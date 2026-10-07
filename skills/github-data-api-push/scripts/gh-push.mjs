#!/usr/bin/env node
/**
 * gh-push.mjs — push a local directory to GitHub via the Git Data API.
 *
 * For environments where `git push` cannot authenticate (blocked egress,
 * no credential helper, token-only access): blobs -> trees -> commit -> ref.
 *
 * Usage:
 *   GITHUB_TOKEN=<token> node gh-push.mjs --repo owner/repo --branch main \
 *     --workdir ./dir --message "commit message" [--base main] \
 *     [--delete path/to/gone.txt] [--force] [--dry-run]
 *
 * Must be EXECUTED, never imported: importing re-runs the push.
 */
import { pathToFileURL } from 'node:url';
if (import.meta.url !== pathToFileURL(process.argv[1]).href) {
  throw new Error('gh-push.mjs must be executed, never imported (importing would re-run the push)');
}

import { readdirSync, readFileSync, lstatSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { blobSha, planTrees, parseArgs, fitsSingleTree } from './lib.mjs';

const API = 'https://api.github.com';
const BLOB_LIMIT = 40 * 1024 * 1024; // API 422s above ~41MB raw; stay under it
const WORKERS = 5;

const args = parseArgs(process.argv.slice(2));
for (const k of ['repo', 'branch', 'workdir', 'message']) {
  if (!args[k]) { console.error(`missing required --${k}`); process.exit(2); }
}
const token = process.env.GITHUB_TOKEN;
if (!token && !args['dry-run']) { console.error('GITHUB_TOKEN is not set'); process.exit(2); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(method, path, body, retries = 4) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(API + path, {
      method,
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'github-data-api-push',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) return res.json();
    const text = await res.text().catch(() => '<unreadable body>');
    if ([429, 500, 502, 503].includes(res.status) && attempt < retries) {
      await sleep(2 ** attempt * 1000);
      continue;
    }
    throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 400)}`);
  }
}

// --- collect ---
const entries = [];
function walk(dir) {
  for (const name of readdirSync(dir).sort()) {
    if (name === '.git') continue;
    const full = join(dir, name);
    const lst = lstatSync(full);
    if (lst.isSymbolicLink()) { console.log(`  skip (symlink): ${relative(args.workdir, full)}`); continue; }
    if (lst.isDirectory()) { walk(full); continue; }
    if (!lst.isFile()) continue;
    const content = readFileSync(full);
    if (content.length > BLOB_LIMIT) {
      throw new Error(`blob too large for the API, split it first: ${relative(args.workdir, full)} (${(content.length / 1048576).toFixed(1)}MB)`);
    }
    const rel = relative(args.workdir, full).split(sep).join('/');
    entries.push({ rel, mode: (lst.mode & 0o111) ? '100755' : '100644', sha: blobSha(content), content });
  }
}
walk(args.workdir);
const deletes = [].concat(args.delete || []);
console.log(`${entries.length} files${deletes.length ? `, ${deletes.length} deletes` : ''}`);

// --- blobs (parallel) ---
async function uploadBlobs() {
  const byRel = new Map();
  const queue = [...entries];
  const workers = Array.from({ length: WORKERS }, async () => {
    while (queue.length) {
      const e = queue.shift();
      const blob = await api('POST', `/repos/${args.repo}/git/blobs`, {
        content: e.content.toString('base64'), encoding: 'base64',
      }, 2);
      if (blob.sha !== e.sha) throw new Error(`SHA mismatch on upload: ${e.rel}`);
      byRel.set(e.rel, blob.sha);
    }
  });
  await Promise.all(workers);
  return byRel;
}

// --- trees ---
async function createTree(payload, bySha) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await api('POST', `/repos/${args.repo}/git/trees`, payload);
    } catch (err) {
      const shas = [...String(err.message).matchAll(/"([0-9a-f]{40})"\] is not a valid blob/g)].map((m) => m[1]);
      if (err.message.includes(' 422') && shas.length && attempt < 3) {
        // Replication lag: the blob exists but this shard hasn't seen it yet.
        for (const sha of shas) {
          const e = bySha.get(sha);
          if (!e) throw err;
          await api('POST', `/repos/${args.repo}/git/blobs`, {
            content: e.content.toString('base64'), encoding: 'base64',
          }, 2);
        }
        await sleep(5000);
        continue;
      }
      throw err;
    }
  }
}

async function buildTrees(byRel) {
  const bySha = new Map(entries.map((e) => [e.sha, e]));
  const plan = planTrees(entries.map((e) => ({ rel: e.rel, mode: e.mode, sha: e.sha })));
  const treeOf = new Map();
  // Deepest first; planTrees already orders bottom-up.
  for (const node of plan) {
    const treeEntries = node.files.map((f) => ({ path: f.name, mode: f.mode, type: 'blob', sha: byRel.get(`${node.dir ? node.dir + '/' : ''}${f.name}`) }));
    for (const sub of node.subdirs) {
      const childDir = node.dir ? `${node.dir}/${sub}` : sub;
      treeEntries.push({ path: sub, mode: '040000', type: 'tree', sha: treeOf.get(childDir) });
    }
    const t = await createTree({ tree: treeEntries }, bySha);
    treeOf.set(node.dir, t.sha);
  }
  return treeOf.get('');
}

const main = async () => {
  const byRel = await uploadBlobs();
  console.log(`uploaded ${byRel.size} blobs`);

  let rootTree;
  if (fitsSingleTree(entries) && !deletes.length) {
    const t = await createTree({
      tree: entries.map((e) => ({ path: e.rel, mode: e.mode, type: 'blob', sha: byRel.get(e.rel) })),
    }, new Map(entries.map((e) => [e.sha, e])));
    rootTree = t.sha;
    console.log('single tree POST');
  } else {
    rootTree = await buildTrees(byRel);
    console.log('incremental per-directory trees');
    if (deletes.length) console.log('NOTE: --delete with incremental trees is not supported; use single-tree mode');
  }
  console.log(`root tree ${rootTree.slice(0, 7)}`);

  if (args['dry-run']) { console.log('dry-run: stopping before commit'); return; }

  // Resolve base.
  let headSha = null;
  try {
    const ref = await api('GET', `/repos/${args.repo}/git/ref/heads/${args.branch}`);
    headSha = ref.object.sha;
  } catch (err) {
    if (!err.message.includes(' 404')) throw err;
    console.log(`branch ${args.branch} does not exist; it will be created`);
  }

  const commit = await api('POST', `/repos/${args.repo}/git/commits`, {
    message: args.message,
    tree: rootTree,
    parents: headSha ? [headSha] : [],
  });
  console.log(`commit ${commit.sha.slice(0, 7)}`);

  if (headSha) {
    await api('PATCH', `/repos/${args.repo}/git/refs/heads/${args.branch}`, {
      sha: commit.sha, ...(args.force ? { force: true } : {}),
    });
  } else {
    await api('POST', `/repos/${args.repo}/git/refs`, {
      ref: `refs/heads/${args.branch}`, sha: commit.sha,
    });
  }
  console.log(`updated refs/heads/${args.branch}`);

  // Verify every blob SHA landed in the pushed tree.
  const remote = await api('GET', `/repos/${args.repo}/git/trees/${rootTree}?recursive=1`);
  const seen = new Map(remote.tree.filter((e) => e.type === 'blob').map((e) => [e.path, e.sha]));
  const missing = entries.filter((e) => seen.get(e.rel) !== e.sha).map((e) => e.rel);
  if (missing.length) throw new Error(`VERIFICATION FAILED, missing: ${missing.slice(0, 10).join(', ')}`);
  console.log(`verified: ${entries.length} blobs present, 0 missing`);
  console.log(`pushed: ${commit.sha.slice(0, 7)}`);
};

main().catch((err) => { console.error(err.message); process.exit(1); });

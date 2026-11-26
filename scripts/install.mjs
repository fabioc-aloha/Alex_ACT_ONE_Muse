#!/usr/bin/env node
// install.mjs — install or sync this edition into a harness skills directory.
//
// Usage:
//   node scripts/install.mjs [--apply] [--skills-dir <dir>] [--repo <dir>]
//
// The install layout mirrors how the skills reference each other:
//   <skills-dir>/local-<skill>/...        one folder per active skill
//   <skills-dir>/../scripts/shared/...    the shared libraries
//
// Default is a dry run: every file is classified and reported, nothing is
// written. With --apply, the two safe classes are written (missing files are
// installed; files whose installed copy still equals the last-synced repo
// version are fast-forwarded). Anything else is reported, never overwritten:
//
//   install       no installed copy — safe to copy
//   current       installed copy already equals the repo version
//   fast-forward  installed copy equals the last-synced version and the repo
//                 moved — safe to copy
//   local-ahead   only the installed copy changed since the last sync — kept
//   diverged      both sides changed since the last sync — needs a human
//   unbaselined   no sync state yet and the copies differ — needs a human
//
// State lives in <skills-dir>/.install-state.json and records, per file, the
// repo and installed blob SHAs as of the last --apply. A first --apply with
// no state installs what is missing, changes nothing else, and records the
// baseline. Fresh whole-skill installs rewrite the SKILL.md frontmatter
// name to local-<skill>, and classification compares against the rewritten
// bytes, so the tool's own rewrite never shows up as a local edit.
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, relative, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

export function blobSha(data) {
  return createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');
}

export function classify(repoSha, installedSha, stateSha) {
  if (installedSha === null) return 'install';
  if (installedSha === repoSha) return 'current';
  if (stateSha === null || stateSha === undefined) return 'unbaselined';
  if (installedSha === stateSha && repoSha !== stateSha) return 'fast-forward';
  if (repoSha === stateSha) return 'local-ahead';
  return 'diverged';
}

export function counterpartDir(skill, existing) {
  const candidates = [`local-${skill}`, `local_${skill.replaceAll('-', '_')}`, `local-${skill.replaceAll('-', '_')}`];
  return candidates.find((c) => existing.has(c)) ?? `local-${skill}`;
}

function walk(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else if (entry.isFile()) out.push(relative(base, full));
  }
  return out.sort();
}

function parseArgs(argv) {
  const args = { apply: false, skillsDir: null, repo: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--apply') args.apply = true;
    else if (argv[i] === '--skills-dir') args.skillsDir = argv[++i];
    else if (argv[i] === '--repo') args.repo = argv[++i];
    else throw new Error(`Unknown argument: ${argv[i]}`);
  }
  return args;
}

export function planSync({ repoRoot, skillsDir }) {
  const manifest = JSON.parse(readFileSync(join(repoRoot, 'manifest.json'), 'utf8'));
  const skills = manifest.assets?.skills ?? [];
  const existing = new Set(existsSync(skillsDir) ? readdirSync(skillsDir) : []);
  const statePath = join(skillsDir, '.install-state.json');
  const state = existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : { files: {} };
  const sharedDir = join(skillsDir, '..', 'scripts', 'shared');
  const items = [];
  const addTree = (repoRel, instAbs, skillName = null) => {
    const repoAbs = join(repoRoot, repoRel);
    if (!existsSync(repoAbs)) return;
    for (const rel of walk(repoAbs)) {
      const src = join(repoAbs, rel);
      const dst = join(instAbs, rel);
      // A SKILL.md installed into a local-* folder carries the folder's name,
      // so the expected installed bytes are the rewritten text, and the
      // classification compares against those bytes.
      let expected = readFileSync(src);
      if (skillName && rel === 'SKILL.md') {
        expected = Buffer.from(
          expected.toString('utf8').replace(/^name: .*$/m, `name: local-${skillName}`), 'utf8');
      }
      const repoSha = blobSha(expected);
      const installedSha = existsSync(dst) ? blobSha(readFileSync(dst)) : null;
      const key = `${repoRel}/${rel}`;
      items.push({
        key, src, dst, expected,
        repoSha, installedSha,
        cls: classify(repoSha, installedSha, state.files[key]?.repo),
      });
    }
  };
  for (const skill of skills) {
    const dir = counterpartDir(skill, existing);
    addTree(join('skills', skill), join(skillsDir, dir), skill);
  }
  addTree(join('scripts', 'shared'), sharedDir, null);
  return { items, state, statePath };
}

export function applySync(plan) {
  const written = [];
  const newState = { version: 1, files: {} };
  for (const item of plan.items) {
    if (item.cls === 'install' || item.cls === 'fast-forward') {
      mkdirSync(dirname(item.dst), { recursive: true });
      writeFileSync(item.dst, item.expected);
      item.installedSha = blobSha(item.expected);
      written.push(item.key);
    }
    newState.files[item.key] = { repo: item.repoSha, installed: item.installedSha };
  }
  mkdirSync(dirname(plan.statePath), { recursive: true });
  writeFileSync(plan.statePath, JSON.stringify(newState, null, 2) + '\n');
  return written;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  const repoRoot = args.repo ? resolve(args.repo) : join(dirname(fileURLToPath(import.meta.url)), '..');
  const skillsDir = args.skillsDir ? resolve(args.skillsDir) : join(homedir(), 'workspace', 'custom-skills');
  const plan = planSync({ repoRoot, skillsDir });
  const counts = {};
  for (const item of plan.items) counts[item.cls] = (counts[item.cls] ?? 0) + 1;
  console.log(`repo:       ${repoRoot}`);
  console.log(`skills dir: ${skillsDir}`);
  console.log(`mode:       ${args.apply ? 'apply' : 'dry-run'}`);
  console.log(`files:      ${plan.items.length}  ${JSON.stringify(counts)}`);
  for (const cls of ['install', 'fast-forward', 'local-ahead', 'diverged', 'unbaselined']) {
    const list = plan.items.filter((i) => i.cls === cls);
    if (list.length) {
      console.log(`\n${cls}:`);
      for (const i of list) console.log(`  ${i.key}`);
    }
  }
  if (args.apply) {
    const written = applySync(plan);
    console.log(`\nwrote ${written.length} file(s); state recorded in ${plan.statePath}`);
  } else {
    console.log('\nDry run. Re-run with --apply to install and fast-forward the safe classes.');
  }
  const blocked = (counts.diverged ?? 0) + (counts.unbaselined ?? 0);
  process.exit(blocked > 0 ? 1 : 0);
}

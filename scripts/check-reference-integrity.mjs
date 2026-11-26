#!/usr/bin/env node
// check-reference-integrity.mjs — deterministic check that files referenced
// from skills and scripts actually exist in this repo.
//
// Reference classes, scoped by where each class has historically broken:
//   specifier  require() / import paths at statement starts in code files.
//              Load-bearing: a miss here is a crash, not a typo.
//   link       Markdown links to other .md files. Reader-facing.
//   path       Prefixed paths (scripts/…, references/…, starter/…, assets/…)
//              in prose or code. Resolved against the repo root, the owning
//              skill, or any repo path ending with the reference (shared
//              reference docs are named once and cited from many skills).
//   filename   Bare script names in code string literals (ps1/cjs/mjs/sh)
//              and installer names (.ps1/.sh) in markdown. This is the class
//              that produced the dangling install-and-check pointer (PR #13):
//              a user-facing message naming a helper the edition never
//              shipped. Resolved against the file's folder, the repo root,
//              scripts/, scripts/shared, and any skill's scripts folder.
//
// Deliberately out of scope: bare .js/.py names in prose (product names like
// Node.js and files in the reader's own project dominate that space),
// example names (foo, placeholders with < > * or ...), trailing-slash output
// directories, and anything under node_modules.
//
// Usage: node scripts/check-reference-integrity.mjs [root]
// Exit 0 when nothing dangles; exit 1 and list the offenders otherwise.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, posix, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TEXT_EXT = /\.(md|cjs|mjs|js|txt)$/;
// Names resolved inside another package's installation at runtime, never
// shipped here. Each entry earns its place by being probed by shipped code.
// npm-cli.js and friends are probed inside npm's own installation;
// runtime-check.cjs is a createRequire anchor name inside a target package.
// None of them are files this repo ships or loads.
export const EXTERNAL_FILENAMES = new Set(['npm-cli.js', 'npx-cli.js', 'npm-prefix.js', 'runtime-check.cjs']);

// References that look dangling but are correct as written. Each entry is
// reviewed like code: a new one needs its reason in the pull request.
export const ALLOWLIST = [
  { path: 'skills/setup-dependencies/SKILL.md', reference: 'install-and-check.ps1',
    reason: 'negative reference: the text names the Copilot edition installer to say it is not shipped here' },
  { path: 'skills/project-status/SKILL.md', reference: 'scripts/brain-qa.cjs',
    reason: "the reader's project scripts, conditional in the text ('if the project ships them')" },
  { path: 'skills/project-status/SKILL.md', reference: 'scripts/brain-semantic-qa.cjs',
    reason: "the reader's project scripts, conditional in the text" },
  { path: 'skills/token-waste-elimination/SKILL.md', reference: 'scripts/brain-qa.cjs',
    reason: "the reader's project scripts, conditional in the text ('if it ships them')" },
  { path: 'skills/token-waste-elimination/SKILL.md', reference: 'scripts/brain-semantic-qa.cjs',
    reason: "the reader's project scripts, conditional in the text" },
  { path: 'skills/docs-shell/references/shell-reference.md', reference: 'assets/copilot-brand.svg',
    reason: 'worked example in an HTML snippet; the text itself flags the icon as adopter-specific' },
];

export function collectReferences(relPath, content) {
  const refs = [];
  const seen = new Set();
  const add = (reference, kind) => {
    const key = `${kind}:${reference}`;
    if (!seen.has(key)) { seen.add(key); refs.push({ reference, kind }); }
  };
  const isCode = /\.(cjs|mjs|js)$/.test(relPath);
  const isMd = relPath.endsWith('.md');
  if (isCode) {
    for (const m of content.matchAll(/^\s*(?:import[\s\S]*?from\s+|import\s+|(?:const|let|var)\s+[^=]*=\s*require\(|export[\s\S]*?from\s+)['"](\.[^'"]+)['"]/gm)) {
      add(m[1], 'specifier');
    }
    for (const m of content.matchAll(/['"`]([^'"`]*?\.(?:ps1|cjs|mjs|sh))['"`]/g)) {
      const base = m[1].split('/').pop();
      if (/^[a-z0-9][a-z0-9._-]*$/.test(base)) add(base, 'filename');
    }
  }
  if (isMd) {
    for (const m of content.matchAll(/\]\(([^)\s]+)\)/g)) {
      const target = m[1].replace(/^<|>$/g, '').split('#')[0].split('?')[0];
      if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
      if (target.endsWith('.md')) add(target, 'link');
    }
    for (const m of content.matchAll(/(?<![\w./-])[a-z0-9][a-z0-9._-]*\.(?:ps1|sh)\b/g)) add(m[0], 'filename');
  }
  for (const m of content.matchAll(/(?<![\w./-])(?:scripts|references|starter|assets)\/[A-Za-z0-9._\-/]+/g)) {
    add(m[0], 'path');
  }
  return refs;
}

export function makeExists(allPaths, fsExists) {
  const set = new Set(allPaths);
  return (p) => set.has(p) || fsExists(p);
}

export function resolveReference(relPath, ref, exists, allPaths) {
  const dir = posix.dirname(relPath);
  const norm = (p) => posix.normalize(p).replace(/^\.\//, '');
  if (ref.kind === 'specifier') {
    const base = norm(posix.join(dir, ref.reference));
    const candidates = [base, `${base}.cjs`, `${base}.mjs`, `${base}.js`, `${base}.json`,
      `${base}/index.cjs`, `${base}/index.mjs`, `${base}/index.js`];
    return candidates.some((c) => exists(c));
  }
  if (ref.kind === 'link') return exists(norm(posix.join(dir, ref.reference)));
  if (ref.kind === 'filename') {
    if (EXTERNAL_FILENAMES.has(ref.reference)) return true;
    const parts = relPath.split('/');
    const homes = [dir, '', 'scripts', 'scripts/shared'];
    if (parts[0] === 'skills' && parts.length > 1) homes.push(`skills/${parts[1]}/scripts`, `skills/${parts[1]}`);
    if (homes.some((h) => exists(norm(posix.join(h, ref.reference))))) return true;
    return allPaths.some((p) => p.endsWith(`/scripts/${ref.reference}`));
  }
  // path: root, owning skill, or any repo path the reference is a suffix of
  const parts = relPath.split('/');
  const bases = [''];
  if (parts[0] === 'skills' && parts.length > 1) bases.push(`skills/${parts[1]}`);
  if (bases.some((b) => exists(norm(posix.join(b, ref.reference))))) return true;
  return allPaths.some((p) => p === ref.reference || p.endsWith(`/${ref.reference}`));
}

export function findDangling(files, exists, allPaths) {
  const out = [];
  for (const { path, content } of files) {
    for (const ref of collectReferences(path, content)) {
      if (ref.reference.includes('node_modules') || /[<>*]/.test(ref.reference)) continue;
      if (ref.reference.includes('...') || ref.reference.endsWith('/') || ref.reference.endsWith('-')) continue;
      if (ref.reference.includes('foo')) continue;
      if (ref.kind === 'filename' && ref.reference === path.split('/').pop()) continue;
      if (ref.kind === 'filename' && /^index\.(cjs|mjs|js)$/.test(ref.reference)) continue;
      if (ALLOWLIST.some((a) => a.path === path && a.reference === ref.reference)) continue;
      if (!resolveReference(path, ref, exists, allPaths)) out.push({ path, ...ref });
    }
  }
  return out.sort((a, b) => `${a.path}:${a.reference}`.localeCompare(`${b.path}:${b.reference}`));
}

function walk(dir, base) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else if (entry.isFile()) out.push(relative(base, full).split('\\').join('/'));
  }
  return out;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const root = process.argv[2] ? resolve(process.argv[2]) : join(dirname(fileURLToPath(import.meta.url)), '..');
  const allPaths = walk(root, root).filter((p) => !p.startsWith('.git/') && !p.includes('node_modules'));
  const files = [];
  for (const top of ['skills', 'scripts']) {
    for (const rel of allPaths.filter((p) => p.startsWith(`${top}/`) && TEXT_EXT.test(p))) {
      // The checker cannot audit its own source: its allowlist and header
      // necessarily contain the reference strings it scans for. The file is
      // reviewed as code instead, and findDangling is covered by unit tests.
      if (rel === 'scripts/check-reference-integrity.mjs') continue;
      files.push({ path: rel, content: readFileSync(join(root, rel), 'utf8') });
    }
  }
  const exists = makeExists(allPaths, (p) => existsSync(join(root, p)));
  const dangling = findDangling(files, exists, allPaths);
  if (dangling.length === 0) {
    console.log(`reference integrity: ${files.length} files checked, nothing dangles`);
  } else {
    console.log(`reference integrity: ${dangling.length} dangling reference(s)`);
    for (const d of dangling) console.log(`  ${d.path} -> ${d.reference} (${d.kind})`);
    process.exit(1);
  }
}

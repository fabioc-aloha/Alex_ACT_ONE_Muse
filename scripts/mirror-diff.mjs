#!/usr/bin/env node
// mirror-diff.mjs — build the adopt / adapt / skip worksheet for mirroring a
// flagship release into this edition.
//
// Usage:
//   node scripts/mirror-diff.mjs <from-tree.json> <to-tree.json>
//        [--edition <dir>] [--from-label <text>] [--to-label <text>]
//        [--out <worksheet.md>]
//
// The tree files are saved GitHub recursive tree listings (the same inputs
// check-edition-parity.mjs takes). Every added, removed, and changed blob is
// classified against the edition on disk:
//   verbatim-held  the edition's copy equals the old flagship version, so a
//                  changed file can be adopted by copying
//   delta-held     the edition's copy differs from both versions; the change
//                  needs a semantic merge, never a blind copy
//   not-in-edition no counterpart here (excluded, or not yet ported)
//   still-held     a file the flagship removed but the edition still carries
// The worksheet groups changes by skill and leaves the Decision column blank
// for the human call. Mirrors in 2026-11 were classified by hand from scratch
// scripts; this is that work, kept.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { blobSha } from './install.mjs';

export function treeMap(treeJson) {
  const map = new Map();
  for (const e of treeJson.tree ?? []) {
    if (e.type === 'blob') map.set(e.path, e.sha);
  }
  return map;
}

export function diffTrees(fromTree, toTree) {
  const from = treeMap(fromTree);
  const to = treeMap(toTree);
  const added = [], removed = [], changed = [];
  let unchanged = 0;
  for (const [path, sha] of to) {
    if (!from.has(path)) added.push({ path, sha });
    else if (from.get(path) !== sha) changed.push({ path, from: from.get(path), to: sha });
    else unchanged++;
  }
  for (const path of from.keys()) if (!to.has(path)) removed.push({ path });
  const byPath = (a, b) => a.path.localeCompare(b.path);
  return { added: added.sort(byPath), removed: removed.sort(byPath), changed: changed.sort(byPath), unchanged };
}

export function classify(path, kind, fromSha, editionShas) {
  const editionSha = editionShas.get(path);
  if (kind === 'added') return editionSha ? 'delta-held' : 'not-in-edition';
  if (kind === 'removed') return editionSha ? 'still-held' : 'not-in-edition';
  if (!editionSha) return 'not-in-edition';
  return editionSha === fromSha ? 'verbatim-held' : 'delta-held';
}

export function skillOf(path) {
  const parts = path.split('/');
  return parts[0] === 'skills' && parts.length > 1 ? parts[1] : '(non-skill)';
}

export function buildWorksheet(diff, editionShas, { fromLabel, toLabel }) {
  const lines = [];
  lines.push(`# Mirror worksheet: ${fromLabel} -> ${toLabel}`, '');
  lines.push(`Added ${diff.added.length}, removed ${diff.removed.length}, changed ${diff.changed.length}, unchanged ${diff.unchanged}.`, '');
  const skillsOf = (items) => [...new Set(items.map((i) => skillOf(i.path)).filter((s) => s !== '(non-skill)'))].sort();
  const newSkills = skillsOf(diff.added).filter((s) => !skillsOf(diff.removed).includes(s) && !diff.changed.some((c) => skillOf(c.path) === s));
  lines.push('## Skill roll-up', '');
  lines.push(`New skills upstream: ${newSkills.length ? newSkills.join(', ') : 'none'}`);
  const removedSkills = skillsOf(diff.removed).filter((s) => !diff.added.some((a) => skillOf(a.path) === s) && !diff.changed.some((c) => skillOf(c.path) === s));
  lines.push(`Removed skills upstream: ${removedSkills.length ? removedSkills.join(', ') : 'none'}`, '');
  const groups = new Map();
  const put = (item, kind, fromSha) => {
    const skill = skillOf(item.path);
    if (!groups.has(skill)) groups.set(skill, []);
    groups.get(skill).push({ ...item, kind, cls: classify(item.path, kind, fromSha, editionShas) });
  };
  for (const i of diff.added) put(i, 'added', null);
  for (const i of diff.removed) put(i, 'removed', null);
  for (const i of diff.changed) put(i, 'changed', i.from);
  lines.push('## Files', '');
  for (const skill of [...groups.keys()].sort()) {
    lines.push(`### ${skill}`, '', '| File | Change | Edition state | Decision |', '| --- | --- | --- | --- |');
    for (const i of groups.get(skill)) lines.push(`| ${i.path} | ${i.kind} | ${i.cls} |  |`);
    lines.push('');
  }
  return lines.join('\n');
}

function editionShas(root) {
  const map = new Map();
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) { if (entry.name !== '.git' && entry.name !== 'node_modules') walk(full); }
      else if (entry.isFile()) map.set(relative(root, full).split('\\').join('/'), blobSha(readFileSync(full)));
    }
  };
  walk(root);
  return map;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const positional = argv.filter((a) => !a.startsWith('--'));
  if (positional.length !== 2) {
    console.error('usage: node scripts/mirror-diff.mjs <from-tree.json> <to-tree.json> [--edition <dir>] [--from-label <text>] [--to-label <text>] [--out <file>]');
    process.exit(2);
  }
  const opt = (name, fallback) => {
    const i = argv.indexOf(name);
    return i >= 0 ? argv[i + 1] : fallback;
  };
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
  const edition = opt('--edition', repoRoot);
  const diff = diffTrees(JSON.parse(readFileSync(positional[0], 'utf8')), JSON.parse(readFileSync(positional[1], 'utf8')));
  const worksheet = buildWorksheet(diff, editionShas(resolve(edition)), {
    fromLabel: opt('--from-label', positional[0]),
    toLabel: opt('--to-label', positional[1]),
  });
  const out = opt('--out', null);
  if (out) { writeFileSync(out, worksheet); console.log(`worksheet written to ${out}`); }
  else console.log(worksheet);
}

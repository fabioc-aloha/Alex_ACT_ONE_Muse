#!/usr/bin/env node
// check-edition-parity.mjs — deterministic drift check between this edition
// and the flagship (fabioc-aloha/Alex_ACT_ONE).
//
// Usage (from this repo's root):
//   node scripts/check-edition-parity.mjs <flagship-tree.json>
//
// <flagship-tree.json> is a saved GitHub recursive tree listing for the
// flagship's main (GET /repos/fabioc-aloha/Alex_ACT_ONE/git/trees/main?recursive=1).
// This edition's side comes from local files: manifest.json (the active set)
// and docs/edition-parity.json (the documented delta). Exit 0 when every
// difference is documented; exit 1 and name the offenders otherwise.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function computeDrift(flagshipSkills, museActiveSkills, parity) {
  const flag = new Set(flagshipSkills);
  const muse = new Set(museActiveSkills);
  const excluded = new Set(parity.excluded.map((e) => e.skill));
  const museOnly = new Set(parity.museOnly.map((e) => e.skill));
  const flagshipOnly = [...flag].filter((n) => !muse.has(n));
  const museSideOnly = [...muse].filter((n) => !flag.has(n));
  // An exclusion is stale when the flagship drops the skill, unless the
  // entry is marked retired-upstream; a retired-upstream entry goes stale
  // the other way, if the flagship ships the skill again.
  const staleExcluded = parity.excluded
    .filter((e) => (e.status === 'retired-upstream' ? flag.has(e.skill) : !flag.has(e.skill)))
    .map((e) => e.skill)
    .sort();
  return {
    undocumentedFlagshipOnly: flagshipOnly.filter((n) => !excluded.has(n)).sort(),
    undocumentedMuseOnly: museSideOnly.filter((n) => !museOnly.has(n)).sort(),
    staleExcluded,
    staleMuseOnly: [...museOnly].filter((n) => !muse.has(n)).sort(),
  };
}

export function flagshipSkillsFromTree(treeJson) {
  const names = new Set();
  for (const e of treeJson.tree ?? []) {
    const parts = e.path.split('/');
    if (parts[0] === 'skills' && parts.length >= 2 && parts[1]) names.add(parts[1]);
  }
  return [...names].sort();
}

function main() {
  const treePath = process.argv[2];
  if (!treePath) {
    console.error('usage: node scripts/check-edition-parity.mjs <flagship-tree.json>');
    process.exit(2);
  }
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
  const parity = JSON.parse(readFileSync(join(root, 'docs', 'edition-parity.json'), 'utf8'));
  const treeJson = JSON.parse(readFileSync(treePath, 'utf8'));
  const flagshipSkills = flagshipSkillsFromTree(treeJson);
  const museActive = manifest.assets.skills.map((s) => s.name);
  const d = computeDrift(flagshipSkills, museActive, parity);
  const problems = [
    ['undocumented flagship-only skills', d.undocumentedFlagshipOnly],
    ['undocumented muse-only skills', d.undocumentedMuseOnly],
    ['stale exclusions (flagship no longer ships them)', d.staleExcluded],
    ['stale museOnly entries (this edition no longer ships them)', d.staleMuseOnly],
  ].filter(([, names]) => names.length > 0);
  console.log(
    `flagship skills: ${flagshipSkills.length} | muse active: ${museActive.length} | ` +
      `documented exclusions: ${parity.excluded.length} | documented muse-only: ${parity.museOnly.length}`,
  );
  if (problems.length === 0) {
    console.log('edition parity: no undocumented drift');
    return;
  }
  for (const [label, names] of problems) console.log(`DRIFT ${label}: ${names.join(', ')}`);
  process.exit(1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();

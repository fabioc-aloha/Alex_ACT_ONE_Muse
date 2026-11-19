// Drift checker: scripts/check-edition-parity.mjs compares the flagship's
// skill folders against this edition's active set (manifest.json) and fails
// on any difference docs/edition-parity.json does not explain.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { computeDrift } from '../scripts/check-edition-parity.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const parity = {
  excluded: [{ skill: 'delta-x' }],
  museOnly: [{ skill: 'muse-x' }],
};

test('documented delta reports no drift', () => {
  const d = computeDrift(['alpha', 'beta', 'delta-x'], ['alpha', 'beta', 'muse-x'], parity);
  assert.deepEqual(d, {
    undocumentedFlagshipOnly: [],
    undocumentedMuseOnly: [],
    staleExcluded: [],
    staleMuseOnly: [],
  });
});

test('a new flagship skill is undocumented drift', () => {
  const d = computeDrift(['alpha', 'beta', 'delta-x', 'rogue'], ['alpha', 'beta', 'muse-x'], parity);
  assert.deepEqual(d.undocumentedFlagshipOnly, ['rogue']);
});

test('a new muse-only skill is undocumented drift', () => {
  const d = computeDrift(['alpha', 'beta', 'delta-x'], ['alpha', 'beta', 'muse-x', 'rogue-2'], parity);
  assert.deepEqual(d.undocumentedMuseOnly, ['rogue-2']);
});

test('an exclusion for a skill the flagship dropped is stale', () => {
  const d = computeDrift(['alpha', 'beta'], ['alpha', 'beta', 'muse-x'], parity);
  assert.deepEqual(d.staleExcluded, ['delta-x']);
});

test('a retired-upstream exclusion is not stale while the flagship stays retired', () => {
  const p = {
    excluded: [{ skill: 'delta-x' }, { skill: 'old-x', status: 'retired-upstream' }],
    museOnly: [{ skill: 'muse-x' }],
  };
  const d = computeDrift(['alpha', 'beta', 'delta-x'], ['alpha', 'beta', 'muse-x'], p);
  assert.deepEqual(d.staleExcluded, []);
});

test('a retired-upstream exclusion goes stale if the flagship ships it again', () => {
  const p = {
    excluded: [{ skill: 'delta-x' }, { skill: 'old-x', status: 'retired-upstream' }],
    museOnly: [{ skill: 'muse-x' }],
  };
  const d = computeDrift(['alpha', 'beta', 'delta-x', 'old-x'], ['alpha', 'beta', 'muse-x'], p);
  assert.deepEqual(d.staleExcluded, ['old-x']);
});

test('a museOnly entry the edition no longer ships is stale', () => {
  const d = computeDrift(['alpha', 'beta', 'delta-x'], ['alpha', 'beta'], parity);
  assert.deepEqual(d.staleMuseOnly, ['muse-x']);
});

test('CLI exits 0 when the flagship tree matches the documented delta', () => {
  const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
  const realParity = JSON.parse(readFileSync(join(root, 'docs', 'edition-parity.json'), 'utf8'));
  const active = manifest.assets.skills.map((s) => s.name);
  const flagshipSkills = [
    ...active.filter((n) => !realParity.museOnly.some((e) => e.skill === n)),
    // Retired-upstream exclusions are absent from the flagship by definition.
    ...realParity.excluded.filter((e) => e.status !== 'retired-upstream').map((e) => e.skill),
  ];
  const tree = {
    tree: flagshipSkills.map((n) => ({ path: `skills/${n}`, type: 'tree' })),
  };
  const dir = mkdtempSync(join(tmpdir(), 'parity-fixture-'));
  const fixture = join(dir, 'flagship-tree.json');
  writeFileSync(fixture, JSON.stringify(tree));
  const out = execFileSync('node', [join(root, 'scripts', 'check-edition-parity.mjs'), fixture], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.match(out, /no undocumented drift/);
});

// Edition parity manifest: docs/edition-parity.json is the machine-checkable
// record of how this edition differs from the flagship (Alex_ACT_ONE).
// It must agree with manifest.json (the archived list) and with the disk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const parity = JSON.parse(readFileSync(join(root, 'docs', 'edition-parity.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));

const archivedNames = manifest.archived.map((a) => a.name).sort();
const activeNames = manifest.assets.skills.map((s) => s.name).sort();
const excludedNames = parity.excluded.map((e) => e.skill).sort();
const museOnlyNames = parity.museOnly.map((e) => e.skill).sort();

test('parity manifest names exactly the archived skills as excluded', () => {
  assert.deepEqual(excludedNames, archivedNames);
});

test('every excluded skill is preserved on disk and not active', () => {
  for (const e of parity.excluded) {
    assert.ok(
      existsSync(join(root, 'archive', 'host-specific', e.skill, 'SKILL.md')),
      `${e.skill} missing from archive/host-specific/`,
    );
    assert.ok(!activeNames.includes(e.skill), `${e.skill} is both archived and active`);
  }
});

test('every excluded entry carries a reason and a native equivalent', () => {
  for (const e of parity.excluded) {
    assert.ok(e.reason && e.reason.length > 0, `${e.skill} has no reason`);
    assert.ok(
      e.nativeEquivalent && e.nativeEquivalent.length > 0,
      `${e.skill} has no nativeEquivalent`,
    );
  }
});

test('museOnly records the satellite-native skills, all active', () => {
  assert.deepEqual(museOnlyNames, ['ai-tell-audit', 'github-data-api-push', 'scoped-delegation']);
  for (const e of parity.museOnly) {
    assert.ok(activeNames.includes(e.skill), `${e.skill} listed as museOnly but not active`);
    assert.ok(e.reason && e.reason.length > 0, `${e.skill} has no reason`);
  }
});

// Tests for the github-data-api-push skill's pure helpers.
// No network: lib.mjs holds the testable logic; gh-push.mjs is the executor.
import test from 'node:test';
import assert from 'node:assert/strict';
import { blobSha, planTrees, parseArgs, fitsSingleTree } from '../skills/github-data-api-push/scripts/lib.mjs';

test('blobSha matches git for the empty blob', () => {
  // sha1("blob 0\0") — the well-known empty git blob.
  assert.equal(blobSha(Buffer.alloc(0)), 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391');
});

test('blobSha accepts strings', () => {
  assert.equal(blobSha('hello\n').length, 40);
  assert.match(blobSha('hello\n'), /^[0-9a-f]{40}$/);
});

test('planTrees orders bottom-up and prunes empty dirs', () => {
  const plan = planTrees([
    { rel: 'a.txt', mode: '100644', sha: 'a'.repeat(40) },
    { rel: 'dir1/b.txt', mode: '100644', sha: 'b'.repeat(40) },
    { rel: 'dir1/sub/c.txt', mode: '100644', sha: 'c'.repeat(40) },
    { rel: 'dir2/sub/d.txt', mode: '100755', sha: 'd'.repeat(40) },
  ]);
  const dirs = plan.map((n) => n.dir);
  // Deepest first; root last.
  assert.deepEqual(dirs, ['dir1/sub', 'dir2/sub', 'dir1', 'dir2', '']);
  // File-less dir2 is kept because it has a kept child.
  const dir2 = plan.find((n) => n.dir === 'dir2');
  assert.deepEqual(dir2.files, []);
  assert.deepEqual(dir2.subdirs, ['sub']);
  // Executable bit preserved.
  const d = plan.find((n) => n.dir === 'dir2/sub');
  assert.equal(d.files[0].mode, '100755');
});

test('planTrees links subtrees to parents', () => {
  const plan = planTrees([{ rel: 'x/y/z.txt', mode: '100644', sha: 'e'.repeat(40) }]);
  const byDir = new Map(plan.map((n) => [n.dir, n]));
  assert.deepEqual(byDir.get('x').subdirs, ['y']);
  assert.deepEqual(byDir.get('x/y').subdirs, []);
  assert.deepEqual(byDir.get('x/y').files.map((f) => f.name), ['z.txt']);
  assert.deepEqual(byDir.get('').subdirs, ['x']);
});

test('parseArgs handles flags and values', () => {
  const a = parseArgs(['--repo', 'o/r', '--branch', 'main', '--force', '--dry-run']);
  assert.equal(a.repo, 'o/r');
  assert.equal(a.branch, 'main');
  assert.equal(a.force, true);
  assert.equal(a['dry-run'], true);
});

test('parseArgs collects repeated --delete', () => {
  const a = parseArgs(['--delete', 'a.txt', '--delete', 'b.txt']);
  const dels = [].concat(a.delete);
  assert.deepEqual(dels, ['a.txt', 'b.txt']);
});

test('fitsSingleTree threshold', () => {
  assert.equal(fitsSingleTree(new Array(200)), true);
  assert.equal(fitsSingleTree(new Array(201)), false);
});

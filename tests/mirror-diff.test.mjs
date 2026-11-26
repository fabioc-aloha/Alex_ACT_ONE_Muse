// mirror-diff.mjs: tree diffing, edition classification, worksheet shape.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWorksheet, classify, diffTrees } from '../scripts/mirror-diff.mjs';

const from = { tree: [
  { path: 'skills/alpha/SKILL.md', type: 'blob', sha: 'a1' },
  { path: 'skills/alpha/scripts/x.cjs', type: 'blob', sha: 'x1' },
  { path: 'skills/gone/SKILL.md', type: 'blob', sha: 'g1' },
  { path: 'README.md', type: 'blob', sha: 'r1' },
]};
const to = { tree: [
  { path: 'skills/alpha/SKILL.md', type: 'blob', sha: 'a2' },
  { path: 'skills/alpha/scripts/x.cjs', type: 'blob', sha: 'x1' },
  { path: 'skills/beta/SKILL.md', type: 'blob', sha: 'b1' },
  { path: 'README.md', type: 'blob', sha: 'r1' },
]};

test('diffTrees separates added, removed, changed, unchanged', () => {
  const d = diffTrees(from, to);
  assert.deepEqual(d.added.map((i) => i.path), ['skills/beta/SKILL.md']);
  assert.deepEqual(d.removed.map((i) => i.path), ['skills/gone/SKILL.md']);
  assert.deepEqual(d.changed.map((i) => i.path), ['skills/alpha/SKILL.md']);
  assert.equal(d.unchanged, 2);
});

test('classify reads the edition state', () => {
  const edition = new Map([['skills/alpha/SKILL.md', 'a1'], ['skills/gone/SKILL.md', 'g9']]);
  assert.equal(classify('skills/alpha/SKILL.md', 'changed', 'a1', edition), 'verbatim-held');
  assert.equal(classify('skills/alpha/SKILL.md', 'changed', 'zz', edition), 'delta-held');
  assert.equal(classify('skills/beta/SKILL.md', 'added', null, edition), 'not-in-edition');
  assert.equal(classify('skills/gone/SKILL.md', 'removed', null, edition), 'still-held');
});

test('the worksheet carries the roll-up and a decision column', () => {
  const edition = new Map([['skills/alpha/SKILL.md', 'a1']]);
  const ws = buildWorksheet(diffTrees(from, to), edition, { fromLabel: 'v1', toLabel: 'v2' });
  assert.match(ws, /New skills upstream: beta/);
  assert.match(ws, /Removed skills upstream: gone/);
  assert.match(ws, /\| skills\/alpha\/SKILL.md \| changed \| verbatim-held \|  \|/);
});

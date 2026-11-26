// check-reference-integrity.mjs: dangling-reference detection, scoped by
// the classes that have actually broken (PR #13's dangling installer name,
// the docs-shell archive link one level too shallow).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findDangling, makeExists } from '../scripts/check-reference-integrity.mjs';

const paths = ['skills/alpha/SKILL.md', 'skills/alpha/scripts/run.cjs', 'scripts/shared/lib.cjs', 'docs/guide.md'];
const exists = makeExists(paths, () => false);
const scan = (path, content) => findDangling([{ path, content }], exists, paths);

test('a shipped sibling script name resolves; an unshipped one dangles', () => {
  assert.deepEqual(scan('skills/alpha/SKILL.md', 'Run `node scripts/run.cjs` first.'), []);
  const bad = scan('skills/alpha/SKILL.md', 'Preview install-and-check.ps1 -DependenciesOnly.');
  assert.equal(bad.length, 1);
  assert.equal(bad[0].reference, 'install-and-check.ps1');
});

test('product names and reader-project files are out of scope', () => {
  assert.deepEqual(scan('skills/alpha/SKILL.md', 'Built on Node.js with Chart.js.'), []);
  assert.deepEqual(scan('skills/alpha/SKILL.md', 'Then run main.py and parse.py.'), []);
});

test('relative specifiers at statement starts resolve with extensions', () => {
  const content = "const lib = require('../../../scripts/shared/lib');\n";
  assert.deepEqual(scan('skills/alpha/scripts/run.cjs', content), []);
  const bad = scan('skills/alpha/scripts/run.cjs', "const x = require('./missing');\n");
  assert.equal(bad.length, 1);
  assert.equal(bad[0].kind, 'specifier');
});

test('markdown links to .md files resolve relative to the file', () => {
  assert.deepEqual(scan('skills/alpha/SKILL.md', 'See [guide](../../docs/guide.md).'), []);
  const bad = scan('skills/alpha/SKILL.md', 'See [guide](../docs/guide.md).');
  assert.equal(bad.length, 1);
  assert.equal(bad[0].kind, 'link');
});

test('the allowlisted negative reference does not dangle', () => {
  const content = 'The Copilot flows (`install-and-check.ps1`) are not shipped in this edition.';
  assert.deepEqual(scan('skills/setup-dependencies/SKILL.md', content), []);
});

test('mid-path fragments, placeholders, and output directories never dangle', () => {
  const content = 'See .github/scripts/x.cjs, /assets/app.js, scripts/<name>.cjs and assets/figures/';
  assert.deepEqual(scan('skills/alpha/SKILL.md', content), []);
});

test('the live tree has no dangling references', () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const out = execFileSync('node', [join(root, 'scripts', 'check-reference-integrity.mjs'), root], { encoding: 'utf8' });
  assert.match(out, /nothing dangles/);
});

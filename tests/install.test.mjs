// install.mjs: three-way classification and a temp-dir end-to-end sync.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { classify, counterpartDir } from '../scripts/install.mjs';

test('classify covers the six outcomes', () => {
  assert.equal(classify('a', null, null), 'install');
  assert.equal(classify('a', 'a', null), 'current');
  assert.equal(classify('a', 'b', null), 'unbaselined');
  assert.equal(classify('b', 'a', 'a'), 'fast-forward');
  assert.equal(classify('a', 'b', 'a'), 'local-ahead');
  assert.equal(classify('b', 'c', 'a'), 'diverged');
});

test('counterpartDir prefers an existing folder spelling', () => {
  const existing = new Set(['local_flint_chart']);
  assert.equal(counterpartDir('flint-chart', existing), 'local_flint_chart');
  assert.equal(counterpartDir('new-skill', existing), 'local-new-skill');
});

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'install-test-'));
  const repo = join(root, 'repo');
  const skillsDir = join(root, 'custom-skills');
  mkdirSync(join(repo, 'skills', 'alpha'), { recursive: true });
  mkdirSync(join(repo, 'scripts', 'shared'), { recursive: true });
  writeFileSync(join(repo, 'manifest.json'), JSON.stringify({ assets: { skills: ['alpha'] } }));
  writeFileSync(join(repo, 'skills', 'alpha', 'SKILL.md'), '---\nname: alpha\ndescription: "x"\n---\nbody\n');
  writeFileSync(join(repo, 'scripts', 'shared', 'lib.cjs'), 'module.exports = 1;\n');
  return { repo, skillsDir };
}

const script = join(dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'install.mjs');
const run = (repo, skillsDir, extra = []) =>
  execFileSync('node', [script, '--repo', repo, '--skills-dir', skillsDir, ...extra], { encoding: 'utf8' });

test('first --apply installs fresh, rewrites the name, and seeds state', () => {
  const { repo, skillsDir } = fixture();
  const out = run(repo, skillsDir, ['--apply']);
  assert.match(out, /wrote 2 file\(s\)/);
  const skill = readFileSync(join(skillsDir, 'local-alpha', 'SKILL.md'), 'utf8');
  assert.match(skill, /name: local-alpha/);
  assert.ok(existsSync(join(skillsDir, '..', 'scripts', 'shared', 'lib.cjs')));
  const again = run(repo, skillsDir);
  assert.match(again, /"current":2/);
});

test('a repo-side change fast-forwards; an installed-side change is kept', () => {
  const { repo, skillsDir } = fixture();
  run(repo, skillsDir, ['--apply']);
  writeFileSync(join(repo, 'scripts', 'shared', 'lib.cjs'), 'module.exports = 2;\n');
  writeFileSync(join(skillsDir, 'local-alpha', 'SKILL.md'), 'local edits\n');
  const dry = run(repo, skillsDir);
  assert.match(dry, /fast-forward:/);
  run(repo, skillsDir, ['--apply']);
  assert.equal(readFileSync(join(skillsDir, '..', 'scripts', 'shared', 'lib.cjs'), 'utf8'), 'module.exports = 2;\n');
  assert.equal(readFileSync(join(skillsDir, 'local-alpha', 'SKILL.md'), 'utf8'), 'local edits\n');
});

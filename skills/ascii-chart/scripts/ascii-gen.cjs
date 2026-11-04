#!/usr/bin/env node
/**
 * @muscle ascii-chart
 * @lifecycle stable
 * @inheritance inheritable
 * @description Compute ASCII chart geometry: bar fills, sparkline chars, card widths, centered titles
 * @version 1.0.0
 * @platform windows,macos,linux
 * @requires node
 *
 * The geometry LLMs reliably get wrong in prose (fill counts, pairwise
 * direction comparisons, width division with remainders, centering
 * offsets) is computed here. The model transcribes the script's output;
 * it does not compute.
 *
 * Usage:
 *   node ascii-gen.cjs bars   --values 42,23,19 --width 20
 *   node ascii-gen.cjs check  --values 42,23,19 --width 20 <rendered.txt>
 *   node ascii-gen.cjs spark  --values 3,4,4,6,2,2,5
 *   node ascii-gen.cjs layout --cols 3
 *   node ascii-gen.cjs center --text REVENUE --width 24
 *
 * bars:   fill = round(value / max(values) * width) for each value.
 * check:  re-derives fills from --values and diffs them against the '#'
 *         counts inside the | ... | bar segment of each rendered line.
 * spark:  one direction char per step between points: / up, \ down,
 *         _ flat. A strict local peak replaces the step into it with ^.
 * layout: card widths for N side-by-side cards on the 78-column grid.
 *         Every card gets floor((78 - (N-1)*2) / N); the remainder goes
 *         +1 per card from the left until it runs out.
 * center: pads text on both sides from its measured length so the
 *         result is exactly --width characters.
 */

const args = process.argv.slice(2);
const cmd = args[0];

function opt(name) {
  const i = args.indexOf('--' + name);
  return i >= 0 ? args[i + 1] : undefined;
}

function parseValues() {
  const raw = opt('values');
  if (!raw) {
    console.error('Missing --values <csv>');
    process.exit(2);
  }
  const vals = raw.split(',').map((s) => Number(s.trim()));
  if (vals.some((v) => !Number.isFinite(v))) {
    console.error(`Bad --values list: ${raw}`);
    process.exit(2);
  }
  return vals;
}

function fills(values, width) {
  const max = Math.max(...values);
  if (max <= 0) return values.map(() => 0);
  return values.map((v) => Math.round((v / max) * width));
}

if (cmd === 'bars') {
  const values = parseValues();
  const width = Number(opt('width'));
  if (!Number.isInteger(width) || width <= 0) {
    console.error('Missing or bad --width <n>');
    process.exit(2);
  }
  const f = fills(values, width);
  values.forEach((v, i) => {
    const bar = '#'.repeat(f[i]) + ' '.repeat(width - f[i]);
    console.log(`${v}\tfill=${f[i]}\t|${bar}|`);
  });
} else if (cmd === 'check') {
  const values = parseValues();
  const width = Number(opt('width'));
  const file = args[args.length - 1];
  if (!Number.isInteger(width) || width <= 0 || !file || file.startsWith('--')) {
    console.error('Usage: node ascii-gen.cjs check --values <csv> --width <n> <rendered.txt>');
    process.exit(2);
  }
  const expected = fills(values, width);
  const lines = require('fs')
    .readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('|'));
  let bad = 0;
  if (lines.length !== expected.length) {
    console.log(`MISMATCH: rendered block has ${lines.length} bar lines, expected ${expected.length}`);
    bad += 1;
  }
  const n = Math.min(lines.length, expected.length);
  for (let i = 0; i < n; i++) {
    const seg = lines[i].split('|')[1] || '';
    const actual = (seg.match(/#/g) || []).length;
    if (actual === expected[i]) {
      console.log(`line ${i + 1}: OK (fill=${actual})`);
    } else {
      console.log(`line ${i + 1}: MISMATCH rendered fill=${actual}, expected ${expected[i]}`);
      bad += 1;
    }
  }
  console.log(bad === 0 ? 'CHECK PASS: all fills match the source values' : `CHECK FAIL: ${bad} problem(s)`);
  process.exit(bad === 0 ? 0 : 1);
} else if (cmd === 'spark') {
  const v = parseValues();
  if (v.length < 2) {
    console.error('spark needs at least 2 values');
    process.exit(2);
  }
  const chars = [];
  for (let i = 1; i < v.length; i++) {
    chars.push(v[i] > v[i - 1] ? '/' : v[i] < v[i - 1] ? '\\' : '_');
  }
  for (let i = 1; i < v.length - 1; i++) {
    if (v[i] > v[i - 1] && v[i] > v[i + 1]) chars[i - 1] = '^';
  }
  console.log(chars.join(''));
} else if (cmd === 'layout') {
  const n = Number(opt('cols'));
  if (!Number.isInteger(n) || n <= 0) {
    console.error('Missing or bad --cols <n>');
    process.exit(2);
  }
  const avail = 78 - (n - 1) * 2;
  const base = Math.floor(avail / n);
  const rem = avail - base * n;
  const widths = Array.from({ length: n }, (_, i) => base + (i < rem ? 1 : 0));
  console.log(`cols=${n} widths=${widths.join(',')} sum=${widths.reduce((a, b) => a + b, 0)} gaps=${(n - 1) * 2} total=78`);
} else if (cmd === 'center') {
  const text = opt('text');
  const width = Number(opt('width'));
  if (text === undefined || !Number.isInteger(width) || width <= 0) {
    console.error('Usage: node ascii-gen.cjs center --text <text> --width <n>');
    process.exit(2);
  }
  if (text.length > width) {
    console.log(text);
    console.error(`warning: text length ${text.length} exceeds width ${width}`);
    process.exit(1);
  }
  const left = Math.floor((width - text.length) / 2);
  const right = width - text.length - left;
  console.log(`|${' '.repeat(left)}${text}${' '.repeat(right)}|`);
} else {
  console.error('Usage: node ascii-gen.cjs <bars|check|spark|layout|center> [options]');
  process.exit(2);
}

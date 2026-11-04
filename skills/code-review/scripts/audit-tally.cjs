#!/usr/bin/env node
/**
 * @muscle code-review
 * @lifecycle stable
 * @inheritance inheritable
 * @description Tally categorized audit lines and compute derived counts/ratios
 * @version 1.0.0
 * @platform windows,macos,linux
 * @requires node
 *
 * Extension audits categorize items by appending a tag to each line of a
 * list file, e.g. `[legitimate]` / `[removable]` for console statements or
 * `[working]` / `[broken]` for menu validation. This script does the
 * counting and the ratio math so the numbers in the audit report come from
 * a deterministic tally, never from counting list items by eye.
 *
 * Usage:
 *   node audit-tally.cjs <list-file> [more-list-files...]
 *
 * Input: one item per line; the category is the trailing [tag] on the line.
 * Blank lines and lines starting with # are ignored. Untagged lines are
 * reported separately so a missed categorization cannot hide in a total.
 *
 * Output: total items, count per category, and derived lines when the
 * console ([legitimate]/[removable]) or menu ([working]/[broken])
 * categories are present.
 */

const fs = require('fs');

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: node audit-tally.cjs <list-file> [more-list-files...]');
  process.exit(2);
}

const counts = new Map();
let total = 0;
let untagged = 0;

for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    total += 1;
    const m = line.match(/\[([^\]]+)\]\s*$/);
    if (!m) {
      untagged += 1;
      continue;
    }
    const cat = m[1].trim().toLowerCase();
    counts.set(cat, (counts.get(cat) || 0) + 1);
  }
}

console.log(`Total items: ${total}`);
for (const [cat, n] of [...counts.entries()].sort()) {
  console.log(`  ${cat}: ${n}`);
}
if (untagged > 0) console.log(`  (untagged: ${untagged})`);

const get = (c) => counts.get(c) || 0;

if (counts.has('legitimate') || counts.has('removable')) {
  const l = get('legitimate');
  const r = get('removable');
  console.log(`Console statements: ${l + r} remaining (${l} legitimate, ${r} removable)`);
}

if (counts.has('working') || counts.has('broken')) {
  const w = get('working');
  const b = get('broken');
  const pct = w + b === 0 ? 0 : (w / (w + b)) * 100;
  console.log(`Menu validation: ${w} working / ${b} broken = ${pct.toFixed(1)}% working`);
}

#!/usr/bin/env node
/**
 * count-occurrences.mjs — count occurrences of a term in a file.
 *
 * Why: some humanizer thresholds are counts, e.g. Pattern 7's "load-bearing"
 * becomes a tell at 3+ occurrences in a single document. Estimating a count
 * while reading is unreliable; this script prints the real count and the
 * lines it appears on.
 *
 * Usage:
 *   node scripts/count-occurrences.mjs <term> <file>
 *   node scripts/count-occurrences.mjs <term> <file> --case-sensitive
 *
 * Output: JSON { term, file, count, lines[] }.
 */

import { readFileSync } from 'node:fs';

const [term, file] = process.argv.slice(2);
if (!term || !file) {
  console.error('usage: node count-occurrences.mjs <term> <file> [--case-sensitive]');
  process.exit(2);
}

const caseSensitive = process.argv.includes('--case-sensitive');
const text = readFileSync(file, 'utf8');
const haystack = caseSensitive ? text : text.toLowerCase();
const needle = caseSensitive ? term : term.toLowerCase();

let count = 0;
let idx = haystack.indexOf(needle);
while (idx !== -1) {
  count += 1;
  idx = haystack.indexOf(needle, idx + needle.length);
}

const lines = [];
text.split('\n').forEach((line, i) => {
  const probe = caseSensitive ? line : line.toLowerCase();
  if (probe.includes(needle)) lines.push(i + 1);
});

console.log(JSON.stringify({ term, file, count, lines }, null, 2));

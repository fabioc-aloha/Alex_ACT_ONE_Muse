#!/usr/bin/env node
/**
 * tally-rejections.mjs — compute the Phase 1 to Phase 2 rejection rate
 * for a Copywriter Mode three-phase review.
 *
 * Why: the rejection rate is a health signal (zero rejections means the
 * sweep list is too narrow; near-total rejection means it is too noisy).
 * It is a ratio over the session's candidates, so it belongs to a tally
 * over the disposition log, not to the model's memory of the session.
 *
 * Log format: one candidate per line, pipe-delimited:
 *   candidate | origin | disposition
 * origin is `sweep` or `close-read`; disposition is `accepted` or
 * `rejected`. Blank lines and lines starting with # are ignored.
 *
 * Usage:
 *   node scripts/tally-rejections.mjs <disposition-log>
 *
 * Output: JSON { total, accepted, rejected, rejectionRate }.
 * Exit code: 1 when the log holds no usable candidate lines, 2 on usage error.
 */

import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node tally-rejections.mjs <disposition-log>');
  process.exit(2);
}

let accepted = 0;
let rejected = 0;
const skipped = [];

readFileSync(file, 'utf8')
  .split('\n')
  .forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('|').map((p) => p.trim());
    const disposition = (parts[2] ?? '').toLowerCase();
    if (parts.length === 3 && disposition === 'accepted') accepted += 1;
    else if (parts.length === 3 && disposition === 'rejected') rejected += 1;
    else skipped.push(i + 1);
  });

const total = accepted + rejected;
if (total === 0) {
  console.error(`no usable candidate lines in ${file}`);
  process.exit(1);
}

const rejectionRate = Math.round((rejected / total) * 1000) / 10;
console.log(
  JSON.stringify({ file, total, accepted, rejected, rejectionRate, skippedLines: skipped }, null, 2),
);

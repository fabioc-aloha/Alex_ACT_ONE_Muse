#!/usr/bin/env node
/**
 * merge-runs.mjs — tally agreement across ensembled close-read runs.
 *
 * Why: Copywriter Mode ensembling uses agreement count as a confidence
 * tier (found by every run: high confidence; found once: still real).
 * Counting matches by eye during the manual union manufactures agreement
 * and loses single-run findings. Each run writes findings in a structured
 * format; this script does the grouping and counting.
 *
 * Run-file format: one finding per line, pipe-delimited:
 *   pattern | location | phrase
 * e.g. `7 | landing.md lede | delve into the details`
 * Blank lines and lines starting with # are ignored. Two lines are the
 * same finding when pattern and phrase match after lowercasing and
 * collapsing whitespace and punctuation.
 *
 * Usage:
 *   node scripts/merge-runs.mjs <run1.txt> <run2.txt> [run3.txt ...]
 *
 * Output: JSON { runs, findings: [{ pattern, location, phrase,
 *   foundInRuns, agreement }] } sorted by agreement, highest first.
 */

import { readFileSync } from 'node:fs';

const files = process.argv.slice(2);
if (files.length < 2) {
  console.error('usage: node merge-runs.mjs <run1.txt> <run2.txt> [run3.txt ...]');
  process.exit(2);
}

function normalize(s) {
  return s
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const byKey = new Map();

files.forEach((file, runIdx) => {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const parts = trimmed.split('|').map((p) => p.trim());
      if (parts.length !== 3) return;
      const [pattern, location, phrase] = parts;
      const key = `${normalize(pattern)} :: ${normalize(phrase)}`;
      if (!byKey.has(key)) {
        byKey.set(key, { pattern, location, phrase, foundInRuns: new Set() });
      }
      byKey.get(key).foundInRuns.add(runIdx + 1);
    });
});

const findings = [...byKey.values()]
  .map((f) => ({
    pattern: f.pattern,
    location: f.location,
    phrase: f.phrase,
    foundInRuns: [...f.foundInRuns].sort((a, b) => a - b),
    agreement: f.foundInRuns.size,
  }))
  .sort((a, b) => b.agreement - a.agreement || a.phrase.localeCompare(b.phrase));

console.log(JSON.stringify({ runs: files.length, findings }, null, 2));

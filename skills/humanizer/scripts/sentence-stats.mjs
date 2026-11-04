#!/usr/bin/env node
/**
 * sentence-stats.mjs — measure the sentence-length pattern of a writing
 * sample for Voice Calibration.
 *
 * Why: calibration asks whether the sample is "short and punchy, long and
 * flowing, or mixed". That is a distribution question; eyeballing it across
 * a long sample gives a vibe, not a measurement. This script reports the
 * count, mean, median, and spread of words per sentence.
 *
 * Usage:
 *   node scripts/sentence-stats.mjs <sample-file>
 *
 * Output: JSON { file, sentences, wordsPerSentence:
 *   { mean, median, min, max, stdev } }.
 */

import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node sentence-stats.mjs <sample-file>');
  process.exit(2);
}

const text = readFileSync(file, 'utf8').replace(/\s+/g, ' ').trim();
const raw = text.match(/[^.!?]+[.!?]+["'”’)\]]*/g) ?? [];
const sentences = raw.map((s) => s.trim()).filter((s) => /[A-Za-z0-9]/.test(s));
const tail = text.slice(raw.join('').length).trim();
if (tail && /[A-Za-z0-9]/.test(tail)) sentences.push(tail);

if (sentences.length === 0) {
  console.error(`no sentences found in ${file}`);
  process.exit(1);
}

const lengths = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
const sorted = [...lengths].sort((a, b) => a - b);
const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
const median =
  sorted.length % 2 === 1
    ? sorted[(sorted.length - 1) / 2]
    : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
const variance = lengths.reduce((a, b) => a + (b - mean) ** 2, 0) / lengths.length;
const round1 = (n) => Math.round(n * 10) / 10;

console.log(
  JSON.stringify(
    {
      file,
      sentences: sentences.length,
      wordsPerSentence: {
        mean: round1(mean),
        median,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        stdev: round1(Math.sqrt(variance)),
      },
    },
    null,
    2,
  ),
);

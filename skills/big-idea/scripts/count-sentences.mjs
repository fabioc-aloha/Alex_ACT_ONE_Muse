#!/usr/bin/env node
/**
 * count-sentences.mjs — count the sentences in a draft file.
 *
 * Why: the big-idea emit gate applies a per-format sentence ceiling
 * (1 sentence for titles, 1–3 for hero copy, 2–4 for abstracts). Counting
 * sentences by eye while reading is exactly the kind of small arithmetic
 * that drifts. This script does the counting; the model checks the printed
 * count against the ceiling.
 *
 * Usage:
 *   node scripts/count-sentences.mjs <draft-file>
 *
 * Output: JSON { file, count, sentences[] }.
 */

import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node count-sentences.mjs <draft-file>');
  process.exit(2);
}

const text = readFileSync(file, 'utf8').replace(/\s+/g, ' ').trim();
// A sentence is a run of text ending in terminal punctuation (. ! ?),
// optionally followed by closing quotes or brackets.
const raw = text.match(/[^.!?]+[.!?]+["'”’)\]]*/g) ?? [];
const sentences = raw.map((s) => s.trim()).filter((s) => /[A-Za-z0-9]/.test(s));
// Trailing fragment with no terminal punctuation still counts as a sentence.
const tail = text.slice(raw.join('').length).trim();
if (tail && /[A-Za-z0-9]/.test(tail)) sentences.push(tail);

console.log(JSON.stringify({ file, count: sentences.length, sentences }, null, 2));

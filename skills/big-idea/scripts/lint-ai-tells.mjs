#!/usr/bin/env node
/**
 * lint-ai-tells.mjs — mechanically scan a draft for the big-idea AI-tell gate.
 *
 * Why: the gate's checks are fixed-string matching: a banned wordlist,
 * `load-bearing` used as decoration, performative openers, and em dashes.
 * Fixed-string matching done by eye misses hits; this script finds them and
 * reports line numbers so the model can fix real instances instead of
 * estimating.
 *
 * Usage:
 *   node scripts/lint-ai-tells.mjs <draft-file>
 *
 * Output: JSON { file, clean, hits: [{ line, kind, match }] }.
 * Exit code: 1 when any hit is found, 0 when clean, 2 on usage error.
 */

import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node lint-ai-tells.mjs <draft-file>');
  process.exit(2);
}

const BANNED = [
  'comprehensive',
  'robust',
  'leverage',
  'seamlessly',
  'delve into',
  'delve',
  'tapestry',
  'weave',
  'testament',
];

const lines = readFileSync(file, 'utf8').split('\n');
const hits = [];

lines.forEach((line, i) => {
  const lineNo = i + 1;

  for (const word of BANNED) {
    const re = new RegExp(`\\b${word.replace(/ /g, '\\s+')}\\b`, 'gi');
    for (const m of line.matchAll(re)) {
      hits.push({ line: lineNo, kind: 'banned-word', match: m[0] });
    }
  }

  for (const m of line.matchAll(/load-bearing/gi)) {
    hits.push({ line: lineNo, kind: 'load-bearing', match: m[0] });
  }

  // Performative openers begin a sentence: at a line start or right after
  // terminal punctuation.
  for (const m of line.matchAll(/(?:^|[.!?]\s+)(Certainly!|Great question!|Let me\b)/g)) {
    hits.push({ line: lineNo, kind: 'performative-opener', match: m[1] });
  }

  for (const m of line.matchAll(/—/g)) {
    hits.push({ line: lineNo, kind: 'em-dash', match: m[0] });
  }
});

console.log(JSON.stringify({ file, clean: hits.length === 0, hits }, null, 2));
process.exit(hits.length === 0 ? 0 : 1);

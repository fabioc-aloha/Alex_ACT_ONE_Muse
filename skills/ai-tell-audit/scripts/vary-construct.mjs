#!/usr/bin/env node
/**
 * vary-construct.mjs — randomly assign recast strategies to flagged instances.
 *
 * Why: when an audit flags N instances of one pattern (e.g. 9 contrast
 * cadences), recasting them all the same way replaces one uniform signature
 * with another. An LLM "picking randomly" is biased toward its favorite
 * constructions, so this script does the picking with a real RNG.
 *
 * Usage:
 *   node scripts/vary-construct.mjs --pattern contrast-cadence --count 9
 *   node scripts/vary-construct.mjs --pattern contrast-cadence --count 9 --seed 42
 *   node scripts/vary-construct.mjs --list
 *
 * Output: JSON { pattern, count, strategies[] } — one strategy per instance,
 * shuffled with no adjacent duplicates where possible.
 */

import { randomInt } from 'node:crypto';

const STRATEGIES = {
  'contrast-cadence': [
    'positive-statement',
    'inverted-order',
    'colon-pivot',
    'two-sentences',
    'subordinate-first',
    'rhetorical-question',
  ],
  'throat-clearer': ['cut', 'front-load-point', 'merge-into-previous'],
  'rule-of-three': ['cut-weakest', 'two-items', 'prose-list'],
  'significance-inflation': ['cut', 'specific-claim', 'demote-to-parenthetical'],
  'section-summary': ['cut', 'end-on-consequence', 'end-on-next-step'],
  'vague-connection': ['name-relationship', 'plain-of-for-by', 'split-sentence'],
  'copula-avoidance': ['plain-is-are', 'active-verb'],
  'elegant-variation': ['repeat-term', 'pronoun'],
  'slogan-ending': ['cut', 'specific-close'],
  'hedge-cluster': ['cut-hedge', 'commit-or-cut'],
  'rhetorical-monotony': ['invert-skeleton', 'merge-two', 'convert-to-list', 'vary-opener'],
};

const GLOSSARY = {
  'positive-statement': 'State the positive claim directly; drop the contrast frame.',
  'inverted-order': 'Put the second clause first, the first second.',
  'colon-pivot': 'Lead into the point with a colon construction.',
  'two-sentences': 'Split into two short sentences.',
  'subordinate-first': 'Subordinate clause first, main claim last.',
  'rhetorical-question': 'Pose as a question, then answer it.',
  'cut': 'Delete the filler outright; the sentence survives without it.',
  'front-load-point': 'Move the point to the front of the sentence.',
  'merge-into-previous': 'Fold the content into the previous sentence.',
  'cut-weakest': 'Drop the weakest of the three items.',
  'two-items': 'Keep two items; the third was padding.',
  'prose-list': 'Unpack into a plain prose list with verbs.',
  'specific-claim': 'Replace the inflation with the concrete fact.',
  'demote-to-parenthetical': 'Move to a parenthetical aside.',
  'end-on-consequence': 'Close on the consequence, not a restatement.',
  'end-on-next-step': 'Close on the next step, not a restatement.',
  'name-relationship': 'Name the actual relationship between the things.',
  'plain-of-for-by': 'Rewrite with of/for/by.',
  'split-sentence': 'Split into two sentences with the relationship explicit.',
  'plain-is-are': 'Use is/are.',
  'active-verb': 'Replace with a concrete active verb.',
  'repeat-term': 'Repeat the exact term.',
  'pronoun': 'Use a pronoun.',
  'specific-close': 'Close on something specific.',
  'cut-hedge': 'Remove the hedge; keep the claim.',
  'commit-or-cut': 'Either commit to the claim or cut the sentence.',
  'invert-skeleton': 'Flip the sentence skeleton (e.g. lead with the verb or the object).',
  'merge-two': 'Merge two same-skeleton instances into one sentence.',
  'convert-to-list': 'Convert the repeated run into a plain list.',
  'vary-opener': 'Change the opener; keep the content.',
};

// mulberry32 — deterministic PRNG for --seed runs
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--pattern') out.pattern = argv[++i];
    else if (argv[i] === '--count') out.count = parseInt(argv[++i], 10);
    else if (argv[i] === '--seed') out.seed = parseInt(argv[++i], 10);
    else if (argv[i] === '--list') out.list = true;
    else if (argv[i] === '--help') out.help = true;
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || (!args.list && (!args.pattern || !args.count))) {
    console.log(`Usage:
  node scripts/vary-construct.mjs --pattern <name> --count <n> [--seed <int>]
  node scripts/vary-construct.mjs --list

Patterns: ${Object.keys(STRATEGIES).join(', ')}`);
    process.exit(args.help ? 0 : 1);
  }

  if (args.list) {
    for (const [p, ss] of Object.entries(STRATEGIES)) {
      console.log(`${p}:`);
      for (const s of ss) console.log(`  - ${s}: ${GLOSSARY[s]}`);
    }
    return;
  }

  const pool = STRATEGIES[args.pattern];
  if (!pool) {
    console.error(`Unknown pattern "${args.pattern}". Use --list.`);
    process.exit(1);
  }
  if (!Number.isInteger(args.count) || args.count < 1) {
    console.error('--count must be a positive integer.');
    process.exit(1);
  }

  const rand = args.seed !== undefined
    ? mulberry32(args.seed)
    : () => randomInt(0, 1 << 30) / (1 << 30);

  // Deal strategies round-robin from a shuffled pool so every strategy gets
  // used before any repeats, then reshuffle — with no adjacent duplicates.
  const result = [];
  while (result.length < args.count) {
    const deck = [...pool];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    for (const s of deck) {
      if (result.length >= args.count) break;
      if (result.length > 0 && result[result.length - 1] === s && pool.length > 1) continue;
      result.push(s);
    }
    // Single-strategy pools: adjacency unavoidable; accept it.
    if (pool.length === 1) break;
  }

  console.log(JSON.stringify({
    pattern: args.pattern,
    count: args.count,
    seed: args.seed !== undefined ? args.seed : null,
    strategies: result,
    glossary: Object.fromEntries(result.map((s) => [s, GLOSSARY[s]])),
  }, null, 2));
}

main();

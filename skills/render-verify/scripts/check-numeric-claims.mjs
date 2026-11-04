#!/usr/bin/env node
/**
 * check-numeric-claims.mjs: verify the numbers in prose against a dataset.
 *
 * Why: captions and paragraphs state ratios and figures ("less than a fifth
 * of the noise", "$4.2M", "78%") that drift away from the data they describe.
 * Computing a ratio in your head while reading, or eyeballing whether a
 * cited number exists somewhere in a JSON file, is exactly the small
 * arithmetic that goes wrong silently. This script does the arithmetic and
 * the diff; the model interprets the output.
 *
 * Ratio mode:
 *   node scripts/check-numeric-claims.mjs --dataset data.json \
 *     --numerator signal --denominator noise
 *   Resolves dotted key paths. A numeric array is summed (and the sum is
 *   reported). Prints the computed ratio exactly.
 *
 * Scan mode:
 *   node scripts/check-numeric-claims.mjs --prose doc.md --dataset data.json
 *   Extracts numeric tokens from the prose ($ amounts, percents, x
 *   multipliers, K/M/B suffixed numbers, comma-grouped numbers) and matches
 *   each against the dataset: every numeric leaf value, plus the sum of
 *   every numeric array. Percent tokens match either the percent value or
 *   the 0-1 fraction. Unmatched tokens are triage candidates, not automatic
 *   failures: a threshold, target, or round-number goal may live only in
 *   prose (the non-data lever). Exit 1 when any token is unmatched, 0 when
 *   all match, 2 on usage or file errors.
 */

import fs from 'node:fs';

function fail(msg) {
  console.error(`[ERROR] ${msg}`);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { dataset: null, numerator: null, denominator: null, prose: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dataset') opts.dataset = argv[++i];
    else if (a === '--numerator') opts.numerator = argv[++i];
    else if (a === '--denominator') opts.denominator = argv[++i];
    else if (a === '--prose') opts.prose = argv[++i];
    else fail(`unknown option: ${a}`);
  }
  if (!opts.dataset) fail('--dataset <json> is required');
  const ratio = Boolean(opts.numerator || opts.denominator);
  if (ratio && !(opts.numerator && opts.denominator)) {
    fail('ratio mode needs both --numerator and --denominator');
  }
  if (!ratio && !opts.prose) fail('scan mode needs --prose <file>');
  if (ratio && opts.prose) fail('pick one mode: ratio or scan');
  return opts;
}

function loadJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (e) {
    fail(`cannot read dataset ${path}: ${e.message}`);
  }
}

function fmt(v) {
  return String(Math.round(v * 1e12) / 1e12);
}

// Resolve a dotted path ("regions.0.q4") and reduce to a single number.
// A numeric array sums; anything else non-numeric is a usage error.
function resolveKey(data, key) {
  let cur = data;
  for (const part of key.split('.')) {
    if (cur === null || typeof cur !== 'object' || !(part in cur)) {
      fail(`key not found in dataset: ${key}`);
    }
    cur = cur[part];
  }
  if (typeof cur === 'number') return { value: cur, note: 'value' };
  if (Array.isArray(cur) && cur.every((v) => typeof v === 'number')) {
    return { value: cur.reduce((s, v) => s + v, 0), note: `sum of ${cur.length} values` };
  }
  fail(`key ${key} does not resolve to a number or a numeric array`);
}

// Collect every matchable value in the dataset: numeric leaves and the sum
// of every numeric array, each tagged with its path for the report.
function collectValues(data) {
  const out = [];
  const walk = (node, path) => {
    if (typeof node === 'number') {
      out.push({ value: node, path });
    } else if (Array.isArray(node)) {
      if (node.length > 0 && node.every((v) => typeof v === 'number')) {
        out.push({ value: node.reduce((s, v) => s + v, 0), path: `${path} (array sum)` });
      }
      node.forEach((v, i) => walk(v, `${path}.${i}`));
    } else if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k);
    }
  };
  walk(data, '');
  return out;
}

const SUFFIX_MULT = { K: 1e3, M: 1e6, B: 1e9 };

// Extract data-like numeric tokens. Bare integers and bare decimals are
// deliberately not extracted: years, counts of sections, and other prose
// scaffolding numbers are not dataset claims.
function extractTokens(text) {
  const re =
    /(?<![\w$])(\$[\d,]+(?:\.\d+)?\s*[KMB]|\$[\d,]+(?:\.\d+)?|\d+(?:\.\d+)?\s*%|\d+(?:\.\d+)?\s*(?:x|×)|\d+(?:\.\d+)?\s*[KMB]|\d{1,3}(?:,\d{3})+(?:\.\d+)?)/g;
  const tokens = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const raw = m[1];
    const line = text.slice(0, m.index).split('\n').length;
    tokens.push({ raw, line, candidates: tokenCandidates(raw) });
  }
  return tokens;
}

function tokenCandidates(raw) {
  const s = raw.replace(/\s+/g, '');
  let m;
  if ((m = s.match(/^\$([\d,]+(?:\.\d+)?)([KMB])?$/))) {
    const base = parseFloat(m[1].replace(/,/g, ''));
    return m[2] ? [base * SUFFIX_MULT[m[2]], base] : [base];
  }
  if ((m = s.match(/^([\d,]+(?:\.\d+)?)%$/))) {
    const p = parseFloat(m[1].replace(/,/g, ''));
    return [p, p / 100];
  }
  if ((m = s.match(/^([\d,]+(?:\.\d+)?)(?:x|×)$/))) {
    return [parseFloat(m[1].replace(/,/g, ''))];
  }
  if ((m = s.match(/^([\d,]+(?:\.\d+)?)([KMB])$/))) {
    const base = parseFloat(m[1].replace(/,/g, ''));
    return [base * SUFFIX_MULT[m[2]], base];
  }
  return [parseFloat(s.replace(/,/g, ''))];
}

function matchesAny(candidates, values) {
  for (const c of candidates) {
    for (const v of values) {
      if (Math.abs(c - v.value) <= 1e-9 * Math.max(1, Math.abs(c), Math.abs(v.value))) {
        return v;
      }
    }
  }
  return null;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const data = loadJson(opts.dataset);

  if (opts.numerator) {
    const num = resolveKey(data, opts.numerator);
    const den = resolveKey(data, opts.denominator);
    if (den.value === 0) fail(`denominator ${opts.denominator} is 0`);
    console.log(`numerator ${opts.numerator}: ${fmt(num.value)} (${num.note})`);
    console.log(`denominator ${opts.denominator}: ${fmt(den.value)} (${den.note})`);
    console.log(`ratio: ${fmt(num.value / den.value)}`);
    return;
  }

  let prose;
  try {
    prose = fs.readFileSync(opts.prose, 'utf8');
  } catch (e) {
    fail(`cannot read prose ${opts.prose}: ${e.message}`);
  }
  const values = collectValues(data);
  const tokens = extractTokens(prose);
  let unmatched = 0;
  for (const t of tokens) {
    const hit = matchesAny(t.candidates, values);
    if (hit) {
      console.log(`MATCH line ${t.line}: ${t.raw} = dataset ${hit.path} (${fmt(hit.value)})`);
    } else {
      unmatched++;
      console.log(`UNMATCHED line ${t.line}: ${t.raw} (triage candidate: no dataset value matches)`);
    }
  }
  console.log(`tokens: ${tokens.length}, matched: ${tokens.length - unmatched}, unmatched: ${unmatched}`);
  process.exit(unmatched > 0 ? 1 : 0);
}

main();

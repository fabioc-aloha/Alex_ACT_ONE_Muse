#!/usr/bin/env node
/**
 * count-tells.mjs — mechanical pre-pass for the ai-tell audit.
 *
 * Why: the audit's severity rules turn on counts (em-dash overuse, boldface
 * abuse, "3+ tells clustered in one paragraph"), and a model tallying those
 * by eye while reading is doing arithmetic in prose. This script counts the
 * mechanically detectable tells per paragraph and flags cluster paragraphs;
 * the auditor still judges whether each instance is decorative, but the
 * numbers come from here.
 *
 * Counted per paragraph (paragraphs are separated by blank lines):
 *   - em dashes (—)
 *   - boldface spans (**...** and __...__)
 *   - bracketed placeholders ([Your Name], [link to...], [TODO: ...]) —
 *     bracketed text that is not a markdown link, image, or footnote
 *   - catalog-word occurrences: a built-in list of common AI-vocabulary
 *     words, extendable with --words w1,w2 (case-insensitive, whole word)
 *
 * A paragraph is flagged as a cluster when its total tell count is >= the
 * --cluster threshold (default 3), matching the Major severity rule.
 *
 * Usage:
 *   node scripts/count-tells.mjs FILE [--words delve,tapestry] [--cluster 3] [--json]
 *
 * Output: per-paragraph counts for paragraphs with any tells, cluster
 * flags, and totals. Exit 0 always (this is a measurement, not a verdict),
 * 2 on usage or file error.
 */

import fs from 'node:fs';

const DEFAULT_WORDS = [
  'delve', 'tapestry', 'pivotal', 'crucial', 'intricate', 'vibrant',
  'leverage', 'furthermore', 'moreover', 'notably', 'underscore',
  'underscores', 'highlight', 'highlights', 'landscape', 'realm',
  'testament', 'showcase', 'showcases', 'foster', 'fosters', 'enhance',
  'enhances', 'crucially', 'additionally', 'arguably',
];

function fail(msg) {
  console.error(`[ERROR] ${msg}`);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { file: null, words: [], cluster: 3, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') opts.json = true;
    else if (a === '--words') {
      const v = argv[++i];
      if (!v) fail('--words needs a comma-separated list');
      opts.words = v.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    } else if (a === '--cluster') {
      const v = parseInt(argv[++i], 10);
      if (!Number.isFinite(v) || v < 1) fail('--cluster needs a positive integer');
      opts.cluster = v;
    } else if (a.startsWith('--')) fail(`unknown option: ${a}`);
    else if (!opts.file) opts.file = a;
    else fail('exactly one FILE argument');
  }
  if (!opts.file) fail('usage: node scripts/count-tells.mjs FILE [--words w1,w2] [--cluster N] [--json]');
  return opts;
}

function countWords(text, words) {
  let n = 0;
  for (const w of words) {
    const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const hits = text.match(re);
    if (hits) n += hits.length;
  }
  return n;
}

function analyze(text, words, clusterAt) {
  const paragraphs = text.split(/\r?\n\s*\r?\n/);
  const rows = [];
  const totals = { emDashes: 0, boldSpans: 0, placeholders: 0, catalogWords: 0, clusters: 0 };
  paragraphs.forEach((para, i) => {
    const emDashes = (para.match(/—/g) || []).length;
    const boldSpans =
      (para.match(/\*\*[^*]+\*\*/g) || []).length +
      (para.match(/__[^_]+__/g) || []).length;
    // Bracketed spans that are not links/images/footnotes: [text] not
    // followed by ( or [ or : and not starting with ^
    const placeholders = (para.match(/\[[^\]]+\](?![([:])/g) || []).filter(
      (s) => !s.startsWith('[^')
    ).length;
    const catalogWords = countWords(para, words);
    const total = emDashes + boldSpans + placeholders + catalogWords;
    totals.emDashes += emDashes;
    totals.boldSpans += boldSpans;
    totals.placeholders += placeholders;
    totals.catalogWords += catalogWords;
    const cluster = total >= clusterAt;
    if (cluster) totals.clusters++;
    if (total > 0) {
      rows.push({
        paragraph: i + 1,
        emDashes,
        boldSpans,
        placeholders,
        catalogWords,
        total,
        cluster,
        preview: para.replace(/\s+/g, ' ').slice(0, 70),
      });
    }
  });
  return { paragraphs: paragraphs.length, rows, totals };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  let text;
  try {
    text = fs.readFileSync(opts.file, 'utf8');
  } catch (e) {
    fail(`cannot read ${opts.file}: ${e.message}`);
  }
  const words = [...new Set([...DEFAULT_WORDS, ...opts.words])];
  const r = analyze(text, words, opts.cluster);

  if (opts.json) {
    console.log(JSON.stringify({ file: opts.file, clusterThreshold: opts.cluster, ...r }, null, 2));
    return;
  }
  console.log(`file: ${opts.file} (${r.paragraphs} paragraphs, cluster threshold ${opts.cluster})`);
  for (const row of r.rows) {
    console.log(
      `paragraph ${row.paragraph}: total ${row.total} (em-dash ${row.emDashes}, bold ${row.boldSpans}, placeholder ${row.placeholders}, catalog ${row.catalogWords})${row.cluster ? ' CLUSTER' : ''} — ${row.preview}`
    );
  }
  console.log(
    `totals: em-dash ${r.totals.emDashes}, bold ${r.totals.boldSpans}, placeholders ${r.totals.placeholders}, catalog words ${r.totals.catalogWords}, cluster paragraphs ${r.totals.clusters}`
  );
}

main();

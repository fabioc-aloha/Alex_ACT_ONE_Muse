#!/usr/bin/env node
/**
 * @muscle chart-vocabulary
 * @lifecycle stable
 * @inheritance inheritable
 * @description Count visuals on an HTML page and assert the 5-visual rule
 * @version 1.0.0
 * @platform windows,macos,linux
 * @requires node
 *
 * The 5-visual rule is a count, and counts are not eyeballed. For a
 * machine-readable page (HTML, docs-shell output), this script counts
 * each visual element once: a <canvas>, or any element carrying a
 * data-chart attribute, or any element with a chart class (a class token
 * of exactly "chart" or starting with "chart-"). A class token ending in
 * "-chart" (e.g. "flint-chart") also counts, but only on container
 * elements (div, figure, section, article, svg), so prose classes like
 * "not-a-chart" on a <p> are not false positives.
 *
 * Usage:
 *   node count-visuals.cjs <page.html> [limit]
 *
 * limit defaults to 5 (Module 3). Exit code is 1 when the count exceeds
 * the limit, 0 when the page is within budget, 2 on bad input.
 */

const fs = require('fs');

const file = process.argv[2];
const limit = process.argv[3] === undefined ? 5 : Number(process.argv[3]);
if (!file || !Number.isInteger(limit) || limit < 0) {
  console.error('Usage: node count-visuals.cjs <page.html> [limit]');
  process.exit(2);
}

const html = fs.readFileSync(file, 'utf8');
const tags = html.match(/<[a-zA-Z][a-zA-Z0-9-]*(?:\s[^>]*)?>/g) || [];

let count = 0;
const found = [];
for (const tag of tags) {
  const name = tag.match(/^<([a-zA-Z][a-zA-Z0-9-]*)/)[1].toLowerCase();
  const isCanvas = name === 'canvas';
  const hasDataChart = /\bdata-chart\b/.test(tag);
  const classMatch = tag.match(/class="([^"]*)"/);
  const tokens = classMatch ? classMatch[1].split(/\s+/).filter(Boolean) : [];
  const container = ['div', 'figure', 'section', 'article', 'svg'].includes(name);
  const hasChartClass = tokens.some(
    (c) => c === 'chart' || c.startsWith('chart-') || (container && c.endsWith('-chart'))
  );
  if (isCanvas || hasDataChart || hasChartClass) {
    count += 1;
    found.push(tag.slice(0, 80));
  }
}

for (const t of found) console.log(`  visual: ${t}`);
console.log(`Visuals: ${count} (limit ${limit}) ${count <= limit ? 'PASS' : 'FAIL'}`);
process.exit(count <= limit ? 0 : 1);

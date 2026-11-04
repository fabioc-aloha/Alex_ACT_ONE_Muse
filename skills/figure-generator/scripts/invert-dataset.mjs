#!/usr/bin/env node
/**
 * invert-dataset.mjs: reverse-engineer a dataset from an approved sample SVG.
 *
 * Why: when a sample figure exists but its dataset is missing, the numbers
 * have to come from the sample itself. Reading tick positions and point
 * coordinates by eye and dividing in your head fabricates data that looks
 * precise and is not. This script does the extraction, the scale solve, and
 * the grid-fidelity assertion mechanically; the model judges whether the
 * result makes sense.
 *
 * How it works:
 *   1. Parses numeric <text> elements as axis tick labels and groups them by
 *      cross-axis alignment (shared x for a vertical axis, shared y for a
 *      horizontal one).
 *   2. Solves the linear scale from the two extreme ticks:
 *      scale = (pixelMax - pixelMin) / (valueMax - valueMin).
 *   3. Inverts every polyline/polygon point and circle center on that axis
 *      back to a data value.
 *   4. Asserts exact fit: each inverted value must land exactly on the
 *      coarsest natural grid from 100 down to 0.01. Exit 1 when no grid
 *      fits (the scale is wrong, or the sample draws something other than
 *      the dataset you think), 2 on usage or parse errors.
 *
 * Usage:
 *   node scripts/invert-dataset.mjs <sample.svg>
 */

import fs from 'node:fs';

const GRIDS = [100, 50, 25, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05, 0.01];

function fail(msg, code = 2) {
  console.error(`[ERROR] ${msg}`);
  process.exit(code);
}

function fmt(v) {
  return String(Math.round(v * 1e10) / 1e10);
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}="(-?[\\d.]+)"`));
  return m ? parseFloat(m[1]) : null;
}

function textContent(inner) {
  return inner
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function parseTicks(svg) {
  const ticks = [];
  const re = /<text\b([^>]*)>([\s\S]*?)<\/text>/g;
  let m;
  while ((m = re.exec(svg)) !== null) {
    const content = textContent(m[2]);
    if (!/^-?\d+(\.\d+)?$/.test(content)) continue;
    const x = attr(m[1], 'x');
    const y = attr(m[1], 'y');
    if (x === null || y === null) continue;
    ticks.push({ value: parseFloat(content), x, y });
  }
  return ticks;
}

// Group ticks that share a coordinate (within tolerance) on one axis.
function groupByCoord(ticks, key, otherKey) {
  const sorted = [...ticks].sort((a, b) => a[key] - b[key]);
  const groups = [];
  for (const t of sorted) {
    const g = groups.find((g) => Math.abs(g.coord - t[key]) <= 2);
    if (g) g.items.push(t);
    else groups.push({ coord: t[key], items: [t] });
  }
  return groups
    .map((g) => ({ fixed: g.coord, items: g.items }))
    .filter(
      (g) =>
        g.items.length >= 2 &&
        new Set(g.items.map((t) => t.value)).size >= 2 &&
        new Set(g.items.map((t) => t[otherKey])).size >= 2
    );
}

function solveAxis(ticks, fixedKey, axisKey) {
  const lo = ticks.reduce((a, b) => (b.value < a.value ? b : a));
  const hi = ticks.reduce((a, b) => (b.value > a.value ? b : a));
  const scale = (hi[axisKey] - lo[axisKey]) / (hi.value - lo.value);
  return { lo, hi, scale, pxPerUnit: Math.abs(scale) };
}

function invert(v, axis) {
  return axis.lo.value + (v - axis.lo[axis.axisKey]) / axis.scale;
}

function parsePoints(svg) {
  const points = [];
  let m;
  const shapeRe = /<(polyline|polygon)\b([^>]*)>/g;
  while ((m = shapeRe.exec(svg)) !== null) {
    const pts = (m[2].match(/points="([^"]*)"/) || [])[1];
    if (!pts) continue;
    for (const pair of pts.trim().split(/\s+/)) {
      const [x, y] = pair.split(',').map(Number);
      if (Number.isFinite(x) && Number.isFinite(y)) points.push({ x, y });
    }
  }
  const circleRe = /<circle\b([^>]*)>/g;
  while ((m = circleRe.exec(svg)) !== null) {
    const cx = attr(m[1], 'cx');
    const cy = attr(m[1], 'cy');
    if (cx !== null && cy !== null) points.push({ x: cx, y: cy });
  }
  return points;
}

function fitGrid(values) {
  for (const g of GRIDS) {
    if (values.every((v) => Math.abs(v / g - Math.round(v / g)) <= 1e-9)) return g;
  }
  return null;
}

function main() {
  const file = process.argv[2];
  if (!file) fail('usage: node scripts/invert-dataset.mjs <sample.svg>');
  let svg;
  try {
    svg = fs.readFileSync(file, 'utf8');
  } catch (e) {
    fail(`cannot read ${file}: ${e.message}`);
  }

  const ticks = parseTicks(svg);
  if (ticks.length < 2) fail('fewer than two numeric tick labels found');
  const points = parsePoints(svg);
  if (points.length === 0) fail('no polyline, polygon, or circle data points found');

  const axes = [];
  for (const g of groupByCoord(ticks, 'x', 'y')) {
    axes.push({ orientation: 'y', fixedKey: 'x', axisKey: 'y', ...solveAxis(g.items, 'x', 'y') });
  }
  for (const g of groupByCoord(ticks, 'y', 'x')) {
    axes.push({ orientation: 'x', fixedKey: 'y', axisKey: 'x', ...solveAxis(g.items, 'y', 'x') });
  }
  if (axes.length === 0) fail('no aligned tick group found (need two or more ticks sharing an x or a y)');

  let anyFit = false;
  for (const axis of axes) {
    const values = points.map((p) => invert(p[axis.axisKey], axis));
    const grid = fitGrid(values);
    console.log(
      `axis ${axis.orientation}: value ${fmt(axis.lo.value)} at ${axis.axisKey}=${fmt(axis.lo[axis.axisKey])}, ` +
        `value ${fmt(axis.hi.value)} at ${axis.axisKey}=${fmt(axis.hi[axis.axisKey])}`
    );
    console.log(`pxPerUnit: ${fmt(axis.pxPerUnit)}`);
    console.log(`inverted values: ${values.map(fmt).join(', ')}`);
    if (grid !== null) {
      anyFit = true;
      console.log(`grid: ${fmt(grid)} (exact fit)`);
    } else {
      console.log('grid: NONE (no natural grid fits every value exactly)');
    }
  }
  process.exit(anyFit ? 0 : 1);
}

main();

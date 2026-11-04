#!/usr/bin/env node
/**
 * check-print-floor.mjs: the shipped gate for the print-legibility floor.
 *
 * Why: the style guide states a floor (5.8pt instructional, 2.9pt for
 * note/micro roles) and calls it gate-enforced, but a floor that lives only
 * in prose is enforced by whoever remembers it. This script computes the
 * print size of every <text> element from the guide's own formula and fails
 * on the violations the guide names. The model reads the verdict; it does
 * not do the px-to-points arithmetic itself.
 *
 * Formula (from SKILL.md): printPoints = fontSizePx x printWidthIn x 72 /
 * viewBoxWidth. Print width defaults to 4.39in (7x10in trim, standard
 * figure); override with --print-width-in.
 *
 * Failures (exit 1 when any occur):
 *   - text below the 5.8pt instructional floor with no data-print-role
 *     marker (unmarked below-floor text)
 *   - note or micro role text below the 2.9pt floor
 *   - a <text> element with no font-size (attribute or style)
 *   - an unknown data-print-role value (only "note" and "micro" exist)
 *   - micro-role text of 40 or more characters: at 40 chars the guide
 *     auto-promotes micro to note, so a long micro is a misclassified note
 *
 * Usage:
 *   node scripts/check-print-floor.mjs <figure.svg> [--print-width-in 4.39]
 *
 * Exit 0 when every text element passes, 2 on usage or file errors.
 */

import fs from 'node:fs';

const INSTRUCTIONAL_FLOOR = 5.8;
const ROLE_FLOOR = 2.9;
const MICRO_PROMOTE_CHARS = 40;
const KNOWN_ROLES = new Set(['note', 'micro']);

function fail(msg) {
  console.error(`[ERROR] ${msg}`);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { file: null, printWidthIn: 4.39 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--print-width-in') {
      opts.printWidthIn = parseFloat(argv[++i]);
      if (!Number.isFinite(opts.printWidthIn) || opts.printWidthIn <= 0) {
        fail('--print-width-in needs a positive number');
      }
    } else if (a.startsWith('--')) fail(`unknown option: ${a}`);
    else if (!opts.file) opts.file = a;
    else fail('exactly one FILE argument');
  }
  if (!opts.file) fail('usage: node scripts/check-print-floor.mjs <figure.svg> [--print-width-in N]');
  return opts;
}

function fontSizeOf(attrs) {
  const direct = attrs.match(/\bfont-size="([\d.]+)(?:px)?"/);
  if (direct) return parseFloat(direct[1]);
  const styled = attrs.match(/font-size:\s*([\d.]+)(?:px)?/);
  if (styled) return parseFloat(styled[1]);
  return null;
}

function textContent(inner) {
  return inner
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  let svg;
  try {
    svg = fs.readFileSync(opts.file, 'utf8');
  } catch (e) {
    fail(`cannot read ${opts.file}: ${e.message}`);
  }

  const vb = svg.match(/<svg\b[^>]*viewBox="([\d.\s-]+)"/);
  if (!vb) fail('no viewBox on the root <svg> element: print size cannot be computed');
  const viewBoxWidth = parseFloat(vb[1].trim().split(/\s+/)[2]);
  if (!Number.isFinite(viewBoxWidth) || viewBoxWidth <= 0) fail('viewBox width is not a positive number');

  const re = /<text\b([^>]*)>([\s\S]*?)<\/text>/g;
  let m;
  let checked = 0;
  const failures = [];
  while ((m = re.exec(svg)) !== null) {
    checked++;
    const attrs = m[1];
    const content = textContent(m[2]);
    const preview = content.slice(0, 50);
    const roleMatch = attrs.match(/data-print-role="([^"]*)"/);
    const role = roleMatch ? roleMatch[1] : null;
    const size = fontSizeOf(attrs);

    if (role !== null && !KNOWN_ROLES.has(role)) {
      failures.push(`text ${checked} (${JSON.stringify(preview)}): unknown data-print-role "${role}"`);
      continue;
    }
    if (size === null) {
      failures.push(`text ${checked} (${JSON.stringify(preview)}): missing font-size`);
      continue;
    }
    const pt = (size * opts.printWidthIn * 72) / viewBoxWidth;
    const ptStr = pt.toFixed(2);
    if (role === null) {
      if (pt < INSTRUCTIONAL_FLOOR - 1e-9) {
        failures.push(
          `text ${checked} (${JSON.stringify(preview)}): ${size}px = ${ptStr}pt, below the ` +
            `${INSTRUCTIONAL_FLOOR}pt instructional floor, with no data-print-role marker`
        );
      }
    } else {
      if (pt < ROLE_FLOOR - 1e-9) {
        failures.push(
          `text ${checked} (${JSON.stringify(preview)}): role "${role}" at ${size}px = ${ptStr}pt, ` +
            `below the ${ROLE_FLOOR}pt floor for marked text`
        );
      }
      if (role === 'micro' && content.length >= MICRO_PROMOTE_CHARS) {
        failures.push(
          `text ${checked} (${JSON.stringify(preview)}): micro-role text of ${content.length} characters ` +
            `(${MICRO_PROMOTE_CHARS}+ auto-promotes to note)`
        );
      }
    }
  }

  console.log(
    `checked ${checked} text elements (viewBox width ${viewBoxWidth}, print width ${opts.printWidthIn}in)`
  );
  for (const f of failures) console.log(`FAIL: ${f}`);
  console.log(failures.length === 0 ? 'verdict: PASS' : `verdict: FAIL (${failures.length} violation(s))`);
  process.exit(failures.length > 0 ? 1 : 0);
}

main();

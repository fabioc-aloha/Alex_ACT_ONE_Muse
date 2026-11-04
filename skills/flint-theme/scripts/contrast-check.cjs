#!/usr/bin/env node
/**
 * @muscle flint-theme
 * @lifecycle stable
 * @inheritance inheritable
 * @description Compute WCAG contrast ratios for hex color pairs and assert AA thresholds
 * @version 1.0.0
 * @platform windows,macos,linux
 * @requires node
 *
 * Text contrast in Theme Lab is a number, not an impression. This script
 * computes the WCAG 2.x contrast ratio for each foreground/background hex
 * pair and fails any pair under the AA threshold: 4.5:1 for normal text,
 * 3:1 for large text (18pt+, or 14pt+ bold).
 *
 * Usage:
 *   node contrast-check.cjs <fg:bg> [more pairs...]
 *   node contrast-check.cjs "#1f2937:#ffffff" "#777777:#ffffff:large"
 *
 * Each pair is fg:bg, with an optional :large suffix. Hex values may be
 * #rgb or #rrggbb, with or without the leading #. Exit code is 1 when any
 * pair fails its threshold, 0 when all pass, 2 on bad input.
 */

function parseHex(h) {
  let s = String(h).trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(s)) s = s.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

function luminance([r, g, b]) {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

const pairs = process.argv.slice(2);
if (pairs.length === 0) {
  console.error('Usage: node contrast-check.cjs <fg:bg> [more pairs...]  (suffix :large for large text)');
  process.exit(2);
}

let failures = 0;
for (const spec of pairs) {
  const parts = spec.split(':');
  const large = parts.length === 3 && parts[2] === 'large';
  if (parts.length < 2 || parts.length > 3 || (parts.length === 3 && !large)) {
    console.error(`Bad pair spec: ${spec} (expected fg:bg or fg:bg:large)`);
    process.exit(2);
  }
  const fg = parseHex(parts[0]);
  const bg = parseHex(parts[1]);
  if (!fg || !bg) {
    console.error(`Bad hex value in pair: ${spec}`);
    process.exit(2);
  }
  const r = ratio(fg, bg);
  const threshold = large ? 3.0 : 4.5;
  const ok = r >= threshold;
  if (!ok) failures += 1;
  console.log(
    `${parts[0]} on ${parts[1]}: ${r.toFixed(2)}:1 ${ok ? 'PASS' : 'FAIL'} (AA ${large ? 'large' : 'normal'} >= ${threshold.toFixed(1)})`
  );
}

process.exit(failures === 0 ? 0 : 1);

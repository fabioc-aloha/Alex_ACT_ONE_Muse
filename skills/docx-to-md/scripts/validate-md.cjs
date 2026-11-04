#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle validate-md
 * @inheritance inheritable
 * @description Post-conversion acceptance checks for docx-to-md output
 * @version 1.0.0
 * @skill docx-to-md
 * @platform windows,macos,linux
 * @requires node
 *
 * The docx-to-md conversion is scripted; its acceptance checks must be too.
 * This validator asserts the three machine-checkable rows of the Conversion
 * Acceptance Decision Table instead of leaving them to spot-checks:
 *
 *   1. Heading-level continuity: no heading jumps more than one level
 *      deeper than the previous heading (H1 -> H3 is a skip).
 *   2. Footnote sequence: every [^label] reference has a definition, and
 *      numeric footnote definitions form the exact sequence 1..N with no
 *      gaps or duplicates.
 *   3. Image existence: every relative image referenced in the output
 *      exists on disk, resolved against the Markdown file's directory.
 *
 * Usage:
 *   node validate-md.cjs OUTPUT.md
 *
 * Exit codes: 0 = all checks pass, 1 = at least one check failed,
 * 2 = usage or file error.
 */

"use strict";

const fs = require("fs");
const path = require("path");

function fail(msg) {
  console.error(`[ERROR] ${msg}`);
  process.exit(2);
}

function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    fail("usage: node validate-md.cjs OUTPUT.md");
  }
  const mdPath = path.resolve(args[0]);
  let text;
  try {
    text = fs.readFileSync(mdPath, "utf8");
  } catch (e) {
    fail(`cannot read ${mdPath}: ${e.message}`);
  }
  const dir = path.dirname(mdPath);
  const lines = text.split(/\r?\n/);
  const problems = [];

  // Strip fenced code blocks so examples inside them are not checked.
  const prose = [];
  let inFence = false;
  lines.forEach((line, idx) => {
    if (/^\s*```/.test(line)) inFence = !inFence;
    prose.push(inFence || /^\s*```/.test(line) ? "" : line);
    void idx;
  });

  // 1. Heading-level continuity
  let prevLevel = 0;
  let headings = 0;
  prose.forEach((line, idx) => {
    const m = line.match(/^(#{1,6})\s+/);
    if (!m) return;
    const level = m[1].length;
    headings++;
    if (prevLevel > 0 && level > prevLevel + 1) {
      problems.push(`headings: line ${idx + 1} jumps H${prevLevel} -> H${level} (skipped level)`);
    }
    prevLevel = level;
  });

  // 2. Footnote sequence
  const refLabels = new Set();
  const defLabels = [];
  prose.forEach((line) => {
    const def = line.match(/^\[\^([^\]]+)\]:/);
    if (def) {
      defLabels.push(def[1]);
      return;
    }
    let m;
    const re = /\[\^([^\]]+)\]/g;
    while ((m = re.exec(line)) !== null) refLabels.add(m[1]);
  });
  const defSet = new Set(defLabels);
  for (const label of refLabels) {
    if (!defSet.has(label)) {
      problems.push(`footnotes: reference [^${label}] has no definition`);
    }
  }
  const numericDefs = defLabels.filter((l) => /^\d+$/.test(l)).map(Number);
  const sorted = [...numericDefs].sort((a, b) => a - b);
  sorted.forEach((n, i) => {
    if (n !== i + 1) {
      problems.push(`footnotes: definitions are not sequential (expected ${i + 1}, found ${n})`);
    }
  });
  if (new Set(numericDefs).size !== numericDefs.length) {
    problems.push("footnotes: duplicate numeric definitions");
  }

  // 3. Image existence
  let images = 0;
  prose.forEach((line, idx) => {
    let m;
    const re = /!\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;
    while ((m = re.exec(line)) !== null) {
      const target = m[1];
      if (/^(https?:|data:)/i.test(target)) continue;
      images++;
      let decoded = target.split("#")[0];
      try {
        decoded = decodeURIComponent(decoded);
      } catch {
        /* leave as-is */
      }
      const resolved = path.resolve(dir, decoded);
      if (!fs.existsSync(resolved)) {
        problems.push(`images: line ${idx + 1} references missing file ${target} (resolved: ${resolved})`);
      }
    }
  });

  console.log(`headings: ${headings} checked for level continuity`);
  console.log(`footnotes: ${defLabels.length} definition(s), ${refLabels.size} referenced label(s)`);
  console.log(`images: ${images} relative reference(s) checked`);
  if (problems.length > 0) {
    for (const p of problems) console.log(`FAIL ${p}`);
    console.log(`FAIL: ${problems.length} acceptance problem(s)`);
    process.exit(1);
  }
  console.log("PASS: heading continuity, footnote sequence, and image existence all hold");
}

main();

#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle check-links
 * @inheritance inheritable
 * @description Verify that relative Markdown links resolve to files on disk
 * @version 1.0.0
 * @skill compile-brain
 * @platform windows,macos,linux
 * @requires node
 *
 * Link resolution is a filesystem check, not a reading task. This script
 * extracts inline links, images, and reference-style link definitions from
 * each given Markdown file, resolves every relative target against the
 * file's own directory, and reports each miss with file and line. External
 * URLs (http:, https:, mailto:, tel:) and pure in-page anchors are listed
 * as skipped, not checked. A target with a #fragment checks the file part
 * only. Percent-encoded characters in targets are decoded before resolving.
 *
 * Usage:
 *   node check-links.cjs FILE.md [FILE2.md ...]
 *
 * Exit codes: 0 = every relative link resolves, 1 = at least one miss,
 * 2 = usage or file error.
 *
 * Also used by the meditation skill's persistence verification: run it over
 * HANDOFF.md, TODO.md, CHANGELOG.md, and AGENTS.md before reporting that
 * local links verify.
 */

"use strict";

const fs = require("fs");
const path = require("path");

function fail(msg) {
  console.error(`[ERROR] ${msg}`);
  process.exit(2);
}

// Inline link or image: [text](target "optional title") / ![alt](target)
const INLINE_RE = /!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;
// Reference-style definition: [id]: target
const REFDEF_RE = /^\s{0,3}\[[^\]]+\]:\s*<?(\S+?)>?(?:\s+.*)?$/;

function isExternal(target) {
  return /^(https?:|mailto:|tel:|data:|ftp:)/i.test(target);
}

function checkFile(file) {
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch (e) {
    fail(`cannot read ${file}: ${e.message}`);
  }
  const dir = path.dirname(path.resolve(file));
  const lines = text.split(/\r?\n/);
  const misses = [];
  let checked = 0;
  let skipped = 0;

  function consider(target, lineNo) {
    if (!target) return;
    if (isExternal(target) || target.startsWith("#")) {
      skipped++;
      return;
    }
    const filePart = target.split("#")[0];
    if (!filePart) {
      skipped++;
      return;
    }
    let decoded = filePart;
    try {
      decoded = decodeURIComponent(filePart);
    } catch {
      /* leave as-is */
    }
    checked++;
    const resolved = path.resolve(dir, decoded);
    if (!fs.existsSync(resolved)) {
      misses.push({ line: lineNo, target, resolved });
    }
  }

  lines.forEach((line, idx) => {
    const lineNo = idx + 1;
    let m;
    INLINE_RE.lastIndex = 0;
    while ((m = INLINE_RE.exec(line)) !== null) consider(m[1], lineNo);
    const ref = line.match(REFDEF_RE);
    if (ref) consider(ref[1], lineNo);
  });

  return { file, checked, skipped, misses };
}

function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    fail("usage: node check-links.cjs FILE.md [FILE2.md ...]");
  }
  let totalMisses = 0;
  for (const file of files) {
    const r = checkFile(file);
    for (const miss of r.misses) {
      console.log(`MISS ${r.file}:${miss.line} -> ${miss.target} (resolved: ${miss.resolved})`);
    }
    console.log(`${r.file}: ${r.checked} relative link(s) checked, ${r.misses.length} miss(es), ${r.skipped} skipped (external/anchor)`);
    totalMisses += r.misses.length;
  }
  if (totalMisses > 0) {
    console.log(`FAIL: ${totalMisses} unresolved relative link(s)`);
    process.exit(1);
  }
  console.log("OK: every relative link resolves");
}

main();

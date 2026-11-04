#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle measure-reduction
 * @inheritance inheritable
 * @description Measure source vs draft length and percent reduction for compile-brain gates
 * @version 1.0.0
 * @skill compile-brain
 * @platform windows,macos,linux
 * @requires node
 *
 * The compile-brain high-reduction gates (20% / 35% / 50%) must be read off a
 * measurement, never estimated in prose (no "characters divided by four").
 * This script counts characters in the source and the draft and prints the
 * percent reduction plus the gate band it falls in. When a tokenizer CLI is
 * on PATH (override with --tokenizer <cmd>), token counts are printed too;
 * the character measurement is always the fallback and always printed.
 *
 * Usage:
 *   node measure-reduction.cjs SOURCE.md DRAFT.md [--tokenizer <cmd>]
 *
 * The tokenizer command, when used, must accept text on stdin and print a
 * single integer token count on stdout.
 *
 * Exit codes: 0 = measured, 2 = usage or file error.
 */

"use strict";

const fs = require("fs");
const { spawnSync } = require("child_process");

function fail(msg) {
  console.error(`[ERROR] ${msg}`);
  process.exit(2);
}

function parseArgs(argv) {
  const files = [];
  let tokenizer = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--tokenizer") {
      tokenizer = argv[++i];
      if (!tokenizer) fail("--tokenizer needs a command");
    } else if (argv[i].startsWith("--")) {
      fail(`unknown option: ${argv[i]}`);
    } else {
      files.push(argv[i]);
    }
  }
  if (files.length !== 2) {
    fail("usage: node measure-reduction.cjs SOURCE.md DRAFT.md [--tokenizer <cmd>]");
  }
  return { source: files[0], draft: files[1], tokenizer };
}

function readFile(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch (e) {
    fail(`cannot read ${p}: ${e.message}`);
  }
}

function countTokens(cmd, text) {
  const res = spawnSync(cmd, [], { input: text, encoding: "utf8", shell: true });
  if (res.error || res.status !== 0) return null;
  const n = parseInt(String(res.stdout).trim(), 10);
  return Number.isFinite(n) ? n : null;
}

function band(pct) {
  if (pct <= 20) return "within the conservative first-pass ceiling (<= 20%)";
  if (pct <= 35) return "above the first-pass ceiling (> 20%): present the first-pass receipt and get an explicit second-pass request";
  if (pct <= 50) return "high-reduction (> 35%): explicit rationale and fresh-context semantic review required before presenting as execution-ready";
  return "above 50%: the review must specifically challenge whether compressed tables, examples, citations, or resource links carried operational meaning";
}

function main() {
  const { source, draft, tokenizer } = parseArgs(process.argv.slice(2));
  const srcText = readFile(source);
  const draftText = readFile(draft);

  const srcChars = [...srcText].length;
  const draftChars = [...draftText].length;
  if (srcChars === 0) fail(`source ${source} is empty; reduction is undefined`);

  const pct = (1 - draftChars / srcChars) * 100;

  console.log(`source: ${source} = ${srcChars} characters`);
  console.log(`draft:  ${draft} = ${draftChars} characters`);
  console.log(`reduction (characters): ${pct.toFixed(1)}%`);
  console.log(`gate: ${band(pct)}`);

  if (tokenizer) {
    const srcTok = countTokens(tokenizer, srcText);
    const draftTok = countTokens(tokenizer, draftText);
    if (srcTok !== null && draftTok !== null && srcTok > 0) {
      const tokPct = (1 - draftTok / srcTok) * 100;
      console.log(`tokens (via ${tokenizer}): source ${srcTok}, draft ${draftTok}, reduction ${tokPct.toFixed(1)}%`);
    } else {
      console.log(`tokens: tokenizer command "${tokenizer}" did not return counts; character measurement stands`);
    }
  }
}

main();

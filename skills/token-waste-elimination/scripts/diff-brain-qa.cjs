#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle diff-brain-qa
 * @inheritance inheritable
 * @description Compute before/after deltas from two brain-qa --json snapshots
 * @version 1.0.0
 * @skill token-waste-elimination
 * @platform windows,macos,linux
 * @requires node
 *
 * Workflow step 6 asks for artifact-count and high-frequency-line deltas
 * between the baseline brain-QA snapshot and the post-change snapshot.
 * Subtracting snapshot numbers in prose is exactly the kind of arithmetic
 * that drifts. This script reads both `brain-qa --json` outputs and prints
 * the deltas itself.
 *
 * Snapshot shapes vary by project, so the script is shape-tolerant:
 *   - Artifact count: the length of the first array found under any of
 *     artifacts / files / items / results, or a numeric count/total field.
 *   - High-frequency lines: when artifact entries carry per-file line
 *     counts (lines / lineCount) and an applyTo scope, lines for scopes
 *     "**" plus the slash-star variant are summed. Otherwise all line
 *     counts is reported as total lines.
 *   - Every numeric scalar field present at the same path in both
 *     snapshots is also diffed, so project-specific counters still show.
 *
 * Usage:
 *   node diff-brain-qa.cjs BEFORE.json AFTER.json
 *
 * Exit codes: 0 = diffed, 2 = usage, file, or JSON error.
 */

"use strict";

const fs = require("fs");

function fail(msg) {
  console.error(`[ERROR] ${msg}`);
  process.exit(2);
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    fail(`cannot parse ${p} as JSON: ${e.message}`);
  }
}

const LIST_KEYS = ["artifacts", "files", "items", "results"];

function artifactList(snap) {
  if (Array.isArray(snap)) return snap;
  if (snap && typeof snap === "object") {
    for (const k of LIST_KEYS) {
      if (Array.isArray(snap[k])) return snap[k];
    }
  }
  return null;
}

function artifactCount(snap) {
  const list = artifactList(snap);
  if (list) return list.length;
  if (snap && typeof snap === "object") {
    for (const k of ["count", "total", "artifactCount", "totalArtifacts"]) {
      if (typeof snap[k] === "number") return snap[k];
    }
  }
  return null;
}

function entryLines(e) {
  if (!e || typeof e !== "object") return null;
  for (const k of ["lines", "lineCount", "line_count"]) {
    if (typeof e[k] === "number") return e[k];
  }
  return null;
}

function lineSums(snap) {
  const list = artifactList(snap);
  if (!list) return null;
  let total = 0;
  let high = 0;
  let any = false;
  let anyScoped = false;
  for (const e of list) {
    const n = entryLines(e);
    if (n === null) continue;
    any = true;
    total += n;
    const scope = e && typeof e === "object" ? e.applyTo || e.scope || e.glob : null;
    if (scope === "**" || scope === "**/*") {
      high += n;
      anyScoped = true;
    }
  }
  if (!any) return null;
  return { total, highFreq: anyScoped ? high : null };
}

function collectScalars(obj, prefix, out) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return;
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "number") out.set(p, v);
    else if (v && typeof v === "object" && !Array.isArray(v)) collectScalars(v, p, out);
  }
}

function fmtDelta(before, after) {
  if (before === null || after === null) return "n/a (missing in one snapshot)";
  const d = after - before;
  const sign = d > 0 ? "+" : "";
  return `${before} -> ${after} (delta ${sign}${d})`;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2) fail("usage: node diff-brain-qa.cjs BEFORE.json AFTER.json");
  const before = readJson(args[0]);
  const after = readJson(args[1]);

  console.log(`artifacts: ${fmtDelta(artifactCount(before), artifactCount(after))}`);

  const lb = lineSums(before);
  const la = lineSums(after);
  if (lb && la) {
    console.log(`total lines: ${fmtDelta(lb.total, la.total)}`);
    if (lb.highFreq !== null && la.highFreq !== null) {
      console.log(`high-frequency lines ("**" + "**/*"): ${fmtDelta(lb.highFreq, la.highFreq)}`);
    } else {
      console.log('high-frequency lines: n/a (artifact entries lack applyTo scopes in one snapshot)');
    }
  } else {
    console.log("lines: n/a (no per-artifact line counts in one snapshot)");
  }

  const sb = new Map();
  const sa = new Map();
  collectScalars(before, "", sb);
  collectScalars(after, "", sa);
  const shared = [...sb.keys()].filter((k) => sa.has(k)).sort();
  if (shared.length > 0) {
    console.log("numeric fields present in both snapshots:");
    for (const k of shared) console.log(`  ${k}: ${fmtDelta(sb.get(k), sa.get(k))}`);
  }
}

main();

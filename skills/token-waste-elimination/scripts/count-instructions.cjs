#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle count-instructions
 * @inheritance inheritable
 * @description Fallback measurement for token-waste-elimination when a project ships no brain-QA scripts
 * @version 1.0.0
 * @skill token-waste-elimination
 * @platform windows,macos,linux
 * @requires node
 *
 * Fallback for projects that do not ship brain-qa equivalents. Counting
 * instruction files and their lines is a filesystem measurement, not a
 * by-hand listing. This script walks a root directory, finds instruction
 * files (*.instructions.md), parses each file's frontmatter `applyTo:`
 * value, and prints line counts grouped by scope. It also scans skill
 * files (SKILL.md) and flags any that exceed 500 lines, matching the
 * skill's "Skill exceeds 500 lines" waste signal.
 *
 * Usage:
 *   node count-instructions.cjs [ROOT] [--json]
 *
 * ROOT defaults to the current working directory. node_modules and .git
 * are never walked.
 *
 * Exit codes: 0 = measured, 2 = usage or directory error.
 */

"use strict";

const fs = require("fs");
const path = require("path");

function fail(msg) {
  console.error(`[ERROR] ${msg}`);
  process.exit(2);
}

const SKIP_DIRS = new Set(["node_modules", ".git"]);

function walk(dir, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(full, out);
    } else if (e.isFile()) {
      out.push(full);
    }
  }
}

function lineCount(text) {
  if (text.length === 0) return 0;
  return text.split(/\r?\n/).length - (text.endsWith("\n") ? 1 : 0) || text.split(/\r?\n/).length;
}

function applyToOf(text) {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return "(no frontmatter)";
  const m = fm[1].match(/^\s*applyTo:\s*"?([^"\n]+?)"?\s*$/m);
  return m ? m[1].trim() : "(no applyTo)";
}

function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const positional = args.filter((a) => !a.startsWith("--"));
  if (positional.length > 1) fail("usage: node count-instructions.cjs [ROOT] [--json]");
  const root = path.resolve(positional[0] || ".");
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    fail(`root is not a directory: ${root}`);
  }

  const files = [];
  walk(root, files);

  const instructions = [];
  const oversizedSkills = [];
  for (const f of files) {
    const base = path.basename(f);
    if (base.endsWith(".instructions.md")) {
      const text = fs.readFileSync(f, "utf8");
      instructions.push({
        file: path.relative(root, f).split(path.sep).join("/"),
        applyTo: applyToOf(text),
        lines: lineCount(text),
      });
    } else if (base === "SKILL.md") {
      const text = fs.readFileSync(f, "utf8");
      const n = lineCount(text);
      if (n > 500) {
        oversizedSkills.push({
          file: path.relative(root, f).split(path.sep).join("/"),
          lines: n,
        });
      }
    }
  }

  const byScope = new Map();
  for (const ins of instructions) {
    if (!byScope.has(ins.applyTo)) byScope.set(ins.applyTo, { files: 0, lines: 0 });
    const g = byScope.get(ins.applyTo);
    g.files++;
    g.lines += ins.lines;
  }
  const totalLines = instructions.reduce((s, i) => s + i.lines, 0);

  if (json) {
    console.log(
      JSON.stringify(
        {
          root,
          instructions,
          byScope: Object.fromEntries(byScope),
          totalInstructionFiles: instructions.length,
          totalInstructionLines: totalLines,
          oversizedSkills,
        },
        null,
        2
      )
    );
    return;
  }

  console.log(`root: ${root}`);
  console.log("instruction files by applyTo scope:");
  const scopes = [...byScope.entries()].sort((a, b) => b[1].lines - a[1].lines);
  if (scopes.length === 0) console.log("  (none found)");
  for (const [scope, g] of scopes) {
    console.log(`  ${scope}: ${g.files} file(s), ${g.lines} line(s)`);
  }
  const highFreq = ['**', '**/*'].reduce((s, k) => s + (byScope.get(k)?.lines || 0), 0);
  console.log(`high-frequency scopes ("**" + "**/*"): ${highFreq} line(s)`);
  console.log(`total: ${instructions.length} instruction file(s), ${totalLines} line(s)`);
  console.log(`skill files over 500 lines: ${oversizedSkills.length}`);
  for (const s of oversizedSkills) console.log(`  OVER 500: ${s.file} = ${s.lines} lines`);
}

main();

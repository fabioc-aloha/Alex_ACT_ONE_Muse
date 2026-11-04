#!/usr/bin/env node
/**
 * lint-innerhtml.mjs — enumerate every innerHTML/outerHTML assignment in a
 * surface and flag any whose value is not DOMPurify.sanitize output.
 *
 * Why: the checklist claim "no raw innerHTML without sanitization anywhere
 * in the surface" is a surface-wide structural claim. Verifying it by
 * reading code misses the one assignment nobody opened. This lint makes
 * the claim machine-checkable.
 *
 * An assignment passes when its right-hand side:
 *   - calls DOMPurify.sanitize(...) directly, or
 *   - is exactly an identifier that is assigned DOMPurify.sanitize(...)
 *     output somewhere in the same file (const/let/var or plain assignment).
 * Anything else is flagged. Template literals and expressions that merely
 * contain a sanitized variable among other content are flagged: route them
 * through a named sanitized variable so the lint can verify them.
 *
 * Usage:
 *   node scripts/lint-innerhtml.mjs FILE [FILE...]
 *   node scripts/lint-innerhtml.mjs src/         (walks .js/.mjs/.cjs/.ts/.tsx/.jsx/.html)
 *
 * Output: one line per assignment (PASS or FLAG with file:line), then a
 * summary. Exit 0 = no flags, 1 = at least one flag, 2 = usage error.
 */

import fs from 'node:fs';
import path from 'node:path';

const EXTS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.html']);
const ASSIGN_RE = /\.(innerHTML|outerHTML)\s*\+?=\s*/g;
const SANITIZED_DEF_RE = /(?:const|let|var)?\s*([A-Za-z_$][\w$]*)\s*=\s*DOMPurify\.sanitize\s*\(/g;

function fail(msg) {
  console.error(`[ERROR] ${msg}`);
  process.exit(2);
}

function collectFiles(inputs) {
  const out = [];
  for (const input of inputs) {
    let st;
    try {
      st = fs.statSync(input);
    } catch {
      fail(`cannot read ${input}`);
    }
    if (st.isDirectory()) {
      const stack = [input];
      while (stack.length) {
        const dir = stack.pop();
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
          if (e.name === 'node_modules' || e.name === '.git') continue;
          const full = path.join(dir, e.name);
          if (e.isDirectory()) stack.push(full);
          else if (EXTS.has(path.extname(e.name))) out.push(full);
        }
      }
    } else {
      out.push(input);
    }
  }
  return out;
}

// Capture the RHS starting at `start`: up to the terminating semicolon at
// paren depth 0, looking ahead at most 6 lines.
function captureRhs(lines, startLine, startCol) {
  let depth = 0;
  let text = '';
  for (let i = startLine; i < Math.min(lines.length, startLine + 6); i++) {
    const line = i === startLine ? lines[i].slice(startCol) : lines[i];
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '(' || ch === '[' || ch === '{') depth++;
      if (ch === ')' || ch === ']' || ch === '}') depth--;
      if (ch === ';' && depth <= 0) return text.trim();
      text += ch;
    }
    text += '\n';
  }
  return text.trim();
}

function lintFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);

  const sanitizedIds = new Set();
  let m;
  SANITIZED_DEF_RE.lastIndex = 0;
  while ((m = SANITIZED_DEF_RE.exec(text)) !== null) sanitizedIds.add(m[1]);

  const results = [];
  lines.forEach((line, idx) => {
    ASSIGN_RE.lastIndex = 0;
    let a;
    while ((a = ASSIGN_RE.exec(line)) !== null) {
      const rhs = captureRhs(lines, idx, a.index + a[0].length);
      let ok = false;
      let why = '';
      if (/DOMPurify\.sanitize\s*\(/.test(rhs)) {
        ok = true;
        why = 'direct DOMPurify.sanitize call';
      } else if (/^[A-Za-z_$][\w$]*$/.test(rhs) && sanitizedIds.has(rhs)) {
        ok = true;
        why = `variable "${rhs}" holds DOMPurify.sanitize output`;
      }
      results.push({ line: idx + 1, prop: a[1], ok, why, rhs: rhs.split('\n')[0].slice(0, 80) });
    }
  });
  return results;
}

function main() {
  const inputs = process.argv.slice(2);
  if (inputs.length === 0) fail('usage: node scripts/lint-innerhtml.mjs FILE [FILE...]');
  const files = collectFiles(inputs);
  let total = 0;
  let flagged = 0;
  for (const file of files) {
    for (const r of lintFile(file)) {
      total++;
      if (r.ok) {
        console.log(`PASS ${file}:${r.line} ${r.prop} = ${r.rhs} (${r.why})`);
      } else {
        flagged++;
        console.log(`FLAG ${file}:${r.line} ${r.prop} = ${r.rhs} (not DOMPurify.sanitize output)`);
      }
    }
  }
  console.log(`summary: ${total} assignment(s), ${flagged} flagged`);
  if (flagged > 0) {
    console.log('FAIL: raw innerHTML/outerHTML without sanitization found');
    process.exit(1);
  }
  console.log('OK: every innerHTML/outerHTML assignment is fed by DOMPurify.sanitize');
}

main();

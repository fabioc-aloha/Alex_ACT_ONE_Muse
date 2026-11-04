#!/usr/bin/env node
/**
 * lint-mermaid-classes.mjs: verify every flowchart node carries a class.
 *
 * Why: the markdown-mermaid skill requires a :::class suffix from the
 * semantic classDef vocabulary on every node, and an unclassed node fails
 * silently: the diagram still renders, just off-palette. Scanning a long
 * document's diagrams by eye for missing suffixes is exactly the kind of
 * check that gets skipped. This script extracts the blocks and does the
 * scan mechanically.
 *
 * Behavior:
 *   - Extracts every ```mermaid fenced block from a markdown file.
 *   - Flowchart and graph blocks are linted. Every other diagram type is
 *     reported as skipped (the class vocabulary is a flowchart rule).
 *   - A node counts as covered when it carries an inline :::class suffix
 *     or is assigned a class by a `class` statement in the same block.
 *   - Node definitions include explicit shapes (A[label], B{label},
 *     C(label)) and bare node ids used in edges.
 *
 * Usage:
 *   node scripts/lint-mermaid-classes.mjs <file.md>
 *
 * Exit 1 when any flowchart or graph node is uncovered, 0 when clean,
 * 2 on usage or file errors.
 */

import fs from 'node:fs';

const SKIP_LINE =
  /^(classDef|linkStyle|style|click|subgraph|end|direction|accTitle|accDescr)\b/;
const KEYWORD_IDS = new Set(['flowchart', 'graph', 'subgraph', 'end', 'direction']);

function fail(msg) {
  console.error(`[ERROR] ${msg}`);
  process.exit(2);
}

function extractBlocks(text) {
  const blocks = [];
  const re = /```mermaid\r?\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    blocks.push({ body: m[1], startLine: text.slice(0, m.index).split('\n').length });
  }
  return blocks;
}

function diagramType(lines) {
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('%%')) continue;
    return t.split(/\s+/)[0];
  }
  return '';
}

function lintBlock(lines) {
  // Pass 1: collect ids assigned by `class` statements.
  const coveredByStatement = new Set();
  for (const line of lines) {
    const m = line.trim().match(/^class\s+([\w,\s-]+?)\s+(\S+)\s*$/);
    if (m) {
      for (const id of m[1].split(',').map((s) => s.trim()).filter(Boolean)) {
        coveredByStatement.add(id);
      }
    }
  }
  // Pass 2: find node definitions.
  const nodes = new Map(); // id -> { line, inlineClass }
  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('%%')) return;
    if (SKIP_LINE.test(line) || /^class\s/.test(line)) return;
    const cleaned = line
      .replace(/"[^"]*"/g, '""')
      .replace(/\|[^|]*\|/g, ' ');
    const segments = cleaned.split(
      /\s*(?:-->|---|--x|--o|==>|===|-\.->|-\.-|~~~)\s*|\s+--\s+/
    );
    for (const seg of segments) {
      const m = seg.match(
        /^([A-Za-z_][\w-]*)\s*(\[[^\]]*\]|\{[^}]*\}|\([^)]*\)|\[\([^)]*\)\]|\(\([^)]*\)\))?\s*(?::::(\w+))?/
      );
      if (!m) continue;
      const id = m[1];
      if (KEYWORD_IDS.has(id)) continue;
      const inlineClass = m[3] || null;
      // A segment that is only an edge label or shape text has no node id
      // at its start; the anchored match above already enforces that. But a
      // segment consisting of a single common word after an edge split can
      // be label residue: require the segment to look like a node (shape,
      // inline class, a recorded id, or block-initial position) unless it
      // carries a shape or class.
      if (!m[2] && !inlineClass && !nodes.has(id)) {
        const isFirstSegment = segments.indexOf(seg) === 0;
        if (!isFirstSegment) continue;
      }
      if (!nodes.has(id)) nodes.set(id, { line: idx + 1, inlineClass });
      else if (inlineClass) nodes.get(id).inlineClass = inlineClass;
    }
  });
  const uncovered = [];
  for (const [id, info] of nodes) {
    if (!info.inlineClass && !coveredByStatement.has(id)) {
      uncovered.push({ id, line: info.line });
    }
  }
  return uncovered;
}

function main() {
  const file = process.argv[2];
  if (!file) fail('usage: node scripts/lint-mermaid-classes.mjs <file.md>');
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (e) {
    fail(`cannot read ${file}: ${e.message}`);
  }
  const blocks = extractBlocks(text);
  if (blocks.length === 0) {
    console.log('no mermaid blocks found');
    return;
  }
  let anyUncovered = false;
  blocks.forEach((block, i) => {
    const lines = block.body.split(/\r?\n/);
    const type = diagramType(lines);
    if (type !== 'flowchart' && type !== 'graph') {
      console.log(`block ${i + 1} (line ${block.startLine}): ${type || 'unknown'} skipped`);
      return;
    }
    const uncovered = lintBlock(lines);
    if (uncovered.length === 0) {
      console.log(`block ${i + 1} (line ${block.startLine}): ${type} OK, every node covered`);
    } else {
      anyUncovered = true;
      for (const u of uncovered) {
        console.log(`block ${i + 1} (line ${block.startLine}): node ${u.id} (block line ${u.line}) has no :::class`);
      }
    }
  });
  process.exit(anyUncovered ? 1 : 0);
}

main();

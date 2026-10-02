---
name: figure-generator
description: "Ship deterministic hand-authored SVG generators for print-quality figures backed by real published datasets. Ships the .mjs generator pattern reading from data/<slug>.json, the data-sha256 audit hash embed for provenance, the dataset-first rule with contract tests pinning headline numbers, the dataset-inversion procedure for reverse-engineering data from an approved sample SVG, the fix-in-generator-never-in-SVG rule, and the figure-count hoist to one JSON. Use when authoring reproducible book or report figures, when a figure's numbers might drift silently, or when reverse-engineering data from a graphic whose dataset is missing. Muse delta: the dataset-first discipline, the contract-test pattern, and the SVG inversion procedure — beyond Muse's native ability to write a script that draws."
lastReviewed: 2026-07-29
---

# Figure generator discipline

## Muse delta

- **Native to Muse:** writing a script that draws an SVG, and testing code.
- **What this skill uniquely adds:** the **dataset-first rule** (published dataset + audit hash, never inlined numbers), the **contract-test pattern** pinning the prose's headline numbers, the **dataset-inversion procedure** for reverse-engineering data from an approved sample SVG, and the **fix-in-generator-never-in-SVG rule**.
- **Load when:** authoring a new figure for a book/report/exec document whose numbers must stay traceable, re-authoring a drifted figure, reverse-engineering a dataset from a sample SVG, or diagnosing figure-vs-prose number mismatches.

Deterministic figure production for books, reports, and any artifact where a figure's numbers have to survive re-generation and stay auditable. Book-tested: 53 figures across 14 chapters.

The engineering side of the illustration workflow. [`print-svg-style-guide`](../print-svg-style-guide/SKILL.md) governs how figures LOOK; this skill governs how they get MADE, VERSIONED, and AUDITED.

## The generator pattern

Every shipped figure is emitted by a deterministic `.mjs` script that:

1. Reads from `data/<slug>.json` — never inlines the numbers
2. Computes a SHA-256 hash of the source data
3. Embeds the hash in the SVG as an XML comment (`<!-- data-sha256: ... -->`)
4. Emits to `assets/figures/<NN>-<slug>.svg`

Skeleton:

```javascript
// scripts/generate-<slug>.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const DATA_PATH = "data/<slug>.json";
const OUT_PATH = "assets/figures/<NN>-<slug>.svg";

const raw = readFileSync(DATA_PATH, "utf8");
const data = JSON.parse(raw);
const dataHash = createHash("sha256").update(raw).digest("hex");

// ... layout math using data ...

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" font-family="Inter, system-ui, sans-serif">
  <!-- data-sha256: ${dataHash} -->
  <title>${title}</title>
  <!-- ... marks, labels, axes ... -->
</svg>`;

writeFileSync(OUT_PATH, svg);
console.log(`Wrote ${OUT_PATH} (data-sha256: ${dataHash.slice(0, 12)}...)`);
```

**Why hand-authored, not a rendering library:** layout math is exact (libraries stretch within their own sizing); regen is byte-stable, which makes `data-sha256` a useful audit hash; debugging is `console.log()` inside the generator instead of an opaque renderer failure. `flint-chart` still serves as an EXPLORATION tool during the design pass — the shipped artifact is always the hand-authored generator when the target is print.

## Dataset-first rule

Every figure must be backed by a REAL, PUBLISHED dataset. Never inline composite numbers.

The publication set per dataset:

- `data/<slug>.json` (source of truth)
- `data/<slug>.csv` (human-readable copy)
- `data/<slug>.md` (README: schema, provenance, units)
- `data/<slug>.schema.json` (JSON Schema for downstream validation)

**Naming:** `<slug>` describes the figure content, not the chapter: `q3-region-revenue` is right; `chapter-5-figure-4` is not.

## Contract tests (pin the headline numbers)

For every figure, write a contract test pinning the values the surrounding prose cites. Runs via Node's built-in test runner (`node --test scripts/<slug>-contract.test.mjs`):

```javascript
// scripts/<slug>-contract.test.mjs
import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const data = JSON.parse(readFileSync("data/<slug>.json", "utf8"));

test("Q4 aggregate matches the chapter total", () => {
  const q4Total = data.regions.reduce((s, r) => r.q4 + s, 0);
  assert.equal(q4Total, 28400000); // "$28.4M quarter" in chapter prose
});

test("EMEA variance matches the prose claim", () => {
  const emea = data.regions.find(r => r.name === "EMEA");
  assert.equal(emea.actual - emea.plan, 1700000); // "$1.7M variance" in prose
});
```

**Pin:** aggregate totals cited in prose, per-segment values the prose names, ordinal claims (`2.18× larger`, `third-lowest`).
**Don't pin:** full dataset shape (separate schema test), or numbers that appear ONLY in the figure and never in prose (over-constrained).

**Register the test:** if the project maintains an explicit test list, add the new file to it — a test file that isn't wired in doesn't run. **The tell is the test count**: if it didn't rise, you're not wired in.

## Fix in the generator, never in the SVG

Manual SVG edits get clobbered on the next regen. The rule is absolute:

| Symptom | Fix in |
| --- | --- |
| Number wrong in the SVG | The generator's layout math, or the dataset |
| Text truncated | The generator's layout — see `print-svg-style-guide` § "when text won't fit" (cut / reflow / abbreviate / grow) |
| Color miscoded | The generator's palette lookup, not the SVG's `fill` attribute |
| XML-invalid comment (`--` inside, bare `&`) | The generator's comment emission — see `render-verify` § SVG XML invalid |
| Regenerating clobbers your patch | That is the rule working, not a bug |

One legitimate exception: a one-off, throwaway figure that will never regenerate. Then treat that SVG as the source of truth and delete the generator so the next contributor isn't misled.

## Dataset inversion (reverse-engineer the data from an approved sample SVG)

When an approved sample SVG exists but its dataset is missing, do not reconstruct data from prose — prose fabricates. Invert the sample.

### Procedure

1. **Extract axis tick coordinates and their labeled values** from the sample (look for `<text>` elements near axis lines with numeric content; match each label to the `<line>` coordinate it labels).
2. **Solve two ticks for the linear scale**: `pxPerUnit = (y1 - y2) / (v2 - v1)`.
3. **Invert every data-point coordinate through the scale**: `dataValue = (yAxisBase - pointY) / pxPerUnit + valueBase`. Round to the domain's natural precision.
4. **Fidelity test**: every derived value must resolve to an EXACT value on the natural grid (e.g., all integers). If not, the scale is wrong or the sample draws something other than the dataset you think.
5. **Feed derived values into the generator and verify byte-identity** — the output polylines should be byte-identical to the sample. The strongest possible verification.

**Why inversion beats prose reconstruction:** prose fabricates. In a shipped case, prose said *"EMEA is the only region falling"* — the sample proved three regions decline and the two lines diverge (gaps 10 → 15 → 20 → 30). The sample doesn't lie.

## Figure-count hoist (one JSON, not scattered constants)

When multiple gates depend on "how many figures are expected," hoist the count into one JSON file. Every gate reads from it. Adding a figure touches ONE file.

```json
{ "expectedFigures": 62, "expectedPages": 439 }
```

JSON (not a `.js` module) is deliberate: it reads from both CJS and ESM without a bridge. **Page count is measured, never predicted** — set `expectedPages` from the built PDF AFTER the build, not before.

## Anti-patterns

| Don't | Do |
| --- | --- |
| Inline numbers in the generator | Read from `data/<slug>.json`, hash the raw text into the SVG |
| Ship a figure without a contract test | Drift without a test is silent |
| Hand-edit the emitted SVG | Grep `scripts/generate-*` for the filename first — fix the generator, re-run |
| Reconstruct a dataset from prose | Prose fabricates. Invert the sample instead |
| Bump the figure count without hoisting | Every separate count is a future stale-count bug |
| Predict `expectedPages` from figure count | Measure it off the built PDF |
| Assume a dropped-in test runs | Explicit test lists silently skip unregistered files |
| Ship XML-invalid SVG | See [`render-verify`](../render-verify/SKILL.md) § SVG XML invalid |

## Related skills

- [`print-svg-style-guide`](../print-svg-style-guide/SKILL.md) — how figures LOOK
- [`chart-big-idea`](../chart-big-idea/SKILL.md) — Step 0.5 (earn-a-figure) and Step 4.5 (focus discipline) run BEFORE this skill fires
- [`flint-chart`](../flint-chart/SKILL.md) — exploration tool during figure design, not the shipping path
- [`render-verify`](../render-verify/SKILL.md) — post-render check on the artifacts this skill produces

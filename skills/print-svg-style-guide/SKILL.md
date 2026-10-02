---
name: print-svg-style-guide
description: "Author print-quality SVG figures for books, reports, and exec-facing documents: canvas and typography grammar with a legibility floor, a semantic color palette where color carries meaning, and four composition idioms. Use when authoring or reviewing a figure destined for paper or PDF, or when picking colors that must read consistently across a document. Muse delta: the print-legibility floor math, the data-print-role taxonomy, and the four composition idioms — beyond Muse's native graphic instincts."
lastReviewed: 2026-07-29
---

# Print-quality SVG style guide

## Muse delta

- **Native to Muse:** well-formed SVG and reasonable typography.
- **What this skill uniquely adds:** the **print-legibility floor math** (px → print points, the 5.8pt gate), the **`data-print-role` taxonomy** for below-floor text, the **Tailwind-grounded semantic palette** where color carries meaning, and the **four composition idioms** with XML skeletons.
- **Load when:** authoring/reviewing a figure destined for paper or PDF, picking canvas dimensions for print + on-screen, assigning a color role in a multi-figure artifact, or composing a paired panel / critique callout / family band / dashboard.

Rules distilled from a shipped book: 53 figures across 14 chapters at 7×10in print size, figure width 4.39in.

Complements the big-idea family: `big-idea` and `chart-big-idea` decide what the figure ARGUES; this skill decides how it LOOKS. [`figure-generator`](../figure-generator/SKILL.md) is the engineering discipline that emits SVGs conforming to this guide.

## Canvas + font stack

| Property           | Value                                | When to override                                             |
| ------------------ | ------------------------------------ | ------------------------------------------------------------ |
| Font stack         | `Inter, system-ui, sans-serif`       | Never in figures. Book body prose can differ (Palatino, etc.) |
| Default viewBox    | `0 0 640 480` (4:3)                  | Standard chapter figure                                      |
| Widescreen viewBox | `0 0 640 380` (~17:10)               | Book-map, flow, wide-comparison figures                      |
| Dashboard viewBox  | `0 0 640 415` (varies)               | Dashboard-shaped figures                                     |

Pin at 640 viewBox width: (a) the print-legibility floor math below is calibrated to a 640-unit reference; (b) side-by-side figures across chapters read as one voice when they share horizontal dimensions.

## Print-legibility floor (gate-enforced)

At 7×10in with figure width 4.39in: `printPoints = fontSizePx × 4.39 × 72 ÷ viewBoxWidth` — at the 640-unit viewBox that's `px × 0.4939`.

| Class | Floor | Marker |
| --- | --- | --- |
| Instructional (anything the reader must read) | **5.8pt** | none |
| Note (annotation the reader is meant to read, below body copy) | **2.9pt** | `data-print-role="note"` required. Auto-promoted from `micro` when text ≥40 chars |
| Micro (source notes, attribution, hash stamps) | **2.9pt** | `data-print-role="micro"` required |

| px | pt at 640 viewBox | Verdict |
| --- | --- | --- |
| 9px | 4.44pt | micro only |
| 10px | 4.94pt | **fails** as instructional |
| 11px | 5.43pt | **fails** as instructional |
| **12px** | **5.93pt** | **lowest safe instructional** |

**Rule:** minimum instructional px = `viewBoxWidth ÷ 54.5`. At 640 → 11.74px, so 12px is the floor. A wider viewBox raises the floor — recompute, don't assume 12px.

**The micro marker is not an escape hatch.** It exists for text the reader never needs to read at size. Marking instructional content `micro` to clear the gate is gaming it. The `note` role's auto-promote (≥40 chars) catches the class where this happens by accident.

### When text won't fit at 12px, the answer is never to shrink it

In priority order:

1. **Cut the text.** A figure carrying sentences is restating adjacent prose (fails the earn-a-figure test). Move sentences to the chapter body; leave labels in the figure.
2. **Reflow.** Split one dense panel into two, or switch to the widescreen viewBox.
3. **Abbreviate.** Fewer axis ticks, shortened value labels, a legend instead of per-point labels.
4. **Grow the canvas.** Last resort — it changes the figure's page footprint.

### Anti-pattern figures obey the floor too

A figure whose subject IS bad typography must still clear 5.8pt. **Demonstrate the failure through RELATIVE properties, never absolute smallness:**

| Failure being taught | Wrong way | Right way |
| --- | --- | --- |
| Collapsed typographic hierarchy | Everything at 10px | Everything at 12px — identical, therefore undifferentiated |
| Chart clutter | Shrink labels to cram more in | Keep 12px, let density itself read as clutter |
| Illegible data labels | Actually illegible | 12px labels overlapping or colliding |

## Type hierarchy

| Role | Style | Notes |
| --- | --- | --- |
| Figure title | 18px / 700 / `#1f2937` / centered / y≈22-28 | 16px for very tall figures |
| Subtitle | 12px italic / `#6b7280` / centered / y≈40-48 | One-line takeaway |
| Source note | 9px / `#6b7280` / centered / y≈64 | Requires `data-print-role="micro"` |
| Panel title | 13px / 700 / `#1f2937` / left / x+12 / y+22 | |
| Panel subtitle | 12px italic / `#6b7280` / left | |
| Body / data | 12px / `#1f2937` (data) or `#6b7280` (axis) | 12px is the instructional minimum |
| Axis tick labels | 12px / `#6b7280` | If ticks crowd, reduce tick COUNT or abbreviate. Never shrink below 12px |
| KPI number | 14px / 700 / `#1e40af` inside white card | |
| Category label | 12px / 700 / colored to match family accent | |

## `data-print-role` markers

- **`data-print-role="micro"`** — attribution, provenance, hash stamps, source notes. Reader never needs to read at size.
- **`data-print-role="note"`** — annotation text the reader IS meant to read, below body copy. Auto-promoted from `micro` at ≥40 characters.

The taxonomy exists because a coverage scanner otherwise cannot distinguish "this is a hash stamp" from "this is a caption the reader is expected to read."

## Tailwind-grounded semantic palette

Color carries meaning — pick from this palette rather than introducing new hues. These are the **print variants** of the Alex ACT semantic roles (darker Tailwind values tuned for white paper); the screen variants live in `.github/config/brand-palette.json`. Same roles across both; different lightness for the surface.

### Grays (neutral scaffolding)

`#1f2937` gray-800 (headlines, primary text) · `#374151` gray-700 (table headers, secondary text) · `#6b7280` gray-500 (subtitles, axis labels, muted data) · `#9ca3af` gray-400 (axis lines, thin separators) · `#d1d5db` gray-300 (panel borders, dividers) · `#f3f4f6` gray-100 (BEFORE panel background) · `#f9fafb` gray-50 (default panel background) · `#ffffff` (card backgrounds) · `#cbd5e1` slate-300 (de-emphasised bars)

### Discipline blues (correct / principled / primary data)

`#1e40af` blue-800 (primary data, headline KPI) · `#1d4ed8` blue-700 (category label + emphasis) · `#2563eb` / `#3b82f6` / `#60a5fa` / `#93c5fd` / `#dbeafe` (5-tone sequential gradient) · `#eff6ff` blue-50 (category background)

### Semantic accents (used sparingly, one per role)

| Hex | Tailwind | Role(s) |
| --- | --- | --- |
| `#b91c1c` | red-700 | Critique callouts, REJECTED badge, target/reference lines |
| `#fee2e2` | red-100 | Rejection-callout background box |
| `#15803d` | green-700 | APPROVED badge (paired with red rejection) |
| `#7c2d12` | orange-900 | Second dark critique tone |
| `#b45309` | amber-700 | (a) Composition-family label; (b) footer-takeaway strip |
| `#d97706` / `#f59e0b` / `#fbbf24` | amber-600→400 | Composition-family data gradient |
| `#fef3c7` | amber-50 | (a) Composition background; (b) warning callout background |

**Semantic discipline:** Blue = correct / principled / primary emphasis · Red = rejection / critique / must-fix (never decorative) · Green = approval / correction shipped · Amber = composition family, warning callout, or footer-takeaway strip (context disambiguates) · Burgundy = second critique tone · Grays = defaults, muted, neutral.

## Composition idioms

### 1. BEFORE/AFTER paired panels

BEFORE left, AFTER right; same width/height; `stroke="#d1d5db"` (gray-300), `rx="4"`; BEFORE bg `#f3f4f6`, AFTER bg `#f9fafb` or `#eff6ff`. Top-right of BEFORE: `<rect fill="#b91c1c" rx="3">` 80×20 with white "REJECTED" 12pt/700; AFTER mirrors with `#15803d` / "APPROVED". Panel title 13pt/700 + italic subtitle 12pt underneath.

```xml
<rect x="20" y="60" width="290" height="380" fill="#f3f4f6" stroke="#d1d5db" rx="4"/>
<rect x="230" y="68" width="80" height="20" fill="#b91c1c" rx="3"/>
<text x="270" y="83" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="700">REJECTED</text>
<text x="32" y="90" font-size="13" font-weight="700" fill="#1f2937">Before</text>
<text x="32" y="106" font-size="12" font-style="italic" fill="#6b7280">what the reader is asked to diagnose</text>
```

### 2. Numbered critique callouts

Red-700 circle r=10 at the top-right of the region being called out; white bold number 12pt/700 centered inside; sequential numbers match the chapter body's walkthrough.

```xml
<circle cx="580" cy="120" r="10" fill="#b91c1c"/>
<text x="580" y="124" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="700">1</text>
```

### 3. Family-band abstract figures

5 vertical panels side-by-side, each ~115px wide. Panel border 1.5px in family accent (blue-700, amber-700, purple-700, green-700, red-700); background in matching 50-tone. Category label 12pt/700 in family accent; italic question quote 12pt italic gray-500; 60–80px canonical example chart; four label blocks below ("Default failure:", "Cousins:", "Use for:" — 12pt/700 label then 12pt gray-500 body).

### 4. 5-Visual Rule dashboards

≤5 visuals per dashboard; one dominant KPI (largest, top-left, blue-800); position → size → color hierarchy (scan top-left to bottom-right). **Blurred-thumbnail test:** shrink to thumbnail, apply Gaussian blur — the dominant KPI must still be identifiable. **Mobile-preserved hierarchy:** mentally re-flow as a single column; reading order must still make sense.

## Anti-patterns

| Don't | Why |
| --- | --- |
| Introduce new hues outside the palette | Consistency is the reader's cross-reference tool |
| Red for anything except critique / rejection / target-line | Red carries the "must-fix" signal |
| Amber outside Composition-family / warning / takeaway | Amber signals family membership or warning throughout |
| Drop-shadows, gradients, decorative flourishes | Publication-appropriate = restraint |
| Ship a figure without the italic subtitle | The subtitle binds the figure to the argument |
| Substitute the font stack | Inter is intentional (open-source, wide numerals) |
| Shrink text below 12px to fit more in | The floor exists for the reader |
| `data-print-role="micro"` on instructional content | The taxonomy is not an escape hatch |
| Skip the deuteranopia check on red/green pairings | ~8% of male readers see them the same; color + shape or color + label survive |

## Related skills

- [`chart-big-idea`](../chart-big-idea/SKILL.md) — earn-a-figure gate + focus discipline (framing side)
- [`flint-chart`](../flint-chart/SKILL.md) § Publication config preset — Vega-Lite config emitting charts obeying this guide
- [`render-verify`](../render-verify/SKILL.md) § Prose-coupling check — verifies surrounding prose after the figure ships
- [`figure-generator`](../figure-generator/SKILL.md) — the engineering discipline that emits conforming SVGs
- `markdown-mermaid` (Alex ACT Core) — sibling for Mermaid diagrams (different rendering model, shared palette discipline)

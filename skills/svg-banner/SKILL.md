---
name: "svg-banner"
description: "Generate 1200x320 SVG banners for READMEs, plans, notes, and release artifacts, using a pluggable brand config that any project can override. Use when a document needs a hero banner, a section header, or brand-stamped consistency at the top of a markdown file. Muse delta: the fixed layout grammar, the banner-brand.json schema + override paths, and the generate-banner.cjs procedure — beyond Muse's native ability to draw SVG."
lastReviewed: 2026-07-29
---

# SVG Banner

## Muse delta

- **Native to Muse:** drawing SVG by hand.
- **What this skill uniquely adds:** the **fixed 1200×320 layout grammar** (so every banner reads as one voice), the **`banner-brand.json` config schema + two override paths**, and the **`scripts/generate-banner.cjs` procedure** with its validation gates (title/subtitle caps, watermark whitelist).
- **Load when:** a document needs a hero banner, a branded section header, or brand-stamped consistency at the top of a markdown file.

Author 1200×320 SVG banners for the top of a markdown document. Generic template with a pluggable brand config; the default brand is Alex ACT.

## When to Use

- Adding a hero banner to a README, PLAN, ROADMAP, CHANGELOG, or release artifact
- A branded section header for a documentation site
- A visual identity stamp for a doc shared externally

> **Looking for a lighter variant?** Pastel 1200×240 banners with content-specific iconography suit branding, education, or audience-facing docs. Use this skill for technical artifacts that need brand-stamped consistency.

## The design (fixed across brands)

Only the brand config (colors, mark, labels, watermarks) varies:

| Element     | Value                                                                                 |
| ----------- | ------------------------------------------------------------------------------------- |
| Dimensions  | 1200 × 320 px                                                                         |
| Layout      | Left brand label (row 1), accent bar, title (row 2), subtitle (row 3); ghost watermark bottom-right; mark top-right |
| Font stack  | `Segoe UI, Helvetica, Arial, sans-serif` (system-first; renders without web-font load) |
| Title       | 56 px / 700, upper-left                                                               |
| Subtitle    | 18 px / 600, under title                                                              |
| Brand label | 15 px / 700 accent + 13 px / 600 muted sub-label                                       |
| Watermark   | ~100 px / 800, 10% opacity, bottom-right                                              |
| Mark        | PNG (base64-embedded), ~170×170, top-right                                            |
| Accent bar  | 3 px gradient stroke under brand label                                                |
| Left ribbon | 6 px vertical gradient stripe (`x=0`) matching accent                                 |

Title cap: **32 chars**. Subtitle cap: **80 chars**. Longer inputs are rejected by the script — reflow or abbreviate.

## Brand configuration

Brand values live in `.github/config/banner-brand.json`. The script reads it on every run; if absent, it falls back to the built-in Alex ACT default.

Schema (essentials): `brand.label` / `brand.subLabel`; `colors` (background, accent1–3 gradient left→right, title, subtitle, brandLabel, brandSubLabel, watermark); `mark` (path relative to repo root, width/height/x/y — PNG/JPG, no SVG); `watermarks[]` (4–8 categories mapping to your document classes) + `watermarkDescriptions`.

### Overriding for your own brand

**A — commit a project-specific config.** Edit `.github/config/banner-brand.json` in your workspace. Ship it with the repo so every collaborator produces on-brand banners.

**B — one-off via `--brand-config`.** `--brand-config path/to/other.json` — for testing a redesign before committing it, or running multiple brands from one tree.

Brand config rules:

- **Palette semantics carry**: `accent1/accent2/accent3` form a left-to-right gradient (deep → medium → light). Avoid red/green without a redundant cue (deuteranopia — see `print-svg-style-guide` § Redundant encoding).
- **Watermark whitelist is the discipline signal**: small vocabulary (4–8) keeps banners readable across the repo; large vocabulary devolves into decoration.
- **Mark path** is relative to the repository root.

## Procedure

### Step 1 — Gather inputs

Ask the user only for what's missing. Defaults:

- **Title** — the document's name, ≤ 32 chars (script-enforced).
- **Subtitle** — one-line purpose statement, ≤ 80 chars. Lift from the doc's first paragraph or north-star sentence; don't invent. State the document's *purpose*, not its contents; one clause; end with a period; no hype ("revolutionary", "ultimate") or meta language ("this document").
- **Watermark** — pick from the config's `watermarks[]` by the doc's role. Script rejects unknown watermarks.
- **Filename** — defaults to `assets/banner-<title-slug>.svg`; override with `--out`.

If unsure about the subtitle, show two options before generating. The `big-idea` skill's Big Idea is a strong upstream for subtitle authoring: the doc's Big Idea IS the banner's subtitle.

### Step 2 — Generate

```sh
node skills/svg-banner/scripts/generate-banner.cjs \
  --title "Document Title" \
  --subtitle "One-line purpose statement." \
  --watermark PLAN
```

`--force` overwrites; `--out` sets a non-default location; `--brand-config` uses a non-default brand. Exit 0 = success; 1 = validation error (length, watermark whitelist); 2 = filesystem error.

### Step 3 — Embed in the document

Add this line just under the document's H1 (the script prints the exact line; copy it verbatim):

```markdown
![Banner](assets/banner-<slug>.svg)
```

## Validation Checklist

- [ ] File written under `assets/`
- [ ] Watermark matches the document's role and is in the whitelist
- [ ] Title ≤ 32 chars, subtitle ≤ 80 chars (else the script rejects)
- [ ] Embed line added under the document's H1
- [ ] Mark image renders in the top-right corner
- [ ] Renders in markdown preview without errors

## PNG Conversion (optional)

GitHub renders SVG banners natively, so SVG is preferred. If a downstream tool needs PNG:

```sh
npx svgexport assets/banner-foo.svg assets/banner-foo.png 1200:320
```

Don't ship PNGs unless required — they double asset weight and drift from the SVG source.

## Boundaries

- The script does not pick the watermark, write the subtitle, or design the brand — those are LLM / skill / brand-owner judgment calls.
- The script does not edit the source markdown — embedding is a separate step.
- Layout, dimensions, and typography are fixed. For a different banner shape, fork the script rather than parametrizing — the shape is calibrated for readability at 1200×320.
- Brand config lives in `.github/config/banner-brand.json`; any other location requires `--brand-config` on every invocation.

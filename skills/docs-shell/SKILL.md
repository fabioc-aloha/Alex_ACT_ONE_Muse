---
name: docs-shell
description: "The single-page HTML shell (index.html + manifest.json at a repository root or stable subfolder) that renders concatenated markdown as browsable, GitHub-styled documentation with a two-line topnav, per-doc emoji icons, sticky page header, and sidebar TOC. Use when the user says 'shell', 'add a doc', 'add a chapter', 'landing page', 'sidebar', 'manifest', 'hero', 'nav-strip', 'shell theme', 'color scheme', 'polish the pages', 'render preview', 'add an area', or when authoring/editing content that appears in the root manifest. Also invoke when the shell misrenders (raw frontmatter visible, links broken across folders, missing hero, doc button not switching content, sticky header overlap). Muse delta: the manifest-driven 90% mental model, the schema essentials, and the common-task procedures — beyond Muse's native ability to write static HTML docs."
lastReviewed: 2026-08-07
---

# docs-shell skill

## Muse delta

- **Native to Muse:** building a static HTML page to display docs.
- **What this skill uniquely adds:** the **manifest-driven mental model** (adding a doc = one JSON entry, no HTML changes), the **manifest schema essentials**, the **auto-strip rules** for frontmatter/nav-strips, and the **common-task procedures** (audit, add doc/area, HTML-source docs, retheme).
- **Load when:** the user says "shell", "add a doc/chapter", "landing page", "sidebar", "manifest", "hero", "nav-strip", "shell theme", "polish the pages", or when the shell misrenders (raw frontmatter visible, broken cross-folder links, missing hero, sticky header overlap).

Load-on-demand pointer. Full technical reference lives at [`references/shell-reference.md`](references/shell-reference.md); this file carries the essentials.

> **Adopting the shell in another project?** Go straight to [`references/shell-reference.md § Adopting the shell in another project`](references/shell-reference.md#adopting-the-shell-in-another-project). The starter kit at [`starter/`](starter/) alongside this file is the copy-paste bundle.

## When to invoke

Fire when any of these appears in the request:

- **Shell operations**: "shell", "index.html", "manifest", "landing page", "sidebar", "hero", "quickJump"
- **Add or edit content**: "add a doc", "add an area", "add a chapter", "new page", "polish the pages"
- **Rendering issues**: "raw frontmatter showing", "link broken in shell", "nav duplicated", "hero missing", "doc button not switching"
- **Theme / UX**: "color scheme", "dark mode", "shell theme", "re-theme", "layout"
- **Cross-navigation**: "?area=", "?doc=", "deep link", "URL scheme"

Do NOT fire when: the user is editing content of an existing doc and the change doesn't affect manifest, hero, or nav-strip; or the user asks about pre-rendered `*.html` artifacts outside the shell folder.

## The 90% mental model

**One stable shell root.** Repository root is recommended (links and deployment are simplest). A stable subfolder such as `docs/` is also supported: keep `index.html` and `manifest.json` together and resolve every source from that folder.

**Manifest drives everything.** The shell reads `manifest.json` on load and renders whatever it declares. No filesystem discovery. **Adding a doc = one JSON entry, no HTML changes.**

**Markdown stays authoritative.** MD files are the primary source: fetched, concatenated, decorated. The shell is a viewer; never generate HTML *from* markdown into the repo. Pre-built HTML reports (Flint chart output, exported dashboards, tabular reports) are supported as an escape hatch: doc entries whose `sources[]` are all `.html` link directly to the file instead of being wrapped by the shell. See "Add an HTML-source doc" under Common tasks.

**Two-line topnav.** Line 1 = brand slot + area buttons. Line 2 = documents of the active area. URL scheme `?area=<id>&doc=<slug>` with cascading fallbacks.

**Rendered reading surface.** The shell doesn't expose raw Markdown controls. Relative links to sources already registered in the manifest route to their rendered shell pages. Parsed Markdown passes through DOMPurify; Mermaid runs afterward in strict mode; CDN assets are exact-version, SHA-384 pinned. On narrow screens both nav rows scroll horizontally; the TOC becomes static and caps expanded height at 360px. Keyboard: skip link, heading permalinks, focus states, `aria-current`. Reduced-motion preferences disable animation and smooth scrolling.

## Manifest schema, essential fields

```json
{
  "brand": { "label": "…", "href": "index.html" },
  "theme": { "light": { "--accent": "#…" }, "dark": { "--accent": "#…" } },
  "defaultArea": "plan",
  "areas": [
    {
      "id": "plan",
      "label": "Plan",
      "folder": "plan",
      "defaultDoc": "about",
      "docs": [
        {
          "id": "mall",
          "label": "Mall Plan",
          "icon": "🛒",
          "title": "Mall Plan — role + modernization",
          "verified": "Phase 0 closed 2026-07-27",
          "hero": {
            "eyebrow": "Ch 05 · Mall Plan",
            "title": "Mall Plan",
            "subtitle": "Path A in-place bump to 3.0.0; no v2 fork per ADR-014."
          },
          "sources": ["plan/mall/README.md"]
        }
      ]
    }
  ]
}
```

Per-doc `icon` is an optional single emoji in the sticky page-title header; empty or absent collapses via CSS `:empty`. Per-doc `hero.subtitle` is the Big Idea (one-sentence thesis). Source paths are relative to the manifest, wherever it lives.

Full field-by-field walkthrough: [`references/shell-reference.md § Manifest schema`](references/shell-reference.md#manifest-schema).

## What the shell auto-strips from source markdown

Before rendering, `loadMarkdown()` removes three per-file blocks:

1. **Leading YAML frontmatter** — regex `^---\r?\n[\s\S]*?\r?\n---\r?\n?`. LLM-only metadata.
2. **Nav-strips** — regex `<!-- nav-strip -->[\s\S]*?<!-- \/nav-strip -->\s*`. Per-file navigation that would duplicate in concat view.
3. **Banner-strips** — same mechanism for banner images.

Content docs may (and often should) keep frontmatter and nav-strips. GitHub honors them; the shell strips them cleanly.

## Theme system

`manifest.theme.light` / `.dark` are optional maps of CSS custom properties. Absent = hardcoded defaults. Present = shell injects a `<style>` block with the declared vars. The injector accepts only `--`-prefixed keys with hex / rgb / hsl / named-color values, so an untrusted manifest can't smuggle arbitrary CSS.

Full override list: [`references/shell-reference.md § Every property you can override`](references/shell-reference.md#every-property-you-can-override).

## Read aloud

The shell reads the rendered page via the browser's built-in Web Speech API — no key, no network, no dependency. Behavior worth knowing before you change it:

- **Duration-budget chunking.** Seams between utterances cost ~80ms of audible gap, so chunks are sized by duration (`CHUNK_SECONDS × CHARS_PER_SECOND × rate`, clamped to min/max) — a faster rate earns longer chunks. Each chunk carries a length-derived timeout as a backstop against dropped `onend`; a keep-alive pump guards long chunks.
- **Skips what doesn't survive being read.** Tables, code blocks, Mermaid diagrams, and inline SVG are announced (`Table skipped.`) rather than spoken; adjacent skips say it once; the `#listen-markers` checkbox turns announcements off. Inline code collapses to "code" only when long AND punctuation-dense — a long path still reads.
- **Click to seek.** Clicking a block during a live session jumps playback there; inert until started; ignores clicks on links/controls/selections.
- **Two buttons, not three.** Play/pause carries the whole interaction (no stop button; `Escape`, page finish, doc switch, unload cover exit). `stopAll()` still exists and runs on page finish, doc switch, and unload.
- **The reader's choice persists** (`localStorage` under `alexact.readaloud`); voice ranking prefers neural/host-natural voices.
- **`[hidden]` needs restating.** Author `display` rules outrank the UA `[hidden]` rule — keep the explicit `.listen-panel[hidden] { display: none; }` rule if you restyle.

## Common tasks

### Audit an existing adopter before upgrade

```bash
node skills/docs-shell/scripts/audit-docs-shell.mjs --shell index.html --project-root .
node skills/docs-shell/scripts/audit-docs-shell.mjs --shell docs/index.html --project-root . --json
```

Exit `0` = all invariants passed. Exit `2` = shell needs upgrade (report names each failed invariant). Exit `1` = input or adjacent manifest invalid. Optional capabilities and unknown manifest fields are informational — treat the latter as local extensions to preserve, not defects to erase.

Upgrade in five steps: audit, classify local extensions, preview the replacement, reapply only extensions still needed, then sweep every manifest route at desktop and mobile widths.

### Add a chapter to an existing doc

1. Create the `.md` file (path relative to repo root).
2. Append its path to the target doc's `sources[]` in the root manifest. Order = concat order.
3. Reload — no build step.

### Add a new doc

Append a `docs[]` entry to the target area with `id`, `label`, optional `icon`, `title`, optional `verified`, optional `hero`, and `sources[]`. Reload.

### Add a new area

Append to top-level `areas[]` with `id`, `label`, optional `folder`, `defaultDoc`, non-empty `docs[]`. Consider bumping `defaultArea`. Reload.

### Add an emoji icon to a doc

Add `"icon": "🛒"` to the doc entry. Rendered at 22px in the sticky page-title header.

### Retheme

Edit `manifest.theme.light` / `.dark`. Most adopters override just `--accent`, `--accent-emphasis`, and the neutrals (`--fg`, `--bg`, `--bg-subtle`). Semantic colors (`--success`, `--attention`, `--danger`) usually stay at GitHub Primer defaults for accessibility.

### Fix a broken cross-folder link in a source

The shell prepends the source's base directory to relative links via `rewriteRelativeLinks()`. If a link doesn't resolve, confirm the source path in `sources[]` includes the full folder prefix (e.g. `plan/mall/README.md`, not `README.md`), and check the link isn't accidentally root-relative (`/foo`) when it should be relative (`foo`).

### Add an HTML-source doc (Flint report, exported dashboard)

For a doc whose `sources[]` are ALL `.html` files, the shell links the topnav button DIRECTLY at the file. Mixed sources (`.md` + `.html`) fall through to the Markdown render pass — keep the two shapes in separate doc entries.

1. Drop the HTML file(s) at a path relative to the manifest.
2. Append a doc entry with `id`, `label`, optional `icon`, `title`, and `sources` set to the HTML path(s):

   ```json
   {
     "id": "report",
     "label": "Sales report",
     "icon": "📊",
     "title": "Sales by region, Q4",
     "sources": ["reports/sales-q4.html"]
   }
   ```

3. To keep shell navigation visible inside the standalone report, load `assets/report-topnav.js` with `defer` (it derives the shell root from its own URL and preserves spacing).
4. Reload. Clicking the topnav button loads the HTML directly; back-button returns to whatever came before (`location.replace`, so the shell URL doesn't stack in history).

## Anti-patterns

| Anti-pattern | Correction |
| --- | --- |
| Editing the shell HTML to add a doc | Docs are declared in `manifest.json`. HTML changes only add new render behaviors. |
| Generating a static HTML file for a doc | The shell IS the renderer. Add the `.md` to a `docs[]` entry's `sources[]`. |
| Splitting one shell across multiple roots | One intentional root: repo root recommended, one stable subfolder supported. |
| Duplicating the shell's CSS into a `.md` file | Content docs are semantic markdown. The shell owns the visual layer. |
| Rendering hero copy that reads as AI marketing | `hero.subtitle` is the Big Idea. If "important" or "central" substitutes without loss, the subtitle is decorative. |
| Adding an emoji icon as decoration | `icon` is optional and collapses when empty. Use it only when it reinforces the doc's identity. |
| Shipping a bundled TTS voice or cloud speech call | Web Speech API is the whole point: no key, no network, no dependency. |
| Verifying a show/hide change by asserting `element.hidden` | Assert `getComputedStyle(el).display` or the bounding box on a freshly loaded page. |
| Reading a table aloud cell by cell | Skip and announce; a row read cell by cell is noise. |
| Capping utterances at a fixed character count | Express the cap as a duration, not a character count. |

## Optional features (CSS ready, opt-in)

| Feature | Where |
| --- | --- |
| Hero chips (`hero.chips[]`) | Reserved CSS `.hero-chips` / `.chip`. Extend `renderHero()` to enable. |
| Hero CTA buttons (`hero.actions[]`) | Reserved CSS `.hero-actions` / `.btn`. Extend `renderHero()` to enable. |
| Hero description (`hero.description`) | Preserved in manifest, not rendered by default. Uncomment the description line in `renderHero()` to re-enable. |
| QuickJumps (`quickJumps[]`) | Reserved CSS. Starter kit renders them; some root shells keep line 1 minimal. |

See [`references/shell-reference.md § Optional features`](references/shell-reference.md#optional-features-css-ready-renderer-opt-in) for enable steps.

## Starter kit for adopters

The complete adopter bundle lives at [`starter/`](starter/):

```text
starter/
├── ADOPTION.md             Portable fresh-adoption and upgrade safety guide.
├── index.html              Full working shell with quickJump CSS and wiring retained as an opt-in, built-in read-aloud, and the brand-icon <img> left commented out.
├── manifest.json           Minimal single-area example. Every non-obvious choice has an inline $comment.
├── about.md                Working demo content with alerts, mermaid, syntax-highlighted code samples, and quickJump examples.
├── example-report.html     Standalone HTML report demonstrating the direct-link route.
└── assets/
    └── report-topnav.js    Optional persistent shell navigation for standalone reports.
```

To adopt: start with [`starter/ADOPTION.md`](starter/ADOPTION.md), choose one stable shell root, copy the complete bundle there, edit `manifest.json` (`brand.label`, theme overrides, `docs[]` entries), and open `index.html` in a browser. Full walkthrough at [`references/shell-reference.md § Adopting the shell in another project`](references/shell-reference.md#adopting-the-shell-in-another-project).

## Cross-links

- [`references/shell-reference.md`](references/shell-reference.md) — canonical technical reference (manifest schema, theme, path rewriting, optional features, adoption, local rendering, troubleshooting)
- [`starter/`](starter/) — the adopter-facing starter kit
- **Related skills**:
  - [big-idea](../big-idea/SKILL.md) — how to author `hero.subtitle` copy
  - [markdown-mermaid](../markdown-mermaid/SKILL.md) — Mermaid authoring rules when a doc contains a `mermaid` block
  - [svg-banner](../svg-banner/SKILL.md) — branded SVG banner authoring

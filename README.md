# Alex ACT ONE — Muse edition

A port of Fabio Correa's Alex ACT ONE Copilot plugin (v0.3.6) for Muse, Meta's
personal AI assistant. The skill format
is identical (`SKILL.md` with `name:`/`description:` frontmatter), so the 52 curated skills carry over; everything Copilot-specific around them was adapted.

## What You Can Do With Alex ACT ONE

**Think before building.** Frame the real problem, weigh competing explanations,
name what would prove you wrong, and check a decision against its risks before
committing to it.

**Write code that survives review.** Test-first workflows, root-cause debugging,
security hardening, adversarial code review from three opposing perspectives,
and safe Git practice with recovery paths.

**Produce prose people finish reading.** Strip AI writing patterns, find the one
sentence a document is actually making, adapt a draft for a named audience, and
write Markdown that passes lint on the first attempt.

**Turn drafts into deliverables.** Convert between Markdown, Word, HTML, plain
text, and formatted email. Build charts, diagrams, print-quality figures, and
banners, then check that what rendered says what you meant.

**Improve the agent itself.** Audit which instructions earn their context cost,
write project-specific skills from work you keep repeating, and consolidate what
a session learned into something reusable.

52 skills, 15 opt-in modules, and 15 chat-ready prompts. There is no MCP server
to install, register, or provision — the capabilities the Copilot edition's
servers provided are native to Muse (see below).

## Install and Use

There is no plugin loader and no install command in the Muse edition. The
`plugin.json` `skills` and `commands` pointers describe the layout; you use the
tree directly:

1. **Skills** — copy the `skills/` directory (or individual skill folders) into
   the skills directory your Muse assistant reads. Each skill is a self-contained
   folder; nothing needs building or registering.
2. **Opt-in modules** — the Copilot edition's always-on instructions live in
   `muse-opt-in/` and are never auto-applied. Read `muse-opt-in/README.md`,
   then deliberately copy only the modules you want into your own assistant
   configuration. `alex-finch-personality` is off by default: it asserts a
   different assistant identity, so adopt it only if you want that.
3. **Prompts** — `prompts/` holds chat-ready prompts. Paste one into a
   conversation; a few reference Copilot-only setup flows and are kept for
   reference (see `prompts/README.md`).

## The Skills

Grouped by what you are trying to do. The **Needs** column lists anything beyond
the host's native capabilities — most skills need nothing. Where the Copilot
edition needed an MCP server, this edition uses the native equivalent (see
[Native capabilities instead of MCP servers](#native-capabilities-instead-of-mcp-servers)).

<!-- BEGIN GENERATED SKILL TABLE -->

<!-- BEGIN GENERATED SKILL TABLE -->

### Reasoning and judgment

How to think through a problem before acting on it.

| Skill | What it does | Needs | Tier |
| --- | --- | --- | --- |
| `act-tenets` | The 10 canonical tenets of Artificial Critical Thinking (ACT) with rationale for each — I Hypothesis… | — | Keep |
| `critical-thinking` | Challenge what you think is right — alternative hypotheses, missing data, evidence quality, bias det… | — | Delta |
| `problem-framing-audit` | Step-back protocol — restate, generalize, specialize, invert, ask why, pre-mortem, check stakeholder… | — | Keep |
| `adversarial-review` | Structured skepticism for high-stakes decisions and reviews. Six methods — Red Team/Blue Team, Pre-M… | — | Keep |
| `deep-review` | Adversarial code review with three parallel perspectives — Advocate, Skeptic, Architect — that creat… | — | Keep |
| `anti-hallucination` | Prevent fabricated facts, invented APIs, and citation confabulation at the point of generation. Use… | — | Delta |
| `risk-analysis` | Probability × impact risk assessment for curation and planning decisions. Categorize risks (quality,… | — | Keep |
| `ethical-reasoning` | Reason through ethical tensions using moral foundations, constitutional principles, and a five-step… | — | Delta |
| `mutation-testing` | Meta-test your test harness — apply small intentional defects to production code, expect the suite t… | — | Keep |

### Engineering

Writing and changing code that survives review.

| Skill | What it does | Needs | Tier |
| --- | --- | --- | --- |
| `code-review` | Systematic code review for correctness, security, and growth — not just style enforcement | — | Keep |
| `security-and-hardening` | Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or… | — | Keep |
| `test-driven-development` | Use for any feature, bug fix, refactor, or behavior change — enforces RED-GREEN-REFACTOR. Write the… | — | Delta |
| `systematic-debugging` | Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes. Four-ph… | — | Keep |
| `git-workflow` | Consistent git practices for branch hygiene, safe commits, and recovery from common mishaps (lost co… | — | Delta |
| `plan` | Use when the user wants a plan instead of execution, or before any non-trivial implementation (multi… | — | Delta |
| `spike` | Use when the user wants to feel out an idea before committing to a real build — 'spike this out', 't… | — | Delta |

### Prose and documentation

Writing people finish reading.

| Skill | What it does | Needs | Tier |
| --- | --- | --- | --- |
| `big-idea` | Distill the central claim before authoring any summary-shaped output: hero copy, commit-message subj… | — | Keep |
| `humanizer` | Use when the user wants to humanize, de-AI, de-slop, or un-ChatGPT a piece of text — strip AI-isms a… | — | Keep |
| `communication-craft` | Communication patterns for feedback, cross-audience content, and eliciting needs. SBI feedback model… | — | Delta |
| `doc-hygiene` | Documentation hygiene — anti-drift rules, code-documentation placement, count elimination, and livin… | — | Delta |
| `lint-clean-markdown` | Write markdown that passes markdownlint on first attempt — encode the most common rules as muscle me… | — | Delta |
| `status-reporting` | Create stakeholder-friendly project status updates and progress reports. Use when writing a status u… | — | Delta |
| `markdown-sanitization-chain` | Render user-supplied markdown safely — marked.js → DOMPurify → Mermaid (order matters; skipping the… | — | Keep |
| `corpus-qa-sweep` | Run a QA sweep across an entire corpus instead of one sample: instrument the real output boundary, a… | — | Delta |

### Charts and figures

Deciding what to draw, drawing it, and checking it says what you meant.

| Skill | What it does | Needs | Tier |
| --- | --- | --- | --- |
| `chart-big-idea` | Distill the one-sentence Big Idea, story arc, audience, and style stance for a chart BEFORE picking… | — | Keep |
| `chart-vocabulary` | Catalog of chart types organized by seven communication goals (comparison, change over time, proport… | — | Keep |
| `chart-interpretation` | Read a chart someone else made — image, screenshot, HTML, or dashboard — and extract insights, patte… | — | Keep |
| `flint-chart` | Use when the user wants to visualize data — from 'which chart should I use?' to 'render this'. Helps… | Native chart capability | Keep |
| `flint-theme` | Creates and refines reusable Flint ThemeSpec visual systems from brand guidance, websites, decks, de… | Native chart capability | Keep |
| `ascii-chart` | Render charts and compact dashboards as pure ASCII in a monospace grid: bar, dot, sparkline, histogr… | — | Delta |
| `print-svg-style-guide` | Author print-quality SVG figures for books, reports, and exec-facing documents: canvas and typograph… | — | Delta |
| `figure-generator` | Ship deterministic hand-authored SVG generators for print-quality figures backed by real published d… | — | Delta |
| `svg-banner` | Generate 1200x320 SVG banners for READMEs, plans, notes, and release artifacts, using a pluggable br… | — | Delta |
| `markdown-mermaid` | Author Mermaid diagrams that render correctly in GitHub, VS Code, and Mermaid 10+ consumers. Applies… | — | Delta |
| `annotate-screenshot` | Add callouts to a raster you did not author, using Pillow, at a resolution that stays legible. Cover… | Pillow | Delta |
| `render-verify` | Verify a rendered visual artifact actually says what it was supposed to say — open it, read its cons… | Native browser tools | Keep |
| `docs-shell` | The single-page HTML shell (index.html + manifest.json at a repository root or stable subfolder) tha… | — | Delta |

### Document conversion

Moving a document between formats without losing its structure.

| Skill | What it does | Needs | Tier |
| --- | --- | --- | --- |
| `docx-to-md` | Convert Word documents (.docx) to clean Markdown with image extraction and pandoc cleanup. Use when… | Pandoc | Keep |
| `html-to-md` | Convert HTML documents to clean Markdown via pandoc. Use when the user asks to convert HTML to markd… | Pandoc | Keep |
| `md-to-html` | Convert Markdown to standalone HTML pages with embedded CSS, images, and Mermaid diagrams. Use when… | Pandoc | Keep |
| `md-to-word` | Convert Markdown with Mermaid diagrams and SVG illustrations to professional Word documents. Use whe… | Pandoc | Keep |
| `md-to-eml` | Convert Markdown to RFC 5322 email (.eml) with inline CSS and CID images. Use when the user asks to… | Pandoc | Delta |
| `md-to-txt` | Strip Markdown formatting and produce clean plain text via pandoc. Use when the user asks to convert… | Pandoc | Delta |

### Working on the agent itself

Auditing, extending, and consolidating the agent.

| Skill | What it does | Needs | Tier |
| --- | --- | --- | --- |
| `meditation` | Review session outcomes, recommend reusable skills or automation, and reconcile project guidance, ha… | — | Keep |
| `compile-brain` | Create or improve a Markdown instruction, skill, prompt, or agent from an explicitly selected file o… | — | Keep |
| `assess-brain` | Assess active Markdown brain files in a local AI agent project or plugin source without changing it.… | — | Keep |
| `project-capability-authoring` | Create tested project-local skills and scripts from demonstrated repeated work. Use after meditation… | — | Keep |
| `token-waste-elimination` | Audit active brain artifacts for context cost, duplicated guidance, oversized routing files, and sta… | — | Keep |
| `proactive-awareness` | Applies cross-session context recovery, uncommitted-work detection, and focus routing once proactive… | — | Delta |
| `evaluate-before-adopting` | Decide whether a plugin or skill from a catalog is worth installing. Covers what a trust score does… | — | Keep |

### Setup and platform

Getting the assistant's dependencies and platform behavior working.

| Skill | What it does | Needs | Tier |
| --- | --- | --- | --- |
| `setup-dependencies` | Check which optional dependencies this plugin can use, report what each missing one costs, and insta… | — | Keep |
| `terminal-command-safety` | Output-capture, hung-command, and host-behavior procedures for Muse's exec environment: redirect lar… | — | Delta |

### Archived

Built for Copilot/VS Code/Outlook/Replicate with no Muse equivalent; preserved complete for other hosts under `archive/host-specific/`.

| Skill | Needs | Status |
| --- | --- | --- |
| `replicate-imagery` | Native image generation | Archived → [archive/host-specific/replicate-imagery/](archive/host-specific/replicate-imagery/) |
| `rich-email` | Pandoc | Archived → [archive/host-specific/rich-email/](archive/host-specific/rich-email/) |
| `bootstrap-core` | — | Archived → [archive/host-specific/bootstrap-core/](archive/host-specific/bootstrap-core/) |
| `bootstrap-project` | — | Archived → [archive/host-specific/bootstrap-project/](archive/host-specific/bootstrap-project/) |
| `platform-awareness` | — | Archived → [archive/host-specific/platform-awareness/](archive/host-specific/platform-awareness/) |
| `browser-tools` | Native browser tools | Archived → [archive/host-specific/browser-tools/](archive/host-specific/browser-tools/) |
| `install-visual-companions` | — | Archived → [archive/host-specific/install-visual-companions/](archive/host-specific/install-visual-companions/) |
| `setup-enterprise-stack` | — | Archived → [archive/host-specific/setup-enterprise-stack/](archive/host-specific/setup-enterprise-stack/) |

<!-- END GENERATED SKILL TABLE -->

## Curation

The straight port carried sixty skills. For v0.2.0 they were triaged for
Muse adoption with the plugin's own critical-thinking disciplines: frame
audit (value is relative to what Muse already does natively, not absolute
skill quality), materiality gate (adopt what changes what the assistant can
actually do), and devil's advocate (don't flatter the host's system prompt
into dismissing real procedures as redundant).

- **Keep (29)** — genuinely new capability or method for Muse; adopted
  unchanged.
- **Delta (23)** — overlaps with native Muse behavior; rewritten as trimmed
  "Muse delta" skills keeping only what Muse doesn't natively do. Each
  keeps its directory name, `name:` frontmatter, scripts, and references,
  and carries a `## Muse delta` section stating what's native, what's added,
  and when to load it.
- **Archived (8)** — built for Copilot/VS Code/Outlook/Replicate with no
  Muse equivalent; preserved complete under `archive/host-specific/` for
  other hosts, not for Muse adoption.

The Tier column in the table above marks every skill. Per-skill rationale
lives in [PORT-NOTES.md](PORT-NOTES.md#v020-curation).

## Native capabilities instead of MCP servers

The Copilot edition shipped three MCP servers — `flint` (charts), `replicate`
(image generation), `alex-playwright` (browser verification) — declared in
`plugin.json` and provisioned by `setup-dependencies`. Muse has no MCP consumer,
so this edition declares none; the capabilities are native to the host:

| Copilot edition | Muse edition |
| --- | --- |
| `flint` MCP server | Built-in chart skills |
| `replicate` MCP server | Native media/image generation |
| `alex-playwright` MCP server | Native browser tools |

The full mapping lives in [docs/muse-capability-map.md](docs/muse-capability-map.md).
Skills that referenced the servers carry a Muse-edition note pointing there; the
Copilot-edition provisioning machinery (`setup-dependencies` scripts, the
runtime launcher) is preserved for reference.

## What changed from the Copilot edition

- **No plugin loader, no install step.** Skills are used straight from the
  `skills/` directory the assistant reads; `plugin.json` keeps the `skills` and
  `commands` pointers but drops `mcpServers`.
- **Always-on instructions became opt-in modules.** The fifteen modules moved
  from `instructions/` to `muse-opt-in/` and are never auto-applied — adoption
  is a deliberate user decision. See `muse-opt-in/README.md`.
- **Prompts are chat-ready.** The fifteen slash-command prompts are kept as
  paste-into-conversation prompts; see `prompts/README.md`.
- **No MCP servers.** The three servers map to native Muse capabilities
  ([capability map](docs/muse-capability-map.md)).
- **Skill compatibility pass.** Copilot-specific mechanics (install paths,
  CLI commands, per-host MCP registration) were neutralized or marked as
  Copilot-edition reference; the skills' intellectual content is unchanged.
- **v0.2.0 curation.** The sixty-skill set was triaged for Muse adoption:
  29 kept unchanged, 23 rewritten as trimmed "Muse delta" skills, 8 archived
  under `archive/host-specific/` (see [Curation](#curation)).
- **Identity.** `plugin.json` name is `alex-act-one-Muse`, version `0.2.0`,
  repository `https://github.com/fabioc-aloha/Alex_ACT_ONE_Muse`. Status stays
  `development`.
- Full change log: [PORT-NOTES.md](PORT-NOTES.md).

## Tests

```text
node --test
```

The suite runs on Node alone: no package manager, no test framework, and no
`package.json` required.

They assert the things this README states: that the manifest and the files on
disk agree in both directions, that activation previews plan exactly what the
manifest declares, that each skill carries the frontmatter its host reads, that
there are no MCP servers to register and the capability map is documented, that
the counts quoted above are real, and that no relative link is dead.

The checks that need a provisioned runtime or PowerShell skip rather than fail
where those are absent, so a clean checkout does not report red for a step it
was never asked to perform.

Release steps and the failures that motivated them are in the
[release checklist](RELEASE-CHECKLIST.md).

## What Is Next

See the [roadmap](ROADMAP.md).

## License

MIT — Fabio Correa. See [LICENSE](LICENSE).

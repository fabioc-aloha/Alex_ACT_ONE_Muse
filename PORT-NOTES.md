# Port Notes — Alex ACT ONE, Muse edition

What changed between the Copilot edition
([Alex ACT ONE](https://github.com/fabioc-aloha/Alex_ACT_ONE) v0.3.6) and this
Muse edition (`alex-act-one-Muse` v0.1.0). Target host: Muse, Meta's personal
AI assistant.

## Mirror to flagship 0.10.0 (this edition's v0.4.0, November 2026)

The flagship shipped 0.10.0 on 2026-11-25 (tag `v0.10.0`, commit
`2fe945f8`). Method, same as the 0.9.2 mirror: the flagship delta
(v0.9.2 → v0.10.0) was classified file by file against this edition —
copied where this edition held the flagship text verbatim, merged where
this edition carries Muse-delta rewrites, and skipped where the change
is Copilot-host machinery. One skill added, none removed from this
edition; the active set is now 60.

Ported:

- **Creative Writing (new skill).** Original fiction drafting and
  targeted revision, host-neutral, adopted verbatim; registered in the
  manifest and the README table, tier Keep. It routes AI-tell-only work
  to `humanizer`, which this edition already ships.
- **Flint 1.1.1.** The language reference and publication preset were
  copied verbatim; the shared pin registry (`scripts/shared/dependencies.cjs`)
  and the provisioning scripts now pin `flint-chart@1.1.1` +
  `flint-chart-mcp@1.1.1` and `@playwright/mcp@0.0.84`. The `flint-chart`
  skill's install pins and contract line moved to 1.1.1, it gained the
  missing-inputs check and the no-silent-substitution rule for live
  boards, and a review note scopes its catalog claims (preset counts,
  chart-type availability) as reviewed against 1.0.1, with the installed
  runtime's own resources as the final authority. The offline Showcase
  and Interaction Lab HTML resources are bundled with the skill, as
  upstream (11.9 MB): this edition's link-integrity checks require them,
  and they run in a browser without a checkout or server.
- **Artifact storage contract.** `proactive-awareness` gained the shared
  storage and delivery contract reference and a read-only delivery-check
  mode; `git-workflow`, `meditation`, `plan`, `project-status`, and
  `render-verify` now route to it. The contract text is adopted with one
  adaptation: the flagship's session-artifact checker scans the Copilot
  host's session-state store, so the checker script is not shipped and
  the inventory check is manual in this edition (noted in the contract,
  the `proactive-awareness` skill, and `project-recovery`).
- **Dependency-block routing.** `setup-dependencies` gained the
  "when another skill is blocked" protocol that eleven skills now link
  to (the convert family, `annotate-screenshot`, the Flint skills); its
  checker is read-only (the retired `--apply` is rejected), and
  `provision-runtime.mjs` gained the shared `version-audit.cjs` helper
  (also copied) and the registry tarball-prefix routing. The Copilot
  edition's PowerShell/Mall setup sections (`install-and-check.ps1`,
  `-DependenciesOnly`) are not shipped here.
- **Git auth checker.** `git-workflow` gained the bundled
  `check-git-auth.cjs` (preview-first, no tokens printed) and its
  non-interactive/multi-account guidance, copied verbatim.
- **Humanizer.** Four pattern-catalog clarifications merged (significance
  labels, trailing participles, cross-sentence contrasts, source-scope
  phrases) and the source-comparison record moved to 2026-11-25
  (next due 2026-12-25). The flagship's new pattern 30 was adapted from
  this edition's own pattern 30 (PR #10) and is not duplicated back;
  this edition's evidence-cited participle text was kept over the
  flagship's softened rewrite.
- **Converter and reference updates.** Fail-fast Mermaid PNG handling in
  `md-to-html`, the 1600px/3x render change and fail-fast SVG conversion
  in `md-to-word` (scripts and skills copied verbatim), the
  `compile-brain` resource-portability section, `docs-shell` link fixes,
  and the chart-family reference re-pointing in `chart-big-idea`,
  `chart-vocabulary`, `render-chart`, and `print-svg-style-guide`
  (including the `replicate-imagery` retirement wording).

Skipped, with reasons:

- `proactive-awareness/scripts/check-session-artifacts.cjs` — scans
  `~/.copilot/session-state/`, a Copilot-only store (see the contract
  adaptation above).
- `plan/references/scoped-delegation.md` — the flagship file was itself
  adapted from this edition's `scoped-delegation` skill; `plan` links to
  the sibling skill instead of carrying a second copy.
- The flagship's `package/alex-act-one/` distribution tree,
  `install-and-check.ps1`, `archive/verification/**` evidence dumps, and
  its docs/tests churn for the Copilot installer and unified setup —
  flagship distribution and verification machinery, not edition content.
- Flagship changes inside the archived exclusions (`bootstrap-core`,
  `bootstrap-project`, `rich-email`) — archived here by design; the
  parity record is unchanged.

## Mirror to flagship 0.9.2 (this edition's v0.3.0, November 2026)

The flagship shipped 0.7.0, 0.8.0, 0.9.0, 0.9.1, and 0.9.2 after this
edition's v0.2.0. This release mirrors them. Method: the flagship delta
(v0.6.0 → main at the 0.9.2 audit commit) was classified file by file
against this edition — copied where this edition held the flagship text
verbatim, merged where this edition carries Muse-delta rewrites, and
skipped where the change is Copilot-host machinery. 114 files changed and
61 added against this edition's previous main; nothing was deleted.

Ported:

- **Flint 1.0.1 (flagship 0.8.0).** Pins in the preserved provisioning
  scripts are exact: `flint-chart@1.0.1` + `flint-chart-mcp@1.0.1`. The
  launcher is now the flagship's thin shim over
  `scripts/shared/runtime-status.cjs`, which derives every route's guard
  from `dependencies.cjs` (one pin source; the drift the smoke suite was
  written against cannot recur, and the suite now asserts that shape).
  The flint skills teach `validate_chart` then `show`,
  `list_interaction_presets`, `validate_board`, the 23 `interaction_spec`
  presets (Vega-Lite only), the Ridgeline / Marginal / Table chart types,
  and the 14 themes; ThemeSpec applies to Vega-Lite and Plotly.
- **New skills (flagship 0.7.0 / 0.9.0):** `convert`, `render-chart`,
  `project-status`, `flint-interactions` — registered in the manifest
  (59 skills) and the README table, tier Keep.
- **Deterministic helpers (flagship 0.7.0).** The helper scripts and the
  flagship test files that cover them (`deterministic-helpers`,
  `converter-safety`, `conversion-runtime`, `markdown-inline-code`,
  `output-publication`) were ported; one flagship test path was adapted
  (`instructions/` → `muse-opt-in/`). Where the two editions had written
  the same helper twice (Nov 4 implementations), the flagship's later
  version was adopted: `check-links` (superset: directory recursion,
  fragment slugs), `validate-md`, `measure-reduction`, `check-print-floor`,
  `diff-brain-qa`, `audit-tally`, and `contrast-check`. Two interface
  notes: `audit-tally` now takes `console <rootDir>` / `ratio <w> <b>`
  (the code-review skill text matches), and adopting the flagship
  `contrast-check` fixed a real defect — this edition's skill text already
  used the flagship pair syntax its own script did not accept.
- **Converter safety (flagship 0.9.1).** The converter scripts and shared
  libraries (`output-publication`, `html-screening`, `local-image-path`,
  `process-command`) came across verbatim: source/output alias rejection,
  Markdown input preservation, DOCX media isolation, literal-code
  preservation, email header validation, staged publication with
  rollback. Verified here against real Pandoc conversions (128 of 129
  converter-cluster tests pass with Pandoc on PATH; the one skip needs
  the Mermaid CLI).
- **Canonical routing and content (flagship 0.7.0 / 0.9.0).** Adapted
  SKILL.md merges across the pack, preserving Muse-delta framing:
  critical-thinking mode routing with its methods in `references/`,
  consolidated references and helper scripts for the existing skills
  (63 new files), git-workflow and plan slimmed onto the flagship's
  native-first routing, and the flagship hygiene rule applied — quota
  phrasing and retired tracking obligations removed from Would Revise If
  sections (enforced by the ported telemetry test).
- **Opt-in modules.** All 15 modules and the 9 governance references the
  flagship changed were refreshed verbatim (this edition held them
  byte-identical to the flagship's 0.6.0 text, so the flagship's current
  text is the mirror).

Skipped, with reasons:

- Flagship CI and installer machinery: `.github/workflows/verify.yml`,
  `ci/runtime/`, `install-optional-dependencies.ps1`,
  `reinstall-and-check.ps1`, `.vscode/`, `.gitattributes`, and the
  flagship host files (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`,
  `HANDOFF.md`, `CHANGELOG.md`). This edition has no CI and no installer;
  its changes are recorded here instead of a changelog.
- Flagship demo and verification artifacts: `docs/flint-showcase.html`,
  `docs/flint-experimental.html`, `docs/testing.md`,
  `docs/verification/`, `docs/getting-started.md`, `docs/install.md`,
  `docs/plans/` — flagship build provenance and Copilot onboarding; this
  edition's README and capability map carry its own.
- Flagship tests for machinery this edition does not ship (activation
  conflicts, bootstrap, PowerShell installer, CI gates, showcase
  provenance, Flint provisioning): about 31 files. The tests that cover
  ported code were ported (above).
- Updates to the 8 archived host-specific skills (bootstrap, browser
  tools, enterprise stack, Replicate, rich email, visual companions,
  platform awareness): the archive is a preservation snapshot of the
  original port; the flagship's evolution of those skills stays
  flagship-only. The Replicate retirement proposed in the flagship's
  roadmap is a flagship decision, not yet approved there.

Known leftovers, deliberate:

- `skills/figure-generator/scripts/invert-dataset.mjs` is superseded by
  the ported `invert-svg.mjs` and no longer referenced; kept in place
  pending a retirement call.
- doc-hygiene's Would Revise If deadline stays at this edition's
  2026-12-01 (the flagship's equivalent reads 2026-11-07); deadlines are
  not moved silently.

Verification: full suite 282 tests, 260 pass, 0 fail, 22 skipped (all
skips are provisioned-runtime or real-tool checks; with Pandoc on PATH
the converter cluster runs 128/129). Baseline before the mirror was 91
tests, 86 pass, 0 fail, 5 skipped.

## Identity and metadata

- `plugin.json`: `name` → `alex-act-one-Muse`, `version` → `0.1.0`, description
  rewritten for Muse. `repository` and `homepage` →
  `https://github.com/fabioc-aloha/Alex_ACT_ONE_Muse`.
- `plugin.json`: `mcpServers` dropped entirely — Muse has no MCP consumer.
  `skills` and `commands` pointers kept.
- `manifest.json`: same renames; `status` stays `development`.
- All 15 instruction entries repointed `instructions/` → `muse-opt-in/` and
  carry `opt_in: true` instead of `install_to`.
- `LICENSE`: unchanged — MIT, Fabio Correa.

## Tree layout

- Full tree copied except `.git/` (173 files). All 60 skill directory names
  kept identical so the editions stay in sync.
- `instructions/` → `muse-opt-in/`, with a new `muse-opt-in/README.md`: the
  modules are optional, never auto-applied. `alex-finch-personality` is opt-in
  and off by default (it asserts a different assistant identity).
- `prompts/` kept as-is, plus `prompts/README.md` noting they are chat-ready
  prompts to paste into a conversation; the Copilot-only setup prompts are
  marked as kept for reference.
- New `docs/muse-capability-map.md`: flint → built-in chart skills,
  replicate → native media/image generation, alex-playwright → native browser
  tools.
- Cross-references in skills and prompts that pointed at `instructions/`
  repointed to `muse-opt-in/` (26 links).

## Skill compatibility pass

Rule: Copilot-specific mechanics neutralized; intellectual content untouched.

- `bootstrap-core`: deepest change. Always-on activation mechanics
  (`COPILOT_HOME`, per-app activation, Scout host table) rewritten for the
  Muse edition: canonical sources live in `muse-opt-in/`, activation is a
  deliberate user decision, bundled scripts still target Copilot host paths
  (preserved for reference). The anti-pattern table's `COPILOT_HOME` row
  neutralized. `bootstrap-core.cjs`: source root `instructions/` → `muse-opt-in/`;
  manifest validation now accepts `opt_in: true` instead of `install_to`.
- `flint-chart`: the per-host MCP registration section (config paths, trust
  prompts, reload steps) replaced with a native-capability pointer; frontmatter
  now says "renders via the host's native chart capability".
- `render-verify`: host table reduced to the Muse row; rung 2 rewritten from
  "the optional `alex-playwright` MCP server" to host-native browser tooling;
  the Playwright MCP setup section collapsed to a reference note.
- `replicate-imagery`: frontmatter no longer claims a bundled MCP server;
  edition note routes image work to native media generation.
- `browser-tools`: frontmatter and a top note reframe it as host-agnostic
  patterns over Muse's native browser tools (was: VS Code 1.127+ agent tools).
- `setup-dependencies`, `setup-enterprise-stack`, `install-visual-companions`,
  `platform-awareness`: edition notes at the top marking them as Copilot-edition
  mechanics preserved for reference (MCP provisioning, Copilot CLI settings,
  marketplace installs, VS Code platform tracking).
- `bootstrap-project`: "project Copilot settings" → "project agent settings",
  VS Code workspace baseline → editor baseline.
- `adversarial-review`: OOB Copilot capabilities and the Copilot CLI / VS Code
  Chat routing table neutralized to terminal-agent / chat-agent wording.
- `big-idea`: `copilot-instructions.md` → agent instructions; "Migrating to
  Copilot CLI plugins" → "a shared plugin runtime".
- `compile-brain`: frontmatter `compatibility` line no longer lists Copilot,
  Cursor, Codex, etc. adapters.
- `doc-hygiene`, `code-review`: `copilot-instructions` mentions → neutral
  "agent instructions" wording.
- `figure-generator`: "via the `flint-chart` MCP server" → "via the host's
  native chart capability".
- `markdown-mermaid`: VS Code native chat rendering section marked as
  reference; Muse renders with its own tooling.
- Deliberately untouched (factual or incidental, not mechanics): `ascii-chart`
  (VS Code emoji cell rendering), `annotate-screenshot` (attribution link),
  `git-workflow` (GitHub/VS Code ecosystem), `svg-banner` (render targets),
  `terminal-command-safety` (platform notes), `assess-brain`,
  `project-capability-authoring` (generic MCP mentions).

## Docs

- `README.md` rewritten for Muse: no install steps (use the `skills/`
  directory directly), skill table kept with neutralized "Needs" column,
  "Native capabilities instead of MCP servers" section, and "What changed from
  the Copilot edition".
- `ROADMAP.md` rewritten for the Muse edition (no MCP registration, opt-in
  modules, native capabilities).
- `RELEASE-CHECKLIST.md`: repo URL updated; MCP-server and reinstall-script
  steps marked as Copilot-edition reference.

## Tests (`node --test`)

- `tests/smoke.test.mjs`: `instructions/` → `muse-opt-in/` paths; the
  "Microsoft Scout setup guidance" block rewritten as "Muse setup guidance"
  (asserts no MCP registration section, capability-map pointer, no
  `mcpServers` in `plugin.json`).
- `tests/reinstall-release.test.mjs`: skips when `pwsh` is unavailable
  (PowerShell-only Copilot marketplace flow; not present on Linux).
- Result: full suite green on Node v24 — see the final report for the exact
  counts. The provisioned-runtime checks skip (no runtime provisioned, and
  there is nothing to provision in this edition).

## Deliberately left unported

- **The three MCP servers** (`skills/setup-dependencies` pins, the runtime
  launcher, `register-scout-mcp.mjs`): no consumer in Muse. Mapped to native
  capabilities in `docs/muse-capability-map.md`; scripts preserved for
  reference.
- **Copilot marketplace / install flows** (`reinstall-and-check.ps1`,
  `install-visual-companions` mechanics): no marketplace in Muse.
- **`alex-finch-personality` as a default**: kept as-is in `muse-opt-in/`,
  explicitly opt-in and off by default.

---

# v0.2.0 curation

After the straight port, the 60 skills were triaged for Muse adoption using
the plugin's own critical-thinking disciplines (frame audit, materiality
gate, devil's advocate). Frame: value is relative to Muse's native
capabilities — its system prompt already mandates due diligence,
verify-before-claiming, completed/failed/blocked/unverified status
separation, short plain warm writing, and test discipline — not absolute
skill quality. Result: **29 keep, 23 delta-adapted, 8 archived.**

## Tier 1 — Keep (29, unchanged)

Genuinely new capability or method for Muse: `act-tenets`,
`problem-framing-audit`, `adversarial-review`, `risk-analysis`,
`evaluate-before-adopting`, `deep-review`, `code-review`,
`systematic-debugging`, `mutation-testing`, `security-and-hardening`,
`big-idea`, `humanizer`, `md-to-word`, `docx-to-md`, `md-to-html`,
`html-to-md`, `markdown-sanitization-chain`, `flint-chart`, `flint-theme`,
`chart-big-idea`, `chart-vocabulary`, `chart-interpretation`,
`render-verify`, `meditation`, `compile-brain`,
`project-capability-authoring`, `token-waste-elimination`, `assess-brain`,
`setup-dependencies`.

## Tier 2 — Muse delta (23, rewritten)

~70% overlap with native Muse behavior; adopted as trimmed "delta" skills
that keep only what Muse doesn't natively do. Each keeps its directory name
and `name:` frontmatter, gains a `## Muse delta` section (what's native,
what's uniquely added, when to load), and targets <60% of original length.
Procedures, checklists, worked examples, templates, and scripts were kept;
principle restatements were cut: `critical-thinking`,
`anti-hallucination`, `ethical-reasoning`, `status-reporting`,
`proactive-awareness`, `plan`, `spike`, `test-driven-development`,
`terminal-command-safety`, `git-workflow`, `communication-craft`,
`lint-clean-markdown`, `markdown-mermaid`, `ascii-chart`, `svg-banner`,
`annotate-screenshot`, `figure-generator`, `print-svg-style-guide`,
`docs-shell`, `doc-hygiene`, `corpus-qa-sweep`, `md-to-txt`, `md-to-eml`.

## Tier 3 — Archived (8, moved to `archive/host-specific/`)

Built for Copilot/VS Code/Outlook/Replicate with no Muse equivalent;
preserved complete for other hosts, removed from the active manifest:
`replicate-imagery`, `rich-email`, `browser-tools`, `platform-awareness`,
`bootstrap-core`, `bootstrap-project`, `setup-enterprise-stack`,
`install-visual-companions`. See `archive/host-specific/README.md`.

## Mechanical changes in v0.2.0

- `plugin.json` version → `0.2.0`.
- `manifest.json`: `assets.skills` now lists the 52 active skills; the 8
  archived are recorded under a new top-level `archived` key with reasons.
- README skill table carries a Tier column (Keep / Delta); archived skills
  moved to a separate table pointing at `archive/host-specific/`.
- Tests: `activation-readiness` and `reinstall-release` fixtures repointed
  from `skills/bootstrap-core/` to `archive/host-specific/bootstrap-core/`;
  prompt cross-links to archived skills repointed the same way.

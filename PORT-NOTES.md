# Port Notes — Alex ACT ONE, Muse edition

What changed between the Copilot edition
([Alex ACT ONE](https://github.com/fabioc-aloha/Alex_ACT_ONE) v0.3.6) and this
Muse edition (`alex-act-one-Muse` v0.1.0). Target host: Muse, Meta's personal
AI assistant.

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

# Muse Edition Parity and Hardening Implementation Plan

**Goal:** Make the Muse edition's intentional differences from the flagship
machine-checkable, and close the operational gaps found while running this
project (workdir loss, checklist drift, undocumented version mapping).

**Architecture:** One JSON manifest (`docs/edition-parity.json`) becomes the
single source of truth for how the two editions differ. A deterministic
checker script compares both repos' skill sets against that manifest and
fails on undocumented drift. Everything else is documentation hardening
around it: workdir safety rules, checklist alignment, a README version map.

**Tech Stack:** Node (.mjs scripts, matching the repo's existing tooling),
the GitHub Git Data API via `~/workspace/bin/gh-api-shim` (plain `git push`
cannot authenticate from the Freddy VM), the repo's existing test suite.

**Plan status:** Plan only, written 2026-11-18. Nothing here is implemented.
The plan file currently lives in the goal workspace; Task 0.1 moves it into
the repo at `docs/plans/2026-11-18-muse-edition-parity-plan.md`.

---

## Context the implementer needs

- Flagship repo: `fabioc-aloha/Alex_ACT_ONE` (Copilot edition).
- Satellite repo: `fabioc-aloha/Alex_ACT_ONE_Muse`. The name is spelled
  **Muse**. `Alex_ACT_ONE_Claude` returns 404 with no hint.
- Neither repo has a local workdir on the Freddy VM right now. Workdirs are
  reconstructed from remote `main` through the Git Data API (list the
  recursive tree, download blobs, verify blob SHAs). Pushes go through
  `~/workspace/bin/gh-delta-push.py` onto an existing branch. Never merge or
  push to `main` without Fabio's explicit go.
- GitHub reads through the proxy can show replication lag for a few minutes
  after a push. Trust blob-SHA comparison over a single read.
- The GitHub API rate budget is shared across all of Fabio's same-day work.
  Prefer local trees; use the API sparingly.

## Reassessment result (done 2026-11-18, evidence for Phase 1)

Live tree comparison on 2026-11-18: flagship has 63 skill folders, the Muse
edition has 59. The gross delta is 7 flagship-only folders, 3 Muse-only
folders, and 1 folder present but removed from the active manifest.

Fabio's position: the gap is intentional because the Muse harness provides
better or native equivalents. **Verdict: he is right on all eight.** The
exclusions were already decided and recorded in prose in the repo's
`PORT-NOTES.md` ("built for Copilot/VS Code/Outlook/Replicate with no Muse
equivalent; preserved complete for other hosts, removed from the active
manifest"). What is missing is not the decision, it is a machine-checkable
record of it.

| Skill | Status | Native Muse equivalent / reason | Verdict |
|---|---|---|---|
| `bootstrap-core` | flagship-only | Copilot activation mechanics (`COPILOT_HOME`, per-app activation); the Muse harness manages its own runtime | Intentional, keep excluded |
| `bootstrap-project` | flagship-only | Copilot project-settings scaffold; Muse uses its own workspace conventions | Intentional, keep excluded |
| `browser-tools` | flagship-only | Muse has a native browser. PORT-NOTES says a host-agnostic reframe was prepared, but no `skills/browser-tools/` folder exists in this repo | **Anomaly: resolve in Task 0.3** |
| `install-visual-companions` | flagship-only | Installs Copilot marketplace plugins for visual work; Muse renders natively (artifacts, widgets, media tools) | Intentional, keep excluded |
| `platform-awareness` | flagship-only | Verifies Copilot CLI / VS Code platform claims; the host is fixed by construction in this edition | Intentional, keep excluded |
| `rich-email` | flagship-only | Opens unsent New Outlook drafts via Windows/Copilot mechanics; Muse has native mail connectors plus the shared `md-to-eml` skill | Intentional, keep excluded |
| `setup-enterprise-stack` | flagship-only | Emits the Copilot CLI settings block for the Microsoft ecosystem; no Muse-side counterpart needed | Intentional, keep excluded |
| `replicate-imagery` | folder present, removed from active manifest | Replicate MCP imagery; Muse has native media generation | Intentional, keep as is |

Muse-only skills (satellite-native additions, also to be recorded in the
manifest): `ai-tell-audit`, `github-data-api-push`, `scoped-delegation`.

Known defect outside this plan's scope: the flagship `rich-email` SKILL.md
references `scripts/test-rich-email.cjs`, which the flagship repo does not
ship. Optional follow-up in the flagship repo, not a parity task.

Corrections to the original five suggestions, after inspection:

- A sync gate already exists: `scripts/check-source-sync.py` in this repo.
  Phase 2 builds on it instead of starting over.
- A release checklist already exists (151 lines vs the flagship's 457).
  Phase 4 aligns it; it does not create one.
- The version mapping is recorded in `PORT-NOTES.md` prose (this edition's
  v0.3.0 mirrors flagship 0.9.2). Phase 5 surfaces it in the README.

---

## Phase 0: Baseline and anomaly resolution

### Task 0.1: Reconstruct the Muse workdir and land this plan

**Objective:** A verified local copy of `Alex_ACT_ONE_Muse` main exists and
this plan sits in its `docs/plans/`.

**Files:**

- Create: `docs/plans/2026-11-18-muse-edition-parity-plan.md` (this file)

**Step 1:** Reconstruct the workdir from remote `main` via the Git Data API
(recursive tree, download every blob, compare each blob SHA against the tree
entry). Expected: 0 mismatches.

**Step 2:** Copy this plan into `docs/plans/`, propose a commit boundary.
Commit and push only on Fabio's explicit go (delta push to a branch, PR).

### Task 0.2: Record the current test baseline

**Objective:** The suite result on unmodified `main` is written into the
plan's verification log before any change lands.

**Step 1:** Run the edition's test suite from the workdir root using the
repo's documented runner (see `RELEASE-CHECKLIST.md`).
Expected: a full run / pass / fail / skipped line. Record it verbatim.

**Step 2:** Note any pre-existing failures by name. Later phases compare
against this baseline, never against an assumed green.

### Task 0.3: Resolve the `browser-tools` anomaly

**Objective:** Establish where the reframed host-agnostic `browser-tools`
content lives, or that it does not exist.

**Step 1:** Search the repo (including `archive/`) for the reframed content:

```bash
grep -ril "browser-tools" archive/ docs/ PORT-NOTES.md | head
ls skills/ | grep browser || echo "no active browser-tools folder"
```

**Step 2:** Record the finding in `PORT-NOTES.md` style, one of:
(a) reframed copy found in `archive/` (exclusion stands, manifest says so),
(b) content lost (flag to Fabio: re-port the reframe or record the loss).
No porting work in this task; the decision is Fabio's.

---

## Phase 1: The parity manifest

### Task 1.1: Write a failing test for the manifest

**Objective:** A test asserts `docs/edition-parity.json` exists, parses, and
names every skill in the known delta.

**Files:**

- Test: `tests/edition-parity.test.mjs`

**Step 1:** Write the test: load the JSON, assert it has `excluded` and
`museOnly` arrays, assert the excluded names equal the eight from the
reassessment table and `museOnly` equals the three satellite additions.

**Step 2:** Run: `node --test tests/edition-parity.test.mjs`
Expected: FAIL, manifest file missing.

### Task 1.2: Create the manifest

**Objective:** `docs/edition-parity.json` records each delta skill with a
one-line reason and its native equivalent.

**Files:**

- Create: `docs/edition-parity.json`

Shape:

```json
{
  "mirrors": { "repo": "fabioc-aloha/Alex_ACT_ONE" },
  "excluded": [
    { "skill": "bootstrap-core", "reason": "Copilot activation mechanics", "nativeEquivalent": "Muse harness runtime management" }
  ],
  "museOnly": [
    { "skill": "ai-tell-audit", "reason": "Satellite-native addition" }
  ]
}
```

Fill all eight exclusions and three additions from the reassessment table.
For `browser-tools`, use the Task 0.3 outcome as its reason.

**Step:** Run the Task 1.1 test. Expected: PASS.

### Task 1.3: Commit boundary

Propose: `docs: edition parity manifest + test`. Push only on Fabio's go.

---

## Phase 2: The drift checker

### Task 2.1: Write failing tests with fixture trees

**Objective:** Tests pin the checker's behavior before it exists.

**Files:**

- Test: `tests/check-edition-parity.test.mjs`

Cases: (1) delta exactly matches the manifest, exit 0; (2) a flagship skill
appears that is neither shared nor in `excluded`, exit 1 and the skill is
named; (3) a manifest entry names a skill that no longer differs, exit 1
(stale manifest entry). Fixtures are small JSON tree listings under
`tests/fixtures/edition-parity/`.

**Step:** Run the tests. Expected: FAIL, checker missing.

### Task 2.2: Implement the checker

**Objective:** `scripts/check-edition-parity.mjs` compares two skill
listings against the manifest and reports undocumented drift.

**Files:**

- Create: `scripts/check-edition-parity.mjs`

Behavior: inputs are two directories (local checkouts) or two saved tree
JSON files (offline mode, used by the tests). It lists `skills/*` in each,
computes the delta, subtracts the manifest's `excluded` and `museOnly`,
and prints any remainder as drift. Exit 0 when the remainder is empty.
Follow the style of `scripts/check-source-sync.py` (deterministic output,
counts from the data, no prose estimates).

**Step:** Run the Task 2.1 tests. Expected: PASS. Then run the checker
against the real reconstructed flagship and Muse trees.
Expected: exit 0, because the manifest was built from the live delta.

### Task 2.3: Wire the checker into the suite

**Objective:** The repo's test run includes the parity tests.

**Step:** Add `tests/edition-parity.test.mjs` and
`tests/check-edition-parity.test.mjs` wherever the suite enumerates tests
(check how existing tests are discovered first; if discovery is by glob,
no change is needed, verify by running the suite and seeing the new tests
listed). Expected: suite at the Task 0.2 baseline plus the new tests
passing.

### Task 2.4: Commit boundary

Propose: `feat: edition parity drift checker`. Push only on Fabio's go.

---

## Phase 3: Workdir safety

### Task 3.1: Add the safety rules to the repo's AGENTS.md

**Objective:** The incident that deleted the canonical workdir mid-build
cannot recur by convention.

**Files:**

- Create or modify: `AGENTS.md` (repo root)

Content, three rules: (1) never delete or move the canonical workdir;
cleanup targets a named scratch directory only; (2) scratch work lives in
`~/workspace/scratch/` on the Freddy VM, never inside the workdir; (3)
before editing, run `scripts/check-source-sync.py` and stop on any
mismatch.

### Task 3.2: Document the restore procedure

**Objective:** `docs/restore-workdir.md` describes the Git Data API
reconstruction (tree listing, blob download, SHA verification) as a
numbered procedure, so a lost workdir is a 10-minute recovery, not a
research project.

**Files:**

- Create: `docs/restore-workdir.md`

### Task 3.3: Commit boundary

Propose: `docs: workdir safety rules and restore procedure`. On Fabio's go.

---

## Phase 4: Release checklist alignment

### Task 4.1: Diff the two checklists

**Objective:** A written list of flagship checklist steps (457 lines) with
no counterpart in this edition's checklist (151 lines), each marked
"applies here" or "Copilot-only".

**Step:** Produce the diff list as a scratch note. Expected: every flagship
step classified; no step silently dropped.

### Task 4.2: Adopt the applicable steps

**Objective:** This edition's `RELEASE-CHECKLIST.md` gains the applicable
steps from Task 4.1, plus two new gates: run
`scripts/check-edition-parity.mjs` (must exit 0) and record the suite
baseline before tagging.

**Files:**

- Modify: `RELEASE-CHECKLIST.md`

**Step:** Verify by grep: the checklist mentions `check-edition-parity`
and the baseline step. Re-run the suite to confirm nothing broke.

### Task 4.3: Commit boundary

Propose: `docs: align release checklist, add parity gate`. On Fabio's go.

---

## Phase 5: README version map

### Task 5.1: Add the mapping table

**Objective:** The README shows which flagship version each Muse release
mirrors.

**Files:**

- Modify: `README.md`

Table content, sourced from `PORT-NOTES.md` (verify each row against it
before writing): v0.1.0 built from the flagship v0.3.6-era base; v0.2.0;
v0.3.0 mirrors flagship 0.9.2. Add one line under the table: the satellite
repo name is spelled `Alex_ACT_ONE_Muse` (Muse, not Claude).

**Step:** Verify each row against `PORT-NOTES.md` text. Any row that cannot
be verified stays out.

### Task 5.2: Commit boundary

Propose: `docs: README version map`. On Fabio's go.

---

## Phase 6: Plugin marketplace packaging (decision-gated spike, optional)

### Task 6.1: Verify applicability before building anything

**Objective:** Establish whether a `.claude-plugin/marketplace.json`
package is consumable by the Muse harness at all.

**Step 1:** Read `docs/muse-capability-map.md` in this repo and the
current Muse product docs on plugin marketplaces. The Muse plugin format
targets Muse; whether the Muse personal-assistant harness consumes
the same format is unverified.

**Step 2:** Report the finding to Fabio in one page or less. Build nothing.
If the format does not apply, the correct deliverable is a one-command
install script instead, proposed as a separate plan.

---

## Risks and tradeoffs

- **API rate budget:** the checker defaults to local trees for this reason.
  An API mode is a convenience, never the default.
- **Manifest rot:** a manifest nobody runs is worse than none. Phase 4's
  checklist gate is what keeps it alive; without Fabio adopting the gate,
  Phases 1 and 2 lose most of their value.
- **Replication lag:** post-push verification reads can lie for a few
  minutes. Verify by blob SHA, and re-read before declaring failure.
- **Scope:** the flagship `rich-email` missing-test defect is real but
  belongs to the flagship repo. Fixing it here would blur the parity this
  plan exists to protect.

## Open questions for Fabio

1. `browser-tools`: if Task 0.3 finds the reframed copy was lost, re-port
   it or record it as excluded like the other seven?
2. Phase 6: worth the spike, or is manual install acceptable for a
   satellite edition?
3. Should the parity gate also run before flagship releases (flagship
   side), or only on this edition?


---

## Execution log (2026-11-18, Freddy)

- **Phase 0:** Workdir reconstructed from remote `main`: 269 blobs, 0 SHA
  mismatches. Baseline suite on the fresh tree: 282 tests / 260 pass /
  0 fail / 22 skipped. Browser-tools anomaly resolved as outcome (a): the
  preserved copy lives in `archive/host-specific/` with an edition note,
  and `manifest.json`'s archived list records all eight exclusions.
- **Phase 1:** `docs/edition-parity.json` + `tests/edition-parity.test.mjs`
  (4 tests). Design adaptation: `manifest.json` already records the
  archived names and reasons, so the parity file adds the native
  equivalents and the `museOnly` record, and the test cross-checks the two
  records against each other and against the disk.
- **Phase 2:** `scripts/check-edition-parity.mjs` +
  `tests/check-edition-parity.test.mjs` (8 tests). First real run caught a
  genuine state change: the flagship has retired `replicate-imagery` (only
  `archive/retired-assets/replicate-imagery.source.txt` remains, guarded by
  its own removal test). The parity file marks it `retired-upstream`, and
  the checker treats that status in both directions.
- **Phase 3:** `AGENTS.md` (workdir safety, sync-before-edit, push rules)
  and `docs/restore-workdir.md` (this procedure, generalized).
- **Phase 4:** Checklist diffed against the flagship's 457-line version.
  The candidate-packaging section is flagship-only (no package builder
  here). The humanizer source check applies and was adopted as step 8; the
  parity gate was added as step 9; the Mall step was renumbered to 11 and
  kept as reference.
- **Phase 5:** README version map (v0.1.0 ↔ flagship v0.3.6, v0.2.0 ↔
  v0.6.0, v0.3.0 ↔ v0.9.2; each row verified against `PORT-NOTES.md`).
  Also fixed a stale fact in the Identity bullet: version 0.2.0 → 0.3.0.
- **Phase 6.1:** Spike report filed in the goal workspace: the
  `.claude-plugin` marketplace format has no consumer in Muse, so nothing
  was built. An install script is the useful alternative if wanted.
- **Final verification:** suite 294 tests / 272 pass / 0 fail / 22 skipped
  (baseline 282 + 12 new, no regressions). Real-tree parity check against
  the flagship's live tree: exit 0, no undocumented drift.
- **Delivery:** branch `alex/edition-parity` and a pull request for
  Fabio's merge decision. Nothing merged to `main`.

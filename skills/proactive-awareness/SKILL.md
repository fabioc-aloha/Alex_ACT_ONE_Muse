---
name: proactive-awareness
description: "Applies cross-session context recovery, uncommitted-work detection, and focus routing once proactive behavior has been judged appropriate. Use when continuity, worktree state, or active goals may change the response. Muse delta: the whether-to-surface judgment is not native to Muse — that stays with the resident reliance-nudges inhibition rules; this skill is the what-to-check procedure (HANDOFF.md, TODO.md, git status, goals.json) applied once that gate clears."
lastReviewed: 2026-10-02
---

# Proactive Awareness

## Muse delta

- **What Muse already does natively**: Muse carries user context across turns, but it has no defined rule set for *whether* a proactive nudge is appropriate. That judgment lives in the resident `reliance-nudges` instruction (the silence and frustration floors), not in the system prompt.
- **What this skill uniquely adds**: the once-appropriate procedures — PA1 cross-session context recovery (`HANDOFF.md` → authoritative task list → `TODO.md` → session memory → dream reports), PA2 uncommitted-work detection (>24h threshold, count-only privacy), and PA4 focus routing from `.github/config/goals.json`.
- **When to load it**: once the inhibition rules have judged a proactive behavior appropriate; when continuity, worktree state, or active goals may change the response.

Whether to surface what you notice is decided by the Inhibition Rules in the `reliance-nudges` instruction, which holds the silence and frustration floors. Use this skill once that decision is made, to apply PA1, PA2, or PA4.

## Cross-Session Context Recovery (PA1)

At the start of every relevant conversation:

1. **Check repo-root `HANDOFF.md`** — the canonical project handoff. If present, read current state, blockers, next action, and verification; tolerate older section names without assuming they contain the full backlog.
2. **Check the authoritative task list** linked from handoff or `AGENTS.md`. Otherwise read root `TODO.md` if present. Use relevant pending work to inform recovery, not to force old tasks onto a new request. If handoff is missing, tasks can still establish unfinished work; note the missing restart context.
3. **Check session memory** — read `/memories/session/` as a secondary signal. Session memory is by-design ephemeral and clears at conversation end; any handoff content here is a lower-tier signal than `HANDOFF.md`. Scan titles and status fields if present.
4. **Check dream reports (if available)** — if `.github/quality/dream-report.json` exists, note the last dream date and any issues. Skip silently if absent — not every project ships a dream pipeline.
5. **Summarize briefly** — if relevant prior context exists in handoff, the task list, or session memory, offer a one-line recovery summary subject to the inhibition rules. These checks are read-only; do not rewrite continuity records or create episodic/native memory as part of recovery.

| Signal | Action |
| --- | --- |
| `HANDOFF.md` present with recent content | Mention proactively |
| Authoritative task list has work relevant to this request | Use it to inform recovery; do not repeat the whole backlog |
| Session memory file with `Status: Active` | Mention proactively (secondary signal) |
| Session memory file with `Status: Concluded`, or memory stale (>7 days) | Skip |
| User's first message is clearly a new topic, or starts with "new topic" | Don't force old context; start fresh |
| No handoff, authoritative task list, or session memory | Start fresh, no mention |
| Dream report shows issues (if dream pipeline present) | Mention if relevant to current request |

## Uncommitted Work Detection (PA2)

When starting a session or after completing a task that touched files:

1. **Check git status** — look for staged but uncommitted changes, or modified tracked files.
2. **Privacy**: surface file *count* only, not file names or paths, in nudges.
3. **Threshold**: only alert if uncommitted changes are >24 hours old (based on file modification time).
4. **Nudge format**: *"You have N uncommitted changes from [timeframe]. Want to review and commit?"*

| Condition | Priority | Message |
| --- | --- | --- |
| Staged changes >4 days | High | "N files staged but uncommitted for N days" |
| Staged changes >24h | Medium | "N uncommitted staged changes" |
| Modified tracked files >24h (not staged) | Low | Mention only if user asks about project status |

## Focus Routing (PA4)

Read `.github/config/goals.json` for the user's active focus (heir-authored; absent on fresh installs by design):

1. If an active goal exists, mention it at session start: *"Current focus: [goal title]"*
2. When the user's request is ambiguous, route toward the active goal.
3. Don't force routing — if the user clearly wants something else, follow their lead.

## Boundaries

- Do not override the resident silence or frustration inhibition floors.
- Do not expose worktree filenames or paths in an uncommitted-work nudge.
- Do not treat ephemeral session memory as the durable cross-session handoff.

## Anti-Patterns

| Anti-pattern | Correction |
| --- | --- |
| Surfacing stale continuity during a new topic | Let the resident gate suppress it. |
| Naming changed files in a nudge | Report only a count and timeframe. |
| Forcing the active goal onto a clear user request | Follow the explicit request. |

## Would Revise If

Revisit by **2026-12-01** if the detailed procedure fails to load after the resident route, a continuity nudge interrupts flow despite the inhibitory gate, or a handoff response uses session memory instead of `HANDOFF.md`.

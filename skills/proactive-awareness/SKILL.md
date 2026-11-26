---
name: proactive-awareness
description: "Applies cross-session context recovery, uncommitted-work detection, focus routing, and read-only project artifact delivery checks once proactive behavior has been judged appropriate. Use when continuity, worktree state, active goals, or repository deliverable verification may change the response. Muse delta: the whether-to-surface judgment is not native to Muse — that stays with the resident reliance-nudges inhibition rules; this skill is the read-only what-to-check contract (HANDOFF.md, authoritative task list, TODO.md fallback, git counts, goals) applied once that gate clears, with the detailed procedures consolidated in its references."
lastReviewed: 2026-11-24
---

# Read-only Project Recovery

## Muse delta

- **What Muse already does natively**: Muse carries user context across turns, and its native session history, resume, and memory interfaces are available as secondary evidence. Muse's official proactive-work skill and runtime proactivity system own the proactive loop itself (when private work runs, what it may do unasked, how results surface); this skill does not duplicate that machinery. They are not the authoritative task backlog, and Muse has no defined native rule set for *whether* a proactive nudge is appropriate — that judgment lives in the resident `reliance-nudges` instruction (the silence and frustration floors), not in the system prompt.
- **What this skill uniquely adds**: the read-only recovery contract — recovery never authorizes writes or meditation; a policy-denied source stays denied; unobserved worktree state stays unknown; nudges disclose counts, not filenames — plus routing to the consolidated procedures in [project recovery](references/project-recovery.md) (PA1 cross-session recovery, PA2 uncommitted-work detection, PA4 focus routing).
- **When to load it**: once the inhibition rules have judged a proactive behavior appropriate; when continuity, worktree state, or active goals may change the response.

Use relevant native session history, resume, and memory interfaces as secondary evidence, not as the authoritative task backlog. Read current repository guidance, HANDOFF current state/next action/blockers/verification, and the authoritative task list; use TODO.md only as a fallback. Follow existing project conventions and do not invent absent records.

This skill is read-only. Do not create or rewrite project records, instructions, memory, or installed configuration. A request to recover context does not authorize meditation writes. New topics and irrelevant/stale history must not be forced onto the user's current task.

A policy-denied source remains unavailable: do not ask the user to paste, supply, or reupload its contents, or recover them through another channel. Ask only for an independently authorized task goal or next action without restricted content. Modified does not establish staged or unstaged status; keep unobserved worktree details unknown.

Load and follow the [project recovery procedure](references/project-recovery.md) for the selected recovery, worktree-state, or focus case. Count changes with git; privacy-sensitive nudges disclose counts, not filenames. Silence wins during frustration or flow, and unsolicited reminders must be relevant and nonintrusive.

For session/context mechanics use native controls and the [session boundary](references/runtime-session-health-monitoring.md); do not collect cross-session behavioral scores. Missing history/handoff is a named limitation, not evidence that no work exists. Return material state, blockers, next action, and evidence without claiming fresh verification from stale notes.

## Delivery-check mode

Load and follow the [shared storage and delivery contract](references/project-artifact-storage.md)
to verify the approved task's artifact inventory, final repository files,
dependencies, discoverability, ignore state, and actual Git state.
Muse edition note: the flagship ships a session-artifact checker that
scans the Copilot host's session-state store (`~/.copilot/session-state/`);
it is not shipped here because Muse has no equivalent store. Perform the
same inventory manually: confirm no deliverable for the active repository
was left in session scratch, temporary storage, or a chat artifact instead
of the repository. Ignored copies do not satisfy delivery, and absent or
unavailable session scope is not reported as clean.
This mode is also read-only: report missing delivery rather than relocating,
archiving, committing, or activating files without the task's write authority.
Recovery should report relevant externally stranded artifacts, not silently
promote them or treat missing session history as proof of completeness.

## Runtime contract references

Load only the reference selected by the triggering instruction; do not replay all runtime contracts for unrelated work. These references add no authority and do not call the instruction again.

- **recovery**: [session-health-monitoring](references/runtime-session-health-monitoring.md)
- **delivery-check**: [project artifact storage](references/project-artifact-storage.md)

## Would Revise If

Revisit if the detailed procedure fails to load after the resident route, a continuity nudge interrupts flow despite the inhibitory gate, or a handoff response uses session memory instead of `HANDOFF.md`.

---
name: "scoped-delegation"
description: "Brief subagents with explicit boundaries, watch their real state, and verify outputs before merging — delegation discipline for agentic work. Use when delegating to any worker agent, especially parallel or long-running ones."
lastReviewed: 2026-10-16
---

# Scoped Delegation

## Muse delta

- **Native to Muse:** spawning and steering subagents, listing active and recent workers, reading their results.
- **What this skill uniquely adds:** the brief-with-boundaries discipline — naming forbidden side effects up front, giving research workers a read-only brief, verifying every output against the brief, and cleaning up unauthorized artifacts. It prevents the two common delegation failures: workers inventing scope, and workers that look stalled while their output sits unpushed on local disk.
- **Load when:** delegating work to subagents — especially several in parallel, long-running work, or anything that touches persistent or external surfaces.

A worker that is only told what to do will invent what else to do. Say the boundaries in the brief, not after the fact.

## Brief with boundaries

- State the task, the deliverables, and where each deliverable goes before the worker starts.
- Name the forbidden side effects explicitly in the brief. A worker that is only told what to do will invent what else to do.
- Forbid creating new persistent surfaces unless the brief names them. Repos, branches, pull requests, tracked items, scheduled jobs, and hooks are never implied by a task.
- Forbid external effects unless the brief names them. Sends, publishes, purchases, installs, and credential use each need their own explicit grant.
- Give research or review workers a read-only brief. If the job is research or review, say that nothing may be written outside the report.
- Ask the user before delegating work that touches surfaces they own personally, such as their calendar, goals, or contacts. What is routine for you can be presumptuous on their behalf.
- Keep independent delegations in separate briefs. Narrow workers drift less and their outputs are easier to verify.

## Watch the real state

- Check the worker's actual state before diagnosing a stall. List active and recent workers and read what each one delivered.
- Distinguish a running worker from stalled work. A worker can be alive while its output sits unpushed on local disk, which looks identical to stuck from the outside.
- Report the material state, not a story about the worker. Say what exists, where it exists, and what has not moved, instead of blaming the worker.
- Do not close a running worker for apparent slowness alone. Close it when its work is no longer needed, it is genuinely stuck, or it needs to be replaced.

## Verify and clean up

- Compare every output against the brief before merging, publishing, or reporting it done.
- Remove unauthorized artifacts the worker created. Delete the branch, close the draft, or revert the file, and say plainly what was removed.
- Disclose anything you keep that the user did not ask for. If an unauthorized creation turns out useful, name it and ask whether to keep it before it becomes load-bearing.
- Record the scope breach in the worker's report. The next brief for similar work should carry the boundary that was missing.

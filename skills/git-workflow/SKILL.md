---
name: git-workflow
description: "Consistent git practices for branch hygiene, safe commits, non-interactive multi-account GitHub authentication, and recovery from common mishaps (lost commits, bad merges, accidental pushes). Use when authoring or reviewing a git workflow, diagnosing non-interactive push/credential failures, recovering broken local state, or sequencing a commit/push that needs explicit user approval before destructive steps. Muse delta: the approval-and-routing contract below, plus the consolidated execution details it routes to (the decision table, the tag-move-forward procedure, reflog recovery, and the three rules that hold before risky operations) — beyond Muse's native habit of confirming before destructive ops."
lastReviewed: 2026-11-07
---

# Git Workflow Skill

## Muse delta

- **Native to Muse:** confirming before destructive operations, proposing checkpoints before risky work, and refusing to force-push without explicit approval.
- **What this skill uniquely adds:** the approval-and-routing contract below, and the consolidated procedures in [execution details](references/execution-details.md) — the scenario→command decision table, the tag-move-forward (pre-push only) procedure, the reflog recovery pattern for orphaned commits, and the three rules that hold before ANY risky operation.
- **Load when:** authoring/reviewing a git workflow, recovering broken local state, or sequencing a commit/push that needs explicit user approval before destructive steps.

Use native Git UI, diff/review tools, and shell commands for ordinary operations. Follow the user's repository/branch workflow; do not introduce PRs, commits, pushes, or a new branch merely because a generic example uses them.

Inspect status and preserve unrelated/uncommitted work. Destructive reset/restore/clean, history rewrites, tag moves, and checkpoint commits require explicit approval of their scope. Never force-push a shared branch or rewrite a published tag. Use non-interactive commands and disable pagers (`git --no-pager …`).

Before an authorized push, or after a non-interactive Git authentication failure, run the bundled [Git auth checker](scripts/check-git-auth.cjs) in preview mode (`node <this-skill>/scripts/check-git-auth.cjs --repository-root <repo> --user <account>`). A repository owner may be an organization; do not infer the login from it. Use `--hostname` explicitly for GitHub Enterprise; other HTTPS providers are not automatically treated as GitHub. This environment's observed `credential.interactive=never` is not a universal host claim. Preview verifies selected-token identity, repository read access, and actual credential-helper execution without printing tokens or changing global account selection. Branch push policies remain separately verified. Apply needs explicit consent; it validates a prepared helper and atomically replaces local config with rollback on a failed post-apply probe.

Load only the applicable recovery, authentication, or release procedure in [execution details](references/execution-details.md). Commands there illustrate effects, not permission to run them. Prefer a scoped, reversible action; when unsure, inspect or dry-run and report the decision needed. A fetch does not merge; a requested fast-forward must refuse divergence.

Apply the [shared artifact storage contract](../proactive-awareness/references/project-artifact-storage.md)
to project deliverables: check that final files and dependencies are discoverable
and not ignored. Repository presence, staging, a local commit, a push, and a
verified remote commit are separate states. Report the observed state; storage
requirements alone do not authorize commits or pushes.

Git core is stable; GitHub features (Actions, CLI) evolve. Verify installed Git/GitHub CLI behavior before a risky operation rather than relying on a version claim in this guide.

Return the actual command result and resulting branch/worktree state. Do not equate an exit code with broader integration or test success.

## Verify the canonical source before asserting or building

- Before you claim a file does or does not exist in a repo, query the remote listing. A local checkout can be stale, and a local directory listing is not evidence of remote state.

- Before you build a deliverable from repo files, pull fresh copies first. Rebuilding from stale local copies ships yesterday's artifact.

- When a remote check contradicts your local view, say so plainly and correct the record. The fix is checking first, not apologizing after.

## Would Revise If

Revise if the recovery patterns produce data loss in a real recovery scenario, or if the 'safe operations' classification labels a destructive op as safe and that op runs without confirmation.

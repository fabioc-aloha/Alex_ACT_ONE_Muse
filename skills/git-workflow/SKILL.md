---
name: git-workflow
description: "Consistent git practices for branch hygiene, safe commits, and recovery from common mishaps (lost commits, bad merges, accidental pushes). Use when authoring or reviewing a git workflow, recovering broken local state, or sequencing a commit/push that needs explicit user approval before destructive steps. Muse delta: the decision table, tag-move-forward procedure, reflog recovery, and the three rules that hold before risky operations — beyond Muse's native habit of confirming before destructive ops."
lastReviewed: 2026-08-15
---

# Git Workflow Skill

## Muse delta

- **Native to Muse:** confirming before destructive operations, proposing checkpoints before risky work, and refusing to force-push without explicit approval.
- **What this skill uniquely adds:** the scenario→command decision table, the tag-move-forward (pre-push only) procedure, the reflog recovery pattern for orphaned commits, and the three rules that hold before ANY risky operation.
- **Load when:** authoring/reviewing a git workflow, recovering broken local state, or sequencing a commit/push that needs explicit user approval before destructive steps.

Git core is stable; GitHub features (Actions, CLI) evolve. Verify installed Git/GitHub CLI behavior before a risky operation rather than relying on a version claim in this guide.

---

## Decision Table

| Scenario | Command | Notes |
|----------|---------|-------|
| Undo last commit, keep changes | `git reset --soft HEAD~1` | Safe, preserves work |
| Restore single file | `git checkout HEAD -- path/to/file` | Discards file changes |
| Restore entire folder | `git checkout HEAD -- .github/` | Discards folder changes |
| Before risky operation | `git status --short; git diff --check` | Propose a checkpoint; commit or tag only after explicit user approval |
| Discard all uncommitted | `git reset --hard HEAD` | Destructive, no recovery |
| Reset to remote state | `git reset --hard origin/main` | Destructive, syncs to remote |
| Save work temporarily | `git stash` → `git stash pop` | For quick context switch |
| Isolated experimental work | `git worktree add ../feature branch` | Agent-friendly isolation |

---

## Commit Message Convention

```text
type(scope): brief description

- Detail 1
- Detail 2
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`

Examples: `feat(skills): add git-workflow skill` · `fix(sync): resolve race condition in background sync` · `docs(readme): update installation instructions`

## Before Risky Operations

```bash
git status --short
git diff --check
```

After explicit user approval, create a scoped checkpoint commit or tag before a risky operation. Do not stage unrelated work or create a checkpoint by default.

Three rules that hold regardless of the operation:

1. **Never force-push to a shared branch** (`main`, `develop`, any branch someone else tracks). Rewriting history under a collaborator is not recoverable by them.
2. **With explicit user approval, create a scoped checkpoint or tag before rebase, reset, or filter operations.** Do not include unrelated work in the checkpoint.
3. **Run `--dry-run` first when unsure.** `git clean`, `git push`, and `git rm` all support it. Read the output before dropping the flag.

## Tag-Move-Forward (Pre-Push Only)

When a small follow-on change lands after a release tag but **before the tag is pushed**, move the tag forward rather than cutting a redundant patch release. Two requirements: (1) the tag must not yet exist on `origin`, (2) the follow-on belongs in the same release narrative (typo, doc fix, orphan removal — not new behavior).

```bash
# Verify tag is local-only first
git ls-remote --tags origin v3.2.1   # must return empty

# Force-move the annotated tag to the new HEAD
git tag -d v3.2.1
git tag -a v3.2.1 -m "release notes..."
git log -4 --oneline                 # confirm tag now on HEAD

# Push main + tag together
git push origin main
git push origin v3.2.1
```

**Never** force-move a pushed tag. Once `git push origin v<x>` succeeded, the only safe move is a new patch (`v<x>+1`).

## Recovery Patterns

### Recover an Unreachable Commit

`git log` only walks commits reachable from a ref. A commit orphaned by `reset --hard`, a bad rebase, or a deleted branch is invisible to it. `reflog` records where `HEAD` has actually been:

```bash
git reflog                      # Every HEAD position, newest first
git reflog show <branch>        # Movements of one branch
git reset --hard <sha-from-reflog>   # Return to that state
git cherry-pick <sha-from-reflog>    # Or lift just that commit
```

Reflog is local-only and expires (90 days for reachable entries, 30 for unreachable). It cannot recover work that was never committed.

### Undo a Pushed Commit

```bash
git revert <sha>    # New commit that inverts the change; safe on shared branches
```

Prefer `revert` over `reset` once a commit is on `origin` — see the force-push rule above.

## Branching Strategy

```text
main
 └── feature/short-description
 └── fix/issue-number
 └── release/v3.7.0
```

**Rules**: `main` is always deployable; feature branches for experimental work; merge via PR when possible, direct commit for small fixes; delete branches after merge.

## Conflict Resolution

1. **Pull before push**: `git pull --rebase origin main`
2. **If conflicts**: resolve in editor, then `git add .` + `git rebase --continue`
3. **If stuck**: `git rebase --abort` to start over

## Worktrees (Agent Isolation)

```bash
git worktree add ../project-feature feature-branch   # isolated work
git worktree list                                     # list all worktrees
git worktree remove ../project-feature                # remove
git worktree prune                                    # prune stale links
```

## Anti-Patterns

- ❌ `git push --force` on shared branches
- ❌ Committing secrets or credentials
- ❌ Giant commits with unrelated changes
- ❌ Vague messages like "fix stuff" or "update"

## Would Revise If

Revise if the recovery patterns produce data loss in a real recovery scenario, or if the 'safe operations' classification labels a destructive op as safe and that op runs without confirmation.

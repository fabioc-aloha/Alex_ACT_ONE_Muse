# AGENTS.md

Working rules for agents editing this repo (Alex ACT ONE, Muse edition).
The repo is a hand-maintained mirror of the Copilot flagship
(`fabioc-aloha/Alex_ACT_ONE`); `PORT-NOTES.md` records what each mirror
changed and why, and `docs/edition-parity.json` is the machine-checkable
record of how the editions differ.

## Workdir safety

These rules exist because of the 2026-11-04 incident: a cleanup command
deleted the canonical workdir mid-build, and the restore cost hours.

1. **Never delete or move the canonical workdir.** Cleanup targets a named
   scratch directory only, never the repo root or its parent.
2. **Scratch work lives outside the workdir** (on the Freddy VM:
   `~/workspace/scratch/`). Build staging, reconstructions of other repos,
   and throwaway experiments never go inside this tree.
3. **Resolve the workdir by its exact name bytes.** The repo is spelled
   `Alex_ACT_ONE_Muse` (Muse, not Claude). Case-variant paths have
   silently resolved to the wrong directory before; when a script computes
   the path, assert the final component.

## Before editing

Run `python3 scripts/check-source-sync.py` (or the equivalent blob-SHA
comparison against remote `main`) and stop on any mismatch. Work that
starts from a stale copy gets redone; the 2026-10-16 book-work incident
and this repo's own restore both trace back to skipping this check.

## Pushing

- From the Freddy VM, plain `git push` cannot authenticate to github.com.
  Pushes go through the Git Data API (`gh-delta-push.py`), onto a branch,
  with a pull request for review.
- Never push or merge to `main` without Fabio's explicit go.
- Verify a push by comparing blob SHAs in the new tree, not by re-reading
  file contents once: reads through the proxy can lag for minutes after a
  push and report the pre-push state.

## Parity gate

Before any release, and after any flagship mirror, run the edition parity
check (see `RELEASE-CHECKLIST.md` step 9). A difference between the
editions that `docs/edition-parity.json` does not document is drift, and
drift gets a decision, not silence.

# Restoring the workdir from remote main

Use this when the local workdir is lost, deleted, or untrusted. The Freddy
VM cannot `git clone` this repo (no credential helper for github.com), so
the workdir is reconstructed through the GitHub Git Data API and verified
blob by blob. Worked example: the 2026-11-18 reconstruction rebuilt 269
files with 0 SHA mismatches, and the suite then ran at its recorded
baseline (282 tests, 260 pass, 0 fail, 22 skipped).

## Procedure

1. **List the remote tree.**
   `GET /repos/fabioc-aloha/Alex_ACT_ONE_Muse/git/trees/main?recursive=1`
   (via `~/workspace/bin/gh-api-shim` on the Freddy VM). Confirm the
   response is not `truncated`; if it is, walk subtrees instead.

2. **Download every blob.**
   For each entry of type `blob`, `GET /repos/{owner}/{repo}/git/blobs/<sha>`
   and base64-decode the content. A few parallel workers (2 to 3) are
   plenty; higher counts stall through the proxy.

3. **Verify each blob before writing it.**
   A git blob's SHA is `sha1("blob " + <byte length> + "\0" + <content>)`.
   If the computed hash differs from the tree entry's SHA, stop and report;
   do not write a partial tree and call it restored.

4. **Write files and restore modes.** Entries with mode `100755` get the
   executable bit; everything else is a regular file. Empty directories do
   not exist in git and are not recreated.

5. **Verify the restore.** Run `node --test` from the workdir root and
   compare against the last recorded baseline. A restore that changes the
   suite result is not a restore.

## Notes

- The local `.git` directory is not reconstructed by this procedure and is
  not needed: sync state is proven by blob SHAs against the remote tree
  (`scripts/check-source-sync.py`), not by git status.
- GitHub's API rate budget is shared across all of Fabio's same-day work.
  A full reconstruction is a few hundred requests; do not run two at once.
- If the workdir still exists and is merely behind, do not rebuild it:
  fetch the remote tree, compare SHAs, and download only the blobs that
  differ.

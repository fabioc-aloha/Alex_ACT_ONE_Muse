---
name: "github-data-api-push"
description: "Push commits to GitHub through the Git Data API (blobs → trees → commit → ref) when `git push` cannot authenticate — blocked egress, no credential helper, or token-only environments. Use when git push fails with 401/auth errors but the REST API works, when pushing large trees, or when scripting pushes without a local git remote."
lastReviewed: 2026-10-07
---

# GitHub Data API Push

## Muse delta

- **Native to Muse:** confirming before destructive operations and proposing checkpoints before risky work (see `git-workflow`).
- **What this skill uniquely adds:** the complete Data API push sequence with the failure modes that only appear at scale — parallel blob uploads that trigger replication lag, single tree POSTs that time out past a few hundred entries, empty directories the API rejects, and the empty-repo case where blob creation 409s. Plus a checked-in `scripts/gh-push.mjs` so the procedure is executed, not re-derived from prose.
- **Load when:** `git push` fails with an auth error but `api.github.com` is reachable, or when a push must be scripted without a git remote.

Git push over HTTPS needs a credential helper or interactive auth. The REST API needs only a token. When the first is broken and the second works, this is the push path.

---

## Auth

The script reads `GITHUB_TOKEN` from the environment. Never pass the token as an argument (it lands in process lists and shell history) and never write it to a file the push stages.

A fine-grained token needs **Contents: read and write** on the target repo. A 401 or 403 is a question about the request before it is a question about the token: check that the `Authorization` header was actually attached. Only once an attached token is still rejected should the token be replaced.

## Procedure

```
GITHUB_TOKEN=<token> node scripts/gh-push.mjs \
  --repo owner/repo --branch feature/x --workdir ./dir \
  --message "commit message" [--base main] [--force] [--dry-run]
```

1. **Blobs.** Every file is uploaded with `POST /repos/{o}/{r}/git/blobs` (base64). The local git blob SHA (`sha1("blob <len>\0" + content)`) is asserted against the returned SHA. Uploads run 5 at a time; a file over ~40MB raw is refused — split it first (the API 422s above ~41MB).
2. **Trees.** Up to ~200 entries go in one tree POST. Past that, trees are built one per directory, bottom-up; a single huge tree POST times out. Empty directories are pruned (the API rejects empty trees, and git cannot store them anyway); file-less directories with children are kept so subtrees link up.
3. **Replication lag.** Parallel blob uploads can outrun replication: the tree POST may 422 with `"sha" is not a valid blob`. The fix is re-uploading those SHAs and retrying with backoff, not restructuring the push.
4. **Commit and ref.** `POST /git/commits`, then create or fast-forward the branch ref. `--force` allows a non-fast-forward move; without it the ref update is a plain fast-forward.
5. **Verify.** Fetch the recursive tree and confirm every local blob SHA is present. A push that ends without this check has not been verified.

## Empty repos

Blob creation 409s on a repo with no commits. Seed one file first with `PUT /repos/{o}/{r}/contents/{path}` (base64 content, commit message), then run the script.

## Surgical updates

For a few changed files, skip the full workdir walk: create the changed blobs, then `POST /git/trees` with `base_tree` set to the branch's current tree SHA and only the changed paths as entries. One small tree POST instead of hundreds of blob uploads.

## Operating rules

1. The push script must be **executed, never imported** — importing re-runs the push and creates orphaned commits. It throws on import so the failure is loud.
2. Symlinks are skipped with a warning, never followed into the tree silently.
3. `--dry-run` builds blobs and trees and stops before the commit. Use it when validating a new workdir layout.
4. Never `git push` from the same workdir afterward "to be sure" — two push paths to one branch invite divergent histories. Pick one.
5. See `references/backup-pattern.md` for the large-backup variant: staging assembly, secrets scan, large-file splitting, and a restore manifest.

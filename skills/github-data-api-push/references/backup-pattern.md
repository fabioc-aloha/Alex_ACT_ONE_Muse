# Large-backup pushes

A reference pattern for pushing big environment snapshots (hundreds of files,
hundreds of MB) through the Git Data API. Distilled from a weekly 1,000-file /
~230MB environment backup.

## Staging

Assemble the tree in a staging directory first, never push the live workspace
directly:

- Copy, don't move. A push that fails halfway must not have destroyed its source.
- Zip or exclude regenerable bulk (`.src` trees, `node_modules/`).
- Refuse to ship symlinks: fail loud if any remain after staging.

## Secrets scan

Grep the staged tree for high-confidence credential patterns before any upload
and abort on a hit:

- `ghp_` / `gho_` + 36 chars (GitHub tokens)
- `sk-` + 20 chars (OpenAI-style keys)
- `AKIA` + 16 chars (AWS access keys)
- `BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY` (private keys)

Patterns are heuristics: a hit aborts the push for human review, it does not
prove a live secret.

## Large files

Refuse blobs over ~40MB raw (the API 422s above ~41MB). Split bigger files
into ≤15MB chunks with `split -b 15M` and ship a `.REASSEMBLY.txt` next to the
chunks with the join command (`cat name.*.part > name`).

## Manifest

Ship two generated docs with every snapshot:

- `BACKUP-MANIFEST.md` — date, file count, size, the split-file list with
  reassembly notes, and the verification line from the push.
- `environment/manifest.md` — what is deliberately NOT in the backup and where
  it lives instead (secrets, reinstallable toolchains, already-remote git
  clones with their SHAs at snapshot time, transient dirs).

## Verify and report

End every run with the script's `verified: N blobs present, 0 missing` line.
Record the date, commit SHA, file count, and any warnings in the operator's
log. The verification compares blob SHAs inside the pushed tree — it proves
the content landed, not just that the API accepted the calls.

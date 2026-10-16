#!/usr/bin/env python3
"""
check-source-sync.py — gate: verify a local working copy is in sync with a
GitHub repo's main branch BEFORE any review/audit/fix work on it.

Lesson: never run a review cycle on a local copy on assumption. A stale copy
wastes the entire cycle — sync first, work second.

Usage:
  python3 scripts/check-source-sync.py --repo owner/name --path path/in/repo --workdir /local/dir
  python3 scripts/check-source-sync.py --repo owner/name --path path/in/repo --workdir /local/dir --stale-ok

Compares every file in the local dir against the repo's current main (via the
GitHub API). Exits 0 if in sync, 1 if any file differs (or is missing/extra).
--stale-ok exits 0 anyway, for explicitly working on a snapshot.

Requires: the gh-api shim (or `gh api`) for GitHub access.
"""
import base64, json, os, subprocess, sys

def gh(api, method, path, body=None):
    args = [api, method, path]
    if body is not None:
        args.append(json.dumps(body))
    r = subprocess.run(args, capture_output=True, text=True, timeout=60)
    if r.returncode != 0:
        raise RuntimeError(f"{method} {path}: {r.stderr[:300]}")
    return json.loads(r.stdout)

def main():
    repo = path = workdir = None
    stale_ok = False
    api = os.path.expanduser("~/workspace/bin/gh-api-shim")
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--repo": repo = args[i+1]; i += 2
        elif args[i] == "--path": path = args[i+1]; i += 2
        elif args[i] == "--workdir": workdir = args[i+1]; i += 2
        elif args[i] == "--stale-ok": stale_ok = True; i += 1
        elif args[i] == "--api": api = args[i+1]; i += 2
        else: i += 1

    if not (repo and path and workdir):
        print("Usage: check-source-sync.py --repo owner/name --path repo/dir --workdir /local/dir [--stale-ok]")
        return 2

    try:
        entries = gh(api, "GET", f"/repos/{repo}/contents/{path}?ref=main")
    except Exception as e:
        print(f"SYNC-CHECK FAILED: could not reach repo ({e})"); return 2
    repo_files = {e["name"] for e in entries if e["type"] == "file"}

    try:
        local_files = {f for f in os.listdir(workdir)
                       if os.path.isfile(os.path.join(workdir, f))}
    except FileNotFoundError:
        print(f"SYNC-CHECK FAILED: workdir not found: {workdir}"); return 2

    problems = []
    for name in sorted(set(repo_files) | local_files):
        if name not in repo_files:
            problems.append(f"extra local file not in repo: {name}"); continue
        if name not in local_files:
            problems.append(f"missing local file (in repo): {name}"); continue
        try:
            d = gh(api, "GET", f"/repos/{repo}/contents/{path}/{name}?ref=main")
            repo_text = base64.b64decode(d["content"])
        except Exception as e:
            problems.append(f"could not download {name}: {e}"); continue
        with open(os.path.join(workdir, name), "rb") as fh:
            local_text = fh.read()
        if local_text != repo_text:
            problems.append(f"content differs from repo main: {name}")

    if problems:
        print(f"SYNC-CHECK FAILED: {len(problems)} problem(s) — not in sync with {repo} main:")
        for p in problems[:20]:
            print(f"  - {p}")
        if len(problems) > 20:
            print(f"  ... and {len(problems) - 20} more")
        if stale_ok:
            print("(--stale-ok given: proceeding anyway)")
            return 0
        print("Sync the working copy from the repo before starting review work.")
        return 1

    print(f"SYNC-CHECK OK: {len(repo_files)} files in sync with {repo} main.")
    return 0

if __name__ == "__main__":
    sys.exit(main())

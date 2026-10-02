---
name: terminal-command-safety
description: "Output-capture, hung-command, and host-behavior procedures for Muse's exec environment: redirect large output to a temp file before reading, background anything over 15 seconds, never run interactive commands, and never pass secrets through a command line. Muse delta: adapts the original PowerShell/VS Code patterns to muse.exec's Linux VM (bash equivalents, process.* lifecycle tools)."
lastReviewed: 2026-08-18
---

# Terminal Command Safety

## Muse delta

- **Native to Muse:** commands run in its own Linux VM via `muse.exec`; output comes back in the tool result; a command still running past `yield_ms` backgrounds automatically and the terminal result is delivered back into context.
- **What this skill uniquely adds:** the concrete failure procedures below — output capture via temp-file redirect when output may be truncated, the 15-second background rule with `process.*` lifecycle tools, and the anti-pattern table for diagnosing silent failures.
- **Load when:** a command may lose output, hang, need interaction, or depend on host execution behavior.

## Output Capture Failures

Terminal output can be silently lost or truncated. When you need the full, unfiltered output, don't trust the exec result buffer:

1. Redirect to file, then read: `cmd > /tmp/out.txt 2>&1`, then read the file.
2. Sentinel the exit code: `cmd; echo "EXIT_CODE:$?"`.
3. Limit volume: `| head -n 50`, `| tail -n 100`, or filter before returning.
4. Avoid interactive pagers (`less`, `vim`, `man`) — use `cat`, `sed`, `awk` or file reads instead.
5. If output came back empty: re-run redirecting to a file, then check stderr in the file.

## Terminal Hanging

1. Use `background: true` (or a generous `yield_ms`) for commands over ~15 seconds: builds, test suites, servers. Backgrounded commands deliver their terminal result automatically — don't poll with `process.poll` just to wait.
2. Never run interactive commands. Pre-answer with noninteractive flags (`--yes`, `--no-edit`, `-y`).
3. Set network timeouts (`--max-time 30`, `--prefer-offline`) so a network stall can't hang the session.
4. Run one command at a time. Don't chain unrelated commands into one invocation.
5. Stop a stuck command with `process.kill`; then read what it produced with `process.log` to diagnose.

## Boundaries

- Never pass secrets through a terminal command or tool input; use the Secure Vault flow instead.
- Never treat a missing output line as proof that a command succeeded — check the exit code.

## Anti-Patterns

| Anti-pattern | Correction |
| --- | --- |
| Relying on a truncated exec result for a precise diagnosis | Redirect to `/tmp/out.txt` and read the file. |
| Starting a long-running command without backgrounding | Use `background: true`; the terminal result arrives automatically. |
| Retrying an interactive command unchanged | Find and provide its noninteractive flags. |
| Chaining five unrelated commands with `&&` | One command at a time; each gets its own verified result. |

## Would Revise If

Revisit by **2026-11-18** if the redirect-to-file fallback stops being needed (exec results reliably carry full output), host behavior makes any procedure above wrong, or a terminal failure reaches the user because these procedures alone were insufficient.

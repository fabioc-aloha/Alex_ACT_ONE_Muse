---
description: "Preview, activate, verify, repair, or remove this plugin's user-scope runtime instructions. Use after installing or updating Alex ACT ONE, or when Alex ACT identity and always-on reasoning behavior are inactive."
lastReviewed: 2026-09-07
---

# /bootstrap-core

Load and follow the [`bootstrap-core`](../archive/host-specific/bootstrap-core/SKILL.md) skill in **activation** mode. Pass the user's arguments, inputs, and explicit constraints unchanged; clarify only missing material inputs. The canonical skill owns the compatibility command constraints, execution, and validation.

1. Read the linked skill.
2. Run its bundled `scripts/bootstrap-core.cjs` command without `--apply`.
3. Show the resolved distribution target and source, all file actions, receipt
   action, installed plugin version, manifest parity, user scope, and recursive
   workspace overlap report.
4. Ask for explicit activation or repair consent.
5. After consent, rerun the exact command with `--apply`.
6. Verify every destination hash and the receipt. A no-op apply must preserve
   receipt bytes.
7. Report legacy mixed-receipt evidence without modifying instructions owned by
   another plugin's receipt.
8. For removal, preview with `--remove`, ask separately, then rerun with
   `--remove --apply`. Reject unsafe receipt entries, preserve modified or
   unowned files, and report post-removal verification.

Instructions activate per app, not per machine. If the user wants the behavior
in more than one app, run this in each one.

Return the owning skill's required result and verification limits. This entrypoint grants no additional authority: preserve the owner's approval, privacy, read-only, draft-only, and installation/publication boundaries as applicable.

Resolve links from the canonical installed alex-act-one package, never an assumed adopter checkout. Report a missing skill/reference and stop rather than silently skipping the workflow.

Revise by **2026-12-07** if this prompt writes without consent, claims state it
does not own, or diverges from the linked script.

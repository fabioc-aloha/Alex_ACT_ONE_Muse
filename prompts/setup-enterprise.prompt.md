---
description: "Emit or install the Copilot CLI settings block for the public Microsoft ecosystem plugins (Azure, Fabric, Power BI, M365 Agents Toolkit). Invokes the `setup-enterprise-stack` skill."
lastReviewed: 2026-08-15
---

# /setup-enterprise

Load and follow the `setup-enterprise-stack` skill in **emit/install/audit** mode and run its three-mode flow (emit / consent-install / audit) against the user's Copilot CLI configuration. Pass the user's arguments, inputs, and explicit constraints unchanged; clarify only missing material inputs. The canonical skill owns the compatibility command constraints, execution, and validation.

Steps:

1. Load skill: [setup-enterprise-stack](../archive/host-specific/setup-enterprise-stack/SKILL.md).
2. Ask the user which mode they want: **emit only** (safe default), **consent-gated auto-install**, or **audit only**. If the user does not answer, default to emit.
3. In **emit only** mode, do not create or update todos, tasks, plan items, or
   any other host planning state. Do not modify files, settings, plugins, or
   marketplace registrations. Return the block and guidance directly.
4. Check prerequisites per the skill's Prerequisites section. Warn about missing subscriptions / licenses but do not refuse to emit.
5. Verify the Copilot CLI version (`copilot --version` >= 1.0.75). If missing or too old, direct the user to <https://github.com/github/copilot-cli> and stop.
6. Execute the chosen mode.
7. Report what changed (or, in emit mode, what the user must paste).

Fires only when the user explicitly asks — `/setup-enterprise` is not auto-invoked. The skill body carries the JSON block, the prerequisite table, and the consent-gate rules.

Return the owning skill's required result and verification limits. This entrypoint grants no additional authority: preserve the owner's approval, privacy, read-only, draft-only, and installation/publication boundaries as applicable.

Resolve links from the canonical installed alex-act-one package, never an assumed adopter checkout. Report a missing skill/reference and stop rather than silently skipping the workflow.

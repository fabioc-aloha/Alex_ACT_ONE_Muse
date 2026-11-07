---
description: "Offer to install marketplace plugins that extend visual authoring: chart rendering, screenshot verification, whiteboard iteration, and PR annotation. Consent-gated, one plugin at a time, never bundled without explicit approval."
lastReviewed: 2026-08-18
---

# /alex-act-one install-visual-companions

Load and follow the [install-visual-companions](../archive/host-specific/install-visual-companions/SKILL.md) skill in **consent-gated setup** mode to offer the 8 visual-workflow companion plugins for consent-gated per-plugin install. Pass the user's arguments, inputs, and explicit constraints unchanged; clarify only missing material inputs. The canonical skill owns the compatibility command constraints, execution, and validation.

Steps:

1. Load the `install-visual-companions` skill.
2. Ask which companions the user wants. Note that framing, chart reading, and render verification already ship in this plugin as `chart-big-idea`, `chart-interpretation`, and `render-verify`, so none of the companions are required for the core loop.
3. For each requested plugin, verify existence in its claimed marketplace via `copilot plugin marketplace browse <marketplace>` (anti-hallucination discipline).
4. Register `alex-mall` marketplace if not already registered.
5. Run `copilot plugin install <name>@<marketplace>` for each verified plugin.
6. Print install-time caveats for the plugins that need manual post-install steps (`chromium-control-canvas`, `eyeball`, `napkin`, `visual-pr` — Playwright-based, ~100 MiB Chromium download each).
7. Report installed, skipped, and caveats outstanding.

Return the owning skill's required result and verification limits. This entrypoint grants no additional authority: preserve the owner's approval, privacy, read-only, draft-only, and installation/publication boundaries as applicable.

Resolve links from the canonical installed alex-act-one package, never an assumed adopter checkout. Report a missing skill/reference and stop rather than silently skipping the workflow.

**Would revise if**: the `install-visual-companions` skill is retired, or the companion catalog changes.

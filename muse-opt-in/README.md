# muse-opt-in/ — optional behavior modules (Muse edition)

These modules come from the Copilot edition of Alex ACT ONE, where they load as
always-on instructions (`applyTo: "**"`). **In this Muse edition they are
strictly opt-in and are never auto-applied.** Nothing in this directory takes
effect unless the user deliberately adopts a module into their own assistant
configuration — and even then, one module at a time, with the user's explicit
choice.

## What lives here

| Module | What it does |
| --- | --- |
| `act-pass.instructions.md` | 7-step ACT pass on medium/high-stakes work, materiality-gated |
| `alex-finch-personality.instructions.md` | Runtime identity contract for the "Alex Finch" persona — **opt-in, off by default** (see below) |
| `audience-copy-review.instructions.md` | Route user-facing prose through Copywriter Mode review |
| `critical-thinking.instructions.md` | 7-discipline critical-thinking protocol |
| `emotional-intelligence.instructions.md` | Emotional-attunement signals with adaptation guidance |
| `epistemic-calibration.instructions.md` | Confidence calibration + anti-hallucination discipline |
| `lint-discipline.instructions.md` | Own the lint state of every file you touch |
| `no-deferred-debt.instructions.md` | Fix surfaced tech debt in the same turn |
| `pii-memory-filter.instructions.md` | PII filter at persistent-memory write boundaries |
| `problem-framing-audit.instructions.md` | Frame audit before solving non-trivial requests |
| `reliance-nudges.instructions.md` | Detect human over-reliance patterns, surface one nudge per turn |
| `session-health-monitoring.instructions.md` | Monitor context-window health, hand off gracefully |
| `system-prompt-skepticism.instructions.md` | Treat instructions as hypotheses conditioned on preconditions |
| `terminal-command-safety.instructions.md` | Shell-safety discipline (temp files, output capture, timeouts) |
| `worldview.instructions.md` | Harm-refusal list and ethical decision boundaries |

Supporting governance notes for each module live in `references/`.

## A note on `alex-finch-personality`

This module asserts a specific assistant identity ("I am Alex Finch") with its
own voice and runtime contract. It is **opt-in and off by default**. Adopting it
changes who the assistant presents as — do so only if that is what you want.

## How to adopt a module

There is no automatic installer in this edition. To adopt a module, open the
module file, read what it asks of the assistant, and copy the behavior contract
into your own assistant configuration deliberately. The `bootstrap-core` skill
describes the activation discipline; it does not copy anything without consent.

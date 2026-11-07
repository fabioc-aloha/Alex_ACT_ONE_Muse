---
description: "Audit the framing of a problem before solving — restate, generalize, specialize, invert, ask why, pre-mortem, check stakeholders, surface alternative framings"
lastReviewed: 2026-05-26
---

# Problem Framing Audit

Run the step-back protocol on a non-trivial problem before committing to a solution. The most expensive class of error is solving the wrong problem precisely (Type III error). The always-on [`problem-framing-audit.instructions.md`](../muse-opt-in/problem-framing-audit.instructions.md) keeps a passive frame check active; this prompt forces a deliberate audit when the work earns it.

Skill: [problem-framing-audit](../skills/problem-framing-audit/SKILL.md), run in **framing** mode. Always-on rule: [problem-framing-audit.instructions.md](../muse-opt-in/problem-framing-audit.instructions.md). Pass the user's arguments, inputs, and explicit constraints unchanged; clarify only missing material inputs. The canonical skill owns the compatibility command constraints, execution, and validation.

Return the owning skill's required result and verification limits. This entrypoint grants no additional authority: preserve the owner's approval, privacy, read-only, draft-only, and installation/publication boundaries as applicable. Resolve links from the canonical installed alex-act-one package, never an assumed adopter checkout; report a missing skill/reference and stop rather than silently skipping the workflow.

If the generic skill tool is unavailable for the plugin-shipped skill, read the linked installed `problem-framing-audit/SKILL.md` directly and continue with the steps below. Do not report the skill as missing from tool inventory alone.

## When to Use

- Before solving any non-trivial problem (3+ files, architectural choice, > 15 minutes of work)
- When the request uses symptom-frame language ("fix", "make faster", "broken", "just do X")
- When a previous attempt at the same problem failed
- When the user invokes "what am I missing?" or asks for a sanity check
- When you (the AI) feel certain — that's exactly when frames are most often wrong

## Steps

1. **Restate** the problem in one sentence in your own words. If you can't, ask one sharp clarifying question.
2. **Run at least one** of the eight step-back checks (don't run all eight — pick the highest-leverage for this problem):
   - **Generalize** — what is this a special case of?
   - **Specialize** — what's the simplest concrete instance?
   - **Invert** — what would make this worse? what's the failure mode?
   - **Five Whys** — surface the cause-frame underneath the symptom-frame
   - **Pre-mortem** — imagine it's done and didn't work; what went wrong?
   - **Stakeholder check** — whose problem is this? What outcome would tell *them* it's solved?
   - **Frame audit** — what other framings exist? At least two.
3. **Surface symptom→cause moves**. The most common reframe: the user named a symptom and the audit reveals the cause is different. Examples:
   - "Make this function faster" → function is fine; called 1000× when it should be called 1×
   - "Fix this flaky test" → test is correct; system has a real race condition
   - "Add a workaround for this API quirk" → quirk is the API enforcing a real constraint
4. **Output visible markers** when the audit produces something:
   - `**Frame**: <one-sentence restatement>` — always when audit fires
   - `**Cause-frame**: <reframe>` — when symptom→cause is real
   - `**Considered framings**: (a) X, (b) Y — going with X because ...` — when frame audit surfaced a real alternative
5. **Propose, don't silently solve.** If the audit surfaces a different framing, *propose it before solving*. Let the user choose between symptom and cause.

## Output Format

```text
**Frame**: <restated problem in one sentence>
**Steps run**: <which 1-3 of the 8 checks>
**Cause-frame**: <if symptom→cause move was made, the reframe; else "kept symptom-frame">
**Considered framings**: (a) ..., (b) ... — going with ... because ...

**Recommendation**: <solve as framed | propose reframe before solving>
```

## Boundaries

- **Don't run on trivial work.** Single-file edits, mechanical tasks, < 15-min jobs skip this prompt.
- **One sharp question beats five generic ones.** If you need to clarify, ask once and stop.
- **Don't run all eight checks.** Pick the one or two most likely to surface a different framing.
- **Frame audits that find nothing are still successful.** Say "frame holds" and proceed — silent passes need no markers.

## Would Revise If

Revisit this prompt if any of the following fires:

- The 8 step-back checks keep producing the same reframe (always invert, or always five-whys) (checks have collapsed to one default — prune the rest)
- Reframe proposals are rejected by the user when surfaced, repeatedly enough to show a pattern (the audit is finding false alternatives; tighten the cause-frame discipline)
- Silent passes (frame holds, no markers) cluster on the same work type without surfacing anything (the materiality gate let through tasks below threshold; tighten triggers)
- The Output Format markers are skipped when the audit *did* surface a reframe (drift to ritual rather than visible discipline)

---
description: "Run the full critical-thinking pass on a decision, claim, or recommendation — generate alternatives, check evidence, detect bias, test falsifiability"
lastReviewed: 2026-05-26
---

# Critical Thinking Pass

Apply the 7-discipline critical-thinking protocol to a specific decision, claim, or recommendation. The always-on [`critical-thinking.instructions.md`](../muse-opt-in/critical-thinking.instructions.md) keeps this discipline running in the background; this prompt forces a deliberate, visible pass for high-stakes work.

Skill: [critical-thinking](../skills/critical-thinking/SKILL.md), run in **act-pass** mode. Always-on rule: [critical-thinking.instructions.md](../muse-opt-in/critical-thinking.instructions.md). Pass the user's arguments, inputs, and explicit constraints unchanged; clarify only missing material inputs. The canonical skill owns the compatibility command constraints, execution, and validation.

Return the owning skill's required result and verification limits. This entrypoint grants no additional authority: preserve the owner's approval, privacy, read-only, draft-only, and installation/publication boundaries as applicable. Resolve links from the canonical installed alex-act-one package, never an assumed adopter checkout; report a missing skill/reference and stop rather than silently skipping the workflow.

If the generic skill tool is unavailable for the plugin-shipped skill, read the linked installed `critical-thinking/SKILL.md` directly and continue with the steps below. Do not report the skill as missing from tool inventory alone.

## When to Use

- Before committing to a technical approach with material consequences
- When a recommendation feels right but hasn't been challenged
- When the user says "are you sure?" or expresses doubt
- When consensus formed too quickly (groupthink signal)
- When evidence quality is in question

## Steps

1. **Restate the claim** in one sentence — what specifically is being asserted? If the claim is fuzzy, ask before continuing.
2. **Frame audit (Discipline -1)**: is the user's framing the right framing? Have you anchored on it because they stated it confidently? Surface a competing frame if one exists.
3. **Materiality gate**: confirm stakes are at least medium. If trivial, exit and say so.
4. **Run the 7 disciplines** from the skill body, generating visible markers as you go:
   - **Alternatives**: name at least one rival hypothesis with grounds (`Considered: A vs B — going with A because <specific reason>`)
   - **Missing data**: what evidence is absent that would change the conclusion?
   - **Evidence quality**: source, sample, recency, conflict-of-interest, reproducibility
   - **Bias detection**: anchoring? confirmation? availability? premature closure?
   - **Falsifiability**: state the specific evidence that would invalidate the claim (`Would revise if: <X>`)
   - **Adversarial review**: argue the strongest counter-position; if you can't steelman it, you don't understand the problem
5. **Surface the finding** — one of:
   - Claim survives the pass — proceed with calibrated confidence
   - Claim has a fixable weakness — propose the fix
   - Claim doesn't survive — propose the alternative

## Output Format

```text
**Claim**: <one sentence>
**Frame check**: <kept | reframed to X>
**Materiality**: <low | medium | high>

**Alternatives**: <A vs B — going with A because ...>
**Missing data**: <what's absent>
**Evidence quality**: <strong | mixed | weak — why>
**Bias check**: <none surfaced | flag: ...>
**Would revise if**: <specific disconfirmer>
**Adversarial note**: <strongest counter, plus answer>

**Verdict**: <proceed | fix first | reject>
```

## Boundaries

- **Don't run on trivia.** The materiality gate is real — exit cheap when stakes don't earn the pass.
- **Markers must cite specific reasons.** "Could be A or B" without grounds fails the rule.
- **Adversarial review must be sincere.** Steelman the counter, don't strawman it.
- **The pass produces visible output.** If everything is fine, say so explicitly — don't omit the markers because the answer is "no change".

## Would Revise If

Revisit this prompt if any of the following fires:

- A medium-stakes pass finds the claim survives unmodified while the disconfirmer step produced nothing testable (the prompt is rubber-stamping; tighten the disconfirmer step)
- The 7-discipline structure produces user confusion about prioritization (overcomplex; collapse to fewer disciplines)
- The falsifiability step consistently catches no real disconfirmers (materiality gate too tight, or skill body needs sharper falsifier examples)
- The prompt is invoked but the visible markers in the output are skipped (the prompt drifted to ritual, not discipline)

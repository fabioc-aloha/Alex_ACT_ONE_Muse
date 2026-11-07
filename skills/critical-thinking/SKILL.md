---
name: critical-thinking
description: "Challenge what you think is right — alternative hypotheses, missing data, evidence quality, bias detection, falsifiability, and adversarial review. Muse delta: Muse's system prompt already mandates verify-before-claiming and never-guess identifiers; this skill adds the frame audit, the Materiality Gate, the seven challenge disciplines with domain worked examples, and visible falsifiability markers."
lastReviewed: 2026-11-07
---

# Critical Thinking

## Muse delta

- **What Muse already does natively**: verify-before-claiming, due diligence, and the never-guess-identifiers rule. The anti-hallucination leg — don't fabricate — is covered by the system prompt.
- **What this skill uniquely adds**: the Discipline -1 frame audit (Type III error avoidance, symptom→cause reframe, eight step-back checks); the Materiality Gate that rations rigor to decisions that change outcomes; the seven named challenge disciplines with domain worked examples; named cognitive-bias countermeasures; the Devil's Advocate pass with visible output; falsifiability-style "Would revise if" markers. The detailed methods live in this skill's references; the Modes table below is the canonical route to them.
- **When to load it**: analysis, recommendations, architecture decisions, health/legal/security/financial advice, or any output the user will act on with real consequences. Factual lookups and simple code edits need only the baseline.

Materiality first: trivial mechanical work exits cheaply. For material work, audit the frame before solving. Preserve the [ten-tenet canon](../act-tenets/SKILL.md); a procedure is not a new canon.

## Modes

Load only the selected methods/reference, not the entire family:

| Mode | Canonical procedure |
| --- | --- |
| act-pass (default) | [Seven-step pass](references/runtime-act-pass.md): materiality, hypothesis, alternatives, disconfirmers, priors, severity, commit |
| reasoning | [Evidence and reasoning methods](references/reasoning-methods.md) plus [resident reasoning contract](references/runtime-critical-thinking.md) |
| framing | [Step-back method](references/framing.md) and [frame/output boundary](references/runtime-problem-framing-audit.md) |
| instruction-preconditions | [Instruction precondition audit](references/runtime-system-prompt-skepticism.md) within applicable authority and safety boundaries |
| adversarial | [Adversarial methods](references/adversarial-methods.md); general decisions need no code diff |
| curation | [Curation-specific risk reference](references/curation-risk.md), not a universal release authority |

For medium stakes, state grounded alternatives and an explicit disconfirmer; for high stakes use the full pass and evidence-scoped commitment. Do not manufacture disagreement or require a fixed number of agents. Native Plan/research and available critics provide mechanics, not the ACT contract. Use direct analysis for evidence that fits the current context.

If rules conflict, report the conflict and resolve the material decision with the user; do not silently choose the shorter or more permissive rule. Report missing references and do not claim the selected pass ran. This workflow does not authorize file edits, external actions, or publication.

## Compatibility command constraints: critical-thinking

Use act-pass mode. Produce grounded alternatives, explicit disconfirmers, and evidence-scoped commitment when stakes warrant them; exit cheaply on trivia.

## Runtime contract references

Load only the reference selected by the triggering instruction; do not replay all runtime contracts for unrelated work. These references add no authority and do not call the instruction again.

- **act-pass**: [act-pass](references/runtime-act-pass.md)
- **reasoning**: [critical-thinking](references/runtime-critical-thinking.md)
- **framing**: [problem-framing-audit](references/runtime-problem-framing-audit.md)
- **instruction-preconditions**: [system-prompt-skepticism](references/runtime-system-prompt-skepticism.md)

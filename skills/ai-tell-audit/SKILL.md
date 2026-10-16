---
name: "ai-tell-audit"
description: "Read-only audit for AI-tell prose: scan text against the humanizer's pattern catalog plus the project's house AI-tell list, and return a density verdict with a Major/Minor findings table and minimal recasts. Never rewrites. Use for pre-publish checks when the author wants to judge the flags themselves."
lastReviewed: 2026-10-16
---

# AI-Tell Audit

## Muse delta

- **Native to Muse:** reading text and spotting obvious AI-isms.
- **What this skill uniquely adds:** a systematic read-only audit — the pattern catalog from `humanizer` (synced from Wikipedia's "Signs of AI writing") plus the project's house AI-tell list, applied with a density verdict and a severity-tagged findings table. It never rewrites: the author decides what to change.
- **Load when:** checking prose before it ships and the author wants to see the flags rather than receive a rewrite; as an independent verification pass after a `humanizer` rewrite.

## When to use

- Pre-publish check on drafts, posts, comments, chapters, PR descriptions, emails.
- A second, independent pass after `humanizer` has rewritten a text — fresh eyes catch what the rewrite pass normalized.
- Anywhere the author writes in their own voice and wants a report, not a rewrite.

## How to run

Follow this procedure directly on the text. For long documents, run it section by section and report density per section.

## What to check

The pattern catalog in the `humanizer` skill (content, language/grammar, style, communication, and filler patterns), plus the project's house AI-tell list when one exists. Where they differ, the house list's named exemptions win: never flag an exempted term, and never "correct" a house-defined term into plainer diction.

Audit in this order:

1. **Unambiguous scaffolding:** unfilled bracketed placeholders ([Your Name], [link to...]), model-internal citation fragments, "as an AI language model" refusal language. Always Major.
2. **Density tells:** clusters of AI-vocabulary words, rule-of-three overuse, em-dash overuse, boldface abuse. One instance is coincidence; a cluster is the finding.
3. **Hollowness tells:** undue significance/legacy emphasis, canned notability, superficial -ing analyses, promotional language, vague attributions, outline-like challenge/future closers, section summaries that restate.
4. **Diction tells:** copula avoidance ("serves as" for "is"), negative parallelisms ("not X, but Y"), elegant variation (synonym cycling), vague connection ("associated with" for a real relationship), hyphenated-pair overuse.
5. **Rhythm tells:** throat-clearing openers, contrast cadence, slogan endings.

## What not to flag

- A catalog word used once, carrying real meaning. Presence alone is never a finding — flag only decorative use, where a plainer word loses nothing.
- Named exemptions in the house list.
- Intentional voice choices: fragments for emphasis, repetition for rhythm, deliberate colloquialisms.
- Anything owned by another pass (grammar, factual accuracy, structure).

## Severity

- **Major:** unambiguous scaffolding; 3+ tells clustered in one paragraph; promotional or superficial analysis that obscures what the sentence claims.
- **Minor:** an isolated decorative instance with a low-cost recast; a borderline case the author should see and decide.

## House rules for recasts

- Follow the project's house style when one exists. Default: no em dashes in recasts, no "isn't X, it's Y" contrast cadence, no hype diction.
- Never invent claims, anecdotes, or first-person experiences the original did not contain.
- The recast must preserve the sentence's meaning exactly. When meaning is ambiguous, say so instead of guessing.

## Varying recasts

When the findings table flags 3+ instances of one pattern family (e.g. contrast-cadence), recast each instance with a different strategy — otherwise the rewrite pass replaces one uniform signature with another. An LLM "picking randomly" is biased toward its favorite constructions, so use the bundled script, which assigns strategies with a real RNG:

```
node scripts/vary-construct.mjs --pattern contrast-cadence --count 9
node scripts/vary-construct.mjs --pattern contrast-cadence --count 9 --seed 42   # reproducible
```

Supported families: contrast-cadence, rule-of-three, rhetorical-monotony, throat-clearer, slogan-ending, section-summary, significance-inflation, vague-connection, copula-avoidance, elegant-variation, hedge-cluster. Strategies are emitted in document order with no adjacent duplicates where possible. Exempted or kept instances do not consume strategy slots.

## Output

A one-line density verdict first ("clean", "light — N minors", "heavy — N majors, M minors"), then only actionable findings, ordered by severity:

| Severity | Pattern | Location | Flagged text (short exact quote) | Why it flags | Minimal recast |
| --- | --- | --- | --- | --- | --- |
| Major or Minor | pattern name | section/line | Quote | Which tell and why it is decorative here | Recast preserving meaning |

End with the pattern families checked and found clean, in one line, so a clean audit is informative rather than empty.

## Related

- [humanizer](../humanizer/SKILL.md) — the rewrite counterpart: identifies the same patterns and produces revised text, with voice calibration.

## Would Revise If

- **Event-based:** if repeated audits flag legitimate stylistic choices as tells (e.g., intentional rule-of-three for humor) 3+ times in a quarter, the catalog's false-positive carve-outs need strengthening — add explicit exemptions rather than softening the patterns.
- **Counter-evidence:** if density verdicts stop discriminating (everything reads "light"), the severity thresholds are too coarse — split Major into blocking vs non-blocking.

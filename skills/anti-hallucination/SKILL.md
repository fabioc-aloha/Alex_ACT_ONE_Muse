---
name: anti-hallucination
description: "Prevent fabricated facts, invented APIs, and citation confabulation at the point of generation. Use when generating factual claims, code examples, API references, library names, configuration values, error messages, or citations — anything where 'sounds plausible' is not the same as 'is real'. Muse delta: Muse natively mandates verify-before-claiming; this skill adds the input/output-discipline split, the signal tables that fire it at generation time, and the don't-defend-a-fabrication rule."
lastReviewed: 2026-10-02
---

# Anti-Hallucination

## Muse delta

- **What Muse already does natively**: verify-before-claiming (check before asserting), and the never-guess-identifiers rule. "Sounds plausible" is already not good enough.
- **What this skill uniquely adds**: the *input-discipline / output-discipline* split — stop fabrication *before* generation, and never claim a check succeeded that wasn't actually run; the signal tables that fire this discipline at the moment of generation; the verification-pattern checklist; and the don't-defend-a-fabrication rule.
- **When to load it**: before generating factual claims about external systems/APIs, code examples invoking specific names, citations or URLs, config values, version numbers, error messages, or capability claims. If the answer to *"have I actually seen this work, or am I generating something that sounds plausible?"* is the second one — **stop**.

> Anti-hallucination prevents fabrication. Awareness detects errors. Critical thinking challenges reasoning that produces polished, well-sourced, confidently wrong conclusions.

## The Core Discipline

| Stage | Question | If unsure |
|---|---|---|
| **Input-discipline** (what I'm about to generate) | Am I about to write something I can't verify is real? | Stop. Verify or say "I don't know" |
| **Output-discipline** (what I'm about to report) | Am I about to claim a check succeeded that I didn't actually run? | Cite what I checked, or hedge the claim |

The line is *between thinking and typing*. Once fabricated content is in the output, downstream review has to detect it among real content — far harder than not generating it.

## Signals That Fire This Skill

### Input-discipline signals

| Signal | Response |
|---|---|
| "I think there might be a `parseFile()` method..." | Stop. Read the docs or grep the source. |
| "One approach could be calling `foo.bar(opts)`..." | Verify the API exists with those params. |
| "Try this workaround: set `FOO_DEBUG=1`..." | Confirm the env var is real. |
| About to invent step-by-step instructions for an unfamiliar tool | Stop. Read the actual docs first. |
| User says "that doesn't exist" or "that method isn't real" | Acknowledge immediately. No defending the fabrication. |

### Output-discipline signals

| Signal | Response |
|---|---|
| "No matches found" / "Verified clean" / "Nothing returned" | Before reporting absence, confirm the search actually executed against the intended scope. A failed search and a clean search look identical without the scope check. |
| "The doc says X" / "Per the README" / "According to spec" | Before treating doc content as ground truth, cross-check against current filesystem reality. Docs drift from code. Cite both. |
| "I checked and..." / "Verified that..." / "Confirmed..." | Name what was actually checked: file path, command, output snippet. Unattributed "verified" is theatre. |

## Verification Patterns

| Need to claim | Verify by |
|---|---|
| An API method exists | Read the function definition or import; don't trust intellisense alone for unfamiliar libraries |
| A config key works | Find it in source / docs, not in another LLM's example |
| A version number is current | Check the package registry or release notes, not training-data memory |
| A file path exists | `ls` / `fs.existsSync` in the current workspace |
| A command succeeded | Cite exit code or output, not "ran cleanly" |
| Absence (no matches found) | Cite the search scope; an absent result and a misconfigured search look identical |

## Anti-Patterns

| Anti-pattern | Why it fails | Correction |
|---|---|---|
| "I'll generate the answer and check it after" | Once written confidently, downstream review struggles to flag it | Verify before generating |
| "Probably works like X" | "Probably" is the fabrication signal | Either verify, or say "I don't know" |
| Defending a fabrication when challenged | Doubles down on the original lie | Acknowledge, correct, move on |
| Generating plausible-looking citations | Citation confabulation is a well-documented LLM failure mode | Cite only what's been seen; mark inferred refs as inferred |
| "The documentation must say..." | Inferring doc content is fabrication | Read the doc or hedge the claim |
| Adding "(citation needed)" to fabricated content | The hedge doesn't make the fabrication safer; it just labels it | Remove the fabrication; don't decorate it |

## Composition With Other Skills

| Sibling | What it adds |
|---|---|
| [epistemic-calibration](../../muse-opt-in/epistemic-calibration.instructions.md) | The always-on signal tables that fire this discipline at runtime; the calibration vocabulary ("I don't know" > confident lie) |
| [critical-thinking](../critical-thinking/SKILL.md) | The next leg of the epistemic triad — challenges reasoning *after* generation; this skill prevents the inputs that reasoning would otherwise compound |
| [system-prompt-skepticism](../../muse-opt-in/system-prompt-skepticism.instructions.md) | Applies the same don't-invent discipline to instruction interpretation: don't fabricate preconditions, don't confabulate rationale |

## Falsifiability

This skill needs revision if any of the following occur by **2026-12-31** (90 days):

- A user reports fabricated content shipped in 2+ sessions where this discipline should have fired
- The input-discipline signal table fails to catch a new fabrication failure mode (e.g., new LLM-specific confabulation pattern)
- The "verify before generating" pattern is bypassed via post-hoc citation-needed decoration ≥3 times in observed work
- Verification patterns become stale (e.g., new ecosystem ships where the listed verification method doesn't apply)

---
name: test-driven-development
description: "Use for any feature, bug fix, refactor, or behavior change — enforces RED-GREEN-REFACTOR. Write the failing test first, watch it fail, write minimal code to pass, refactor. Carve out only throwaway prototypes, generated code, configuration files. Adapted from Hermes Agent / obra/superpowers. Muse delta: the Iron Law, the worked RED-GREEN-REFACTOR examples, and the rationalization table go beyond Muse's native test discipline."
lastReviewed: 2026-06-07
---

# Test-Driven Development (TDD)

## Muse delta

- **Native to Muse:** testing production code, running test suites, and refusing to ship unverified work. Muse won't skip tests or claim "it works" without a run.
- **What this skill uniquely adds:** the **Iron Law** (no production code without a *watched* failure first), the worked RED-GREEN-REFACTOR examples below, and the rationalization table — the catalog of excuses that turn "tests after" into self-deception.
- **Load when:** you're about to write any feature, bug fix, refactor, or behavior change. Skip only for throwaway prototypes (use [spike](../spike/SKILL.md)), generated code, or configuration files.

**Core principle:** If you didn't watch the test fail, you don't know if it tests the right thing.

## When to Use

**Always:** new features, bug fixes, refactoring, behavior changes.

**Exceptions (ask the user first):** throwaway prototypes (use [spike](../spike/SKILL.md) instead), generated code, configuration files.

Thinking "skip TDD just this once"? Stop. That's rationalization.

## The Iron Law

```text
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before the test? Delete it. Start over. No exceptions: don't keep it as "reference", don't "adapt" it while writing tests. Implement fresh from tests.

## Red-Green-Refactor Cycle

### RED — Write Failing Test

Write one minimal test showing what should happen.

**Good test:**

```python
def test_retries_failed_operations_3_times():
    attempts = 0
    def operation():
        nonlocal attempts
        attempts += 1
        if attempts < 3:
            raise Exception('fail')
        return 'success'

    result = retry_operation(operation)

    assert result == 'success'
    assert attempts == 3
```

**Bad test:**

```python
def test_retry_works():
    mock = MagicMock()
    mock.side_effect = [Exception(), Exception(), 'success']
    result = retry_operation(mock)
    assert result == 'success'  # What about retry count? Timing?
```

**Requirements:** one behavior per test; clear descriptive name ("and" in the name? split it); real code, not mocks (unless truly unavoidable); name describes behavior, not implementation.

### Verify RED — Watch It Fail

**MANDATORY. Never skip.**

```bash
pytest tests/test_feature.py::test_specific_behavior -v
```

Confirm: the test fails (not errors from typos), the failure message is the expected one, and it fails because the feature is missing.

**Test passes immediately?** You're testing existing behavior. Fix the test. **Test errors?** Fix the error, re-run until it fails correctly.

### GREEN — Minimal Code

Write the simplest code to pass the test. Nothing more. Cheating is OK in GREEN: hardcode return values, copy-paste, duplicate code, skip edge cases. Fix it in REFACTOR.

### Verify GREEN — Watch It Pass

**MANDATORY.**

```bash
pytest tests/test_feature.py::test_specific_behavior -v   # the specific test
pytest tests/ -q                                          # then ALL tests for regressions
```

**Test fails?** Fix the code, not the test. **Other tests fail?** Fix regressions now.

### REFACTOR — Clean Up

After green only: remove duplication, improve names, extract helpers, simplify expressions. Keep tests green throughout. Don't add behavior. **If tests fail during refactor:** undo immediately, take smaller steps.

### Repeat

Next failing test for next behavior. One cycle at a time.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "Too simple to test" | Simple code breaks. Test takes 30 seconds. |
| "I'll test after" | Tests passing immediately prove nothing. |
| "Tests after achieve same goals" | Tests-after = "what does this do?"; tests-first = "what should this do?" |
| "Already manually tested" | Ad-hoc ≠ systematic. No record, can't re-run. |
| "Deleting X hours is wasteful" | Sunk cost fallacy. Keeping unverified code is technical debt. |
| "Keep as reference, write tests first" | You'll adapt it. That's testing after. Delete means delete. |
| "Need to explore first" | Fine. Throw away exploration, start with TDD. |
| "Test hard = design unclear" | Listen to the test. Hard to test = hard to use. |
| "TDD will slow me down" | TDD is faster than debugging after. |

## Red Flags — STOP and Start Over

Delete the code and restart with TDD if you catch yourself: writing code before the test, test passing immediately on first run, can't explain why the test failed, adding tests "later", rationalizing "just this once", or claiming "this is different because…".

**All of these mean: Delete code. Start over with TDD.**

## Verification Checklist

Before marking work complete:

- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing, for the expected reason (feature missing, not typo)
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass; output pristine (no errors, warnings)
- [ ] Tests use real code (mocks only if unavoidable)
- [ ] Edge cases and errors covered

Can't check all boxes? You skipped TDD. Start over.

## When Stuck

| Problem | Solution |
|---|---|
| Don't know how to test | Write the wished-for API. Write the assertion first. Ask the user. |
| Test too complicated | Design too complicated. Simplify the interface. |
| Must mock everything | Code too coupled. Use dependency injection. |
| Test setup huge | Extract helpers. Still complex? Simplify the design. |

## Integration With Other Skills

### With delegated work

When dispatching a worker subagent, enforce TDD in the goal:

> "Implement [feature] using strict TDD. Follow test-driven-development skill: write failing test FIRST, run to verify failure, write minimal code to pass, run to verify pass, refactor if needed, commit. Project test command: `pytest tests/ -q`."

### With systematic-debugging

Bug found? Write failing test reproducing it. Follow the TDD cycle — the test proves the fix and prevents regression. See [systematic-debugging](../systematic-debugging/SKILL.md) — never fix bugs without a test.

### With plan

[plan](../plan/SKILL.md) calls for TDD per task. Every implementation task in a plan should start with RED.

## Testing Anti-Patterns

- **Testing mock behavior instead of real behavior** — mocks verify interactions, not replace the system under test
- **Testing implementation details** — test behavior/results, not internal method calls
- **Happy path only** — always test edge cases, errors, and boundaries
- **Brittle tests** — refactoring shouldn't break behavior tests

## Final Rule

```text
Production code → test exists and failed first
Otherwise → not TDD
```

No exceptions without the user's explicit permission.

## Related

- [systematic-debugging](../systematic-debugging/SKILL.md) — bug-found path that produces the failing test
- [plan](../plan/SKILL.md) — every plan task should embed RED-GREEN-REFACTOR
- [spike](../spike/SKILL.md) — TDD exception lane for throwaway feasibility experiments
- [code-review](../code-review/SKILL.md) — post-write companion; TDD is pre-write, code-review is the review gate

## Attribution

Adapted from [Hermes Agent](https://github.com/NousResearch/hermes-agent) (Nous Research, MIT), which itself adapted the discipline from [obra/superpowers](https://github.com/obra/superpowers) (MIT). Both upstream sources MIT-licensed.

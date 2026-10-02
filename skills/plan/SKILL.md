---
name: plan
description: "Use when the user wants a plan instead of execution, or before any non-trivial implementation (multi-file, architectural choice, > 15 min). Writes a concrete actionable markdown plan with bite-sized tasks (2-5 min each), exact file paths, complete code, and verification steps. Adapted from Hermes Agent / obra/superpowers. Muse delta: Muse natively confirms before mutating and reads before acting; this skill adds the plan-only mode contract, the save-location conventions, the TDD task template with complete code and exact commands, and the zero-context implementer standard."
lastReviewed: 2026-10-02
---

# Plan Mode

## Muse delta

- **What Muse already does natively**: confirm before consequential side effects (no committing/pushing without approval), and read/inspect before acting. Those are the floor.
- **What this skill uniquely adds**: the plan-only mode contract (deliverable is a markdown plan, never implementation); the save-location conventions (`docs/plans/`, `docs/history/`); the zero-context implementer standard (assume the implementer knows nothing about this codebase); bite-sized 2–5-minute TDD task granularity; the task template with exact file paths, complete copy-pasteable code, exact commands with expected output, and verification steps.
- **When to load it**: the user asks for a plan, says "design before building", types `/plan`, or the work obviously spans multiple files / requires architectural choice / will take more than ~15 minutes.

For this turn, you are planning only.

- Do not implement code
- Do not edit project files except the plan markdown file
- Do not run mutating terminal commands, commit, push, or perform external actions without explicit user approval in a separate execution turn
- You may inspect the repo or other context with read-only commands when needed
- Your deliverable is a markdown plan saved to a project-appropriate docs location

## Output requirements

Write a markdown plan that is concrete and actionable. Include, when relevant:

- Goal
- Current context / assumptions
- Proposed approach
- Step-by-step plan
- Files likely to change
- Tests / validation
- Risks, tradeoffs, and open questions

If the task is code-related, include exact file paths, likely test targets, and verification steps.

## Save location

Save the plan under the repo's `docs/` directory:

- `docs/plans/YYYY-MM-DD-<slug>.md` for plans tied to a specific date
- `docs/plans/PLAN-<feature>.md` for living plans that get re-edited as the work progresses
- `docs/history/YYYY-MM-DD-<slug>.md` if the repo uses `docs/history/` as its archive convention

If the repo has no `docs/` folder, create one. If the user names a different target path, use that exactly.

## Interaction style

- If the request is clear enough, write the plan directly
- If no explicit instruction accompanies `/plan`, infer the task from the current conversation context
- If it is genuinely underspecified, ask one brief clarifying question instead of guessing
- After saving the plan, reply briefly with what you planned and the saved path

---

# Writing the Plan Well

The craft of authoring a _good_ implementation plan — the content that goes inside the markdown file above.

## The implementer standard

Write comprehensive implementation plans assuming the implementer has **zero context** for the codebase and questionable taste. Document everything they need: which files to touch, complete code, testing commands, docs to check, how to verify. Give them bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

**Core principle:** A good plan makes implementation obvious. If someone has to guess, the plan is incomplete.

## When a full plan helps

**Always use before**: implementing multi-step features, breaking down complex requirements, delegating work to a worker subagent.

**Don't skip when**: the feature seems simple (assumptions cause bugs), you plan to implement it yourself (future you needs guidance), or you're working alone (documentation matters).

## Bite-sized task granularity

**Each task = 2-5 minutes of focused work.** Every step is one action:

- "Write the failing test" — step
- "Run it to make sure it fails" — step
- "Implement the minimal code to make the test pass" — step
- "Run the tests and make sure they pass" — step
- "Propose a commit boundary" — step, only after explicit user approval

**Too big:** "### Task 1: Build authentication system" with 50 lines of code across 5 files.

**Right size:**

```markdown
### Task 1: Create User model with email field

[10 lines, 1 file]

### Task 2: Add password hash field to User

[8 lines, 1 file]

### Task 3: Create password hashing utility

[15 lines, 1 file]
```

## Plan document structure

### Header (required)

Every plan MUST start with:

```markdown
# [Feature Name] Implementation Plan

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

---
```

### Task structure

Each task follows this format:

````markdown
### Task N: [Descriptive Name]

**Objective:** What this task accomplishes (one sentence)

**Files:**

- Create: `exact/path/to/new_file.py`
- Modify: `exact/path/to/existing.py:45-67` (line numbers if known)
- Test: `tests/path/to/test_file.py`

**Step 1: Write failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

**Step 2: Run test to verify failure**

Run: `pytest tests/path/test.py::test_specific_behavior -v`
Expected: FAIL — "function not defined"

**Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

**Step 4: Run test to verify pass**

Run: `pytest tests/path/test.py::test_specific_behavior -v`
Expected: PASS

**Step 5: Propose a commit boundary**

```bash
git status --short
git diff --check
```

State the suggested commit scope and message. Run `git add` or `git commit` only
after the user explicitly authorizes that action.
````

## Writing process

1. **Understand requirements** — feature requirements, design docs, acceptance criteria, constraints.
2. **Explore the codebase** — project structure, similar features, existing tests, key files (read-only).
3. **Design approach** — architecture pattern, file organization, dependencies, testing strategy.
4. **Write tasks** in order: setup/infrastructure → core functionality (TDD each) → edge cases → integration → cleanup/documentation.
5. **Add complete details** per task: exact file paths (not "the config file"), complete code examples (not "add validation"), exact commands with expected output, verification steps.
6. **Review the plan**:

- [ ] Tasks are sequential and logical
- [ ] Each task is bite-sized (2-5 min)
- [ ] File paths are exact
- [ ] Code examples are complete (copy-pasteable)
- [ ] Commands are exact with expected output
- [ ] No missing context
- [ ] DRY, YAGNI, TDD principles applied

## Principles

### DRY (Don't Repeat Yourself)

**Bad:** Copy-paste validation in 3 places.
**Good:** Extract validation function, use everywhere.

### YAGNI (You Aren't Gonna Need It)

**Bad:** Add "flexibility" for future requirements.

```python
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email
        self.preferences = {}  # Not needed yet!
        self.metadata = {}     # Not needed yet!
```

**Good:** Implement only what's needed now.

```python
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email
```

### TDD (Test-Driven Development)

Every task that produces code includes the full cycle: write failing test → run to verify failure → write minimal code → run to verify pass. (See the `test-driven-development` skill for details.)

### Commit boundaries

After a cohesive implementation unit, propose a commit boundary. Do not commit from plan mode or assume permission carries from code-edit approval to Git write approval.

## Common mistakes

| Mistake | Bad | Good |
|---------|-----|------|
| Vague tasks | "Add authentication" | "Create User model with email and password_hash fields" |
| Incomplete code | "Step 1: Add validation function" | The step followed by the complete function code |
| Missing verification | "Step 3: Test it works" | "Step 3: Run `pytest tests/test_auth.py -v`, expected: 3 passed" |
| Missing file paths | "Create the model file" | "Create: `src/models/user.py`" |

## Execution handoff

After saving the plan, offer the execution approach:

> "Plan complete and saved to `docs/plans/<slug>.md`. Ready to execute task by task with TDD and verification. I will propose a commit boundary after each cohesive unit if you want one."

## Remember

```text
Bite-sized tasks (2-5 min each)
Exact file paths
Complete code (copy-pasteable)
Exact commands with expected output
Verification steps
DRY, YAGNI, TDD
```

## Would Revise If

Revisit by **2026-12-01** if plans still cause unauthorized mutations, task granularity makes verification impractical, or users repeatedly need a different planning format for multi-repository work.

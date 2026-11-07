---
name: plan
description: "Use native planning for uncertain or consequential implementation work. Preserve read-only discussion, approval before execution, and task-specific verification without compulsory repository files or prewritten implementation. Muse delta: Muse natively confirms before mutating and reads before acting; this skill adds the planning authority contract — no compulsory repository plan file, no fixed task durations, no prewritten implementation — and demotes the project plan template to optional craft material."
lastReviewed: 2026-11-07
---

# Native-first Planning

## Muse delta

- **What Muse already does natively**: confirm before consequential side effects (no committing/pushing without approval), and read/inspect before acting. Those are the floor.
- **What this skill uniquely adds**: the authority contract below — planning never authorizes implementation; a repository plan file is created only on explicit request or under an approved project workflow; fixed task durations and prewritten implementation are not required. The older plan craft (task template, sizing, storage conventions) survives only as optional material in the template reference.
- **When to load it**: the user asks for a plan, says "design before building", or the work is uncertain or consequential enough that a read-only planning pass should precede execution. Small, well-defined edits do not require a full planning ritual.

Use native Plan mode or the host's planning agent when available. Ask for the outcome, constraints, relevant files/patterns, decisions, risks, and verification needed for this task.

## Authority

Planning does not authorize implementation, commits, pushes, installation, or external effects. Native CLI Plan blocks clear built-in workspace mutations, but ambiguous shell commands and MCP/external tools are not an airtight read-only sandbox. Do not use those paths to evade the planning boundary.

Do not create a repository plan file unless the user explicitly requests one or the project's approved workflow requires it. Use the host's private planning workspace by default where supported. Do not require fixed task durations or prewrite the implementation.

If native planning is unavailable, perform a read-only planning discussion and state that the permission boundary is procedural rather than host-enforced. Obtain approval before implementation. The [project-specific plan template](references/project-plan-template.md) is optional craft material; its old mandatory sizing/storage prescriptions are historical examples, overridden by this authority contract. Load only relevant template sections.

Report the plan, unresolved decisions, and verification, not a success claim about code that has not run.

## Would Revise If

Revisit if plans still cause unauthorized mutations, or users repeatedly need a different planning format for multi-repository work.

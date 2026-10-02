---
name: "status-reporting"
description: "Create stakeholder-friendly project status updates and progress reports. Use when writing a status update, progress report, weekly or milestone recap, release summary, or any stakeholder-facing account of where work stands. Muse delta: Muse natively separates completed/failed/blocked/unverified and verifies before claiming; this skill adds the audience-graded templates, the technical-to-executive translation table, the traffic-light system, and the trigger/data-source protocol."
lastReviewed: 2026-10-02
---

# Status Reporting

## Muse delta

- **What Muse already does natively**: separate completed / failed / blocked / unverified in status, and verify numbers and dates before claiming them. Those are the floor, not the report.
- **What this skill uniquely adds**: the four audience-graded templates (executive summary, weekly team update, stakeholder email, sprint retrospective), the technical-term → executive translation table, detail-level by audience, the traffic-light + trend indicator system, when-to-generate triggers, and the data-source protocol.
- **When to load it**: writing any status update, progress report, weekly or milestone recap, release summary, or stakeholder-facing account of where work stands.

> "Stakeholders don't need to know HOW you did it — they need to know WHAT it means for them."

## Report Templates

### Executive Summary (30 seconds)

```markdown
## Project Status: [Project Name]
**Date**: [Date] | **Status**: 🟢 On Track / 🟡 At Risk / 🔴 Blocked

### One-Line Summary
[Single sentence: what happened and what it means]

### Key Metrics
| Metric | Current | Target | Trend |
|--------|---------|--------|-------|
| [Metric 1] | [Value] | [Goal] | ↑/↓/→ |
| [Metric 2] | [Value] | [Goal] | ↑/↓/→ |

### Decisions Needed
- [ ] [Decision 1 with deadline]

### Timeline Impact
[On schedule / X days ahead / X days behind — why]
```

### Weekly Team Update

```markdown
## Week of [Date Range]

### Completed ✅
- [Achievement 1] — [impact]
- [Achievement 2] — [impact]

### In Progress 🔄
- [Task 1] — [% complete, ETA]
- [Task 2] — [% complete, ETA]

### Blocked 🚫
- [Blocker] — need [resolution] from [who] by [when]

### Next Week Focus
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]

### Metrics
- Velocity: [X] story points
- Bugs: [X] open, [Y] closed
- Coverage: [X]%

### Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk] | H/M/L | H/M/L | [Action] |
```

### Stakeholder Email

```markdown
Subject: [Project] Status — [Date] — [Status Emoji]

Hi [Name],

**Quick Summary**: [One sentence on where we are]

**This Week's Wins**:
• [Win 1 — business impact]
• [Win 2 — business impact]

**Coming Up**:
• [Next milestone] — [Date]
• [Key deliverable] — [Date]

**Need Your Input On**:
• [Decision needed] — [Context, options, recommendation]

Happy to jump on a call if you have questions.

[Sign-off]
```

### Sprint Retrospective Summary

```markdown
## Sprint [N] Retrospective

### What Went Well 🎉
- [Positive 1]
- [Positive 2]

### What Could Improve 🔧
- [Improvement 1]
- [Improvement 2]

### Action Items
| Action | Owner | Due |
|--------|-------|-----|
| [Action] | [Who] | [When] |

### Sprint Metrics
- Planned: [X] points | Completed: [Y] points
- Carry-over: [Z] items
- Team satisfaction: [Score]/5
```

## Audience Adaptation

| Audience | Detail level | Lead with | Avoid |
|----------|--------------|-----------|-------|
| **C-Suite** | Minimal | Business impact, risks, decisions | Technical detail |
| **VP/Director** | Summary | Progress, resources, timeline | Implementation specifics |
| **Manager** | Moderate | Tasks, blockers, team health | Jargon-heavy depth |
| **Team** | Detailed | Technical specifics, dependencies | Marketing language |
| **Customer** | Outcome | Value delivered, what's next | Internals |

### Language translation

| Technical term | Executive translation |
|----------------|----------------------|
| "Refactored the authentication module" | "Improved security and login reliability" |
| "Reduced technical debt" | "Reduced maintenance costs and risk" |
| "Implemented CI/CD pipeline" | "Automated our release process — faster, safer updates" |
| "Fixed race condition" | "Resolved intermittent bug causing data issues" |
| "Migrated to microservices" | "Made the system more scalable and reliable" |

## Status Indicators

### Traffic Light System

| Status | Symbol | Meaning | Action |
|--------|--------|---------|--------|
| **Green** | 🟢 | On track, no issues | Continue |
| **Yellow** | 🟡 | At risk, needs attention | Monitor closely |
| **Red** | 🔴 | Blocked, needs escalation | Immediate action |
| **Blue** | 🔵 | Complete | Celebrate |
| **Gray** | ⚪ | Not started | Plan |

### Trend Indicators

| Symbol | Meaning |
|--------|---------|
| ↑ | Improving |
| ↓ | Declining |
| → | Stable |
| ⚠️ | Needs attention |

## When to Generate

| Trigger | Report type |
|---------|-------------|
| End of day Friday | Weekly summary |
| Sprint end | Sprint report |
| Before stakeholder meeting | Executive summary |
| Milestone completion | Achievement update |
| Blocker encountered | Escalation notice |
| User asks "what did we do" | Session/period summary |

Pull data from: git commits and PR descriptions; issue tracker (completed, in-progress, blocked); calendar (milestones, deadlines); session history (what we worked on); metrics dashboards if available.

## Session Protocol

1. **Clarify audience**: who will read this?
2. **Determine scope**: what period? what project?
3. **Gather data**: commits, issues, conversations
4. **Identify highlights**: what matters most?
5. **Draft** from the matching template, adapted to audience level
6. **Review for clarity**: can a newcomer understand it?

### Quick Status Commands

```
/alex-act-one status              → Generate session status
/alex-act-one status weekly       → Weekly team update
/alex-act-one status exec         → Executive summary
/alex-act-one status email [name] → Stakeholder email draft
```

## Best Practices

**DO**: lead with the most important information; use consistent formatting; include specific dates and numbers; highlight decisions needed; acknowledge blockers honestly; show progress, not just activity.

**DON'T**: bury bad news; use jargon with non-technical audiences; include unnecessary detail; report activity without outcomes; over-promise on timelines; skip risk assessment.

## Triggers for This Skill

- "status update", "status report"
- "what did we accomplish", "summarize progress"
- "stakeholder update", "email to [stakeholder]"
- "sprint report", "weekly summary"
- End of day/week (proactive)

## Would Revise If

Revisit by **2026-12-31** (90 days) or sooner if any of the following fires:

- Stakeholder feedback reports the templates as unclear, jargon-heavy, or missing decisions-needed sections ≥3 times within a quarter
- The audience-adaptation table produces tone mismatches when applied verbatim ≥2 times in observed reports
- Reports generated via these templates consistently bury bad news or miss escalation triggers that surface later as preventable surprises

---

*Good status reports build trust. Great ones prevent surprise.*

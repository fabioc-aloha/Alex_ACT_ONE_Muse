# Evaluate Alex ACT ONE for Muse yourself

Do not take the README's word for any of this. Run one loaded prompt through a Muse assistant with none of these skills, then through one with the skills copied in, and score what changes. Fifteen minutes.

## The test

You need two Muse conversations, set up as alike as the host allows:

- Conversation one: a Muse assistant with none of the ACT ONE skills or opt-in modules.
- Conversation two: a Muse assistant with the `skills/` folders copied in (and whichever `muse-opt-in/` modules you chose to adopt).

Paste the same prompt into both:

```text
Our analytics dashboard takes 8 seconds to load and users are complaining.
Should we rewrite the backend in Rust or add Redis caching to get it under 2 seconds?
```

The prompt is loaded on purpose. It assumes the backend is the bottleneck, offers only two fixes, and sets a 2 second target from nowhere. A careful assistant should catch at least the first two before recommending anything.

## What to look for

Score each answer on five things:

1. **Does it check the question before answering it?** The plain answer usually picks a side. The ACT ONE answer should stop first and ask where the 8 seconds are actually spent: queries, payload, rendering, network.
2. **Does it ask for evidence?** Look for a named measurement, not a vibe. "Profile the slowest query" counts. "It depends" does not.
3. **Does it widen the options?** The honest answer is often neither Rust nor Redis. Watch for options the prompt left out, starting with measure first.
4. **Does it mark its confidence?** Facts, reports, estimates and guesses should not all sound the same. ACT ONE labels them.
5. **Does it check its own output?** A recommendation is a draft until someone verifies it. Look for the check, not just the answer.

Three or more of these, clearly present, is the discipline working. If the ACT ONE run shows fewer, that is a product finding worth an issue, not something to explain away.

## What you get if it works

- **Fewer confident wrong answers.** The frame audit catches the bad question before the assistant builds on it.
- **Evidence before recommendations.** You see what to measure and what result would change the answer.
- **Confidence you can read.** A guess is labeled a guess, so you know what to verify yourself.
- **New maker range.** The port keeps the Copilot edition's chart and document skills working through Muse's native tools, including Flint charts and the Markdown converters.
- **Corrections that stick.** When you fix a mistake, the fix can become a rule or a skill, so the same mistake does not come back next session.

## Alternate prompts

Same loaded-frame pattern, if you want a second test:

1. "Our churn went up 2 points last month. Should we cut prices 10 percent or add an onboarding wizard to win users back?"
2. "The migration to the new database will take 6 weeks. Should the team work weekends or drop the reporting feature to hit the date?"

## Honesty rules

- Use your real runs, exactly as they come out. If a run disappoints, that is data.
- Keep the two setups as alike as you can. No tuning one side to win.
- If the plain assistant catches the frame too, good. The claim is not that a plain assistant never catches a bad question. The claim is that ACT ONE makes catching it a habit.

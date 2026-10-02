---
name: ascii-chart
description: "Render charts and compact dashboards as pure ASCII in a monospace grid: bar, dot, sparkline, histogram, box plot, scatter, bubble, heatmap, funnel, waterfall, treemap, gauge, KPI card, and more. No rendering engine, no SVG, no browser, no MCP server. Use when the delivery target is a terminal, a log file, a pull request comment, a commit message, a README code block, or a context window where no renderer exists, or when the user asks for a text chart, an ASCII chart, or a plain-text dashboard. Muse delta: the 78-column grid constants, construction rules, and the mandatory measure-don't-eyeball QA loop — LLMs reliably miscount characters without it."
lastReviewed: 2026-08-18
---

# Delivery: ASCII Dashboard

## Muse delta

- **Native to Muse:** ASCII-art intuition — Muse can draw a reasonable box or bar chart off the cuff.
- **What this skill uniquely adds:** the exact **78-column grid constants**, the **construction rules** (compute widths, right-align numbers, one header per card), and the **mandatory Alignment QA Loop** — LLMs reliably produce 77/79/80-char lines they believe are 78; measure with the shell, don't eyeball.
- **Load when:** the delivery target is a terminal, log file, PR comment, commit message, README code block, or any context window where no renderer exists.

Render dashboards as pure ASCII: no emojis, no Unicode box-drawing beyond the basic set. A monospace text block that looks correct in any terminal, any markdown code fence, any LLM context window. Zero dependencies; geometry is predictable because every character is one cell.

## When to Use

- Quick status snapshots in terminal output, log files, or commit messages
- Environments where SVG/HTML rendering is unavailable (CI logs, SSH sessions, plain-text email)
- Token-constrained contexts where SVG coordinate math would waste budget
- Rapid prototyping before committing to a richer delivery format

## When NOT to Use

- The audience expects graphical output (use `flint-chart` or `print-svg-style-guide` instead)
- Charts require color encoding (ASCII is monochrome)
- More than 78 columns of data (wrapping breaks the layout)
- Interactive filtering or drill-through is required

## Module 1: Character Geometry

ASCII is 1 cell per character, always — unlike emojis, which render as 1 or 2 cells depending on terminal, font, and OS. A `🟢` in VS Code vs Windows Terminal breaks column alignment. Status indicators use letters instead:

| Status | ASCII | Meaning |
| --- | --- | --- |
| Complete | `[x]` | Done |
| In progress | `[-]` | Active |
| Not started | `[ ]` | Pending |
| Pass | `[OK]` | Check passed |
| Fail | `[!!]` | Check failed |
| Warning | `[??]` | Needs attention |

### Grid Constants

| Constant | Value | Rationale |
| --- | --- | --- |
| Max width | 78 characters | Fits 80-column terminals with 1-char margin each side |
| Card padding | 1 character inside each border | Readable without waste |
| Column gap | 2 characters (`  `) | Visually separates side-by-side cards |
| Row gap | 1 blank line | Separates card rows |
| Title centering | Centered within card width | Visual anchor |
| Number alignment | Right-aligned within column | Scannable |

### Box-Drawing Characters (basic set only)

Horizontal `-`, vertical `|`, corners `+`, separator `=` or `-`, bar fill `#`, bar empty `.` or space, sparkline up `/`, down `\`, flat `_`, peak `^`, bullet `*`.

## Module 2: Layout Patterns

### KPI Strip (single row of metrics)

```text
+----------------+  +----------------+  +----------------+
|   REVENUE      |  |   USERS        |  |   CHURN        |
|   $4.2M        |  |   12,847       |  |   3.1%         |
|   +12% YoY     |  |   +892 MoM     |  |   -0.4pp       |
+----------------+  +----------------+  +----------------+
```

Width per card = `(78 - (N-1)*2) / N`. For 3 cards: 24 chars each.

### Horizontal Bar Chart

```text
Revenue by Region
==========================================
North America  | #################### | 42%
Europe         | ###########          | 23%
Asia Pacific   | #########            | 19%
Latin America  | #####                | 11%
Other          | ##                   |  5%
==========================================
```

Bar width = total width − label width − value width − borders. Labels left-aligned, values right-aligned.

### Sparkline Row

```text
Trend (12 months):  _/\__/\/\___/\  High: 4.2M  Low: 2.1M
```

`/` up, `\` down, `_` flat, `^` peak. One char per data point, 20 chars max.

### Two-Column Dashboard

```text
+------------------------------------+  +------------------------------------+
|  SALES PIPELINE                    |  |  SUPPORT TICKETS                   |
+------------------------------------+  +------------------------------------+
|                                    |  |                                    |
|  Q1   | ########           | $2.1M |  |  Open     | ###########    |  127  |
|  Q2   | ###########        | $2.8M |  |  Pending  | ######         |   68  |
|  Q3   | ###############    | $3.7M |  |  Closed   | ############## |  156  |
|  Q4   | ################## | $4.2M |  |  Overdue  | ##             |   23  |
|                                    |  |                                    |
|  Trend: __/\/\__/\  YTD: $12.8M   |  |  Avg resolution: 4.2 days         |
+------------------------------------+  +------------------------------------+
```

Each column = 38 chars (including borders); gap = 2 chars.

## Module 3: Construction Rules

1. **Compute widths before drawing.** `card_width = (78 - (n_columns-1)*2) / n_columns`; `bar_area = card_width - label_width - value_width - 4`. Never eyeball.
2. **Right-align numbers, left-align labels.** Numbers scan faster with the ones digit in a fixed column.
3. **Sort bars by value** (unless time-ordered). Largest on top; the eye scans top-down.
4. **One header per card, centered.** Caps or title case for weight; no bold or underline (not portable).
5. **Footer row = call to action.** Last row spans full width with the one thing the reader should do next.
6. **Validate with character count.** Every line in a card must have identical length. Counting is the advantage of ASCII.

## Module 4: Generating from Data

Input: a JSON or table structure (title, date, `kpis[]` with label/value/detail, `charts[]` with title/type/items, footer). Algorithm: compute the grid layout → render each component into a string array (one string per line) → zip line arrays side by side with gap spacing → pad every line to its card width → validate identical line lengths → join with newlines → run the Alignment QA Loop below.

## Module 5: Alignment QA Loop (mandatory)

LLMs cannot reliably count characters in generated text. The model produces lines it believes are 78 characters but are actually 77, 79, or 80 — on nearly every generation. The only reliable fix is to measure after generation and fix before delivery. **Do not self-report "all lines OK" without measuring. "Looks correct" is not a measurement.**

### Validation method

Measure every line with the shell — the ONLY acceptable validation. Mental counting or estimation is not acceptable.

```bash
f="/tmp/dashboard.txt"   # or wherever the draft lives
awk -v f="$f" '{ if (length($0) != 78 && length($0) != 0) print FILENAME": "NR" len="length($0)": "$0 }' "$f"
```

If that prints nothing (no failing lines), the dashboard is 78-clean.

### Construction method (prevents most failures)

Do not freehand ASCII lines. Use padding functions to construct each line:

```text
Row(content):     "| " + content.padRight(74) + " |"
Border(char):     "+" + (char * 76) + "+"
DualRow(l, r):    "| " + l.padRight(34) + " |" + "  " + "| " + r.padRight(34) + " |"
```

### Width constants (do not deviate)

| Element | Formula | Result |
| --- | --- | --- |
| Total line width | fixed | 78 |
| Full-width border | `+` + 76 dashes + `+` | 78 |
| Full-width inner | `\| ` + 74 content + ` \|` | 78 |
| Side-by-side border | `+` + 36 + `+` + `  ` + `+` + 36 + `+` | 78 |
| Side-by-side inner | `\| ` + 34 + ` \|` + `  ` + `\| ` + 34 + ` \|` | 78 |

The width is 78, NOT 80. Common mistake: using 80 because "80-column terminal". The 1-char margin on each side means content is 78.

### Fix-and-Recheck Loop

If any line fails: identify line number + measured width + content; trim trailing content before `|` if too long, add spaces before closing `|` if too short; re-run the measurement. Repeat until zero failures. **Do NOT write the output file until measurement passes.** A misaligned dashboard is a rendering bug, not a cosmetic issue.

## Anti-Patterns

| Anti-pattern | Fix |
| --- | --- |
| Emojis for status indicators | `[x]`, `[!!]`, `[OK]` — always 1 cell per character |
| Eyeballing column widths | Compute from grid constants. Count characters. |
| Mixing Unicode box-drawing with ASCII | Pick one. ASCII `+-|` is safest |
| Lines of different lengths within a card | Pad every line. The #1 rendering bug |
| More than 78 characters wide | Redesign or split into rows |
| Detailed data in the dashboard | ASCII is for summaries; link to detail elsewhere |

## Cross-References

- [`chart-big-idea`](../chart-big-idea/SKILL.md) — the Chart Brief decides whether ASCII is the right delivery target
- [`chart-vocabulary`](../chart-vocabulary/SKILL.md) — pick the communication goal and chart type before rendering
- [`references/ascii-gallery.md`](references/ascii-gallery.md) — 32 worked forms by seven communication goals
- [`render-verify`](../render-verify/SKILL.md) — steps 4–5 still apply (checking a claim needs no renderer)
- [`flint-chart`](../flint-chart/SKILL.md) — the upgrade path when ASCII is not enough

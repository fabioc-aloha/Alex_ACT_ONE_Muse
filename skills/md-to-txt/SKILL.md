---
name: "md-to-txt"
description: "Strip Markdown formatting and produce clean plain text via pandoc. Use when the user asks to convert to plain text or export markdown as a .txt file. Muse delta: the md-to-txt.cjs option flags and the format-aware defaults (em-dash → comma ON, decorative HRs preserved) — beyond Muse's native ability to strip markdown by hand."
lastReviewed: 2026-05-26
---

# Md To Txt

## Muse delta

- **Native to Muse:** stripping markdown formatting by hand for a small excerpt.
- **What this skill uniquely adds:** the `scripts/md-to-txt.cjs` pipeline with its **option flags** and **format-aware defaults** (em-dash → comma ON for txt, decorative HRs preserved) — consistent, repeatable conversion Muse hand-stripping can't guarantee.
- **Load when:** the user asks to convert to plain text or export markdown as a `.txt` file.

Strip all Markdown formatting and produce clean plain text. Useful for clipboard export, email body fallback, accessibility, and as input to text analysis tools.

## Quick Start

```bash
node skills/md-to-txt/scripts/md-to-txt.cjs source.md output.txt
```

## Options

| Flag | Default | Effect |
|---|---|---|
| `--wrap N` | 80 | Line wrap width (0 = no wrap) |
| `--strip-frontmatter` | off | Remove YAML frontmatter |
| `--strip-mermaid` | off | Replace Mermaid blocks with `[diagram]` |
| `--strip-images` | off | Replace image refs with alt text |
| `--no-replace-em-dashes` | em-dashes ARE replaced for txt | Keep `—` literal |
| `--strip-decorative-rules` | HRs preserved for txt | Strip decorative `---` lines |

## Format-Aware Defaults

Plain text gets:

- **Em-dash → `, ` ON.** AI-tell em-dashes look bad in monospace fonts.
- **Decorative HR strip OFF.** Pandoc renders `---` as visible plain-text dividers, which are usually intentional in txt output.

Override via flags above.

## What gets stripped

- Bold, italic, strikethrough markers
- Inline code backticks
- Link URLs (alt text preserved)
- Heading `#` markers
- Bullet/list markers (indentation preserved)

## Related

- Pre-flight the source with the project's linter or the `lint-clean-markdown` skill
- [md-to-word](../md-to-word/SKILL.md) — for formatted output

# Archived skills — host-specific

These eight skills were built for hosts other than Muse and have no Muse
equivalent. They are preserved here, complete with scripts and references,
for use with those hosts — they are **not** part of the Muse adoption
(`skills/`) and the manifest does not list them as active skills.

| Skill | Built for | Why it stays archived |
| --- | --- | --- |
| `replicate-imagery` | Replicate API via MCP | Needs a `REPLICATE_API_TOKEN` and paid account; Muse generates images natively |
| `rich-email` | New Outlook on Windows | Opens an unsent Outlook draft via Windows automation — no Outlook on this host |
| `browser-tools` | VS Code 1.127+ browser tools | VS Code extension APIs; Muse has native browser tools instead |
| `platform-awareness` | VS Code Copilot platform | Deferred-tool categories and skill-picker surfacing are VS Code concepts |
| `bootstrap-core` | Copilot CLI / Scout | Copies always-on `.instructions.md` files into host instruction locations |
| `bootstrap-project` | Copilot plugin scaffold | Applies the Copilot repository scaffold and workspace settings |
| `setup-enterprise-stack` | Copilot CLI | Emits the Copilot CLI settings block for the Microsoft ecosystem |
| `install-visual-companions` | Copilot marketplace | Installs marketplace plugins — Muse has no plugin marketplace |

Nothing here was deleted: if a future host needs one, move it back to
`skills/` and re-add it to the manifest's `archived` → `skills` inventory.

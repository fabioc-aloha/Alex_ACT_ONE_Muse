# Muse capability map

The Copilot edition of Alex ACT ONE ships three MCP servers. Muse has no
MCP-server consumer, so this edition drops them from `plugin.json` and maps
each one to the Muse native equivalent below. Skills that referenced an MCP
server now point here instead.

| Copilot edition (MCP server) | What it did | Muse native equivalent |
| --- | --- | --- |
| `flint` (`flint-chart-mcp`) | Chart rendering via Vega-Lite / ECharts / Chart.js; ThemeSpec discovery; `assembleVegaLite` / `assembleECharts` / `assembleChartjs` | Muse's built-in chart skills (`chart-big-idea`, `chart-interpretation`, `chart-vocabulary`, `ascii-chart`) plus the host's own chart-rendering tools. The `flint-chart` and `flint-theme` skills' authoring guidance (chart choice, spec discipline, claim-carrying titles) still applies — only the render step changes: author the spec per the skill, then render with the host's native chart capability instead of the Flint MCP tools. |
| `replicate` (`replicate-mcp`) | AI image generation (needed a paid `REPLICATE_API_TOKEN`) | Muse's native media/image generation. The `replicate-imagery` skill's prompting guidance still applies; substitute the host's image-generation tool for the Replicate MCP calls, with no token or paid account required. |
| `alex-playwright` (`@playwright/mcp`) | Browser verification for `render-verify` (screenshots, page interaction) | Muse's native browser tools (page fetch, screenshots, visual review). `render-verify`'s rung model still applies: prefer the host's built-in browser capability, and fall back to local rendering scripts where the skill describes them. |

## Notes

- The Flint MCP was the only server whose absence stopped a skill outright in
  the Copilot edition (`flint-chart`, `flint-theme` had no fallback). In this
  edition the fallback is the host itself: Muse always has chart-rendering
  capability, so the authoring skills remain fully usable.
- `setup-dependencies` in the Copilot edition provisions these servers. In this
  edition there is nothing to provision — the capabilities are native to the
  host. The skill is preserved for reference.
- Version pins from the Copilot edition (`flint-chart-mcp@0.5.1`,
  `@playwright/mcp@0.0.80`, `replicate-mcp@0.9.0`) are recorded here for
  lineage; they have no operational meaning in the Muse edition.

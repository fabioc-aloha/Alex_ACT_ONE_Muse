# Roadmap

What is working now, what is being built, and what is deliberately out of scope.
Applies to the Muse edition (`alex-act-one-Muse` 0.1.0), ported from the Copilot
edition (Alex ACT ONE v0.3.6).

## Working Today

- The package declares 60 skills, 15 chat-ready prompts, and 15 opt-in modules.
  There are no MCP servers to register — the Copilot edition's three servers map
  to native Muse capabilities (see `docs/muse-capability-map.md`)
- Skills are used straight from the `skills/` directory the assistant reads;
  there is no plugin loader and no install step
- Opt-in modules in `muse-opt-in/` are never auto-applied. Adoption is a
  deliberate user decision, one module at a time
- A no-write host activation readiness report names the selected host's
  activation target, manual steps, and observation boundary. The bootstrap
  scripts are preserved from the Copilot edition for reference
- Every external npm package in the preserved provisioning scripts is pinned
  to an exact version, and one command reports when a pin has fallen behind
- `node --test` checks the structural claims above, including a plugin-root check
  on the prompt routes, that activation previews plan exactly what the manifest
  declares, and that any count quoted in this file is real

## Next

**Verify the opt-in modules against real Muse assistant configs.** The modules
were ported verbatim from always-on Copilot instructions; their advice is
host-agnostic, but nobody has yet adopted each one into a live Muse setup and
confirmed it behaves.

**Adoption guide.** A short worked example: which skills to copy first, which
opt-in modules pair well together, and what to skip until you need it.

**Documentation you can follow without asking.** Setup, a short example of when
each group of skills is worth reaching for, and troubleshooting for the cases
people actually hit.

## Not Planned

- Replacing your judgment. Every consequential step previews first and asks.
- Silent writes outside the plugin. Activation, project scaffolding, and setup
  commands each preview their exact file list.
- Telemetry, usage collection, or reading your conversations.
- Shared continuity across sessions. ONE remains project-local and does not
  create or depend on a shared store.
- An MCP server layer for Muse. The host's native capabilities are the
  supported path; the Copilot-edition provisioning scripts stay for reference.

## How To Read This

The [README](README.md) distinguishes source support from host-level evidence.
When a host has not been tested on the current release, say so rather than
promoting an earlier baseline into a current activation claim.

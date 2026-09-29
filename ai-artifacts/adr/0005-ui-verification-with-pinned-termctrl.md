---
status: accepted
date: 2026-09-19
---

# Verify the terminal UI with pinned Terminal Control and reviewed cell baselines

The old Python PTY smoke test searched the whole output history, so text drawn earlier could pass a check on a wrong final screen. We kept Bun tests and added Terminal Control (`termctrl`) scenarios that capture the visible screen as text, styled cells and PNG at named checkpoints.

## Considered options

Migrating to OpenTUI or another runner only to get screenshots was rejected; `termctrl` already captured the app without source changes.

## Consequences

- `termctrl` is pinned to 0.4.1 (`TERMCTRL_VERSION` in `packages/tui/test/support/ui-capture.ts`). Its renderer changed between versions, so upgrading it and rewriting baselines must happen in one reviewed step.
- Baselines compare styled cells, not pixels. PNGs are review evidence only.
- Only `bun run ui:update` writes baselines, after a person reviews each screen. A first baseline otherwise freezes existing bugs.
- `bun run check` stays headless; `bun run test:ui` runs in its own CI job.
- The Python PTY driver and `pty-smoke.test.ts` were removed on 2026-09-29. The `replay`, `inspect` and `quit` scenarios cover the same checks. [existing]

Source: UI testing research (`19b4829`); the removed file is in git history at `d5ddbe4^:ai-artifacts/research/2026-09-19-ui-testing.md`.

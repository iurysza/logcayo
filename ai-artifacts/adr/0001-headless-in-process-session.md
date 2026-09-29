---
status: accepted
date: 2026-09-18
---

# Headless, in-process session with a functional core

Logcayo had to be testable before any terminal UI existed. We chose one in-process `Session` that owns sources, bounded storage and cancellation, with pure functions in `@logcayo/core` for parsing, filters, navigation and projection. The TUI and the CLI only send commands and read snapshots.

```text
source ─► Session (imperative shell) ─► snapshot ─► TUI | logcayo query | tests
             │
             └─ calls pure core: frame, parse, filter, navigate, project
```

## Considered options

- **A. TUI owns state.** Smallest setup, but UI and app lifecycle become one boundary, and tests must load the renderer.
- **B. Headless in-process session (chosen).** One writer, one commit per slice, and tests use the real session with `ManualScheduler`. The risk is event-loop starvation, so work runs in bounded slices.
- **C. Engine in a worker or process.** Isolates CPU work, but adds serialisation, protocol versioning and crash semantics. Deferred until profiling shows B is too slow.

## Consequences

- Storage is mutable and bounded (ring buffer, indexes), but policy stays in core. "Functional core" does not mean copying 100,000 records per batch.
- `tests/architecture/import-boundaries.test.ts` keeps Bun, files, processes and clocks out of core.
- This decision made ADR 0004 cheap: `logcayo query` is just another snapshot reader.

Source: [technical design, Alternatives and Recommendation](../../docs/design/2026-09-18-technical-design.md#alternatives).

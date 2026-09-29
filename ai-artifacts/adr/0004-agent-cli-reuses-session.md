---
status: accepted
date: 2026-09-26
---

# `logcayo query` reuses the Session, with no second matcher

Agents needed matched events, not a summary. `logcayo query` builds the same `Session` with the same source and initial filter as the TUI, then reads results through one new read-only method, `Session.readMatches(after, limit)`. It prints NDJSON.

## Consequences

- The TUI and the CLI cannot disagree about matches. `tests/contract/filter-cases.ts` holds one table of `{ query, expectedIds }` cases, checked through both adapters. If they diverge, a test fails.
- `query` never writes files; `record` stays the only writer.
- Exit codes match the other commands: `0` done, `1` source failure, `2` bad arguments or query.

Source: query design, Decisions 3–5 (PR #14); the removed file is in git history at `d5ddbe4^:ai-artifacts/specs/2026-09-26-tui-filtering-agent-cli-design.md`.

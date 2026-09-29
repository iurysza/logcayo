---
status: accepted
date: 2026-09-26
---

# One query language, parsed only in core

The TUI had a five-field filter form and the CLI had only `--filter-text`, so no filter could move between them. We added `packages/core/src/query.ts` as the only text-to-filter parser. A query such as `level:W tag:Database lock` works unchanged after `/` in the TUI and in `logcayo query`.

## Considered options

More CLI flags were rejected because flags cannot be pasted into the TUI. Letting a repeated key silently win was rejected because it hides mistakes; it is an error instead.

## Consequences

- `parseFilterQuery(formatFilterQuery(spec))` returns the same spec, enforced by a generated-spec test in `packages/core/test/query.test.ts`.
- Architecture tests forbid importing the field parsers outside core.
- Unknown `key:value` words stay text, so a typo such as `lvl:W` shows up as a text chip.
- `~` later became the only way to select Jev (ADR 0006).

Source: query design, Decision 1 (PR #14); the removed file is in git history at `d5ddbe4^:ai-artifacts/specs/2026-09-26-tui-filtering-agent-cli-design.md`.

---
status: accepted
date: 2026-09-28
supersedes: the `--semantic` flag design of 2026-09-18
---

# Jev runs only for `~` queries, and only when an API key is set

Jev classifies events by meaning through the paid TypeSafe API. It first shipped behind `--semantic`, with an `m` key to switch modes and `v` to hide weak rows. That gave three ways into one feature. Now `TYPESAFE_API_KEY` alone enables Jev, and a `~` before the query text is the only way to use it.

```text
query ─► parse ─► searchMode = "text" ──► filter as you type
                └► searchMode = "jev"  ──► local keyed filters ─► Enter ─► classify batch ─► settle ─► show
```

## How it got here

| Commit | Change |
|---|---|
| `3805073` | Jev behind `--semantic`; pending and failed rows stay visible |
| `be69e15` | Admit only confirmed matches into the list |
| `559d53a`, `fb33e9e` | Bound history classification; track visible counts |
| `718e6ff`…`62dda8c` | `~` prefix in the query language, `m` toggle, `v` hide |
| `cdd0bb3` | Remove `--semantic`, `semantic.enabled` and `m`; `h` replaces `v`; settle before showing |

## Consequences

- Jev waits for Enter because each request costs money; text search applies on every keystroke.
- Local filters such as `level:` always run first, so Jev scores fewer events.
- Old config files with `semantic.enabled` still load; the field is ignored.
- The code still names the module `semantic/`. See [CONTEXT.md](../../CONTEXT.md#finding-events).

Source: commit messages above, [docs/query-and-jev.md](../../../docs/query-and-jev.md).

---
description: Maintainer knowledge for logcayo. The glossary, architectural decisions and key runtime flows.
---

# Logcayo knowledge base

This folder is for maintainers and agents. User and contributor docs live in [`docs/`](../docs/). Only the glossary, decisions and flows are tracked; plans, handoffs and research in this folder stay local.

- [CONTEXT.md](CONTEXT.md) fixes the words: event, log call, continuation, unparsed event, named UID, Jev. Read it first.
- [flows/line-to-row.md](flows/line-to-row.md) traces one log call from ADB bytes to a list row. Read it before touching parsing or grouping.

## Decisions

| ADR | Decision |
|---|---|
| [0001](docs/adr/0001-headless-in-process-session.md) | One headless, in-process `Session` with a functional core |
| [0002](docs/adr/0002-package-attribution-by-uid.md) | Attribute packages by UID, resolve lazily, store the table in recordings |
| [0003](docs/adr/0003-one-query-language-in-core.md) | One query language, parsed only in core |
| [0004](docs/adr/0004-agent-cli-reuses-session.md) | `logcayo query` reuses the `Session`, no second matcher |
| [0005](docs/adr/0005-ui-verification-with-pinned-termctrl.md) | Pinned Terminal Control and reviewed styled-cell baselines |
| [0006](docs/adr/0006-jev-by-tilde-and-api-key.md) | Jev only for `~` queries, only with an API key |
| [0007](docs/adr/0007-ansi-adapter-with-shared-geometry.md) | Keep the direct ANSI renderer, not OpenTUI |
| [0008](docs/adr/0008-group-by-log-call.md) | Group lines by log call; a headerless line never continues an event |

Formats: `.agents/skills/domain-modeling/CONTEXT-FORMAT.md` and `ADR-FORMAT.md`. When a decision changes, mark the old ADR `superseded by ADR-NNNN` and add a new one. Do not edit history into an accepted record.

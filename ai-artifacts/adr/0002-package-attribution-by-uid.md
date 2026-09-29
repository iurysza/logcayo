---
status: accepted
date: 2026-09-20
---

# Attribute packages by UID, resolved lazily and stored in recordings

Logcat has no package column. We capture the UID (`-v uid`), resolve UID to packages with `cmd package list packages -U` only when the detail view or a `pkg:` filter needs it, cache one table per device session, and store that table in new recordings. Replay never asks a connected device.

## Considered options

Other log viewers (pidcat, adbcat, BeautyCat and others) poll `ps` for a PID-to-process map. PIDs are reused, processes restart, and buffered lines outlive their process, so that approach breaks retained history and replay. A UID survives restarts and is part of each captured line.

## Consequences

- The capture profile became `threadtime-epoch-usec-uid-v2` and the recording format version 2. Version 1 recordings still load, with the package shown as not recorded.
- The detail panel never guesses: one package, several packages for a shared UID, none for native processes, or `Unavailable`.
- Named UIDs (ADR 0008) must parse, or those lines lose their UID.

Source: package attribution research, 2026-09-20; the removed file is in git history at `d5ddbe4^:ai-artifacts/research/2026-09-20-package-attribution.md`.

---
status: accepted
date: 2026-09-28
---

# Group lines by log call; a headerless line is never a continuation

Android splits one multi-line log call into lines that each repeat the full header. We join a line to the previous event only when it has a parsed header and `isSameLogCall` matches: same time, PID, TID, level, UID and tag. A line without a parseable header becomes its own unparsed event.

```text
08:55:00.002921 10042 4321 4340 W Database: Retry after lock timeout   ─► event
08:55:00.002921 10042 4321 4340 W Database:     at Store.lock(...)     ─► continuation (same log call)
not a header line                                                      ─► unparsed event
```

## Why

Before this, every line without metadata became a continuation of whatever event came last. On a Samsung phone, logcat prints short account names (`root`, `radio`, `u0_a5`) in the UID column; the parser only accepted digits, so those lines were glued under unrelated events. The fix parses named UIDs (`fbfa490`) and removes the "headerless means continuation" rule (`0f62fde`).

The original technical design already said to preserve unmatched lines as unparsed events and not invent metadata for them. The code had drifted from that.

## Consequences

- Stack traces still group, through the same-call rule (`dbe0493`).
- Unknown named UIDs parse with `uid: null` rather than failing the whole header.
- [?] NDJSON `continuations` hold raw lines including the repeated header. The TUI strips it with `continuationText`; the CLI does not.

Source: commits `dbe0493`, `fbfa490` and `0f62fde` (PR #12).

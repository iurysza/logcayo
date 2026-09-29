# Configuration and output

This page covers the config file, the capture command, and the machine-readable output of `--headless` and `logcayo query`. For the query grammar and Jev states, read [Query line and Jev](query-and-jev.md).

## Config file

`live` and `replay` read `logcayo.json` in the working directory. Pass `--config PATH` to use another file. Command-line flags override the file.

```json
{
  "filter": { "text": "database locks" },
  "semantic": {
    "threshold": 0.5,
    "model": "jev-1.13.0",
    "flushMs": 50,
    "batchItems": 100,
    "historyEvents": 100,
    "maxInFlight": 2,
    "maxQueued": 2000,
    "maxRequestBytes": 131072,
    "timeoutMs": 30000
  }
}
```

- `TYPESAFE_API_KEY` in the environment turns Jev on. Without it, Jev is off. Older files with `semantic.enabled` still load, but the field is ignored.
- `semantic.historyEvents` sets how many recent events Jev scores when you apply a question. New events that match are scored as they arrive.
- `TYPESAFE_DEFAULT_MODEL` overrides `semantic.model`.
- Do not put API keys in the file. logcayo rejects a config that contains one.

## Capture command

Live capture runs this argument vector directly, not through a shell:

```text
adb -s <serial> logcat -b main -b system -b crash -v threadtime -v epoch -v usec -v uid *:V
```

## Headless output

`live --headless` and `replay --headless` print one JSON summary line after the source ends. Diagnostics go to stderr.

| Exit code | Meaning |
| --- | --- |
| 0 | Success, including a recording that stopped at its size limit |
| 1 | Source or recording failure |
| 2 | Invalid arguments |

## Query output

`logcayo query` writes NDJSON by default: one line per event, then one summary line.

An event has `v`, `type`, `id`, `time` (ISO 8601), `epochMicros`, `level`, `pid`, `tid`, `uid`, `tag`, `message`, `raw`, and `continuations`. Metadata fields are null for lines logcayo could not parse.

The summary has `query`, `emitted`, `matched`, `stop`, `terminal`, `evictedBeforeRead`, and, for live queries, `timeout_ms`. `evictedBeforeRead` estimates how many events were dropped before the command read them. The estimate can include events that would not have matched.

`--format text` prints raw lines and continuations to stdout and the JSON summary to stderr.

A Jev query reads the recording to the end, waits for scores, and prints only relevant events. Each event gains `score` (0 to 1) and `verdict`. The summary gains a `jev` object with `threshold`, `relevant`, `belowThreshold`, `unscored`, and `error`. Jev queries do not work with `--live`.

| Exit code | Meaning |
| --- | --- |
| 0 | Success, including zero matches |
| 1 | Source failure, or Jev failed and scored nothing (`jev-failure`) |
| 2 | Invalid arguments or query, or `TYPESAFE_API_KEY` is not set (`missing-api-key`) |

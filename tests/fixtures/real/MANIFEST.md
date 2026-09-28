# Sanitized real-pattern fixture

File: `sanitized-aosp-pattern.lvr.jsonl`  
Provenance: `sanitized-real`  
Redaction version: `2026-09-28.device-uid-pattern.v2`  
Profile: `threadtime-epoch-usec-uid-v2`

## Origin

The fixture follows the layout of a Samsung Android 17 phone captured with logcayo's flags: leading spaces, a UID column, and named UIDs such as `root`, `radio`, `wifi`, `lmkd`, `shell` and `logd`. Logcat prints a name instead of the number when the account name has at most 5 characters.

The app story (`com.example.logview.demo`, the `Database` stack trace, the libc abort) is invented. The `radio`, `wifi`, `lmkd` and `shell` lines come from a real capture, with PIDs and timestamps changed. The stack trace repeats its header on every line, as real logcat does, so it groups into one event. `not a header line` stays as one unparsed event.

It is **not** an untouched dump from a private phone.

## Review

| Class | Result |
|---|---|
| Personal names, emails, phone numbers | None |
| Tokens, cookies, passwords, payment data | `token=REDACTED` only |
| Device serials / IMEI / advertising IDs | None in log text. Replay header stores no serial. |
| Package identity | Invented `com.example.logview.demo` |
| PIDs / UIDs | Invented, or changed from the real capture |
| Control bytes | One escaped ESC sequence in a warning line, to prove display sanitization |

## Packets

Stdout is the UTF-8 logcat text in `sanitized-payload.ts`, split so a multibyte `é` in `café` crosses a packet boundary. Stderr is a diagnostic line that must not become a log event.

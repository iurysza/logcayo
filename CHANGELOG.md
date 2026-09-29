# Changelog

## [0.4.1](https://github.com/iurysza/logcayo/compare/v0.4.0...v0.4.1) (2026-09-28)


### Bug Fixes

* **core:** parse logcat headers with named UIDs ([fbfa490](https://github.com/iurysza/logcayo/commit/fbfa490f04fb4744a9af2ffbf4a3ad448d64a4fe))
* **engine:** group lines from one log call into one event ([dbe0493](https://github.com/iurysza/logcayo/commit/dbe04934bd7c1d9e1c4024b7ef36a37a868d3dcf))
* **engine:** keep unparsed lines as their own events ([0f62fde](https://github.com/iurysza/logcayo/commit/0f62fde48bcd08929b56b01a64c3590f4f5079cb))
* **tui:** align list messages and wrap at word boundaries ([01fee65](https://github.com/iurysza/logcayo/commit/01fee65af3b9892bf7d062fda0a12cc15184d6b2))

## [0.4.0](https://github.com/iurysza/logcayo/compare/v0.3.0...v0.4.0) (2026-09-28)


### Features

* **jev:** classify with ~ only and settle results before showing ([cdd0bb3](https://github.com/iurysza/logcayo/commit/cdd0bb38bed2fed1c1c3920188933c336f3f9908))

## [0.3.0](https://github.com/iurysza/logcayo/compare/v0.2.0...v0.3.0) (2026-09-27)


### Features

* install standalone binaries with a curl script ([bff3bc7](https://github.com/iurysza/logcayo/commit/bff3bc70905a0a54caded1303f47ab626108f29f))
* install standalone binaries with a curl script ([62dec19](https://github.com/iurysza/logcayo/commit/62dec195977f0bb1aff9fb3543881ca212eaed62))

## [0.2.0](https://github.com/iurysza/logcayo/compare/v0.1.0...v0.2.0) (2026-09-26)


### Features

* **tui:** wrap the detail screen instead of clipping it ([c191d6d](https://github.com/iurysza/logcayo/commit/c191d6d02e96ea17e8016a6cc9047f9d44e116a4))

## 0.1.0

First public release.

- Keyboard-driven terminal viewer for live `adb logcat`, recordings, and replay
- One query line for level, tag, PID, package, and text filters, with Tab completion
- Event inspector with copy and tag or PID pivots
- `logcayo record` and `logcayo replay` with adjustable speed
- `logcayo query` for NDJSON output to agents and scripts
- Optional Jev natural-language filtering through TypeSafe

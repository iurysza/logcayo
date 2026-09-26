# Development

This page is for contributors. It covers the repository layout, the quality gate, terminal UI checks, fixtures, and benchmarks. Read [the architecture reference](architecture.md) before you move code between packages.

## Set up

You need [Bun](https://bun.sh) 1.4 or later. You need `adb` and an authorized device only for live capture.

```sh
git clone https://github.com/iurysza/logcayo.git
cd logcayo
bun install
bun run check
```

Run the CLI from the checkout with `bun run logcayo ARGS`.

## Packages

| Package | Owns |
| --- | --- |
| `@logcayo/core` | Pure parsing, filters, navigation, and interaction state. No Bun, files, processes, clocks, or terminal code. |
| `@logcayo/engine` | The `Session` API, bounded storage, sources, recording, scheduling, and Jev coordination. |
| `@logcayo/cli` | Argument parsing, config loading, and command wiring. |
| `@logcayo/tui` | ANSI rendering, raw input, and terminal cleanup. |

`tests/architecture/import-boundaries.test.ts` enforces these boundaries.

## Quality gate

```sh
bun run check
```

`check` runs lint, TypeScript, and the headless tests. The headless tests do not load the terminal UI, start an ADB server, call Jev, or sleep on wall-clock timers. They drive the public `Session` API with a scripted source and a manual scheduler.

### anti-slop lint

This repository vendors [anti-slop](https://github.com/dmmulroy/anti-slop) at `tools/oxlint/anti-slop/`, from commit `c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b`. The plugin has no npm package. It is local source registered in `oxlint.config.ts`, and `tools/oxlint/UPSTREAM.md` records where it came from. Keep `oxlint` and `@oxlint/plugins` pinned to the same version.

Effect-specific rules are on because `effect` is a direct dependency. `bun run lint` must fail on filter-then-map chains, unknown parameters, unguarded type assertions, and the Effect tagged-value rules.

```sh
bun run lint
bun run lint:fix   # readable-spacing autofix, then lint again
```

## Live ADB without a phone

The tests use a fake `adb` in `tests/support/adb-stubs/`, so they can cover live capture without a device:

```sh
bun run test:adapters
bun run logcayo live --headless --adb tests/support/adb-stubs/one-device --serial emulator-5554
```

With no device, with several devices and no `--serial`, or with an unauthorized or offline serial, the command explains the problem and exits `1`.

## Terminal UI checks

```sh
bun run test:tui
bun run test:ui
```

`test:tui` covers chrome, key decoding, the bounded row pool, `Session` state transitions, and real PTY scenarios. The PTY scenarios start the CLI with the sanitized fixture. They check navigation, inspector layouts at 120 and 119 columns, help, burst input, zero matches, narrow chrome, the minimum-size warning, highlighting, `NO_COLOR`, quit, exit status, and terminal restoration.

Visual checks use the pinned `@kitlangton/terminal-control@0.4.1`:

```sh
bun run ui:verify --scenario inspect --out generated/ui/inspect
bun run ui:update --scenario inspect
```

`ui:verify` compares the screen against the committed styled-cell baseline. It saves the PNG, visible text, terminal cells, a compact styled snapshot, and metadata to `--out`. A missing or changed baseline fails the check and saves the expected cells and a property-level diff. It never changes a baseline.

Run `ui:update` only after you review the PNGs and the snapshot diff. It is the only command that writes `packages/tui/test/baselines/`. Generated evidence stays in the ignored `generated/` directory.

## Fixtures

- `tests/fixtures/synthetic/` holds tiny recordings for schema and CLI tests.
- `tests/fixtures/real/sanitized-aosp-pattern.lvr.jsonl` is a reviewed stand-in built from public AOSP log shapes. It contains no private device data. See `tests/fixtures/real/MANIFEST.md`.

Recordings under `sessions/` are gitignored.

## Benchmarks

Timings on shared runners are for guidance only. `bun run check` enforces the structural limits: visible row count, history size, drained queue, and filter publication.

```sh
bun run bench:headless
bun run bench:full   # filters 100,000 events with a 128 MiB history cap
```

Each JSON report records the Bun version, OS, CPU, memory, seed, line sizes, RSS and heap, filter time, and 95th-percentile navigation time. A single frames-per-second number does not prove the UI is responsive.

## Scripts

| Script | What it does |
| --- | --- |
| `bun run check` | Lint, typecheck, and headless tests |
| `bun run test:headless` | Lint and headless tests |
| `bun run test:adapters` | Process, recording, fixture, and fake-ADB tests |
| `bun run test:tui` | Terminal UI chrome, state, and PTY tests |
| `bun run test:ui` | Styled baselines, `Session` state, and PTY scenarios |
| `bun run ui:verify --scenario NAME --out PATH` | Check one UI scenario and save evidence |
| `bun run ui:update --scenario NAME` | Replace one reviewed UI baseline |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run bench:headless` | Fixed-seed ingest, burst, and filter measurement |
| `bun run bench:full` | Full-scale filter measurement |

## Releases

[release-please](https://github.com/googleapis/release-please) opens a release pull request from conventional commits on `main`. Merging it tags the version and updates `CHANGELOG.md`.

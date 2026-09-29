---
status: accepted
date: 2026-09-20
---

# Keep the direct ANSI renderer and share pure layout geometry

The original design named OpenTUI Core as the first terminal adapter. The shipped TUI writes ANSI directly (`packages/tui/src/app.ts`), and no package depends on OpenTUI. For the visual revamp we kept that renderer and added pure presentation modules (`theme.ts`, `chrome.ts`) with a fixed layout: top bar, filter row, heading row, content, bottom bar.

## Considered options

- **A. Only change colours.** Too small for the revamp goals.
- **B. Keep ANSI and share pure geometry (chosen).** No new dependencies, no change to the `Session` API.
- **C. Move to a component renderer.** New dependencies, larger startup and cleanup changes, and a second layout to reconcile, with no capability the design needed.

## Consequences

- Frames use synchronised output (`ESC[?2026h`) and cursor-home overwrite instead of clearing the screen, which removed flicker.
- References to OpenTUI in the technical design describe the original plan, not the code.

Source: visual revamp spec and goal (PR #13); the removed file is in git history at `d5ddbe4^:ai-artifacts/specs/2026-09-20-visual-revamp.md`.

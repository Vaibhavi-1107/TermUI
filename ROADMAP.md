# TermUI Roadmap

This file shows where TermUI is and where it is going. Use it to pick work that fits your skill level.

The full version with details lives in the [Roadmap wiki page](https://github.com/Karanjot786/TermUI/wiki/Roadmap).

## Current state (v0.1.x)

TermUI ships a working core today:

- Layout engine with flexbox rules
- Differential renderer (only changed cells redraw)
- JSX runtime and React-style hooks
- 13 packages, 600+ tests passing
- Theming, animations, routing, hot-reload dev server

## Waves

Work is grouped into waves. Claim any issue in an open wave.

| Wave | Focus | Status |
|---|---|---|
| Wave 1 | Core widgets | Merging now |
| Wave 2 | Beginner capabilities and adapters | Open |
| Wave 3 | Intermediate hooks, prompts, rendering | Open |
| Wave 4 | Advanced layout, registry, templates | Open |

## By difficulty

| Level | What it looks like | Where to start |
|---|---|---|
| Beginner | Single file, clear spec, 1 to 2 tests | [good first issues](https://github.com/Karanjot786/TermUI/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) |
| Intermediate | Multiple files, reads the architecture | [intermediate issues](https://github.com/Karanjot786/TermUI/issues?q=is%3Aissue+is%3Aopen+label%3A%22level%3Aintermediate%22) |
| Advanced | Multi-file, design judgment | [advanced issues](https://github.com/Karanjot786/TermUI/issues?q=is%3Aissue+is%3Aopen+label%3A%22level%3Aadvanced%22) |

## Future direction

These land after the current waves:

- Mouse support (hit-grid architecture)
- Component registry (shadcn-style)
- AI widget suite (ChatThread, ToolApproval, TokenUsage)
- Accessibility metadata for screen readers

Shape these in the open RFCs:

- [Adapters package bootstrap](https://github.com/Karanjot786/TermUI/issues/58)
- [Component registry design](https://github.com/Karanjot786/TermUI/issues/59)
- [Mouse support architecture](https://github.com/Karanjot786/TermUI/issues/60)

## How to pick work

1. Open the [project board](https://github.com/users/Karanjot786/projects/2).
2. Filter by difficulty label.
3. Read the issue. Comment "I would like to work on this".
4. Wait for assignment, then open your PR within 7 days.

Found a gap not on the roadmap? Open a new issue. New ideas are welcome.

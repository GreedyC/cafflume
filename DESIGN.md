---
name: BrewStack
description: Modern Precision Coffee Workstation
colors:
  signal: "#f35b22"
  signal-strong: "#d94712"
  canvas: "#eef0f1"
  surface: "#f8f9f9"
  surface-elevated: "#ffffff"
  graphite: "#182020"
  ink: "#121718"
  ink-muted: "#596164"
  border: "rgba(18, 23, 24, 0.13)"
typography:
  display:
    fontFamily: "Noto Sans, sans-serif"
    fontWeight: 800
  body:
    fontFamily: "Noto Sans, sans-serif"
    fontWeight: 500
  numeric:
    fontFamily: "JetBrains Mono, monospace"
    fontWeight: 600
rounded:
  xs: "6px"
  sm: "7px"
  control: "8px"
  md: "10px"
  panel: "11px"
  lg: "12px"
  legacy-control: "14px"
  game-tile: "16px"
  pill: "999px"
---

# Design System

## Direction

BrewStack is a precision coffee workstation. Its visual language comes from calibrated scales, laboratory controls, CNC interfaces, and powder-coated equipment—not cafés, national coffee cultures, craft paper, or vintage cupping ephemera.

## Composition

- The active task dominates. On the dashboard this is the live brew console, not analytics or inventory.
- Dense data uses rows, rules, and alignment. Avoid nested cards and equal-weight tile grids.
- Mobile ordering is task-first: active coffee, recipe, timer, then records.
- One persistent action per viewport; contextual repeat/cupping actions remain secondary.

## Color and Material

- Cool off-white and graphite are the primary surfaces.
- Safety orange is reserved for the current action, focus, or meaningful process signal.
- Green communicates healthy/ready states; amber and red are limited to caution and failure.
- No gradients, glassmorphism, paper grain, brass, terracotta, national palettes, or flag-based language controls.

## Type

- Noto Sans carries interface and headings across supported languages.
- JetBrains Mono is used only for timers, ratios, temperatures, scores, and measured values.
- Headings are compact, bold, and slightly tightened; functional labels stay at least 12px on mobile.

## Interaction

- Live brew is a resumable state machine: ready → running → paused → finish and rate.
- Recipe values survive refresh and interruptions in a local draft.
- Repeating a brew preloads every parameter. “Change one variable” should remain visible as the learning model.
- Language switching is a compact text control and persists in a secure same-site cookie.
- English remains the default; Turkish, Spanish, German, Norwegian, Japanese, and Korean are first-class choices. Localized surfaces must not mix languages.
- Cupping uses eight explicit sensory dimensions and never labels the result an official SCA score.

## Accessibility

- Primary touch targets are at least 44px.
- State is conveyed by text and structure, never color alone.
- Focus rings use the signal color with sufficient offset.
- Controls retain native semantics; custom radio interactions must implement full keyboard behavior.

## Approved Reference

`.impeccable/mocks/modern-industrial-live-brew.png` defines the hierarchy: live brew at the center, contextual coffee inspector beside it, records below. Its literal content and invented demonstration values are not product truth.

## Isolated Legacy Surface

The `/play` mini-game retains its own value-based tile ramp (`#4f6f58`, `#766247`, `#9a6742`, `#ae5735`, `#b8442f`, `#a92f26`, `#c68c35`, `#d6a348`, `#e2b95f`, `#e8ca78`, `#f0d68c`, `#d8733e`, `#20160d`). These colors are scoped to game state and must not enter the product workspace.

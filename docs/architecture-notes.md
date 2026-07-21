# Ollie architecture and implementation notes

This document preserves the detailed implementation context behind the concise
project overview in the README. It describes the approved submission build; it
is not a list of unfinished work.

## Runtime architecture

Ollie is a Manifest V3 Chrome extension built with vanilla HTML, CSS, and
JavaScript and no build step or runtime dependencies.

- The background service worker is the single source of truth for focus and
  break deadlines, alarms, settings, active-tab context, and commentary.
- The popup sends commands and renders sanitized state; it does not own timer
  authority or read saved keys back from storage.
- The content script owns presentation. It creates one Shadow DOM root per
  eligible page and receives tab-specific state snapshots.
- Timer rendering derives from absolute timestamps so service-worker suspension
  does not make a long-running interval authoritative.

## Distraction classification and intervention

Distraction matching uses normalized hostnames rather than raw URL substring
checks. Attack state is possible only when a focus session is running and the
tab is active in the focused Chrome window. Every background tab remains idle.
The worker tracks this through `tabs.onActivated`, `tabs.onUpdated`, and
`windows.onFocusChanged`.

The approved intervention follows notice → warning → think → hop → aim → spray
→ inspect. Ollie begins at the canonical top-right attack anchor, throws a
warning shot, waits through a six-second grace period, and then escalates over
two four-second phase boundaries if the user remains distracted. Leaving the
tab or domain, changing the active context, or stopping focus immediately
cancels the sequence and removes the ink.

During later phases Ollie travels through deliberate viewport waypoints,
anticipates each spray, and inspects the result before relocating. The warning
mark remains visible and accumulates beneath later ink. Movement and spray
cadence grow more confident without changing the cancellation rules.

The live attack uses the approved canonical Small, Medium, and Large SVG
splatters. Their silhouettes are not regenerated at runtime. Each attack gets a
fresh seeded layout with varied position, horizontal mirroring, and
satellite-droplet offsets; rotation is intentionally absent. Units render at
approximately 80% of an earlier footprint, while the Final phase uses more
units to create a clearer escalation.

Eight bounded spray events reuse a fixed pool of 33 approved SVG units and 66
offset droplets, avoiding continuous DOM creation. The approved density pass
left Warning and Phase 1 unchanged, raised Phase 2 by approximately eight
coverage points, and raised Final by approximately sixteen. Nine randomized
Phase 2 samples averaged 22.81% true visible coverage; six Final samples
averaged 48.48%. Coverage measurement uses the visible union after clipping and
overlap rather than summed nominal asset area.

All ink uses flat opaque outline, base, and shade colours; integer `<rect>`
cells; and `shape-rendering="crispEdges"`. It uses no gradients, blur,
anti-aliasing, or alpha-based overlap. The overlay remains non-interactive, and
reduced-motion rules retain phase progression without continuous movement.

## Commentary and BYOK boundary

Task-aware commentary makes at most one request at focus-session start, and
only when both an optional nonblank task and locally stored API key are present.
The background worker calls `gpt-5.6-luna`, validates the strict response, and
caches one greeting, two idle lines, two distracted lines, two break lines, and
one celebration line for the whole session.

A blank task, missing key, timeout, HTTP error, offline state, invalid JSON, or
malformed response all follow the same bundled fallback path without blocking
the timer. Generated and fallback lines are plain text and share the same
renderer.

The popup writes a user-supplied key to `chrome.storage.local`, but only the
service worker reads it. Content and popup state expose only `hasApiKey`. The
key, authorization header, and complete request are never sent to the content
script or logged. This client-side BYOK design is an explicit submission-scope
tradeoff, not secure secret storage; a production release would place API
access behind a proxy.

## Speech bubble

The production speech bubble is a coded 120×52 integer SVG frame with the
approved outline, rounded stepped corners, white fill, lower depth accent, and
yellow or grey sparkle treatment. Dynamic text is inserted with `textContent`.

The positioning controller compares the available space on every side of
Ollie's live bounding box, prefers a side that fits the 240×104 natural rendered
frame, and switches among left, right, top, and bottom tails. It clamps the
result inside a 12px viewport margin and uses orientation hysteresis to avoid
flicker. If no side fits at natural size, the coded frame scales to the
available bounds.

The bubble is mounted beside Ollie in the same moving stage. Tracking runs only
while a message is preparing, visible, or dismissing, so dragging and future
movement can update the anchor while speech remains attached. Commentary waits
briefly for unstable hop, land, aim, or spray behaviour to settle and then
follows anticipation → stepped entrance → length-aware reading pause → stepped
dismissal. If a future implementation replaces Ollie's anchor element instead
of moving it, the controller must be recreated with the replacement anchor.

## Character assets and states

Ollie's production artwork uses hand-authored role grids and reusable SVGs in
`assets/ollie-poses/`. Non-prop poses retain the canonical 24×18 canvas. Hammer
poses use 32×18 and the laptop pose uses 36×18 so props have room without
compressing Ollie's body cells or changing their scale.

The state library includes neutral idle, looking left, looking right, thinking,
holding a hammer, hammer strike, laptop work, and sleeping. Hammer heads and
laptop panels use a dedicated neutral-grey prop role. Connected hammer handles
use a separate flat brown role, leaving Ollie's body palette unchanged. The
hammer pair moves from a raised ready position to a downward impact angle. The
laptop pose leans and looks toward the screen with a tentacle at the work
surface, and the sleeping silhouette balances its weight with a visible
right-hand curl.

During an undistracted focus session, Ollie occasionally looks left or right
and alternates between laptop work and a two-pose hammer action every randomized
45–90 seconds. Thinking precedes speech. Distraction and break interrupt ambient
work immediately. Break start transitions Ollie to sleeping; returning to focus
wakes him. Pose changes use short anticipation → action → settle transitions.

Each prop-pose footprint triggers viewport clamping so the wider SVG canvas
remains visible near either edge. One inherited CSS scale renders every pose at
90% without changing grid data, viewBoxes, or pixel geometry.

## Drag behaviour

Pointer dragging updates Ollie's position in real time, clamps release to the
visible viewport, and leaves him at that position for the current page
lifetime. Idle and speech use the dragged position. Coordinates are not stored,
and reloading restores the default position.

When distraction begins, Ollie resets to the canonical top-right attack anchor
before the existing intervention runs. This keeps all tested attack origins and
ink choreography unchanged. The current build intentionally has no persistent
home-position system.

## Popup behaviour

The final popup makes Ollie the primary heading and Focus companion the
subtitle. The header character is visible only while no session is active: its
absence during focus or break represents Ollie leaving the panel to work in the
page, and it returns after the session stops or completes.

The timer card, task input, durations, helper text, and vertical spacing are
compact enough to fit without a scrollbar. The task label is a single line.
Missing-key state shows the input, a No key saved chip, and right-aligned Save
key action. Saved-key state is derived from `hasApiKey` and collapses to a Saved
chip with a right-aligned outlined Remove key action. Generated-success
implementation text is hidden; useful pending and fallback feedback remains.

## Preview and verification tools

- `docs/ollie-preview.html` shows the approved model sheet, character poses,
  controller states, speech sequencing, and prop-edge checks.
- `docs/distraction-preview.html` provides direct phase controls, the complete
  timing sequence, choreography intent, cancellation checks, and visible-union
  coverage measurement.
- `docs/speech-bubble-preview.html` provides editable text, all four tails,
  sparkle palettes, 200% inspection, edge/corner placement, and movement tests.
- `docs/ink-preview.html` preserves the approved reference and production ink
  library for visual comparison.
- `popup/popup.html?preview=empty` and
  `popup/popup.html?preview=saved-active` provide read-only popup states without
  changing extension storage.

Milestone approval evidence and the reusable regression suite are maintained in
`docs/manual-test-checklist.md`.

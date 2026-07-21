# Ollie

Ollie is a Manifest V3 Chrome extension companion that lives at the edge of
ordinary webpages. During focus sessions, the pixel-grid octopus works quietly,
reacts when the active tab drifts to a distraction site, and celebrates during
breaks.

## Status

Milestone 4 is implemented and approved after live unpacked-Chrome verification
with a user-supplied key and task-specific generated commentary. The Core Shell,
normalized distraction-domain matching, focused-window and active-tab tracking,
tab-specific state broadcasts, and Ollie's two-stage warning and gradually
accumulating pixel-ink intervention are present. During attack phases Ollie now
travels through deliberate viewport waypoints, anticipates each spray, and
inspects the result before relocating. His warning mark remains on the viewport
and accumulates beneath the later attack. The live attack uses the approved
canonical Small, Medium, and Large SVG splatters, scaled without changing their
artwork. Each attack receives a fresh seeded layout with varied position,
horizontal mirroring, and satellite-droplet offsets. Units are approximately
20% smaller, while the Final phase adds more units for a clearer escalation.

Task-aware commentary now uses a single session-start request to
`gpt-5.6-luna` when both an optional task and a locally stored BYOK key are
present. The worker validates and caches the strict structured response for the
whole session. A blank task, missing key, timeout, HTTP error, offline state, or
malformed response all use the same bundled Ollie lines without preventing the
timer from starting. Break-specific animation, celebration, and colour variants
remain sequenced for Milestone 5.

## Planned milestones

1. Scaffold
2. Core shell
3. Cross-tab distraction logic
4. GPT-5.6 integration and BYOK security
5. Break/celebrate states, colour variants, and polish

Implementation proceeds only after approval for each milestone.

Milestones 1–4 and the production speech-bubble slice are implemented and
approved. Ollie's state work is next. A further ink-polish pass has been
explicitly deferred.

The first Character Polish slice is complete: the temporary
commentary box has been replaced by a reusable coded speech bubble matching the
approved frame, with denser rounded pixel corners, a lower depth accent, white
fill, centred text-and-sparkle composition, four pointer positions, and yellow
or grey sparkle palettes. The bubble now measures available viewport space on
every visible frame, selects the best of Ollie's four sides, switches its tail,
and clamps itself inside a 12px safe margin. It is mounted beside Ollie in the
same moving stage, so future hops and dragging can move the anchor while the
bubble follows. Ink rendering, intervention choreography, timers, session
state, and GPT generation were not changed in this slice.

## Technical constraints

- Chrome Extension Manifest V3
- Vanilla HTML, CSS, and JavaScript
- No build tooling or runtime dependencies
- Pixel-grid inline SVG; no companion image assets
- Background service worker as the single source of truth
- Shadow DOM isolation for the webpage overlay
- User-supplied OpenAI key stored only in `chrome.storage.local`

## Loading the scaffold

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select this repository directory.

Start a focus session from the popup to show Ollie on eligible HTTP and HTTPS
pages. The service worker owns phase deadlines and transitions focus to break,
then back to idle.

The task field is optional. To enable task-aware commentary, paste an OpenAI API
key into the popup and choose **Save key**. The popup never reads a saved key
back from storage; it receives only a `hasApiKey` status flag. Starting with a
blank task deliberately skips the API request and uses bundled commentary.

## Repository layout

- `background/` — service worker, sessions, tab monitoring, and OpenAI client
- `assets/` — production-ready Ollie and curated ink SVGs
- `content/` — webpage overlay, pixel geometry, and animation styles
- `popup/` — extension popup UI
- `shared/` — shared constants, state, messages, storage, and validation
- `docs/` — approved visual reference, comparison preview, and manual checklist

## Ollie asset preview

Serve the repository from any local static server, then open
`docs/ollie-preview.html`. For example:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Then visit `http://127.0.0.1:4173/docs/ollie-preview.html`.

To assess the distraction intervention, open
`http://127.0.0.1:4173/docs/distraction-preview.html`. The page provides direct
controls for idle, warning, and all three attack phases, plus a real-timing
escalation sequence. Its live intent readout exposes the choreography for review,
and the controls can be collapsed so Ollie's full viewport path remains visible.
The same page reports true visible ink coverage after clipping and overlap.

To review the production speech bubble, open
`http://127.0.0.1:4173/docs/speech-bubble-preview.html`. The preview accepts
dynamic text, switches among left, right, top, and bottom pointer placements,
switches the sparkle palette, and includes a 200% inspection view. Its
attachment lab moves Ollie to edges and corners, simulates travel while he is
speaking, and offers wide, narrow, and compact viewport bounds.

The positioning controller compares the available space on each side of
Ollie's current bounding box, prefers a side that fits the 240×104 natural
frame, and uses a small orientation hysteresis to prevent tail flicker. If no
side fits at natural size, it scales the coded frame to the available bounds;
the final position is clamped inside the viewport. Tracking runs only while a
message is preparing, visible, or dismissing. Commentary waits briefly for
hop/land/aim/spray behavior to settle, then follows an anticipation → stepped
entrance → length-aware reading pause → stepped dismissal sequence.

The controller receives plain commentary text only. Generated and fallback
lines share the same renderer, while the current working state intentionally
uses the schema's `idle` pair. Celebration text is presentation-ready for the
future phase; adding that phase remains Milestone 5 state-machine work. If a
future implementation replaces Ollie's anchor element rather than moving it,
the controller must be recreated with the replacement anchor.

## Roadmap

V1.0 uses BYOK (user-supplied OpenAI API key, stored locally, never sent
server-side). A production release would move this behind a proxy so users don't
need their own API key — noted here as a known next step, not a limitation we're
unaware of.

For V1.0, only the background service worker reads the saved key and calls the
OpenAI Responses API. The key and authorization header are never included in
content-script state or logs. BYOK in `chrome.storage.local` is an MVP tradeoff,
not secure secret storage.

Next interaction milestone: make Ollie draggable and persist his position so
the default top-right placement cannot obstruct webpage controls. This is a
backlog note only; dragging is not implemented in the current milestone.

## Documentation

- [Submission and build notes](docs/submission-notes.md)
- [Ollie asset comparison](docs/ollie-preview.html)
- [Production ink library](docs/ink-preview.html)
- [Distraction intervention preview](docs/distraction-preview.html)
- [Production speech bubble preview](docs/speech-bubble-preview.html)

See `AGENTS.md` for implementation rules and milestone boundaries.

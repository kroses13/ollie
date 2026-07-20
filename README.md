# Ollie

Ollie is a Manifest V3 Chrome extension companion that lives at the edge of
ordinary webpages. During focus sessions, the pixel-grid octopus works quietly,
reacts when the active tab drifts to a distraction site, and celebrates during
breaks.

## Status

Milestone 3 is implemented and awaiting unpacked-Chrome review: the Core Shell,
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
OpenAI integration, break-specific animation, celebration, and colour variants
remain sequenced for later milestones.

## Planned milestones

1. Scaffold
2. Core shell
3. Cross-tab distraction logic
4. GPT-5.6 integration and BYOK security
5. Break/celebrate states, colour variants, and polish

Implementation proceeds only after approval for each milestone.

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

## Roadmap

V1.0 uses BYOK (user-supplied OpenAI API key, stored locally, never sent
server-side). A production release would move this behind a proxy so users don't
need their own API key — noted here as a known next step, not a limitation we're
unaware of.

Next interaction milestone: make Ollie draggable and persist his position so
the default top-right placement cannot obstruct webpage controls. This is a
backlog note only; dragging is not implemented in the current milestone.

## Documentation

- [Submission and build notes](docs/submission-notes.md)
- [Ollie asset comparison](docs/ollie-preview.html)
- [Production ink library](docs/ink-preview.html)
- [Distraction intervention preview](docs/distraction-preview.html)

See `AGENTS.md` for implementation rules and milestone boundaries.

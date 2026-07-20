# Ollie

Ollie is a Manifest V3 Chrome extension companion that lives at the edge of
ordinary webpages. During focus sessions, the pixel-grid octopus works quietly,
reacts when the active tab drifts to a distraction site, and celebrates during
breaks.

## Status

Milestone 2 Core Shell is implemented: the approved neutral Ollie asset, popup
controls, alarms-backed focus/break timer, Shadow DOM page injection, and idle
bob are present. Cross-tab distraction logic, OpenAI integration, break-specific
animation, celebration, and colour variants remain sequenced for later
milestones.

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
- `assets/` — production-ready standalone Ollie SVG
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

See `AGENTS.md` for implementation rules and milestone boundaries.

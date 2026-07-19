# Ollie

Ollie is a Manifest V3 Chrome extension companion that lives at the edge of
ordinary webpages. During focus sessions, the pixel-grid octopus works quietly,
reacts when the active tab drifts to a distraction site, and celebrates during
breaks.

## Status

Milestone 2 visual-asset slice: the approved neutral Ollie pixel grid, standalone
SVG, reusable renderer, and comparison preview are present. Timer logic,
browser behavior, extension UI, and animation remain unimplemented.

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

The current scaffold loads, but its popup and page companion are placeholders.

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

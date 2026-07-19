# Manual test checklist

Use this checklist after implementing each milestone. Record anything that could
not be tested; do not claim end-to-end verification without exercising Chrome.

## Milestone 1 — Scaffold

- [ ] `manifest.json` parses successfully.
- [ ] The repository loads as an unpacked extension.
- [ ] The placeholder popup opens.
- [ ] The service-worker console has no startup errors.
- [ ] No secret or local environment file is tracked.

## Milestone 2 — Core shell

- [ ] The approved reference appears beside the production SVG in the preview.
- [ ] The neutral SVG matches the approved silhouette, proportions, expression,
      and palette as closely as practical on the fixed grid.
- [ ] The 24px, 32px, and 48px previews have crisp pixel edges.
- [ ] The action tentacle is a separate `#ollie-action-tentacle` SVG group.
- [ ] Changing Ollie CSS variables recolours the expected pixel roles.
- [ ] Start and stop a focus session from the popup.
- [ ] Timer state is derived from a stored end timestamp.
- [ ] The alarm completes the focus phase after the popup closes.
- [ ] Stored timestamps provide best-effort recovery after a worker restart.
- [ ] Exactly one Shadow DOM root appears on each eligible page.
- [ ] Host-page CSS does not visibly alter Ollie.
- [ ] Ollie renders as pixel-grid SVG and plays the idle animation.
- [ ] Reloading or SPA navigation does not create duplicate roots.

## Milestone 3 — Cross-tab distraction logic

- [ ] Exact distraction hosts and intended subdomains match.
- [ ] Lookalike hosts such as `notreddit.com` do not match.
- [ ] A matching active tab in the focused window enters attack state.
- [ ] A matching background tab remains idle.
- [ ] Switching tabs updates both the old and new tab correctly.
- [ ] Switching Chrome windows updates Ollie correctly.
- [ ] Updating an active tab's URL updates Ollie correctly.
- [ ] Repeated state broadcasts do not restart the ink attack continuously.

## Milestone 4 — GPT-5.6 integration and security

- [ ] The popup saves the API key to `chrome.storage.local`.
- [ ] The service worker is the only context that reads the key.
- [ ] Content-script messages and state never contain the key.
- [ ] Logs never contain the key or authorization header.
- [ ] At most one commentary request occurs per session start.
- [ ] Valid generated lines are cached and displayed as text.
- [ ] Missing key, timeout, HTTP failure, or malformed output uses bundled lines.
- [ ] An OpenAI failure does not prevent the focus session from starting.

## Milestone 5 — Break, celebrate, colours, and polish

- [ ] Focus completion triggers celebration once.
- [ ] Break state uses its intended movement.
- [ ] Session completion returns Ollie to the intended idle state.
- [ ] Every colour changes body cells without separate companion assets.
- [ ] Changing colour persists and updates open tabs.
- [ ] Ollie does not block ordinary page interaction.
- [ ] A typical site, an SPA, and a restricted Chrome page fail or render cleanly.

# Manual test checklist

Use this checklist after implementing each milestone. Record anything that could
not be tested; do not claim end-to-end verification without exercising Chrome.

## Milestone 1 — Scaffold

- [X] `manifest.json` parses successfully.
- [X] The repository loads as an unpacked extension.
- [X] The placeholder popup opens.
- [X] The service-worker console has no startup errors.
- [X] No secret or local environment file is tracked.

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
- [ ] Warning starts with a restless gesture and one approved Medium splatter
      near Ollie; its visible coverage remains below 5%.
- [ ] The warning splatter appears at the spray moment, remains stationary
      through warning-wait and every attack phase, and clears only on idle.
- [ ] Attack does not begin before the configured six-second grace period.
- [ ] Leaving during the grace period cancels all pending attack phases.
- [ ] Staying triggers approximately 8–12%, then 15–20%, then 30–35%
      viewport splatter coverage.
- [ ] Each choreography spray reveals only its bounded event group rather than
      revealing a full phase simultaneously.
- [ ] Ollie moves inward before spraying and the first attack marks originate
      near him, so movement and ink read as one action.
- [ ] After the warning, Ollie leaves the top-right corner and uses short,
      stepped hops between deliberate viewport waypoints.
- [ ] Each stop reads as think → hop → land → aim → spray → inspect before the
      next relocation begins.
- [ ] Phase one completes both character-led sprays before its four-second phase
      ends; phase two completes all three before its four-second phase ends.
- [ ] Later phases shorten the average think, travel, and inspection cadence so
      Ollie appears increasingly confident rather than merely adding more ink.
- [ ] At least two relocations briefly pass behind existing ink before Ollie
      emerges to aim and spray.
- [ ] Every attack mark is an SVG made from crisp square cells with a stepped
      silhouette; there are no rounded blobs, gradients, blur, or soft edges.
- [ ] Leaving the tab/domain or ending focus immediately hides all attack ink.
- [ ] Repeated distracted-state broadcasts do not restart the grace period.
- [ ] The ink field does not capture pointer or keyboard interaction.
- [ ] Reduced-motion mode removes character and splatter motion while preserving
      paced decisions, spray progression, and intervention stages.
- [ ] The attack reuses its fixed pool of twenty splatter SVG elements across
      eight spray events, allocated 4/4/2/2/2/2/2/2, plus forty bounded offset
      droplets created once with the field.
- [ ] `docs/distraction-preview.html` exposes idle, warning, phase one, phase
      two, and final states without duplicating production rendering logic.
- [ ] The preview's real-timing sequence follows the configured 6s → 4s → 4s
      escalation and can be cancelled from its control panel.
- [ ] The preview reports Ollie's current intent and its panel can collapse so
      bottom-edge and behind-ink travel remain visible.

### Interaction backlog — not implemented

- [ ] Make Ollie draggable and persist his position so the default top-right
      placement cannot obstruct webpage controls.

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

## Verification record — 2026-07-20

Core Shell checks completed in the implementation environment:

- Manifest JSON, JavaScript syntax, SVG XML, and Git whitespace checks pass.
- Fixed-timestamp transition checks produce `focus`, then `break`, then `idle`.
- The packaged popup layout and approved Ollie mark render correctly in a
  browser preview.
- Runtime source contains none of the deferred polish-pass concepts.

Still requires manual verification after loading the unpacked extension in
Chrome:

- Alarm behavior while the popup is closed.
- Best-effort recovery after suspending the service worker or restarting Chrome.
- Shadow DOM injection, one-root enforcement, and idle bob on real host pages.
- Focus-to-break broadcast updates across already-open eligible tabs.
- Service-worker and content-script console inspection.

## Verification record — 2026-07-20 (Milestone 3)

Checks completed in the implementation environment:

- Exact and subdomain matches pass for YouTube, Youtu.be, X, Twitter, Reddit,
  Instagram, and TikTok.
- Lookalike domains such as `notreddit.com` and `youtube.com.example.org` remain
  on-task.
- A fixed state projection marks only the focused active tab as distracted.
- The same active distraction state projects as idle for a background tab and
  during a break phase.
- Manifest JSON, JavaScript syntax, and Git whitespace checks pass.
- A controllable-clock check confirms warning → first phase → second phase →
  final phase timing at 6s, 4s, and 4s.
- Repeated distracted states do not restart the warning timer, and clearing the
  state cancels a pending warning or active attack immediately.
- Runtime construction is bounded to twenty reusable authored SVG units and
  forty small offset satellite droplets across the same eight spray events;
  the overlay remains non-interactive and keeps the reduced-motion ruleset.
- The live renderer uses only the approved canonical Small, Medium, and Large
  assets. Every asset retains flat opaque fills and
  `shape-rendering="crispEdges"`; scale changes do not alter their silhouettes.
- A 120-layout true visible-union sample at 1280×900 measured mean coverage of
  6.05% first-phase, 13.97% second-phase, and 32.13% final-phase. Observed
  ranges were 5.70–6.22%, 12.54–15.05%, and 29.41–35.05%. The randomized
  warning averaged 0.66% and remained below 0.8% in the sample.
- The same randomized sample measured mean 6.30% / 13.26% / 29.71% at
  1024×768 and 6.28% / 14.46% / 33.12% at 1440×900.
- The preview's live readout draws the actual rendered SVG assets into a
  sampling canvas with their current translation and horizontal mirroring, so
  overlapping opaque pixels count once rather than adding nominal asset areas.
- A state-selector audit confirms the stationary warning mark is hidden during
  notice/aim, appears on warning spray, persists through inspect/warning-wait
  and `attack-one`/`attack-two`/`attack-final`, then clears on idle. It is the
  same asset, scale, and position as the first Phase 1 unit, so persistence does
  not change the confirmed attack-phase coverage union.
- All three canonical ink assets use `#100d11` outline, `#4a414d` base, and
  `#29222c` shade. Their approved cell layout, shading, protrusions, satellite
  droplets, and proportions are unchanged by integration.
- Each new warning run generates and records a fresh local layout seed. Units
  in the same event use stratified angles and wider Phase 2 radii, while units
  from different events remain free to overlap. Only static transforms and a
  bounded droplet pool are used; no recurring DOM creation is introduced.
- Computed animation checks confirm both ear groups share the same synchronized
  effort animation during Phase 2 aim and spray moments.
- A permanent distraction preview now provides direct state toggles and a
  cancellable real-timing sequence using the production renderer, ink pool,
  animation styles, and timing constants.
- A timed browser trace confirms `think → hop → aim → spray → inspect`, one
  bounded event-group reveal per spray, two early events in 3.18s, three middle
  events in 3.74s, and an
  immediate reset to the home position with zero visible marks on cancellation.
- A full real-timing preview remains in warning with zero large splatters at 5s,
  then finishes all eight sprays away from the home corner by 17.7s.
- Reduced-motion emulation disables the stage transition and character
  animation while preserving the same two-mark phase-one progression.
- Page controls remained clickable during the final phase, and cancelling the
  distracted state removed the ink within the configured fade window.

Still requires manual verification after loading the unpacked extension in
Chrome:

- `tabs.onActivated` returns the previous tab to idle and reacts only in the new
  active tab.
- `tabs.onUpdated` reacts when the focused active tab enters or leaves a listed
  hostname.
- `windows.onFocusChanged` clears the reaction when Chrome loses focus and
  restores the correct state in the newly focused Chrome window.
- Repeated distracted-state broadcasts do not restart the grace period.
- Background tabs continue the normal idle bob throughout tab and window
  switches.
- Reduced-motion behavior remains static while preserving warning and
  escalation timing.
- Confirm the refined coverage and event-by-event accumulation in an unpacked
  Chrome run on representative real webpages.

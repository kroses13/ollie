# Manual test checklist

Use this checklist after implementing each milestone. Record anything that could
not be tested; do not claim end-to-end verification without exercising Chrome.

## Current milestone sequence

| Milestone | Status |
|---|---|
| 1 — Scaffold | Complete and approved |
| 2 — Core shell | Complete and approved |
| 3 — Cross-tab distraction logic | Complete and approved |
| 4 — GPT-5.6 integration and security | Complete, live-verified, and approved |
| 5A — Production speech bubble | Complete and approved |
| 5B — Ollie's states | Next |
| 5C — Ink polish | Broad polish deferred; approved density adjustment complete |

Unchecked items inside completed milestones remain useful regression scenarios;
they do not override the recorded human approval for those milestones.

## Milestone 1 — Scaffold

**Status:** Complete and approved.

- [X] `manifest.json` parses successfully.
- [X] The repository loads as an unpacked extension.
- [X] The placeholder popup opens.
- [X] The service-worker console has no startup errors.
- [X] No secret or local environment file is tracked.

## Milestone 2 — Core shell

**Status:** Complete and approved. Unchecked items remain regression checks.

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

**Status:** Complete and approved. A targeted later-density adjustment was
approved on 2026-07-21; preserve that intervention while Ollie's states are
developed.

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
- [ ] Staying preserves Phase 1 near its approved baseline, then reaches
      approximately 22% in Phase 2 and 48% in Final.
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
- [ ] The attack reuses its fixed pool of 33 splatter SVG elements across eight
      spray events, allocated 4/4/4/4/4/5/5/3, plus 66 bounded offset droplets
      created once with the field.
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

**Status:** Complete, live-verified with a real key, and approved.

- [ ] A focus session starts when the optional task field is blank.
- [ ] A blank task makes no OpenAI request and uses the shared bundled lines.
- [ ] The popup saves the API key to `chrome.storage.local`.
- [ ] The popup can replace and remove the stored key without reading it back.
- [ ] The service worker is the only context that reads the key.
- [ ] Content-script messages and state never contain the key.
- [ ] Logs never contain the key or authorization header.
- [ ] At most one commentary request occurs per session start.
- [X] The request uses `gpt-5.6-luna` and the exact greeting/idle/distracted/
      break/celebrate structured schema.
- [ ] Valid generated lines are cached and displayed as text.
- [ ] Animation ticks, phase changes, and tab changes do not make another call.
- [ ] Missing key, timeout, HTTP failure, or malformed output uses bundled lines.
- [ ] An OpenAI failure does not prevent the focus session from starting.

## Milestone 5A — Production speech bubble

**Status:** Complete and approved on 2026-07-21. The detailed verification
record appears at the end of this document.

## Milestone 5B — Ollie's states

**Status:** Next implementation milestone. Do not alter the approved speech
bubble or ink system while this work is in progress.

- [ ] Focus completion triggers celebration once.
- [ ] Idle/work has a readable neutral behavior and does not compete with the
      page.
- [ ] Distracted behavior communicates notice, warning, and increasing
      confidence without changing intervention timing or ink allocation.
- [ ] Break state uses its intended playful movement and cached break lines.
- [ ] Celebration reads as a distinct one-time state and uses the cached
      celebration line.
- [ ] Session completion returns Ollie to the intended idle state.
- [ ] State transitions do not leave stale transforms, bubbles, or temporary
      character attributes behind.
- [ ] Speech waits for a stable character moment and remains attached during
      movement in every state.
- [ ] Every colour changes body cells without separate companion assets.
- [ ] Changing colour persists and updates open tabs.
- [ ] Ollie does not block ordinary page interaction.
- [ ] A typical site, an SPA, and a restricted Chrome page fail or render cleanly.

## Milestone 5C — Ink polish — broadly deferred

**Status:** A narrowly approved density adjustment is complete. Phase 2 now
adds 12 units across its unchanged three spray events, and Final adds 13 more
across its unchanged three events. Canonical artwork, choreography,
cancellation, timing, Warning, and Phase 1 are unchanged. Do not start further
visual ink refinement until it is explicitly rescheduled.

### Verification record — 2026-07-21 (density adjustment)

- The existing eight spray events and all intervention timing remain unchanged.
- Event allocation changed from `4/4/2/2/2/2/2/2` to
  `4/4/4/4/4/5/5/3`; all added elements reuse the approved canonical Medium or
  Large SVGs and the existing horizontal-flip/jitter system.
- Nine randomized Phase 2 preview runs measured a 22.81% mean, with a
  21.18–24.90% observed range. This is approximately 8.84 percentage points
  above the previous 13.97% reference baseline.
- Six randomized Final preview runs after final tuning measured a 48.48% mean,
  with a 47.06–50.17% observed range. This is approximately 16.35 percentage
  points above the previous 32.13% reference baseline.
- Warning, Phase 1, phase durations, spray-event count, choreography,
  cancellation, tab scoping, detection, privacy behavior, and SVG silhouettes
  were not modified.

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

## Verification record — 2026-07-20 (Milestone 4)

Checks completed in the implementation environment:

- A simulated extension-worker run accepted a blank task, started focus, used
  the bundled commentary, and made zero API requests.
- The same simulation confirmed a nonblank task with no stored key uses the
  identical bundled fallback and makes zero API requests.
- Saving a test-only placeholder key, starting a nonblank task, and returning a
  valid structured response produced exactly one request and cached the
  generated lines in the session.
- Removing the key cleared its dedicated `chrome.storage.local` entry and
  updated only the public `hasApiKey` metadata flag.
- Local storage access is restricted to trusted extension contexts. The popup
  writes but never reads the key, then sends the worker a key-free status
  command; only the worker reads the stored value.
- Serialized popup/content state did not contain the test-only key. Source
  inspection and the message simulation confirm neither state nor runtime
  commands contain it, and the storage read/request call sites are reachable
  only from the background worker.
- The request body uses `gpt-5.6-luna` and a strict schema containing
  `greeting`, two `idle` lines, two `distracted` lines, two `break` lines, and
  `celebrate`.
- Mocked offline, HTTP-error, invalid-JSON, and malformed-schema responses were
  rejected at the same client boundary and handled by the worker's one fallback
  path.
- A hanging mocked request was aborted by the configured 8,000ms timeout.
- JavaScript syntax, manifest JSON, Git whitespace, and credential-pattern
  scans pass.

Still requires manual verification after loading the unpacked extension in
Chrome:

- Visually inspect the popup key controls and Ollie speech bubble on real pages.
- Confirm popup-driven key save, replacement, and removal in extension storage.
- Confirm a blank task starts immediately and shows bundled commentary.
- Inspect the network panel and all extension/page consoles to confirm one call
  per eligible session, no calls from ticks or state changes, and no key or
  authorization-header logging.
- Exercise an invalid key and offline mode in Chrome and confirm both preserve
  the active focus session while showing the bundled-line status.

## Verification record — 2026-07-21 (Milestone 4 live approval)

The project owner completed a live unpacked-Chrome session with a real
user-supplied key and a nonblank task:

- The stored `commentarySource` was inspected through the service-worker
  console and confirmed as `generated`, not `fallback`.
- All eight cached lines were inspected: one greeting, two idle, two
  distracted, two break, and one celebrate line.
- The generated lines were confirmed to reference the submitted task rather
  than reading as generic commentary.
- This verifies that `gpt-5.6-luna` accepted the live request, the task text was
  part of the request, the strict response passed validation, and the result
  was cached in the active session.
- No real key, task text, or generated line content is reproduced in this
  repository record.

Milestone 4 was manually approved after this verification. Unchecked scenarios
above remain useful regression checks and are not implied by this approval.

## Character Polish — production speech bubble

**Status:** Complete and approved on 2026-07-21.

- [X] The coded frame matches the approved reference's near-black keyline,
      denser rounded pixel corners, solid white fill, and cool-grey lower depth
      accent.
- [X] The canonical component orientation keeps its stepped pointer on the
      lower-left edge.
- [X] Left, right, top, and bottom pointer geometry allows the bubble to occupy
      any of Ollie's four sides without rotating the text.
- [X] Commentary and the sparkle form one centred content group inside the
      bubble.
- [X] The two-tone pixel sparkle supports yellow and grey palettes, appears for
      short commentary, and remains clear of the text.
- [X] Long commentary uses the wider interior, hides the decorative sparkle,
      wraps naturally, and remains fully inside the frame without clipping.
- [X] Commentary is inserted only through `textContent` and updates without
      recreating the component.
- [X] Generated and fallback commentary render identically; the bubble receives
      plain text and has no source-specific presentation branch.
- [X] Greeting, idle/working, distracted, break, and celebration commentary all
      select the expected cached line shape.
- [X] The appearance sequence reads as anticipation → stepped entrance →
      readable pause → stepped dismissal without flicker.
- [X] A bubble requested during hop, land, emerge, aim, or spray waits briefly
      for a stable character moment before entering.
- [X] At each viewport edge, the controller selects a fitting top, bottom, left,
      or right position and changes the tail to point back toward Ollie.
- [X] Edge and corner placements remain within the 12px viewport safe margin
      and do not overlap Ollie when another side can fit.
- [X] Long and short copy remain readable in wide, narrow, and compact bounds;
      the frame and tail do not overflow the viewport.
- [X] While Ollie's anchor moves, the visible bubble follows continuously and
      recalculates its side without becoming fixed to the old viewport point.
- [X] `docs/speech-bubble-preview.html` supports editable copy, all four pointer
      positions, both sparkle palettes, production size, a 200% inspection
      view, edge/corner movement, and wide/narrow/compact bounds.
- [X] Ink behavior, intervention timing, Ollie choreography, GPT generation,
      timer authority, and the session state machine remain unchanged.

### Verification record — 2026-07-21

Checks completed in the implementation environment:

- The refined production component renders from a 120×52 integer SVG viewBox
  at exactly two CSS pixels per grid unit, with
  `shape-rendering="crispEdges"`; outline, depth, fill, and sparkle remain
  separate coded layers.
- Browser inspection confirmed the 240×104 production render and its 200%
  scale preserve the stepped silhouette and hard pixel edges.
- Left, right, top, and bottom controls each reveal exactly one matching coded
  tail group without rotating or transforming the text.
- Computed layout checks confirm the content group and bubble share the same
  horizontal centre, with both flex alignment and text alignment set to centre.
- Yellow and grey sparkle controls switch the palette without rebuilding the
  component.
- Live preview input updated both component instances through `textContent`.
- A 119-character sample switched to the long-copy layout, hid the sparkle,
  wrapped with no horizontal or vertical text overflow, and remained inside
  the coded frame at a compact 196×84 render.
- Automated browser geometry checks placed Ollie at the left, right, top, and
  bottom edges. The bubble selected right/left/bottom/top respectively, used
  the matching inward-facing tail, remained fully contained, and did not
  overlap Ollie.
- Compact top-left and bottom-right corner checks remained contained and
  selected bottom/top placement with matching top/bottom tails.
- The attachment lab verifies the same plain-text renderer independently of
  commentary source. Runtime selection covers greeting, the idle pair used for
  working, distracted, break, and the presentation-ready celebration string.
- Tracking uses Ollie's live `getBoundingClientRect()` while the bubble is
  visible, with a 12px safe margin, 8px anchor gap, and 48px orientation
  hysteresis. It is requestAnimationFrame-bound and stops after dismissal.
- Seven samples taken during a stepped cross-canvas trip remained inside the
  preview bounds and did not overlap Ollie, including the live right-to-left
  tail handoff.
- The bubble and Ollie are siblings in the same stage. Moving or dragging the
  existing anchor is supported; replacing the anchor node requires recreating
  the controller.
- The preview's “Speak after hop” control holds the bubble through a simulated
  unstable behavior, then permits the normal anticipation and entrance after
  the stage returns to idle.
- JavaScript syntax, manifest JSON, SVG XML, and Git whitespace checks pass.

Optional regression checks after future state work:

- Compare the production and 200% views directly with the approved reference.
- Inspect the production bubble beside Ollie in the unpacked extension on
  representative webpages.
- Confirm the anticipation, reading pause, and natural dismissal subjectively
  match Ollie's character in a live focus session.

# Ollie verification record

This document records the completed submission milestones, the evidence used to
approve them, and the regression scenarios worth repeating after future
changes. Unchecked boxes appear only in the regression section; they are not
statements about current milestone completion.

## Submission status

| Milestone | Status | Approval |
|---|---|---|
| 1 — Scaffold | Complete | Approved 2026-07-19 |
| 2 — Core shell | Complete | Approved 2026-07-20 |
| 3 — Cross-tab distraction and ink intervention | Complete | Approved 2026-07-20; final density adjustment approved 2026-07-21 |
| 4 — GPT-5.6 integration and BYOK security | Complete and live-verified | Approved 2026-07-21 |
| 5A — Production speech bubble | Complete | Approved 2026-07-21 |
| 5B — Character states, props, and ambient behaviour | Complete | Approved 2026-07-21 |
| 5C — Basic drag repositioning | Complete | Approved 2026-07-21 |
| 5D — Final popup UX | Complete | Approved 2026-07-21 |

The currently planned submission milestones are complete. Optional additions
are listed separately under Future Improvements.

## Milestone 1 — Scaffold

The repository was established as a directly loadable Manifest V3 Chrome
extension using vanilla HTML, CSS, and JavaScript, with no build step or runtime
dependencies.

Verification summary:

- `manifest.json` parsed and the unpacked extension loaded successfully.
- The popup and service worker started without startup errors.
- Repository structure, `.gitignore`, implementation guidance, and manual
  verification documentation were established before feature work.
- No credential or local environment file was committed.

## Milestone 2 — Core shell

The service worker owns focus/break timestamps and alarms; the popup sends
commands; the content script renders one Shadow DOM companion on eligible HTTP
and HTTPS pages.

Verification summary:

- Fixed-time checks produced the expected focus → break → idle sequence.
- Timer rendering derives from stored absolute end timestamps rather than a
  long-running authoritative interval.
- Best-effort recovery uses stored session timestamps.
- The approved Ollie reference was reproduced as a structured 24×18 SVG role
  grid with integer `<rect>` cells and `crispEdges`.
- Reference, 24px, 32px, and 48px previews confirmed the production silhouette
  and hard pixel treatment.
- The action tentacle remains an independently targetable SVG group.
- Shadow DOM styling, duplicate-root prevention, and passive page interaction
  are implemented in the production content script.

## Milestone 3 — Cross-tab distraction and ink intervention

Distraction state is derived from normalized hostnames and is valid only for
the active tab in the focused Chrome window during a focus session. The
approved intervention uses a warning grace period followed by three
character-led escalation phases.

Verification summary:

- Exact and deliberate subdomain matches passed for the configured services;
  lookalikes such as `notreddit.com` and `youtube.com.example.org` remained
  on-task.
- State projection marked only the focused active tab as distracted; background
  tabs and break state remained idle.
- `tabs.onActivated`, `tabs.onUpdated`, and `windows.onFocusChanged` are wired
  through the worker-owned tab context.
- A controllable clock confirmed the 6s warning grace period followed by 4s and
  4s escalation intervals. Repeated state broadcasts did not restart the
  intervention, and leaving the tab/domain or stopping focus cancelled it.
- Warning ink persists through later phases and clears when the intervention
  ends.
- Eight bounded spray events reuse a fixed pool of 33 approved SVG units and 66
  offset droplets; no continuous DOM creation occurs.
- Canonical ink uses flat opaque outline/base/shade colours, integer cells,
  horizontal mirroring only, and no gradients, blur, or rotation.
- The approved density adjustment retained Warning and Phase 1 behaviour. Nine
  randomized Phase 2 samples averaged 22.81% visible coverage; six Final
  samples averaged 48.48%.
- Choreography follows notice → warning → think → hop → aim → spray → inspect,
  with later phases increasing Ollie's confidence and cadence.
- The overlay remains non-interactive, and reduced-motion rules preserve state
  progression without continuous movement.
- `docs/distraction-preview.html` exercises production rendering, direct phase
  controls, cancellation, full timing, and visible-union coverage measurement.

## Milestone 4 — GPT-5.6 integration and BYOK security

Task-aware commentary is an optional enhancement. A nonblank task may trigger
one `gpt-5.6-luna` request at session start; a blank task or any request failure
uses the same bundled fallback without blocking the timer.

Verification summary:

- The strict cached schema contains one greeting, two idle lines, two
  distracted lines, two break lines, and one celebration line.
- Simulated blank-task and missing-key sessions made no request and used bundled
  commentary.
- Valid simulated output produced exactly one request and remained cached across
  animation, phase, tab, and window updates.
- Offline, HTTP-error, invalid-JSON, malformed-schema, and timeout paths all
  resolved through the same fallback.
- A live unpacked-Chrome session with a real user key produced
  `commentarySource: generated`; all eight returned lines were confirmed to be
  specific to the supplied task. No real key, task, or generated copy is stored
  in this repository.
- The popup writes the user key to `chrome.storage.local`; only the service
  worker reads it. Content state exposes only `hasApiKey`.
- Credential, authorization-header, and complete-request logging are absent.

## Milestone 5A — Production speech bubble

The temporary commentary box was replaced by a coded, dynamic pixel speech
bubble that treats generated and fallback text identically.

Verification summary:

- The 120×52 integer SVG frame preserves the approved outline, rounded stepped
  corners, white fill, lower depth accent, and yellow/grey sparkle treatment.
- Dynamic copy is inserted through `textContent`; long text wraps without
  clipping and generated/fallback content uses the same renderer.
- Left, right, top, and bottom tails were verified at viewport edges and
  corners with a 12px safe margin.
- The controller selects available space, avoids Ollie when practical, follows
  his live bounding box, and uses orientation hysteresis to prevent flicker.
- Speech waits for unstable movement states to settle, then follows
  anticipation → entrance → reading pause → dismissal.
- `docs/speech-bubble-preview.html` retains editable text, all orientations,
  both sparkle palettes, compact bounds, edge/corner checks, and movement
  verification.

## Milestone 5B — Character states, props, and ambient behaviour

Ollie's approved production state set is implemented without changing the
canonical base scale or palette.

Verification summary:

- Hand-authored grids cover looking left, looking right, thinking, holding a
  hammer, hammer strike, laptop work, and sleeping.
- Non-prop poses retain the 24×18 canvas. Hammer poses use 32×18 and laptop work
  uses 36×18 so props do not compress Ollie's body.
- Hammer heads and laptop panels use neutral grey; connected hammer handles use
  a separate flat brown role. The laptop pose includes a working lean and
  contacting tentacle; sleeping has a balanced right curl.
- Ambient focus behaviour randomizes directional looks and alternates laptop
  and two-pose hammer work every 45–90 seconds.
- Thinking precedes speech. Distraction, break, and other higher-priority states
  interrupt ambient work immediately.
- Break enters sleeping; returning to focus wakes Ollie and restores idle.
- All six left/right prop-edge footprint checks passed using the production
  viewport clamp.
- One inherited CSS scale renders every page pose at 90% without altering grid
  data, viewBoxes, or `crispEdges`.
- `docs/ollie-preview.html` retains the approved model sheet, pose comparison,
  live controller, speech sequence, and edge checks.

## Milestone 5C — Basic drag repositioning

Ollie can be repositioned for the current page lifetime without introducing a
persistent home-position system.

Verification summary:

- Pointer dragging updates Ollie's position in real time and clamps release to
  the viewport.
- A live drag moved Ollie independently of choreography transforms; extreme
  top-left and bottom-right drags clamped correctly.
- Idle and speech continue from the dragged position.
- Distraction restores the canonical top-right attack anchor before running the
  unchanged intervention choreography.
- Reloading restores the default position; no drag coordinate is persisted.

## Milestone 5D — Final popup UX

The popup is compact, reflects real session/key state, and preserves the
intentional metaphor that Ollie leaves the panel while working on the page.

Verification summary:

- Ollie is the primary heading and Focus companion is the subtitle.
- Header Ollie is visible only while idle, hidden during focus and break, and
  restored after stop or completion.
- Timer card, task input, duration controls, helper copy, and vertical spacing
  fit without a popup scrollbar.
- The optional task label appears on one line.
- Missing-key state shows the entry field, No key saved chip, and right-aligned
  primary Save key action.
- Saved-key state derives from `hasApiKey` and collapses to a Saved chip plus a
  right-aligned outlined Remove key action. The popup never reads the key back.
- Generated-success implementation text is hidden; only useful pending/fallback
  feedback remains available.
- Read-only local review states use the production renderer for idle/no-key and
  active/saved inspection without changing extension storage.

## Regression checklist

Repeat the relevant checks after future changes. Record the date and result in
the pull request, release notes, or a new verification entry rather than
changing completed milestone status.

### Extension lifecycle and page safety

- [ ] Load/reload the unpacked extension and inspect worker/page consoles.
- [ ] Start and stop focus from the popup; allow an alarm to complete while the
      popup is closed.
- [ ] Suspend/restart the worker or browser and confirm best-effort timestamp
      recovery.
- [ ] Confirm exactly one Shadow DOM root on a typical site and an SPA after
      navigation/reinjection.
- [ ] Confirm host CSS cannot restyle Ollie and restricted Chrome pages fail
      quietly.
- [ ] Confirm passive overlays do not block ordinary pointer or keyboard use.

### Cross-tab distraction

- [ ] Exercise exact matches, intended subdomains, and lookalike false positives.
- [ ] Switch tabs and Chrome windows; confirm only the focused active tab can
      attack and every background tab remains idle.
- [ ] Navigate the active tab into and out of a distracting hostname.
- [ ] Leave during warning and during each attack phase; confirm immediate
      cancellation and ink removal.
- [ ] Confirm repeated state broadcasts do not restart warning or escalation.
- [ ] Recheck reduced-motion pacing and representative viewport coverage.

### Commentary and secret handling

- [ ] Start with a blank task and confirm no OpenAI request occurs.
- [ ] Save, remove, and re-add a key through the popup without logging it.
- [ ] Run one task-aware session and confirm exactly one request and cached
      task-specific lines.
- [ ] Exercise missing-key, invalid-key, offline, timeout, and malformed-output
      fallback while preserving the active focus session.
- [ ] Inspect worker, popup, page, state, and network views for key or
      authorization-header exposure.

### Character presentation

- [ ] Recheck all production poses, prop-edge clamping, and 90% display scale.
- [ ] Confirm ambient laptop/hammer work is interrupted by distraction and break.
- [ ] Drag to all viewport edges, speak from the dragged position, then confirm
      distraction resets to the attack anchor.
- [ ] Recheck short/long speech at each edge and corner.
- [ ] Confirm sleeping/wake and idle restoration after stop or completion.

### Popup

- [ ] Verify idle, focus, break, and stopped header-character visibility in the
      unpacked extension.
- [ ] Verify empty-key and saved-key controls against real local storage.
- [ ] Confirm optional blank task, compact layout, and scrollbar-free rendering.

## Future Improvements

These are intentionally outside the completed submission milestones:

- Further ink polish beyond the approved submission baseline.
- Additional character animation refinement and expanded states, including a
  hop cycle and celebration presentation.
- Colour variants.
- Persistent drag position and a formal home-position system.
- A production proxy so users do not need to supply their own OpenAI API key.

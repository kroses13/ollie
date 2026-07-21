# Ollie

Ollie is a Manifest V3 Chrome extension companion that lives at the edge of
ordinary webpages. During focus sessions, the pixel-grid octopus works quietly,
reacts when the active tab drifts to a distraction site, and sleeps during
breaks.

## Status

The submission build includes the approved Core Shell, cross-tab distraction
intervention, live-verified GPT-5.6 commentary, production speech bubble, basic
dragging, and production character-state pass. Normalized hostname matching,
focused-window and active-tab tracking, tab-specific state broadcasts, and
Ollie's two-stage warning and gradually accumulating pixel-ink intervention are
present. During attack phases Ollie
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
timer from starting. The production character library now also includes the
approved looking-left, looking-right, thinking, holding-hammer, hammer-strike,
laptop-work, and sleeping poses.
The final popup pass makes Ollie the primary header title, compacts the timer and
form, keeps the header character visible only while no session is active, and
shows genuinely different missing-key and saved-key states. This layout is
approved for the submission build. Celebration and
colour variants remain explicitly deferred beyond the submission build.

## Planned milestones

1. Scaffold
2. Core shell
3. Cross-tab distraction logic
4. GPT-5.6 integration and BYOK security
5. Break/celebrate states, colour variants, and polish

Implementation proceeds only after approval for each milestone.

Milestones 1–4, the production speech bubble, dragging, and the production
pose/ambient-behavior pass are implemented and approved. The final pose-art pass
closes the submission animation scope. A broad
ink-polish pass remains deferred; a separately approved
density adjustment raised Phase 2 by approximately eight coverage points and
Final by approximately sixteen points without changing the canonical artwork
or intervention sequence.

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

Ollie also supports basic in-memory repositioning. Click and hold the character,
drag him to another visible point, and release to leave him there. The position
is clamped to the current viewport and remains the base for idle and speech
behavior. When a distraction warning begins, Ollie immediately resets to the
original top-right anchor before the existing attack choreography runs, keeping
the tested ink origin intact. This pass deliberately does not persist a home
position or change the existing behavior state machine.

Ollie's seven additional production poses are hand-authored role grids and
checked in as reusable SVGs under `assets/ollie-poses/`. Non-prop poses retain
the canonical 24×18 canvas. Hammer poses use 32×18 and the laptop uses 36×18 so
Ollie's body cells remain at the same scale and proportions while props occupy
their own space. Hammer heads and laptop panels use a dedicated light
neutral-grey prop role; hammer handles use a separate flat brown role, leaving
Ollie's body palette untouched. The hammer pair
now reads as a raised ready position followed by a downward impact angle; the
laptop pose leans and looks toward the screen with a tentacle placed at the
work surface, and the sleeping silhouette has a balanced right-hand curl.
During an undistracted
focus session he occasionally looks left or right and, every randomized 45–90
seconds, alternates naturally between laptop work and a two-pose hammer action.
New commentary uses a thinking → speaking sequence before the existing bubble
appears. Break start immediately interrupts ambient work and transitions to
sleeping; returning to focus wakes Ollie. Pose changes use a short anticipation
→ action → settle treatment without changing timer, commentary, distraction, or
ink logic. Each prop-pose footprint triggers the existing viewport clamp so the
wider canvas remains visible at either edge.
The shared page renderer applies a uniform 90% display scale to the SVG in
every pose without changing the authored grids, viewBoxes, or pixel geometry.

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
back from storage; it receives only a `hasApiKey` status flag. When that flag is
true, the popup shows a Saved chip and a single Remove key action; removing the
key restores the entry field and Save key action. Starting with a blank task
deliberately skips the API request and uses bundled commentary.

## OpenAI API key setup

Ollie supports personalised, task-aware commentary through the OpenAI API.

To enable it, create an API key from the
[OpenAI Platform](https://platform.openai.com/api-keys) and paste it into
Ollie's popup settings. The key is stored locally in your browser and is used
only to request commentary for your focus sessions.

OpenAI API usage is billed separately from ChatGPT subscriptions, as explained
in [OpenAI's API billing guidance](https://help.openai.com/en/articles/8156019-i-want-to-move-my-chatgpt-subscription-to-the-api).
New API users may need to add prepaid credits, with a current minimum purchase
of US$5 according to
[OpenAI's prepaid-billing guidance](https://help.openai.com/en/articles/8264778-what-is-prepaid-billing).

### Why Ollie uses your own API key

Ollie follows a bring-your-own-key model rather than routing every user's
requests through a shared project key.

This approach:

- keeps control of API access and spending with the user
- avoids distributing a shared secret inside the browser extension
- prevents one user's activity from consuming another user's allowance
- allows users to review and manage their own API usage directly
- introduces users to how API-powered products connect securely to an AI
  service

Your API key is not included with Ollie, committed to the repository, or shared
with other users.

Treat it like a password: do not post it publicly or share it with anyone.

### Ollie still works without an API key

An API key is optional.

Without one, Ollie's core companion features continue to work normally,
including:

- focus and break timers
- distraction detection
- character movement and reactions
- fallback dialogue
- other local extension behaviour

Adding a key only enables personalised commentary generated for the task and
focus-session context you provide.

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

To inspect the production popup without changing extension storage, open
`popup/popup.html?preview=empty` for the idle/no-key state or
`popup/popup.html?preview=saved-active` for the active/saved-key state. These
read-only local review modes use the same popup renderer as the extension; the
normal `chrome-extension://` popup always uses real worker state.

## Roadmap

V1.0 uses BYOK (user-supplied OpenAI API key, stored locally, never sent
server-side). A production release would move this behind a proxy so users don't
need their own API key — noted here as a known next step, not a limitation we're
unaware of.

For V1.0, only the background service worker reads the saved key and calls the
OpenAI Responses API. The key and authorization header are never included in
content-script state or logs. BYOK in `chrome.storage.local` is an MVP tradeoff,
not secure secret storage.

Basic dragging is implemented without persistence. A later interaction
milestone may persist Ollie's position or introduce a formal home position;
neither is part of the current build.

The hop-cycle poses shown on the production model sheet remain deferred roadmap
work and are not part of the submission animation set.

Future updates may further refine animation timing and expand Ollie's character
states after the submission build; this is planned polish, not functionality
claimed as complete here.

## Documentation

- [Submission and build notes](docs/submission-notes.md)
- [Pre-submission verification record](docs/verification-record.md)
- [Manual test checklist](docs/manual-test-checklist.md)
- [Ollie asset comparison](docs/ollie-preview.html)
- [Production ink library](docs/ink-preview.html)
- [Distraction intervention preview](docs/distraction-preview.html)
- [Production speech bubble preview](docs/speech-bubble-preview.html)

See `AGENTS.md` for implementation rules and milestone boundaries.

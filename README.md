# Ollie

Ollie is a tiny octopus focus companion who lives at the edge of your browser.
Start a focus session and he quietly works alongside you, chats about your task,
and gets mischievous when you wander onto a distracting site. During breaks, he
settles down to sleep.

## Quickstart

1. Click the green **Code** button at the top of this repository, then
   **Download ZIP**. Unzip the downloaded file.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Choose **Load unpacked**.
5. Select the unzipped repository folder.
6. Open Ollie from the extensions menu and start a focus session.

Ollie appears on eligible HTTP and HTTPS pages. The task field and OpenAI API
key are optional; without them, the timer, companion behaviours, distraction
detection, and bundled dialogue continue to work normally.

No build step, no dependencies to install — the folder loads directly.

### A quick test drive

1. Open any ordinary webpage, then start a short focus session from Ollie's
   popup. The task and API key can both be left blank.
2. Watch Ollie settle at the page edge and work alongside you.
3. During the focus phase, open YouTube, Reddit, X, Instagram, or TikTok in the
   active tab. Ollie gives a warning shot, waits through the grace period, then
   starts his ink intervention if you stay.
4. Switch to a non-distracting tab or stop the session. The intervention should
   clear immediately.

For task-aware dialogue, save an OpenAI API key, enter a task, and start a new
session. Ollie still works normally without either one.

## Demo

**Demo video:** Public link pending final recording.

In the meantime, the repository includes working
[visual and interaction previews](#visual-and-interaction-previews) for Ollie,
the distraction sequence, speech bubble, and popup.

## What is included

- Focus and break timers that continue when the popup is closed.
- An original pixel-art companion with idle, thinking, working, sleeping, and
  directional-looking states.
- A character-led distraction intervention: warning, grace period, movement,
  and progressively accumulating pixel ink.
- Correct focused-window and active-tab behaviour across multiple tabs.
- Basic drag repositioning within the current page lifetime.
- A viewport-aware speech bubble that follows Ollie and supports every side.
- Optional task-aware GPT-5.6 commentary with bundled fallback dialogue.
- A compact popup with optional task input and clear API-key saved state.

## Submission status

All currently planned submission milestones are implemented and approved:

1. Scaffold
2. Core shell
3. Cross-tab distraction and ink intervention
4. GPT-5.6 integration and locally stored API-key handling
5. Character polish — speech bubble, production states, dragging, and popup UX

The GPT integration was verified live with a real user key and task-specific
output. The final popup, character states, drag behaviour, speech bubble, and
approved ink intervention have also completed manual review. Celebration
presentation and colour variants remain intentionally deferred.

Detailed implementation decisions, measurements, and choreography notes are in
[Architecture and implementation notes](docs/architecture-notes.md). Approval
history and reusable regression checks are in the
[verification record](docs/manual-test-checklist.md).

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

An API key is optional. Without one, Ollie's core companion features continue
to work normally, including:

- focus and break timers
- distraction detection
- character movement and reactions
- fallback dialogue
- other local extension behaviour

Adding a key only enables personalised commentary generated for the task and
focus-session context you provide.

The popup never reads a saved key back from storage; it receives only a
`hasApiKey` status flag. A saved key is represented by a Saved chip and a
Remove key action. Starting with a blank task deliberately skips the API
request and uses bundled commentary.

## Privacy and permissions

Ollie has no accounts, analytics, ads, telemetry, or project-owned backend.
Its optional task-aware request is the only product network call: when a task
and key are both present, the background worker sends the task to OpenAI once
at session start. Ollie does not send page content, browsing history, visited
hostnames, or timer activity to OpenAI or the project author.

Chrome shows broad page-access wording because Ollie needs to place the
companion on ordinary HTTP and HTTPS pages. The requested permissions are:

- `storage` — saves settings, the current session, cached commentary, and the
  optional user-supplied API key locally.
- `alarms` — advances focus and break phases even when the popup is closed.
- `tabs` — identifies the active tab and its hostname so only the focused
  distracting tab reacts.
- HTTP/HTTPS content-script access — renders Ollie on normal webpages.
- `https://api.openai.com/*` — allows the background worker to request optional
  task-aware commentary.

Read the full [privacy notice](PRIVACY.md) before installing with a personal
API key.

## Technical constraints

- Chrome Extension Manifest V3
- Vanilla HTML, CSS, and JavaScript
- No build tooling or runtime dependencies
- Pixel-grid inline SVG; no companion raster sprites
- Background service worker as the single source of truth
- Shadow DOM isolation for the webpage overlay
- User-supplied OpenAI key stored only in `chrome.storage.local`

## Known limitations

- Ollie currently supports desktop Chrome and is installed as an unpacked
  extension; it is not published in the Chrome Web Store.
- Chrome-owned and other restricted pages do not allow the companion content
  script to run.
- The distraction list is bundled rather than user-configurable.
- Dragged positions last only for the current page lifetime.
- Session recovery after a browser or service-worker restart is best effort.
- Browser-local BYOK storage is suitable for this prototype, not equivalent to
  a server-side secret store.
- Celebration presentation, colour variants, and additional animation polish
  remain future work.

## Repository layout

- `background/` — service worker, sessions, tab monitoring, and OpenAI client
- `assets/` — production-ready Ollie and curated ink SVGs
- `content/` — webpage overlay, pixel geometry, and animation styles
- `popup/` — extension popup UI
- `shared/` — shared constants, state, messages, storage, and validation
- `docs/` — visual references, previews, architecture, and verification records

## Visual and interaction previews

Serve the repository from a local static server:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open:

- [Ollie poses and character states](http://127.0.0.1:4173/docs/ollie-preview.html)
- [Distraction intervention](http://127.0.0.1:4173/docs/distraction-preview.html)
- [Production speech bubble](http://127.0.0.1:4173/docs/speech-bubble-preview.html)
- [Production ink library](http://127.0.0.1:4173/docs/ink-preview.html)
- [Popup — idle and no key](http://127.0.0.1:4173/popup/popup.html?preview=empty)
- [Popup — active session and saved key](http://127.0.0.1:4173/popup/popup.html?preview=saved-active)

These pages use the production renderers. They provide direct state controls,
editable speech, edge and corner checks, coverage measurement, and read-only
popup states without changing extension storage.

## Roadmap

V1.0 uses BYOK (user-supplied OpenAI API key, stored locally, never sent
server-side). A production release would move this behind a proxy so users
don't need their own API key — noted here as a known next step, not a limitation
we're unaware of.

For V1.0, only the background service worker reads the saved key and calls the
OpenAI Responses API. The key and authorization header are never included in
content-script state or logs. BYOK in `chrome.storage.local` is an MVP tradeoff,
not secure secret storage.

Optional future improvements include:

- further ink polish
- additional animation refinement and character states, including hop and
  celebration presentation
- colour variants
- persistent dragging and a formal home-position system
- a production API proxy

None of these are claimed as part of the completed submission build.

## How it was built

The product concept, scope, final character design, interaction priorities, and
milestone approvals were human-led. Codex scaffolded and implemented the
extension, translated the approved Ollie artwork into structured pixel-grid
SVGs, and helped build the production renderers, previews, behaviour, and
documentation. Claude helped structure the initial PRD and early technical
plan; ChatGPT supported concept development, scope refinement, and visual
exploration.

At runtime, `gpt-5.6-luna` is used only for the optional session-start
commentary request. Its structured response is validated, cached for the
session, and rendered as text. It does not control the timer, classify pages,
or generate Ollie's visuals or movement.

The factual development record is available in
[Submission and build notes](docs/submission-notes.md).

## Feedback

If something is confusing or broken, open a GitHub issue with your Chrome
version, the page where it happened, and the steps needed to reproduce it.
Never include an API key, authorization header, or private generated text.

## Licence

Ollie uses a split licence:

- The extension's software source code is available under the
  [MIT License](LICENSE).
- Ollie's original character artwork, visual identity, reference images, SVG
  assets, and character geometry are licensed under
  [CC BY-NC-ND 4.0](LICENSE-ASSETS.md).

This means friends can inspect, run, and experiment with the code, while the
Ollie character and artwork cannot be commercially reused or distributed in
modified form without separate permission. Neither licence grants ownership of
the general idea of a browser focus companion.

## Documentation

- [Architecture and implementation notes](docs/architecture-notes.md)
- [Submission and build notes](docs/submission-notes.md)
- [Pre-submission verification record](docs/verification-record.md)
- [Milestone history and regression checklist](docs/manual-test-checklist.md)
- [Ollie asset comparison](docs/ollie-preview.html)
- [Production ink library](docs/ink-preview.html)
- [Distraction intervention preview](docs/distraction-preview.html)
- [Production speech bubble preview](docs/speech-bubble-preview.html)
- [Privacy notice](PRIVACY.md)
- [Artwork licence](LICENSE-ASSETS.md)

See `AGENTS.md` for implementation rules and milestone boundaries.

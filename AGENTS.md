# AGENTS.md

## Project

Ollie is a Manifest V3 Chrome extension that renders a pixel-grid octopus
companion at the edge of ordinary webpages during focus sessions.

The MVP is deliberately small. Preserve the Build Week scope and do not add
accounts, a backend, progression systems, additional species, cross-browser
support, vision-based classification, or a desktop overlay unless explicitly
requested.

## Delivery milestones

Implementation is grouped into five approval-gated milestones:

1. Scaffold
2. Core shell — background worker, alarms timer, popup, content script, Shadow
   DOM, pixel-grid Ollie rendering, and idle animation
3. Cross-tab distraction logic — hostname matching and active-tab-only reaction
4. GPT-5.6 integration and security — API key flow, fetch, and fallback lines
5. Break/celebrate states, colour variants, and polish

Stop after completing each milestone and wait for explicit approval before
starting the next one. Do not split these into additional approval gates unless
the user requests it.

## Technical direction

- Chrome Extension Manifest V3
- Vanilla HTML, CSS, and JavaScript
- ES modules where supported by the relevant extension context
- No framework
- No bundler or compile step
- No automated test suite or Node test runner
- No remotely hosted executable code
- No runtime dependencies unless explicitly approved
- Inline pixel-grid SVG made from `<rect>` cells
- CSS and DOM/SVG transforms for animation
- No raster companion sprites or generated animation frames

Keep the unpacked extension directly loadable from the repository root.

## Architecture and ownership

### Background service worker

The background service worker is the single source of truth for application
state. It owns:

- Session lifecycle and focus/break phase transitions
- Absolute phase timestamps and Chrome alarms
- Active tab and focused-window tracking
- Distraction-domain classification
- Persisted settings and best-effort session recovery
- OpenAI requests and response validation
- Broadcasting sanitized state snapshots

Do not use long-running intervals as authoritative timers. Manifest V3 service
workers may be suspended. Store absolute timestamps, use `chrome.alarms`, and
derive remaining time when rendering.

Session recovery is best effort only. Restore from stored timestamps when they
are present, but do not add complex recovery machinery for the MVP.

Register Chrome event listeners synchronously at service-worker startup.

### Content script

The content script owns presentation only:

- Create exactly one Ollie root per document
- Render inside Shadow DOM to isolate styles
- Render the inline SVG pixel matrix
- Apply visual states and transitions
- Display sanitized commentary text
- Remove or replace stale UI cleanly

Ollie renders in every eligible open tab. Only the tab that is both the active
tab and in the focused Chrome window may show distracted/attack state.
Background tabs stay idle.

The content script must not read the OpenAI API key, call OpenAI, modify session
state directly, or infer authoritative timer state.

### Popup

The popup owns user controls:

- Task input
- Start and stop controls
- Session status
- Colour selection
- API key entry and replacement
- A concise indication when generated commentary falls back to bundled lines

The popup sends validated commands to the service worker. It must not contain
timer authority or OpenAI request logic.

### Shared modules

Keep state transitions, message definitions, hostname matching, validation, and
constants in small shared modules. Prefer deterministic, side-effect-free logic
where practical, even though the MVP uses manual verification only.

Avoid circular imports and hidden mutable module state.

## State model

Use one documented, serializable state shape with a numeric `stateVersion`.

Separate:

- Settings: colour, durations, and API configuration metadata
- Session: phase, task, timestamps, generated lines, and status
- Runtime context: active tab ID, focused window ID, active hostname, and
  distraction status

The API key is a secret setting and must never appear in a state snapshot sent
to content scripts.

All state changes must flow through named service-worker commands. Do not allow
popup or content code to submit arbitrary storage patches.

## Messaging

Define message types centrally. Use explicit messages such as:

- `GET_STATE`
- `START_SESSION`
- `STOP_SESSION`
- `SAVE_SETTINGS`
- `STATE_UPDATED`

Validate every incoming message and its sender. Content scripts are untrusted
inputs even though they belong to the extension.

Return structured success or error responses. Keep MVP error handling concise.

## Storage and secrets

- Store the user's OpenAI API key only in `chrome.storage.local`.
- Never use `chrome.storage.sync` for the key.
- Never send the key to a content script.
- Never log the key, authorization headers, or complete OpenAI requests.
- Never hardcode or commit a real key.
- Keep local secret/config files out of Git from the first commit.
- Do not invent a custom encryption scheme for local storage.

Only the service worker may read the key and make OpenAI requests.

BYOK storage is appropriate for the MVP but must not be described as secure
secret storage.

## OpenAI integration

OpenAI generation is an enhancement, not a prerequisite for starting a focus
session.

- Make no more than one generation request per session start.
- Keep the API endpoint and model identifier in one configuration location.
- Validate model availability before treating a model name as final.
- Request a strict structure containing approximately five short strings.
- Validate and normalize the response before storing it.
- Limit task input length.
- Wrap the request in `try/catch` and apply a timeout.
- On any failure, use one shared fallback path with bundled character lines.
- Do not build separate user-facing flows for invalid keys, rate limits,
  offline state, or malformed responses in the MVP.
- Never execute model output or insert it as HTML. Render it as text.

Do not add an OpenAI SDK unless explicitly approved. A small `fetch` client is
preferred for the MVP.

## Cross-tab distraction detection

This behavior is a priority.

Classify distractions by parsed hostname, never by raw substring matching.
Maintain an explicit canonical-domain list. Subdomains may match only through a
deliberate exact-or-suffix rule.

Ollie appears in every eligible open tab, but distracted/attack state is valid
only when all of the following are true:

1. A focus session is running.
2. The tab is active in its window.
3. That window is the focused Chrome window.
4. The tab's normalized hostname matches the distraction list.

All other tabs remain in the idle/work visual state. Wire and manually verify:

- `chrome.tabs.onActivated`
- `chrome.tabs.onUpdated`
- `chrome.windows.onFocusChanged`

The ink attack must not continuously restart on every state refresh.

## Rendering and animation

Ollie must remain a pixel-grid SVG:

- Each filled grid cell is an SVG `<rect>`.
- Body colour is controlled through a CSS custom property.
- Outline, eye, and highlight roles should be represented separately from body
  cells.
- Geometry data must be separate from animation and DOM lifecycle logic.
- State changes animate the grid/container; do not swap raster frames.

Use one fixed overlay root with a bounded high `z-index`. Passive companion
elements should default to `pointer-events: none`.

Support these visual modes:

- Idle/work
- Distracted/attack
- Break/playful
- Celebrate

Visual transitions must be idempotent.

## Page safety and style isolation

Assume host pages contain hostile CSS and unusual DOM structures.

- Use Shadow DOM for style isolation.
- Do not use `innerHTML` with page, user, or model-provided text.
- Do not modify page-owned nodes.
- Do not block page interaction.
- Prevent duplicate companion roots.
- Handle SPA navigation and content-script reinjection safely.
- Fail quietly on restricted Chrome pages where content scripts cannot run.

## Permissions

Request the least privilege that satisfies the implementation.

Expected starting permissions:

- `storage`
- `alarms`
- `tabs` for continuous active-URL and cross-tab monitoring

Expected host access:

- HTTP and HTTPS page matches for the static content script
- The exact OpenAI API origin for background requests

Do not add `scripting`, `<all_urls>` host permissions, or another sensitive
permission merely for convenience. Document the reason whenever permissions
change.

## Error handling

Focus sessions must remain usable without OpenAI. The OpenAI request has one
failure path: catch the failure and use bundled commentary lines.

Do not show raw stack traces, secret-bearing responses, authorization headers,
or noisy recurring errors to users.

Handle ordinary Chrome runtime failures without adding elaborate recovery or
error classification for the MVP.

## Manual verification

There is no automated test suite for Build Week. Maintain and use
`docs/manual-test-checklist.md`.

Before declaring a milestone complete:

1. Complete the checks relevant to that milestone.
2. Load or reload the unpacked extension.
3. Inspect the service-worker and page consoles for errors.
4. Record any checks that could not be performed.
5. Do not claim end-to-end verification if Chrome could not be exercised.

Priority manual scenarios include timer transitions, cross-tab/window state,
hostname matching and false positives, duplicate-root prevention, API fallback,
and confirmation that no key or authorization header appears in logs or state
sent to content scripts.

## Code style

- Prefer small, single-purpose modules and named functions.
- Use descriptive names rather than abbreviations.
- Use constants for state names, message names, and storage keys.
- Use early returns to keep control flow shallow.
- Avoid classes unless they provide a clear lifecycle benefit.
- Avoid global variables outside the service worker's controlled runtime state.
- Comment decisions and browser constraints, not obvious syntax.
- Keep formatting consistent with the existing project.
- Do not introduce tooling solely for formatting.

## Scope discipline

Build only the currently approved milestone. Do not begin work belonging to a
later milestone before approval.

Do not implement stretch goals before the five approved milestones are working
and verified.

## Git and file hygiene

- Preserve unrelated user changes.
- Review `git diff` before handing off.
- Never commit secrets, generated credentials, browser profiles, or local
  environment files.
- Keep `.gitignore` current.
- Do not commit or push unless explicitly requested.
- Do not add generated build output; the MVP has no build step.

## Decision rule

When requirements are ambiguous, favor:

1. Reliable focus-session behavior
2. BYOK security and minimal permissions
3. Correct active-tab and focused-window behavior
4. A fast judge-friendly setup
5. Simple maintainable vanilla JavaScript
6. Visual polish and stretch features

Ask before making a choice that changes product scope, privacy expectations, or
the no-build-tool architecture.

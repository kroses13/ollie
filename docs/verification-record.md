# Ollie pre-submission verification record

Date: 2026-07-21

This record summarizes the demonstrated state of the submission build. Detailed
manual scenarios and historical evidence remain in
`docs/manual-test-checklist.md` and `docs/submission-notes.md`.

## Current implementation status

| Area | Current state | Verification evidence |
|---|---|---|
| Scaffold and Core Shell | Complete and approved | The MV3 extension loads unpacked; the background worker owns timestamp-based focus/break phases and alarms; the content script injects one Shadow DOM companion root. |
| Cross-tab distraction | Complete and approved | Hostnames use exact/suffix matching. Only the focused window's active tab can attack; warning, cancellation, eight-event escalation, and bounded ink pooling are implemented. |
| Ink intervention | Approved submission baseline | Canonical hand-authored pixel SVGs use horizontal mirroring only. The latest approved density preview averaged about 22.8% at Phase 2 and 48.5% at Final while preserving timing and cancellation. Broader ink polish is deferred. |
| GPT-5.6 commentary | Complete, live-verified, and approved | A real BYOK session returned one validated, cached, task-specific eight-line `gpt-5.6-luna` response. Blank tasks and every request failure use the shared fallback. |
| BYOK boundary | Complete for Build Week | The popup writes the key to `chrome.storage.local`; only the worker reads it. Content state exposes only `hasApiKey`; no key or authorization header is logged or committed. |
| Speech bubble | Complete and approved | The coded pixel frame supports dynamic plain text, four automatic orientations, viewport clamping, movement tracking, and generated/fallback parity. |
| Dragging | Complete and approved | Ollie can be dragged and viewport-clamped for the current page lifetime. Distraction resets him to the tested attack anchor; persistence is intentionally deferred. |
| Character poses and animation | Complete and approved submission pass | Idle looks, thinking/speaking, laptop work, two-step hammer work, sleeping/wake, interruption priority, prop clamping, and uniform 90% page display scale are implemented. |
| Popup UX | Complete and approved | The compact production renderer was inspected in idle/no-key and active/saved states. The saved state collapses to one chip and a right-aligned outlined Remove key action. Real extension state still requires one final unpacked-Chrome regression after reload. |

## Popup state verification

- Idle/no key: Ollie is visible in the header; Ollie is the primary title;
  Focus companion is the subtitle; Save key is primary; the original paste-key
  placeholder is visible.
- Active/saved: Ollie is absent from the header by design; the compact timer and
  task remain legible; successful-generation status is hidden; only a Saved
  chip and Remove key action remain in the API section.
- Returning to idle restores the header Ollie. The condition is derived from
  session phase, not a permanent hide.
- The saved presentation is derived from `settings.hasApiKey`. No stored key is
  read back into the popup or displayed in a coloured key field.
- Reduced helper and input typography plus hidden body overflow keep both popup
  states contained without scrolling.
- API actions are right-aligned; Remove key uses the same compact outlined-button
  language as the popup's secondary controls.

## Security and static checks

- JavaScript source passes syntax checking.
- `manifest.json` parses successfully.
- Production pose SVGs parse as XML and preserve integer grid viewBoxes with
  `crispEdges`.
- Git whitespace checks pass.
- Credential-pattern scans find no committed OpenAI key or bearer token.
- The current extension requests only `storage`, `alarms`, and `tabs`, plus the
  OpenAI API host permission and HTTP/HTTPS content-script matches.

## Final manual checks before submission

- Reload the unpacked extension after the popup change.
- Confirm the popup's save, remove, and re-add controls against real local
  storage without exposing the key in any console.
- Confirm the header Ollie disappears during focus and break, then returns after
  stop or natural completion.
- Re-run representative tab/window distraction cases on real webpages.
- Record final screenshots, demo video, repository visibility/licence, Devpost
  requirements, and the Codex Session ID.

## Explicitly deferred work

- Persistent drag/home positioning.
- Further ink polish beyond the approved submission baseline.
- Additional animation refinement and expanded character states.
- Hop-cycle, celebration artwork/state, and colour variants.
- A production proxy that removes the need for user-supplied API keys.

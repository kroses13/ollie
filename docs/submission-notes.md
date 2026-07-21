# Ollie Submission Notes

## 1. Project summary

Ollie is a Manifest V3 Chrome extension that places an original pixel-grid
octopus companion at the edge of ordinary webpages during focus sessions. It
addresses the problem of drifting into distracting sites while trying to
complete a specific task.

The core interaction is a focus/break timer paired with a visible companion.
Ollie stays quietly present during focused work, reacts in character when the
user becomes distracted, and changes behavior around breaks and completed
sessions.

Unlike a conventional productivity timer that relies mainly on countdowns,
alerts, and warnings, Ollie turns session state into character behavior. The
companion approach is intended to feel ambient and personable rather than
punitive.

## 2. Tool usage

### Claude

- Helped structure the initial PRD and early technical plan.
- Did not implement the final product code unless explicitly recorded later.
- Authored the deferred polish-pass section appended to the PRD on 2026-07-20.

### ChatGPT

- Supported concept development.
- Helped refine product scope and interaction ideas.
- Supported visual exploration and selection of the approved Ollie design.

### Codex

- Scaffolded and implemented the codebase.
- Translated the approved Ollie reference into the structured pixel-grid SVG
  system.
- Created the reusable renderer, preview tooling, and implementation files.
- Implemented the Core Shell, cross-tab distraction intervention, and approved
  Milestone 4 task-aware commentary flow.

### GPT-5.6

- `gpt-5.6-luna` is configured to produce task-aware companion commentary from
  one OpenAI Responses API request at focus-session start.
- The strict response contains a greeting, two idle lines, two distracted
  lines, two break lines, and one celebration line. Valid output is cached in
  the local session and displayed only as text.
- Blank tasks, missing keys, and request or validation failures all use the same
  bundled commentary.
- On 2026-07-21, the project owner verified a live request with a real
  user-supplied key and nonblank task. The cached source was `generated`, and
  all eight returned lines were confirmed as genuinely task-specific.

## 3. Key decisions

- Chrome extension first.
- Manifest V3.
- Vanilla HTML, CSS, and JavaScript.
- Safari adaptation deferred.
- Original octopus companion named Ollie.
- No copyrighted character or Pokémon assets.
- One hand-built SVG pixel grid instead of raster sprite sheets.
- SVG cells use a structured 24×18 grid.
- Character colours are controlled through CSS variables.
- The neutral pose is the base asset.
- The curled action tentacle is isolated as a separate group.
- Animation will be handled through CSS and JavaScript.
- OpenAI API keys must never be hardcoded or committed in the browser extension.
- V1.0 uses BYOK: the user supplies an OpenAI API key, it is stored only in
  `chrome.storage.local`, read only by the service worker, and never sent to a
  project-owned server.
- A server-side or serverless proxy is a production-hardening consideration for
  a later release, not a requirement for the Build Week submission.
- Draggable positioning with persistence is the next interaction backlog item
  because the default top-right position can overlap webpage controls; it is
  not implemented in the current milestone.

## 4. Codex acceleration log

| Date | Stage | Task | What Codex did | Human decision/review | Files affected |
|---|---|---|---|---|---|
| 2026-07-19 | Scaffold | Initial project scaffold | Created the MV3 repository structure, implementation guidance, manifest, placeholder modules, README, and manual checklist. | Reviewed and approved the proposed architecture and milestone sequence. | `AGENTS.md`, `README.md`, `manifest.json`, `background/*`, `content/*`, `popup/*`, `shared/*`, `docs/manual-test-checklist.md` |
| 2026-07-19 | Stage 2 visual asset | Approved Ollie visual-asset implementation | Inspected the approved image and translated its silhouette, proportions, expression, and limited palette into a production SVG approach without embedding the raster reference in the extension. | Selected and approved the final Ollie reference image; instructed Codex not to redesign it. | `assets/ollie.svg`, `docs/reference/ollie-approved.png`, `content/ollie-grid.js`, `content/companion-view.js`, `content/overlay.css` |
| 2026-07-19 | Stage 2 visual asset | Structured 24×18 role grid | Represented every filled cell as structured role data for outline, body, shade, highlight, eye, and sucker pixels. | Approved the structured grid approach after reviewing the visual comparison. | `content/ollie-grid.js`, `assets/ollie.svg` |
| 2026-07-19 | Stage 2 visual asset | Reusable SVG renderer | Built a DOM-based renderer that creates the inline SVG from role-grid data with a grid-matched viewBox and crisp edges. | Approved the renderer and neutral-pose output. | `content/companion-view.js`, `content/ollie-grid.js` |
| 2026-07-19 | Stage 2 visual asset | Visual comparison preview | Created a local preview showing the approved reference and generated Ollie at hero, 24px, 32px, and 48px widths. | Visually reviewed and approved the Stage 2 result. | `docs/ollie-preview.html`, `docs/ollie-preview.css`, `docs/ollie-preview.js`, `docs/reference/ollie-approved.png` |
| 2026-07-19 | Stage 2 visual asset | CSS-variable colour system | Assigned each pixel role to a limited palette controlled by CSS custom properties. | Confirmed future colour variants should reuse one geometry asset. | `content/overlay.css`, `assets/ollie.svg` |
| 2026-07-19 | Stage 2 visual asset | Isolated action tentacle | Placed the right curled tentacle in a separately addressable SVG group for later state animation. | Required and approved the independently targetable action tentacle. | `content/ollie-grid.js`, `content/companion-view.js`, `assets/ollie.svg` |
| 2026-07-19 / 2026-07-20 | Validation | Validation and syntax checks | Checked grid dimensions and cell parity, SVG XML, JavaScript syntax, manifest JSON, Git whitespace, preview rendering, and fixed-time session transitions. | Reviewed milestone summaries and approved the visual asset and Core Shell commits. | `docs/manual-test-checklist.md` and the files under validation |
| 2026-07-20 | Stage 2 Core Shell | Timer, popup, and page injection | Implemented worker-owned focus/break timestamps, Chrome alarms, sanitized state messaging, popup controls, Shadow DOM injection, and the neutral idle bob. | Approved the Core Shell milestone and requested it be committed. | `background/service-worker.js`, `background/session-controller.js`, `content/content-script.js`, `content/animations.css`, `popup/*`, `shared/*`, `manifest.json`, `README.md` |
| 2026-07-20 | Milestone 3 | Cross-tab distraction logic | Implemented normalized exact/suffix hostname matching, focused-window and active-tab tracking, tab-specific state broadcasts, and the ink/action-tentacle reaction. | Reviewed and approved Milestone 3. | `background/service-worker.js`, `background/tab-monitor.js`, `shared/domains.js`, `shared/state.js`, `content/content-script.js`, `content/animations.css`, `popup/popup.js` |
| 2026-07-20 | Milestone 3 refinement | Two-stage escalating intervention | Replaced the immediate attack with a cancellable warning grace period and three timed coverage phases. Refined the visuals to eight reusable 12×10 pixel-grid SVG splatters, gentler 2→5→8 accumulation, a tiny warning shot, and character-led inward movement. Preserved immediate teardown and reduced-motion behavior without changing timer or detection logic. | Specified the escalating intervention, then requested a lighter pixel-art treatment; implementation review is pending. | `content/intervention-controller.js`, `content/ink-splatter-view.js`, `content/content-script.js`, `content/animations.css`, `manifest.json`, `README.md`, `docs/manual-test-checklist.md`, `docs/submission-notes.md` |
| 2026-07-20 | Milestone 3 preview | Distraction-state assessment page | Built a permanent mock distraction page with direct idle, warning, and three-phase attack controls plus a cancellable sequence using production timing constants and rendering modules. | Requested a dedicated preview for assessing Ollie's intervention states; review is pending. | `docs/distraction-preview.html`, `docs/distraction-preview.css`, `docs/distraction-preview.js`, `README.md`, `docs/manual-test-checklist.md`, `docs/submission-notes.md` |
| 2026-07-20 | Milestone 3 character polish | Living-viewport attack choreography | Added a cancellable presentation sequencer that moves Ollie through varied, intentional viewport waypoints and coordinates thinking, hopping, landing, aiming, spraying, inspecting, and occasional behind-ink emergence with each individual ink reveal. Kept the approved stage timings, detection, scoping, and ink limits unchanged. | Defined the target emotional response and requested character intent over additional visual effects; implementation review is pending. | `content/ollie-choreography.js`, `content/companion-view.js`, `content/content-script.js`, `content/animations.css`, `manifest.json`, `docs/distraction-preview.*`, `README.md`, `docs/manual-test-checklist.md`, `docs/submission-notes.md` |
| 2026-07-20 | Milestone 3 ink polish | Small-shot cluster rendering and synchronized ears | Replaced oversized viewport-scaled blob silhouettes with eight bounded, reusable clusters of deterministic 12–20px pixel shots; changed the warning to four 6–8px drops; added a live occupancy readout; and synchronized both ear groups during later aim/spray effort. Measured 10.1%, 17.6%, and 33.6% coverage at 1280×900 without changing choreography or intervention logic. | Requested ink-only rendering and sizing refinement with measured coverage targets; implementation review is pending. | `content/ink-splatter-view.js`, `content/companion-view.js`, `content/animations.css`, `docs/distraction-preview.js`, `docs/manual-test-checklist.md`, `docs/submission-notes.md` |
| 2026-07-20 | Ink asset curation | Production ink candidate library | Hand-authored eight distinct, grid-aligned SVG candidates across XS, small, medium, and large tiers using only the approved outline, base, and shade roles. Added an isolated reference-versus-output review page at natural size, 200%, and 400%; no candidate was integrated into intervention behavior. | Requested a quality-first permanent asset library and reserved integration until manual visual approval; review is pending. | `assets/ink/*.svg`, `docs/ink-preview.html`, `docs/submission-notes.md` |
| 2026-07-20 | Milestone 3 ink integration | Curated larger-scale live spray library | Locked the approved Medium and Large art, removed the rejected XS/Small tiers, hand-authored XL and XXL pairs, and integrated all eight fixed SVG assets into the live attack. Reallocated fourteen reusable units across the existing eight sprays and tuned true visible-union coverage to 10.43% / 17.62% / 33.89% at 1280×900 without changing phase timing, detection, cancellation, tab scoping, or privacy behavior. | Approved `m-1`, `m-2`, `l-1`, and `l-2`; set Medium as the permanent size floor and authorized direct integration plus larger upper tiers. | `assets/ink/*.svg`, `content/ink-splatter-view.js`, `content/companion-view.js`, `content/animations.css`, `manifest.json`, `docs/distraction-preview.*`, `docs/ink-preview.html`, `README.md`, `AGENTS.md`, `docs/manual-test-checklist.md`, `docs/submission-notes.md` |
| 2026-07-20 | Milestone 3 ink polish | Persistent warning and contrast audit | Added a stationary warning mark that appears on spray and persists beneath all later attack phases, co-located it with the first Phase 1 unit so the confirmed attack coverage remains unchanged, and raised base/shade contrast consistently across Medium through XXL. Audited every attached protrusion against the two-pixel minimum without changing silhouettes, satellite counts, phase allocation, or browser behavior. | Confirmed coverage was final and requested explicit warning persistence plus consistent colour and consolidated hard-pixel edges. | `assets/ink/*.svg`, `content/ink-splatter-view.js`, `content/content-script.js`, `content/animations.css`, `docs/distraction-preview.js`, `docs/manual-test-checklist.md`, `docs/submission-notes.md` |
| 2026-07-20 | Canonical ink reproduction | Approved-reference SVG transcription | Reproduced the three canonical small, medium, and large reference compositions as standalone crisp-grid SVG candidates using only the specified outline, base, and shade palette. Replaced the ink review page with direct reference, matching-scale, 4×, and 8× comparisons; kept the live intervention on its previously tested assets pending visual approval. | Declared the attached three-splatter image canonical and required a visual approval gate before intervention integration or coverage retuning. | `assets/ink/canonical/*.svg`, `docs/ink-preview.html`, `docs/submission-notes.md` |
| 2026-07-20 | Canonical ink integration | Approved three-tier live library | Replaced the superseded eight-asset library with the approved canonical Small, Medium, and Large SVGs. Mapped them onto the unchanged eight spray events, tuned rendered scale only, and measured true visible-union coverage of 10.13% / 17.76% / 33.66% at 1280×900 while retaining fourteen total units. | Visually approved the reproduced SVG artwork and authorized the previously sequenced integration step. | `assets/ink/canonical/*.svg`, `content/ink-splatter-view.js`, `content/companion-view.js`, `content/animations.css`, `manifest.json`, `AGENTS.md`, `README.md`, `docs/ink-preview.html`, `docs/manual-test-checklist.md`, `docs/submission-notes.md` |
| 2026-07-20 | Ink rendering fine-tune | Randomized spread, reduced footprint, and stronger Final | Added a fresh seeded layout per attack, stratified same-event jitter, crisp quarter-turn rotations, two bounded offset droplets per unit, and wider Phase 2 spread. Reduced canonical unit scale by approximately 20% and increased Phase 2 and Final to two units per spray event without changing the eight-event timing sequence. Across 120 reference-viewport layouts, measured mean coverage was 6.04% / 14.01% / 32.36%. | Requested more organic repeat variation, wider same-event distribution, a smaller overall footprint, and a more pronounced Final escalation; explicitly allowed the previous coverage targets to change. Review is pending. | `content/ink-splatter-view.js`, `content/content-script.js`, `content/companion-view.js`, `content/animations.css`, `docs/distraction-preview.js`, `README.md`, `AGENTS.md`, `docs/manual-test-checklist.md`, `docs/submission-notes.md` |
| 2026-07-20 | Ink rendering fine-tune | Horizontal variation only | Removed all spray rotation while preserving the approved splatters, size, jitter, spread, droplets, unit allocation, and timing. Seeded variation now uses horizontal mirroring only. Across 120 reference-viewport layouts, measured mean coverage was 6.05% / 13.97% / 32.13%. | Approved the current sizing and requested horizontal flips as the sole orientation variation. | `content/ink-splatter-view.js`, `content/animations.css`, `docs/distraction-preview.js`, `README.md`, `AGENTS.md`, `docs/manual-test-checklist.md`, `docs/submission-notes.md` |
| 2026-07-20 | Milestone 4 | GPT-5.6 integration and BYOK security | Added the worker-only Responses API client, exact structured schema, optional-task flow, one shared bundled fallback, session caching, response validation, timeout, key save/remove controls, trusted-context storage restriction, key-free status messaging, sanitized public metadata, and text-only commentary rendering. Simulated blank-task, missing-key, success, failure, timeout, caching, and secret-isolation paths without using a real credential. | Approved the exact schema and flow, retained client-side BYOK for Build Week, and authorized Milestone 4 implementation. | `background/openai-client.js`, `background/service-worker.js`, `shared/commentary.js`, `shared/constants.js`, `shared/messages.js`, `shared/state.js`, `shared/storage.js`, `shared/validation.js`, `popup/*`, `content/companion-view.js`, `content/content-script.js`, `content/overlay.css`, `README.md`, `docs/manual-test-checklist.md`, `docs/submission-notes.md` |
| 2026-07-21 | Milestone 4 verification | Live task-aware commentary | Preserved the exact request and provided a key-safe service-worker console inspection path for the cached source and all eight lines. Recorded only the verification outcome, not the real key, task, or generated content. | Ran a live session with a real key and task, confirmed `commentarySource: generated`, verified all eight lines were task-specific, approved Milestone 4, and requested the commit. | `README.md`, `docs/manual-test-checklist.md`, `docs/submission-notes.md` |
| 2026-07-21 | Character Polish | Production speech bubble | Replaced the temporary CSS box with a reusable coded component, then refined it to a denser 120×52 integer-grid SVG frame with rounded stepped corners, separate outline/depth/fill layers, centred dynamic text and sparkle, four pointer positions, and yellow/grey sparkle palettes. Added a source-agnostic presentation controller that waits for a stable character moment, selects and clamps a fitting viewport side, follows the live Ollie anchor while visible, and dismisses after a length-aware reading pause. Expanded the preview with edge, corner, travel, long-copy, and compact-bound checks. | Supplied and described the approved speech-bubble reference, authorized a dynamic coded reproduction, approved the completed component for commit, selected Ollie's states as the next milestone, and deferred further ink polish. | `content/speech-bubble.js`, `content/speech-bubble-controller.js`, `content/companion-view.js`, `content/content-script.js`, `content/overlay.css`, `manifest.json`, `docs/speech-bubble-preview.*`, `README.md`, `docs/manual-test-checklist.md`, `docs/submission-notes.md` |
| 2026-07-21 | Targeted ink density adjustment | Phase 2 and Final coverage increase | Kept the existing eight spray events and approved canonical artwork, increased reusable unit allocation from 4/4/2/2/2/2/2/2 to 4/4/4/4/4/5/5/3, and tuned only added-unit placement/scale. Nine randomized Phase 2 preview runs averaged 22.81%; six final tuned runs averaged 48.48%. Warning, Phase 1, timing, choreography, cancellation, scoping, detection, and privacy behavior were unchanged. | Explicitly requested an approximately eight-point Phase 2 increase and sixteen-point Final increase despite the broader ink-polish deferral. | `content/ink-splatter-view.js`, `docs/distraction-preview.js`, `README.md`, `docs/manual-test-checklist.md`, `docs/submission-notes.md` |
| 2026-07-21 | Character interaction | Basic drag repositioning | Added a small pointer-driven controller that moves Ollie's outer positioning layer in real time, clamps the visible character to the viewport, and resets naturally on reload. Reused the same controller in the distraction preview and added a canonical-anchor reset before Warning so the tested attack choreography and ink positioning always start from their expected origin. | Requested deliberately minimal drag behavior with no persistence and no home-position system; requested the distraction reset after live drag review. | `content/drag-controller.js`, `content/content-script.js`, `content/animations.css`, `manifest.json`, `docs/distraction-preview.js`, `docs/distraction-preview.css`, `README.md`, `docs/manual-test-checklist.md`, `docs/submission-notes.md` |
| 2026-07-21 | Character polish — production states | Seven production pose assets and ambient behavior wiring | Transcribed references 5, 6, 7, 8, 9, 10, and 12 into structured rect grids and standalone SVGs while preserving the canonical live palette. Kept non-prop poses at 24×18, used 32×18 hammer canvases and a 36×18 laptop canvas so Ollie's body stays undistorted, and balanced the sleeping tentacle spread. Added anticipation/action/settle pose transitions, thinking-before-speech, randomized directional looks, alternating 45–90 second laptop/hammer work, immediate interruption, break sleeping/wake behavior, and expanded-footprint viewport clamping. Expanded the asset preview with the approved sheet, seven-pose checkpoint, live production-controller lab, and six-case edge check. | Supplied the approved model sheet, made the existing live Ollie asset canonical for palette/proportions, returned hammer art to scope, required wider prop canvases, and requested direct behavior integration while retaining the hop-cycle deferral. | `assets/ollie-poses/*`, `content/ollie-grid.js`, `content/companion-view.js`, `content/ollie-behavior-controller.js`, `content/content-script.js`, `content/drag-controller.js`, `content/animations.css`, `content/overlay.css`, `manifest.json`, `docs/reference/ollie-production-sheet.png`, `docs/ollie-preview.*`, `README.md`, `docs/manual-test-checklist.md`, `docs/submission-notes.md`, `scripts/generate-ollie-pose-assets.js` |
| 2026-07-21 | Character polish — final pose art | Prop contrast, readable hammer arc, engaged laptop, and balanced sleep | Added a dedicated neutral-grey SVG role for props, redrew the hammer pair as raised versus downward impact, gave laptop work a slight lean, directed gaze, and contacting tentacle, and completed the sleeping pose with a visible right curl. Regenerated the production SVGs and retained the existing state timing, alternation, interrupts, and viewport clamping. | Requested this as the final animation-art pass and kept Ollie's canonical body palette and behavior system unchanged. | `content/ollie-grid.js`, `content/overlay.css`, `assets/ollie-poses/*`, `scripts/generate-ollie-pose-assets.js`, `docs/ollie-preview.*`, `README.md`, `docs/manual-test-checklist.md`, `docs/submission-notes.md` |
| 2026-07-21 | Character polish — prop clarity | Connected two-tone hammer and light-grey laptop | Added a flat brown handle role, rebuilt both handles as connected two-cell steps from tentacle to head, and lightened the shared silver/grey role used by hammer heads and the laptop shell. Ollie's body art, pose timing, and behavior wiring were unchanged. | Required a zero-gap grip, simple brown-plus-silver hammer readability, and a light-grey laptop icon. | `content/ollie-grid.js`, `content/overlay.css`, `assets/ollie-poses/*`, `scripts/generate-ollie-pose-assets.js`, `docs/ollie-preview.*`, `README.md`, `docs/manual-test-checklist.md`, `docs/submission-notes.md` |
| 2026-07-21 | Character polish — display scale | Uniform 10% page-size reduction | Applied one inherited 90% CSS scale to the rendered Ollie SVG across every pose. Preserved all structured grids, SVG viewBoxes, cells, crisp-edge rendering, behavior timing, and asset files. | Requested a final live display-size check rather than another asset pass. | `content/animations.css`, `README.md`, `docs/manual-test-checklist.md`, `docs/submission-notes.md` |

## 5. Human-led decisions

The following were manually reviewed and approved by the project owner:

- Product concept and scope.
- Final Ollie reference image.
- Visual proportions and expression.
- Decision to stop generating additional raster assets.
- Decision to use a structured SVG pixel grid.
- Approval of the Stage 2 visual output after side-by-side review.
- Approval of the Stage 2 Core Shell after implementation review.
- Approval and commit of the complete Milestone 3 cross-tab distraction and
  ink-animation implementation after iterative visual review.
- Approval of the canonical Small, Medium, and Large ink SVG reproductions
  before intervention integration.
- Approval of the Milestone 4 single-call schema, optional-task behavior,
  unified fallback path, and client-side BYOK security boundary.
- Live verification and approval of Milestone 4 after confirming generated,
  task-specific commentary across the complete eight-line schema.
- Approval of the production speech bubble after viewport, movement, wrapping,
  and four-orientation verification; Ollie's states were selected next and ink
  polish was deferred.

## 6. Repository and setup checklist

- [ ] Public repository or private repository shared with required judging
      emails.
- [ ] Relevant licence added.
- [ ] Final README completed.
- [ ] Local setup instructions verified.
- [ ] Extension loading instructions added.
- [ ] Environment variables documented.
- [ ] Sample data added if required.
- [ ] Demo video recorded.
- [ ] Screenshots prepared.
- [ ] Codex Session ID captured.
- [ ] Devpost requirements rechecked.
- [X] GPT-5.6 runtime integration documented.
- [X] Security review completed for the implemented client-side boundary;
      unpacked-Chrome network and console inspection remains recorded in the
      manual checklist.
- [X] API key confirmed absent from repository and extension bundle.

## 7. Final submission copy

### Project description

**Placeholder:** Insert a concise, evidence-backed overview of the completed
product and its demonstrated user value.

### Inspiration

**Placeholder:** Record the observed productivity problem, the companion idea,
and the evidence for choosing an octopus character.

### What it does

**Placeholder:** Describe only functionality shown in the final working build
and demo.

### How it was built

**Placeholder:** Summarize the final extension architecture, pixel-grid renderer,
state flow, runtime AI path, and deployment setup with links to relevant files.

### Challenges

**Placeholder:** Add concrete technical or product challenges supported by Git
history, test notes, or milestone screenshots.

### Accomplishments

**Placeholder:** List completed, demonstrated outcomes without promotional or
unverified claims.

### What was learned

**Placeholder:** Record specific lessons from MV3 lifecycle behavior, SVG pixel
art, extension isolation, AI integration, and the review process.

### What comes next

After the submission build is complete, future updates should improve Ollie's
animation quality and expand/refine character states. This is deliberate
post-submission polish rather than unfinished scope for the current build.
Also distinguish any remaining MVP requirements from optional work and the
explicitly deferred ink-polish pass.

### How Codex accelerated the workflow

**Placeholder:** Use the acceleration log, meaningful commits, elapsed milestone
history, and specific files to explain Codex's contribution.

### How GPT-5.6 was used

**Placeholder:** Insert the final model identifier, single request flow, output
schema, product behavior it powers, fallback path, and evidence from runtime
testing.

### Disclosure of Claude and ChatGPT usage

**Placeholder:** Summarize the factual planning, scope-development, and visual
exploration roles recorded in the Tool usage section.

## 8. Evidence to preserve

- Meaningful Git commits.
- Approved Ollie reference image.
- SVG comparison preview.
- Architecture decisions.
- Codex session IDs.
- Screenshots of working milestones.
- Demo recordings.
- API integration tests.
- Final Devpost requirement checklist.

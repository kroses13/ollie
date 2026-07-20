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
- Implemented the current Core Shell and will implement and iterate on later
  extension functionality after milestone approval.

### GPT-5.6

- Intended to power the live in-product commentary or contextual companion
  responses.
- Final runtime model, endpoint, request schema, and demonstrated use: **record
  after implementation**.

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

## 5. Human-led decisions

The following were manually reviewed and approved by the project owner:

- Product concept and scope.
- Final Ollie reference image.
- Visual proportions and expression.
- Decision to stop generating additional raster assets.
- Decision to use a structured SVG pixel grid.
- Approval of the Stage 2 visual output after side-by-side review.
- Approval of the Stage 2 Core Shell after implementation review.

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
- [ ] GPT-5.6 runtime integration documented.
- [ ] Security review completed.
- [ ] API key confirmed absent from repository and extension bundle.

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

**Placeholder:** Distinguish incomplete MVP requirements from optional future
scope and the explicitly deferred polish pass.

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

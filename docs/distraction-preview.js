import { createOllieCharacter } from "../content/companion-view.js";
import { createOllieDragController } from "../content/drag-controller.js";
import {
  createPixelInkField,
  randomizePixelInkField,
} from "../content/ink-splatter-view.js";
import { INTERVENTION_TIMING } from "../content/intervention-controller.js";
import { createOllieChoreography } from "../content/ollie-choreography.js";

const STATE_DETAILS = Object.freeze({
  idle: {
    title: "Idle",
    coverage: "0% ink",
    description: "Ollie rests at the page edge with no intervention active.",
  },
  warning: {
    title: "Warning",
    coverage: "Randomized baseline · mean 0.66% ink",
    description:
      "Ollie fires one approved canonical Small ink unit as the warning shot.",
  },
  "attack-one": {
    title: "Attack · phase 1",
    coverage: "Randomized baseline · mean 6.05% ink",
    description:
      "Two sprays place four canonical Small ink units each.",
  },
  "attack-two": {
    title: "Attack · phase 2",
    coverage: "Updated target · approximately 22% ink",
    description:
      "Three sprays add four widely spread Medium or Large units each.",
  },
  "attack-final": {
    title: "Attack · final phase",
    coverage: "Updated target · approximately 48% ink",
    description:
      "Three sprays add thirteen varied Large units for a stronger " +
      "final escalation.",
  },
});

const BEHAVIOR_LABELS = Object.freeze({
  idle: "Resting",
  notice: "Noticed distraction",
  aim: "Aiming",
  spray: "Spraying",
  inspect: "Inspecting the result",
  "warning-wait": "Waiting for your response",
  think: "Choosing the next spot",
  hop: "Relocating",
  land: "Landing",
  emerge: "Emerging from the ink",
  decide: "Pleased with the result",
});

const SEQUENCE = Object.freeze([
  { state: "warning", delay: 0 },
  { state: "attack-one", delay: INTERVENTION_TIMING.WARNING_GRACE_MS },
  {
    state: "attack-two",
    delay:
      INTERVENTION_TIMING.WARNING_GRACE_MS +
      INTERVENTION_TIMING.PHASE_ONE_DURATION_MS,
  },
  {
    state: "attack-final",
    delay:
      INTERVENTION_TIMING.WARNING_GRACE_MS +
      INTERVENTION_TIMING.PHASE_ONE_DURATION_MS +
      INTERVENTION_TIMING.PHASE_TWO_DURATION_MS,
  },
]);

const inkField = createPixelInkField();
const ollieStage = createOllieStage();
const olliePosition = document.createElement("div");
olliePosition.className = "ollie-preview-position";
olliePosition.append(ollieStage);
const stateTitle = document.querySelector("#state-title");
const stateDescription = document.querySelector("#state-description");
const coverageLabel = document.querySelector("#coverage-label");
const behaviorLabel = document.querySelector("#behavior-label");
const sequenceStatus = document.querySelector("#sequence-status");
const playSequenceButton = document.querySelector("#play-sequence");
const previewControls = document.querySelector(".preview-controls");
const togglePanelButton = document.querySelector("#toggle-panel");
const openInkComparisonButton = document.querySelector("#open-ink-comparison");
const closeInkComparisonButton = document.querySelector("#close-ink-comparison");
const inkComparisonPanel = document.querySelector("#ink-comparison-panel");
const stateButtons = [...document.querySelectorAll("[data-state]")];
const requestedState = new URLSearchParams(window.location.search).get("state");
let sequenceTimers = [];
let countdownTimer = null;
let coverageTimer = null;
let sequenceStartedAt = 0;
const choreography = createOllieChoreography({
  onBehaviorChange: applyCharacterBehavior,
  onPositionChange: applyCharacterPosition,
  onVisibleCountChange: applyVisibleInk,
});

document.body.append(inkField, olliePosition);
const dragController = createOllieDragController({
  character: ollieStage.querySelector(".ollie-character"),
  positionElement: olliePosition,
});
populateInkComparisons();
window.addEventListener(
  "pagehide",
  () => {
    choreography.dispose();
    dragController.dispose();
    window.clearTimeout(coverageTimer);
  },
  { once: true },
);

stateButtons.forEach((button) => {
  button.addEventListener("click", () => {
    cancelSequence();
    if (button.dataset.state !== "idle") {
      randomizePixelInkField(inkField);
    }
    applyState(button.dataset.state);
    sequenceStatus.textContent = "Direct state selected. Sequence stopped.";
  });
});

playSequenceButton.addEventListener("click", () => {
  if (playSequenceButton.dataset.playing === "true") {
    cancelSequence();
    applyState("idle");
    sequenceStatus.textContent = "Sequence cancelled.";
    return;
  }

  playSequence();
});

togglePanelButton.addEventListener("click", () => {
  const nextCollapsed = previewControls.dataset.collapsed !== "true";
  previewControls.dataset.collapsed = String(nextCollapsed);
  togglePanelButton.textContent = nextCollapsed
    ? "Show controls"
    : "Hide controls";
});

openInkComparisonButton.addEventListener("click", () => {
  cancelSequence();
  applyState("idle");
  inkComparisonPanel.hidden = false;
});

closeInkComparisonButton.addEventListener("click", () => {
  inkComparisonPanel.hidden = true;
});

const initialState = STATE_DETAILS[requestedState] ? requestedState : "idle";
if (initialState !== "idle") {
  randomizePixelInkField(inkField);
}
applyState(initialState);

function createOllieStage() {
  const stage = document.createElement("div");
  stage.className = "ollie-stage";
  stage.dataset.phase = "focus";
  stage.dataset.intervention = "idle";
  stage.dataset.behavior = "idle";
  stage.dataset.confidence = "cautious";
  stage.dataset.depth = "front";
  stage.append(createOllieCharacter({ title: "Ollie" }));
  return stage;
}

function applyState(state) {
  const details = STATE_DETAILS[state];
  if (!details) {
    return;
  }

  if (state !== "idle") {
    dragController.resetToAnchor();
  }

  ollieStage.dataset.intervention = state;
  inkField.dataset.intervention = state;
  choreography.setInterventionStage(state);
  stateTitle.textContent = details.title;
  stateDescription.textContent = details.description;
  coverageLabel.textContent = details.coverage;

  stateButtons.forEach((button) => {
    button.dataset.active = String(button.dataset.state === state);
  });
}

function applyCharacterBehavior(behavior, confidence) {
  ollieStage.dataset.behavior = behavior;
  inkField.dataset.behavior = behavior;
  ollieStage.dataset.confidence = confidence;
  behaviorLabel.textContent = BEHAVIOR_LABELS[behavior] ?? behavior;
}

function applyCharacterPosition(position, travelMs) {
  ollieStage.style.setProperty("--ollie-x", position.x);
  ollieStage.style.setProperty("--ollie-y", position.y);
  ollieStage.style.setProperty("--ollie-travel-ms", `${travelMs}ms`);
  ollieStage.style.setProperty("--ollie-aim-x", position.aimX);
  ollieStage.style.setProperty("--ollie-aim-y", position.aimY);
  ollieStage.dataset.depth = position.depth;
}

function applyVisibleInk(visibleCount, sprayIndex) {
  inkField.dataset.visibleCount = String(visibleCount);
  inkField.dataset.sprayIndex = String(sprayIndex ?? 0);
  scheduleCoverageMeasurement(visibleCount);
}

function scheduleCoverageMeasurement(visibleCount) {
  window.clearTimeout(coverageTimer);
  coverageLabel.textContent = "Measuring ink…";
  coverageTimer = window.setTimeout(() => {
    const coverage = measureInkCoverage(visibleCount);
    if (coverage === null) {
      scheduleCoverageMeasurement(visibleCount);
      return;
    }
    coverageLabel.dataset.measuredCoverage = coverage.toFixed(2);
    coverageLabel.textContent =
      coverage < 0.1
        ? "Measured < 0.1% ink"
        : `Measured ${coverage.toFixed(1)}% ink`;
  }, 220);
}

function measureInkCoverage(visibleCount) {
  const intervention = inkField.dataset.intervention;
  if (visibleCount === 0 && intervention !== "warning") {
    return 0;
  }

  const sampleSize = 2;
  const columns = Math.ceil(window.innerWidth / sampleSize);
  const rows = Math.ceil(window.innerHeight / sampleSize);
  const canvas = document.createElement("canvas");
  canvas.width = columns;
  canvas.height = rows;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.imageSmoothingEnabled = false;

  const persistentWarning = inkField.querySelector(".ollie-warning-mark");
  const visibleElements = intervention === "warning"
    ? [persistentWarning]
    : [
        persistentWarning,
        ...[...inkField.querySelectorAll("[data-spray-event]")].filter(
          (element) => Number(element.dataset.sprayEvent) <= visibleCount,
        ),
      ];
  const visibleImages = visibleElements.filter(
    (element) => element instanceof HTMLImageElement,
  );
  if (visibleImages.some((image) => !image.complete || !image.naturalWidth)) {
    return null;
  }

  visibleElements.forEach((element) => {
    if (element instanceof HTMLImageElement) {
      drawTransformedImage(context, element, sampleSize);
      return;
    }

    context.fillRect(
      element.offsetLeft / sampleSize,
      element.offsetTop / sampleSize,
      element.offsetWidth / sampleSize,
      element.offsetHeight / sampleSize,
    );
  });

  const pixels = context.getImageData(0, 0, columns, rows).data;
  let occupiedCount = 0;
  for (let index = 3; index < pixels.length; index += 4) {
    occupiedCount += Number(pixels[index] > 0);
  }
  return (occupiedCount / (columns * rows)) * 100;
}

function drawTransformedImage(context, image, sampleSize) {
  const jitterX = Number(image.dataset.jitterX ?? 0);
  const jitterY = Number(image.dataset.jitterY ?? 0);
  const flipX = Number(image.dataset.flipX ?? 1);
  const width = image.offsetWidth;
  const height = image.offsetHeight;
  const centerX = image.offsetLeft + width / 2 + jitterX;
  const centerY = image.offsetTop + height / 2 + jitterY;

  context.save();
  context.translate(centerX / sampleSize, centerY / sampleSize);
  context.scale(flipX, 1);
  context.drawImage(
    image,
    -width / 2 / sampleSize,
    -height / 2 / sampleSize,
    width / sampleSize,
    height / sampleSize,
  );
  context.restore();
}

function populateInkComparisons() {
  const clusters = [...inkField.querySelectorAll(".ollie-splatter")];
  const phaseRanges = Object.freeze({
    "attack-one": [1, 2],
    "attack-two": [3, 5],
    "attack-final": [6, 8],
  });

  Object.entries(phaseRanges).forEach(([phase, [start, end]]) => {
    const output = document.querySelector(
      `[data-comparison-phase="${phase}"]`,
    );
    clusters
      .filter(({ dataset }) => {
        const eventIndex = Number(dataset.sprayEvent);
        return eventIndex >= start && eventIndex <= end;
      })
      .forEach((cluster) => {
        const comparisonUnit = cluster.cloneNode(true);
        comparisonUnit.removeAttribute("style");
        output.append(comparisonUnit);
      });
  });
}

function playSequence() {
  cancelSequence();
  randomizePixelInkField(inkField);
  sequenceStartedAt = Date.now();
  playSequenceButton.dataset.playing = "true";
  playSequenceButton.textContent = "Stop sequence";

  SEQUENCE.forEach(({ state, delay }) => {
    sequenceTimers.push(
      window.setTimeout(() => applyState(state), delay),
    );
  });

  updateSequenceStatus();
  countdownTimer = window.setInterval(updateSequenceStatus, 200);
}

function updateSequenceStatus() {
  const totalDuration = SEQUENCE.at(-1).delay;
  const elapsed = Date.now() - sequenceStartedAt;
  const remainingSeconds = Math.max(
    0,
    Math.ceil((totalDuration - elapsed) / 1000),
  );

  if (elapsed >= totalDuration) {
    window.clearInterval(countdownTimer);
    countdownTimer = null;
    sequenceTimers = [];
    playSequenceButton.dataset.playing = "false";
    playSequenceButton.textContent = "Replay real escalation · 14s";
    sequenceStatus.textContent = "Sequence complete. Final phase remains visible.";
    return;
  }

  sequenceStatus.textContent = `Real timing active · ${remainingSeconds}s to final phase`;
}

function cancelSequence() {
  sequenceTimers.forEach((timerId) => window.clearTimeout(timerId));
  sequenceTimers = [];
  if (countdownTimer !== null) {
    window.clearInterval(countdownTimer);
    countdownTimer = null;
  }
  playSequenceButton.dataset.playing = "false";
  playSequenceButton.textContent = "Play real escalation · 14s";
}

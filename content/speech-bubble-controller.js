import {
  setSpeechBubbleText,
  SPEECH_BUBBLE_TAIL_SIDE,
} from "./speech-bubble.js";

export const SPEECH_BUBBLE_TIMING = Object.freeze({
  anticipationMs: 220,
  enterMs: 240,
  exitMs: 220,
  minimumReadMs: 3_200,
  maximumReadMs: 6_800,
  readMsPerCharacter: 32,
  maximumStabilityWaitMs: 1_200,
});

const NATURAL_SIZE = Object.freeze({ width: 240, height: 104 });
const VIEWPORT_MARGIN_PX = 12;
const ANCHOR_GAP_PX = 8;
const ORIENTATION_HYSTERESIS_PX = 48;
const UNSTABLE_BEHAVIORS = new Set(["hop", "land", "emerge", "aim", "spray"]);

const POSITION_TO_TAIL = Object.freeze({
  left: SPEECH_BUBBLE_TAIL_SIDE.RIGHT,
  right: SPEECH_BUBBLE_TAIL_SIDE.LEFT,
  top: SPEECH_BUBBLE_TAIL_SIDE.BOTTOM,
  bottom: SPEECH_BUBBLE_TAIL_SIDE.TOP,
});

export function createSpeechBubbleController({
  anchor,
  boundsProvider,
  bubble,
  stage,
  windowRef = window,
}) {
  let currentDirection = null;
  let currentMessage = "";
  let pendingMessage = "";
  let phase = "hidden";
  let positionFrameId = null;
  const scheduledTimers = new Set();

  bubble.dataset.presentation = phase;

  function present(message) {
    const normalizedMessage = typeof message === "string" ? message.trim() : "";
    if (!normalizedMessage) {
      pendingMessage = "";
      currentMessage = "";
      beginExit();
      return;
    }

    if (
      normalizedMessage === currentMessage ||
      normalizedMessage === pendingMessage
    ) {
      return;
    }

    pendingMessage = normalizedMessage;
    if (phase === "hidden") {
      startPendingMessage();
    } else if (phase !== "exiting") {
      beginExit();
    }
  }

  function startPendingMessage() {
    if (!pendingMessage) {
      return;
    }

    clearScheduledTimers();
    currentMessage = pendingMessage;
    pendingMessage = "";
    setSpeechBubbleText(bubble, currentMessage);
    bubble.hidden = false;
    phase = "anticipating";
    bubble.dataset.presentation = phase;
    startPositionLoop();
    waitForStableAnchor(Date.now());
  }

  function waitForStableAnchor(startedAt) {
    const waitedMs = Date.now() - startedAt;
    if (
      isAnchorStable() ||
      waitedMs >= SPEECH_BUBBLE_TIMING.maximumStabilityWaitMs
    ) {
      schedule(beginEnter, SPEECH_BUBBLE_TIMING.anticipationMs);
      return;
    }

    schedule(() => waitForStableAnchor(startedAt), 50);
  }

  function beginEnter() {
    phase = "entering";
    bubble.dataset.presentation = phase;
    schedule(() => {
      phase = "visible";
      bubble.dataset.presentation = phase;
      schedule(beginExit, getReadDuration(currentMessage));
    }, SPEECH_BUBBLE_TIMING.enterMs);
  }

  function beginExit() {
    if (phase === "hidden") {
      hideBubble();
      return;
    }

    clearScheduledTimers();
    phase = "exiting";
    bubble.dataset.presentation = phase;
    schedule(() => {
      hideBubble();
      if (pendingMessage) {
        startPendingMessage();
      }
    }, SPEECH_BUBBLE_TIMING.exitMs);
  }

  function hideBubble() {
    clearScheduledTimers();
    phase = "hidden";
    bubble.dataset.presentation = phase;
    bubble.hidden = true;
    stopPositionLoop();
  }

  function isAnchorStable() {
    return !UNSTABLE_BEHAVIORS.has(stage.dataset.behavior);
  }

  function positionNow() {
    const bounds = getBounds(boundsProvider, windowRef);
    const anchorRect = anchor.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const bubbleSize = applyResponsiveSize(bubble, bounds);
    const direction = chooseDirection(
      bounds,
      anchorRect,
      bubbleSize,
      currentDirection,
    );
    const viewportPosition = getViewportPosition(
      direction,
      bounds,
      anchorRect,
      bubbleSize,
    );
    const scaleX = stage.offsetWidth ? stageRect.width / stage.offsetWidth : 1;
    const scaleY = stage.offsetHeight ? stageRect.height / stage.offsetHeight : 1;

    currentDirection = direction;
    bubble.dataset.position = direction;
    bubble.dataset.tailSide = POSITION_TO_TAIL[direction];
    bubble.style.left = `${(viewportPosition.x - stageRect.left) / (scaleX || 1)}px`;
    bubble.style.top = `${(viewportPosition.y - stageRect.top) / (scaleY || 1)}px`;
    bubble.style.right = "auto";
    return { direction, ...viewportPosition, ...bubbleSize };
  }

  function startPositionLoop() {
    if (positionFrameId !== null) {
      return;
    }

    const update = () => {
      positionNow();
      positionFrameId = windowRef.requestAnimationFrame(update);
    };
    update();
  }

  function stopPositionLoop() {
    if (positionFrameId === null) {
      return;
    }
    windowRef.cancelAnimationFrame(positionFrameId);
    positionFrameId = null;
  }

  function schedule(callback, delayMs) {
    const timerId = windowRef.setTimeout(() => {
      scheduledTimers.delete(timerId);
      callback();
    }, delayMs);
    scheduledTimers.add(timerId);
  }

  function clearScheduledTimers() {
    scheduledTimers.forEach((timerId) => windowRef.clearTimeout(timerId));
    scheduledTimers.clear();
  }

  function dispose() {
    pendingMessage = "";
    currentMessage = "";
    clearScheduledTimers();
    stopPositionLoop();
    bubble.hidden = true;
  }

  return {
    dispose,
    positionNow,
    present,
  };
}

function getReadDuration(message) {
  return Math.min(
    SPEECH_BUBBLE_TIMING.maximumReadMs,
    Math.max(
      SPEECH_BUBBLE_TIMING.minimumReadMs,
      SPEECH_BUBBLE_TIMING.minimumReadMs +
        message.length * SPEECH_BUBBLE_TIMING.readMsPerCharacter,
    ),
  );
}

function getBounds(boundsProvider, windowRef) {
  if (typeof boundsProvider === "function") {
    const provided = boundsProvider();
    if (provided?.width > 0 && provided?.height > 0) {
      return provided;
    }
  }

  return {
    left: 0,
    top: 0,
    right: windowRef.innerWidth,
    bottom: windowRef.innerHeight,
    width: windowRef.innerWidth,
    height: windowRef.innerHeight,
  };
}

function applyResponsiveSize(bubble, bounds) {
  const widthScale =
    Math.max(1, bounds.width - VIEWPORT_MARGIN_PX * 2) / NATURAL_SIZE.width;
  const heightScale =
    Math.max(1, bounds.height - VIEWPORT_MARGIN_PX * 2) / NATURAL_SIZE.height;
  const scale = Math.min(
    1,
    Math.max(0.01, widthScale),
    Math.max(0.01, heightScale),
  );
  const width = Math.max(1, Math.floor(NATURAL_SIZE.width * scale));
  const height = Math.max(1, Math.floor(NATURAL_SIZE.height * scale));

  bubble.style.width = `${width}px`;
  bubble.style.height = `${height}px`;
  bubble.dataset.size = scale < 0.85 ? "compact" : "regular";
  return { width, height };
}

function chooseDirection(bounds, anchorRect, bubbleSize, currentDirection) {
  const available = {
    left: anchorRect.left - bounds.left - VIEWPORT_MARGIN_PX,
    right: bounds.right - anchorRect.right - VIEWPORT_MARGIN_PX,
    top: anchorRect.top - bounds.top - VIEWPORT_MARGIN_PX,
    bottom: bounds.bottom - anchorRect.bottom - VIEWPORT_MARGIN_PX,
  };
  const required = {
    left: bubbleSize.width + ANCHOR_GAP_PX,
    right: bubbleSize.width + ANCHOR_GAP_PX,
    top: bubbleSize.height + ANCHOR_GAP_PX,
    bottom: bubbleSize.height + ANCHOR_GAP_PX,
  };
  const candidates = Object.keys(available).map((direction) => ({
    direction,
    fits: available[direction] >= required[direction],
    ratio: available[direction] / required[direction],
    surplus: available[direction] - required[direction],
  }));
  const fittingCandidates = candidates
    .filter((candidate) => candidate.fits)
    .sort((left, right) => right.surplus - left.surplus);

  if (fittingCandidates.length) {
    const best = fittingCandidates[0];
    const current = fittingCandidates.find(
      (candidate) => candidate.direction === currentDirection,
    );
    if (
      current &&
      best.surplus - current.surplus < ORIENTATION_HYSTERESIS_PX
    ) {
      return current.direction;
    }
    return best.direction;
  }

  return candidates.sort((left, right) => right.ratio - left.ratio)[0].direction;
}

function getViewportPosition(
  direction,
  bounds,
  anchorRect,
  bubbleSize,
) {
  const centeredX =
    anchorRect.left + anchorRect.width / 2 - bubbleSize.width / 2;
  const centeredY =
    anchorRect.top + anchorRect.height / 2 - bubbleSize.height / 2;
  const positions = {
    left: {
      x: anchorRect.left - ANCHOR_GAP_PX - bubbleSize.width,
      y: centeredY,
    },
    right: {
      x: anchorRect.right + ANCHOR_GAP_PX,
      y: centeredY,
    },
    top: {
      x: centeredX,
      y: anchorRect.top - ANCHOR_GAP_PX - bubbleSize.height,
    },
    bottom: {
      x: centeredX,
      y: anchorRect.bottom + ANCHOR_GAP_PX,
    },
  };
  const position = positions[direction];

  return {
    x: clamp(
      position.x,
      bounds.left + VIEWPORT_MARGIN_PX,
      bounds.right - VIEWPORT_MARGIN_PX - bubbleSize.width,
    ),
    y: clamp(
      position.y,
      bounds.top + VIEWPORT_MARGIN_PX,
      bounds.bottom - VIEWPORT_MARGIN_PX - bubbleSize.height,
    ),
  };
}

function clamp(value, minimum, maximum) {
  if (maximum < minimum) {
    return minimum;
  }
  return Math.min(maximum, Math.max(minimum, value));
}

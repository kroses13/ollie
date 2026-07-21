import {
  createSpeechBubble,
  SPEECH_BUBBLE_SPARKLE_TONE,
  SPEECH_BUBBLE_TAIL_SIDE,
  setSpeechBubbleText,
} from "../content/speech-bubble.js";
import {
  createOllieCharacter,
  createOllieSpeechBubble,
} from "../content/companion-view.js";
import { createSpeechBubbleController } from "../content/speech-bubble-controller.js";

const copyInput = document.querySelector("#preview-copy");
const productionMount = document.querySelector("#production-mount");
const zoomMount = document.querySelector("#zoom-mount");
const tailInputs = [...document.querySelectorAll('input[name="tail"]')];
const sparkleInputs = [
  ...document.querySelectorAll('input[name="sparkle"]'),
];
const positioningLab = document.querySelector("#positioning-lab");
const positioningStage = document.querySelector("#positioning-stage");
const placementReadout = document.querySelector("#placement-readout");

const productionBubble = createSpeechBubble({ text: copyInput.value });
const zoomBubble = createSpeechBubble({ text: copyInput.value });
productionMount.append(productionBubble);
zoomMount.append(zoomBubble);

const movingCharacter = createOllieCharacter({ title: "Ollie preview" });
const attachedBubble = createOllieSpeechBubble();
positioningStage.append(movingCharacter, attachedBubble);
const bubbleController = createSpeechBubbleController({
  anchor: movingCharacter,
  boundsProvider: () => positioningLab.getBoundingClientRect(),
  bubble: attachedBubble,
  stage: positioningStage,
});
moveCharacter("right", false);
bubbleController.present(copyInput.value);

copyInput.addEventListener("input", render);
tailInputs.forEach((input) => input.addEventListener("change", render));
sparkleInputs.forEach((input) => input.addEventListener("change", render));
document.querySelectorAll("[data-anchor-position]").forEach((button) => {
  button.addEventListener("click", () =>
    moveCharacter(button.dataset.anchorPosition),
  );
});
document.querySelectorAll("[data-lab-size]").forEach((button) => {
  button.addEventListener("click", () => {
    positioningLab.dataset.size = button.dataset.labSize;
    window.requestAnimationFrame(() => {
      moveCharacter(movingCharacter.dataset.previewPosition ?? "right", false);
      updatePlacementReadout();
    });
  });
});
document.querySelector("#travel-button").addEventListener("click", () => {
  moveCharacter("left");
  replayAttachedBubble();
  window.setTimeout(() => moveCharacter("right"), 500);
});
document.querySelector("#hop-speak-button").addEventListener("click", () => {
  positioningStage.dataset.behavior = "hop";
  replayAttachedBubble();
  window.setTimeout(() => {
    positioningStage.dataset.behavior = "idle";
  }, 600);
});
document
  .querySelector("#speak-button")
  .addEventListener("click", replayAttachedBubble);
window.addEventListener("resize", updatePlacementReadout);

function render() {
  const selectedTail = tailInputs.find((input) => input.checked)?.value;
  const tailSide = Object.values(SPEECH_BUBBLE_TAIL_SIDE).includes(selectedTail)
    ? selectedTail
    : SPEECH_BUBBLE_TAIL_SIDE.LEFT;
  const sparkleTone =
    sparkleInputs.find((input) => input.checked)?.value ===
    SPEECH_BUBBLE_SPARKLE_TONE.GREY
      ? SPEECH_BUBBLE_SPARKLE_TONE.GREY
      : SPEECH_BUBBLE_SPARKLE_TONE.YELLOW;

  [productionBubble, zoomBubble].forEach((bubble) => {
    bubble.dataset.sparkleTone = sparkleTone;
    bubble.dataset.tailSide = tailSide;
    setSpeechBubbleText(bubble, copyInput.value);
  });

  attachedBubble.dataset.sparkleTone = sparkleTone;
  bubbleController.present(copyInput.value);
  updatePlacementReadout();
}

function moveCharacter(positionName, animate = true) {
  const characterWidth = 96;
  const characterHeight = 72;
  const inset = 8;
  const stageWidth = positioningStage.clientWidth;
  const stageHeight = positioningStage.clientHeight;
  const centerX = Math.round((stageWidth - characterWidth) / 2);
  const centerY = Math.round((stageHeight - characterHeight) / 2);
  const positions = {
    left: { x: inset, y: centerY },
    right: { x: stageWidth - characterWidth - inset, y: centerY },
    top: { x: centerX, y: inset },
    bottom: { x: centerX, y: stageHeight - characterHeight - inset },
    "top-left": { x: inset, y: inset },
    "bottom-right": {
      x: stageWidth - characterWidth - inset,
      y: stageHeight - characterHeight - inset,
    },
  };
  const position = positions[positionName] ?? positions.right;

  movingCharacter.dataset.previewPosition = positionName;
  movingCharacter.dataset.animate = animate ? "true" : "false";
  movingCharacter.style.left = `${Math.max(inset, position.x)}px`;
  movingCharacter.style.top = `${Math.max(inset, position.y)}px`;
  bubbleController.positionNow();
  window.setTimeout(updatePlacementReadout, animate ? 760 : 0);
}

function replayAttachedBubble() {
  bubbleController.present("");
  window.setTimeout(() => bubbleController.present(copyInput.value), 240);
}

function updatePlacementReadout() {
  if (attachedBubble.hidden) {
    placementReadout.textContent = "Bubble preparing…";
    return;
  }

  const bubbleRect = attachedBubble.getBoundingClientRect();
  const labRect = positioningLab.getBoundingClientRect();
  const isContained =
    bubbleRect.left >= labRect.left &&
    bubbleRect.top >= labRect.top &&
    bubbleRect.right <= labRect.right &&
    bubbleRect.bottom <= labRect.bottom;
  placementReadout.textContent =
    `${attachedBubble.dataset.position} · ` +
    `tail ${attachedBubble.dataset.tailSide} · ` +
    `${isContained ? "contained" : "clipped"}`;
}

window.setInterval(updatePlacementReadout, 250);

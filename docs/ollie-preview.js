import {
  createOllieCharacter,
  createOllieSpeechBubble,
  createOllieSvg,
  setOlliePose,
} from "../content/companion-view.js";
import {
  createOllieBehaviorController,
  OLLIE_BEHAVIOR_TIMING,
} from "../content/ollie-behavior-controller.js";
import { OLLIE_POSE, OLLIE_POSE_LAYOUTS } from "../content/ollie-grid.js";
import { createOllieDragController } from "../content/drag-controller.js";
import { createSpeechBubbleController } from "../content/speech-bubble-controller.js";

const previewParameters = new URLSearchParams(window.location.search);
if (previewParameters.get("background") === "plain") {
  document.documentElement.dataset.previewBackground = "plain";
}

const heroPreview = document.querySelector("#hero-preview");
const heroSvg = createOllieSvg({ className: "hero-svg" });
heroPreview.append(heroSvg);

const sizePreviews = document.querySelector("#size-previews");

[24, 32, 48].forEach((width) => {
  const card = document.createElement("article");
  card.className = "size-card";

  const svg = createOllieSvg();
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String((width * 18) / 24));

  const label = document.createElement("p");
  label.textContent = `${width}px wide`;

  card.append(svg, label);
  sizePreviews.append(card);
});

const poseGrid = document.querySelector("#pose-grid");
const POSE_PREVIEWS = Object.freeze([
  ["5", "Looking left", OLLIE_POSE.LOOK_LEFT, "Directional gaze with the canonical side-curl silhouette."],
  ["6", "Looking right", OLLIE_POSE.LOOK_RIGHT, "Mirrored gaze without mirroring Ollie's authored asymmetry."],
  ["7", "Thinking", OLLIE_POSE.THINKING, "Lower inward gaze and a curled thinking tentacle."],
  ["8", "Holding hammer", OLLIE_POSE.HOLDING_HAMMER, "Raised silver head and connected brown handle, with Ollie's palette unchanged."],
  ["9", "Hammer strike", OLLIE_POSE.HAMMER_STRIKE, "Connected two-cell handle steps complete the readable downward swing."],
  ["10", "Working at laptop", OLLIE_POSE.WORKING_LAPTOP, "The approved working posture now engages a clearly light-grey laptop."],
  ["12", "Sleeping", OLLIE_POSE.SLEEPING, "Balanced resting silhouette with a clearly outlined curl on the right."],
]);

POSE_PREVIEWS.forEach(([reference, label, pose, note]) => {
  const card = document.createElement("article");
  card.className = "pose-card";

  const heading = document.createElement("h3");
  heading.textContent = `${reference}. ${label}`;

  const artboard = document.createElement("div");
  artboard.className = "pose-card__artboard";
  const svg = createOllieSvg({ pose, title: `Ollie ${label.toLowerCase()}` });
  const layout = OLLIE_POSE_LAYOUTS[pose];
  svg.setAttribute("width", "240");
  svg.setAttribute("height", String((240 * layout.height) / layout.width));
  artboard.append(svg);

  const description = document.createElement("p");
  description.textContent = note;
  card.append(heading, artboard, description);
  poseGrid.append(card);
});

const behaviorViewport = document.querySelector("#behavior-viewport");
const behaviorPose = document.querySelector("#behavior-pose");
const behaviorStage = document.createElement("div");
behaviorStage.className = "ollie-stage behavior-lab__stage";
behaviorStage.dataset.phase = "focus";
behaviorStage.dataset.intervention = "idle";
behaviorStage.dataset.behavior = "idle";
behaviorStage.dataset.confidence = "cautious";
behaviorStage.dataset.depth = "front";

const behaviorCharacter = createOllieCharacter({ title: "Live behavior Ollie" });
const behaviorBubble = createOllieSpeechBubble();
behaviorStage.append(behaviorCharacter, behaviorBubble);
behaviorViewport.append(behaviorStage);

const behaviorSpeech = createSpeechBubbleController({
  anchor: behaviorCharacter,
  bubble: behaviorBubble,
  stage: behaviorStage,
});
let demoRandomValue = 0.13;
const behaviorController = createOllieBehaviorController({
  character: behaviorCharacter,
  speechBubbleController: behaviorSpeech,
  random: () => {
    demoRandomValue = (demoRandomValue + 0.37) % 1;
    return demoRandomValue;
  },
  timing: {
    ...OLLIE_BEHAVIOR_TIMING,
    speakingQuietPeriodMs: 3_000,
    lookDelayMinMs: 2_200,
    lookDelayMaxMs: 3_600,
    lookHoldMinMs: 800,
    lookHoldMaxMs: 1_200,
    laptopDelayMinMs: 6_000,
    laptopDelayMaxMs: 7_500,
    laptopHoldMinMs: 2_400,
    laptopHoldMaxMs: 3_200,
  },
});
behaviorController.setSessionState({ phase: "focus", isDistracted: false });

let demoMessageIndex = 0;
document.querySelectorAll("[data-demo]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.demo === "distract") {
      behaviorStage.dataset.phase = "focus";
      behaviorController.setSessionState({ phase: "focus", isDistracted: true });
      behaviorController.setChoreographyBehavior("think");
      behaviorController.present("That looks suspicious. Back to the task?");
      return;
    }

    if (button.dataset.demo === "break") {
      behaviorStage.dataset.phase = "break";
      behaviorController.setSessionState({ phase: "break", isDistracted: false });
      behaviorController.present("Break time. I’ll keep watch from here.");
      return;
    }

    behaviorStage.dataset.phase = "focus";
    behaviorController.setSessionState({ phase: "focus", isDistracted: false });
    behaviorController.setChoreographyBehavior("idle");
    if (button.dataset.demo === "speak") {
      demoMessageIndex += 1;
      behaviorController.present(
        `Thought ${demoMessageIndex}: one small step, then the next.`,
      );
    } else {
      behaviorController.present("");
    }
  });
});

const poseStatusTimer = window.setInterval(() => {
  behaviorPose.textContent = behaviorController.getPose();
}, 100);

window.addEventListener(
  "pagehide",
  () => {
    window.clearInterval(poseStatusTimer);
    behaviorController.dispose();
    behaviorSpeech.dispose();
  },
  { once: true },
);

const footprintCheck = document.querySelector("#footprint-check");
const footprintResult = verifyPropPoseFootprints();
footprintCheck.textContent = footprintResult.ok
  ? `Edge footprint check: pass · ${footprintResult.checked} prop/edge combinations`
  : "Edge footprint check: failed · inspect viewport bounds";

function verifyPropPoseFootprints() {
  const propPoses = [
    OLLIE_POSE.HOLDING_HAMMER,
    OLLIE_POSE.HAMMER_STRIKE,
    OLLIE_POSE.WORKING_LAPTOP,
  ];
  let checked = 0;
  let ok = true;

  ["left", "right"].forEach((edge) => {
    const host = document.createElement("div");
    host.style.position = "fixed";
    host.style.top = "16px";
    host.style.width = "96px";
    host.style.height = "72px";
    host.style.visibility = "hidden";
    host.style.pointerEvents = "none";
    host.style.setProperty(edge, "0px");

    const stage = document.createElement("div");
    stage.className = "ollie-stage";
    const character = createOllieCharacter({ title: "Footprint check" });
    stage.append(character);
    host.append(stage);
    document.body.append(host);

    const dragController = createOllieDragController({
      character,
      positionElement: host,
    });
    propPoses.forEach((pose) => {
      setOlliePose(character, pose);
      dragController.clampCurrentPosition({ force: true });
      const rect = character.getBoundingClientRect();
      ok = ok && rect.left >= 0 && rect.right <= window.innerWidth;
      checked += 1;
    });
    dragController.dispose();
    host.remove();
  });

  return { checked, ok };
}

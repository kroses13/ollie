import {
  OLLIE_ACTION_TENTACLE_GRID,
  OLLIE_GRID_HEIGHT,
  OLLIE_GRID_WIDTH,
  OLLIE_IDLE_GRID,
  OLLIE_POSE,
  OLLIE_POSE_GRIDS,
  OLLIE_POSE_LAYOUTS,
} from "./ollie-grid.js";
import {
  createSpeechBubble,
  SPEECH_BUBBLE_TAIL_SIDE,
} from "./speech-bubble.js";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const DEFAULT_TITLE = "Ollie";
const RENDERED_PIXEL_SIZE = 4;

function createPixelLayer(layerName, grid, groupedPixels = []) {
  const layer = document.createElementNS(SVG_NAMESPACE, "g");
  layer.dataset.layer = layerName;

  const groups = groupedPixels.map(({ id, includes }) => {
    const group = document.createElementNS(SVG_NAMESPACE, "g");
    group.id = id;
    layer.append(group);
    return { element: group, includes };
  });

  grid.forEach((row, y) => {
    row.forEach((role, x) => {
      if (!role) {
        return;
      }

      const pixel = document.createElementNS(SVG_NAMESPACE, "rect");
      pixel.setAttribute("x", String(x));
      pixel.setAttribute("y", String(y));
      pixel.setAttribute("width", "1");
      pixel.setAttribute("height", "1");
      pixel.setAttribute("class", `ollie-pixel ollie-pixel--${role}`);
      pixel.dataset.role = role;
      const targetGroup = groups.find(({ includes }) => includes(x, y));
      (targetGroup?.element ?? layer).append(pixel);
    });
  });

  return layer;
}

export function createOllieSvg({
  title = DEFAULT_TITLE,
  actionTentacleVisible = true,
  className = "",
  pose = OLLIE_POSE.IDLE,
} = {}) {
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  svg.setAttribute("xmlns", SVG_NAMESPACE);
  svg.setAttribute("viewBox", `0 0 ${OLLIE_GRID_WIDTH} ${OLLIE_GRID_HEIGHT}`);
  svg.setAttribute("shape-rendering", "crispEdges");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", title);
  svg.setAttribute("class", ["ollie-svg", className].filter(Boolean).join(" "));
  applySvgPoseLayout(svg, pose);

  const idleBody = createPixelLayer("idle-body", OLLIE_IDLE_GRID, [
    {
      id: "ollie-left-ear",
      includes: (x, y) => x <= 5 && y >= 3 && y <= 9,
    },
  ]);
  idleBody.classList.add("ollie-pose-layer");
  idleBody.dataset.pose = OLLIE_POSE.IDLE;
  svg.append(idleBody);

  const actionTentacle = createPixelLayer(
    "action-tentacle",
    OLLIE_ACTION_TENTACLE_GRID,
  );
  actionTentacle.id = "ollie-action-tentacle";
  actionTentacle.classList.add("ollie-pose-layer");
  actionTentacle.dataset.pose = OLLIE_POSE.IDLE;
  actionTentacle.hidden = !actionTentacleVisible;
  if (!actionTentacleVisible) {
    actionTentacle.setAttribute("display", "none");
  }
  svg.append(actionTentacle);

  Object.entries(OLLIE_POSE_GRIDS).forEach(([poseName, grid]) => {
    const poseLayer = createPixelLayer(`${poseName}-body`, grid);
    poseLayer.classList.add("ollie-pose-layer");
    poseLayer.dataset.pose = poseName;
    svg.append(poseLayer);
  });

  return svg;
}

export function setOlliePose(target, pose) {
  const svg = target.matches?.(".ollie-svg")
    ? target
    : target.querySelector?.(".ollie-svg");
  if (!svg || !Object.values(OLLIE_POSE).includes(pose)) {
    return false;
  }

  const layout = applySvgPoseLayout(svg, pose);
  const character = target.matches?.(".ollie-character")
    ? target
    : target.closest?.(".ollie-character");
  if (character) {
    character.style.width = `${layout.width * RENDERED_PIXEL_SIZE}px`;
    character.style.height = `${layout.height * RENDERED_PIXEL_SIZE}px`;
    character.dataset.pose = pose;
  }
  return true;
}

function applySvgPoseLayout(svg, pose) {
  const layout = OLLIE_POSE_LAYOUTS[pose] ?? OLLIE_POSE_LAYOUTS[OLLIE_POSE.IDLE];
  svg.dataset.pose = OLLIE_POSE_LAYOUTS[pose] ? pose : OLLIE_POSE.IDLE;
  svg.dataset.gridWidth = String(layout.width);
  svg.dataset.gridHeight = String(layout.height);
  svg.setAttribute("viewBox", `0 0 ${layout.width} ${layout.height}`);
  svg.setAttribute("width", String(layout.width * RENDERED_PIXEL_SIZE));
  svg.setAttribute("height", String(layout.height * RENDERED_PIXEL_SIZE));
  return layout;
}

export function createOllieCharacter({ title = DEFAULT_TITLE } = {}) {
  const character = document.createElement("div");
  character.className = "ollie-character";

  const svg = createOllieSvg({ title });

  const warningInk = document.createElement("img");
  warningInk.className = "ollie-warning-ink";
  warningInk.src = new URL(
    "../assets/ink/canonical/approved-small.svg",
    import.meta.url,
  ).href;
  warningInk.alt = "";
  warningInk.draggable = false;
  warningInk.width = 82;
  warningInk.height = 68;

  const sprayPixel = document.createElement("div");
  sprayPixel.className = "ollie-spray-pixel";

  character.append(svg, warningInk, sprayPixel);
  setOlliePose(character, OLLIE_POSE.IDLE);
  return character;
}

export function createOllieSpeechBubble() {
  return createSpeechBubble({
    tailSide: SPEECH_BUBBLE_TAIL_SIDE.RIGHT,
  });
}

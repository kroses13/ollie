import {
  OLLIE_ACTION_TENTACLE_GRID,
  OLLIE_GRID_HEIGHT,
  OLLIE_GRID_WIDTH,
  OLLIE_IDLE_GRID,
} from "./ollie-grid.js";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const DEFAULT_TITLE = "Ollie";

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
} = {}) {
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  svg.setAttribute("xmlns", SVG_NAMESPACE);
  svg.setAttribute("viewBox", `0 0 ${OLLIE_GRID_WIDTH} ${OLLIE_GRID_HEIGHT}`);
  svg.setAttribute("shape-rendering", "crispEdges");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", title);
  svg.setAttribute("class", ["ollie-svg", className].filter(Boolean).join(" "));

  svg.append(
    createPixelLayer("idle-body", OLLIE_IDLE_GRID, [
      {
        id: "ollie-left-ear",
        includes: (x, y) => x <= 5 && y >= 3 && y <= 9,
      },
    ]),
  );

  const actionTentacle = createPixelLayer(
    "action-tentacle",
    OLLIE_ACTION_TENTACLE_GRID,
  );
  actionTentacle.id = "ollie-action-tentacle";
  actionTentacle.hidden = !actionTentacleVisible;
  if (!actionTentacleVisible) {
    actionTentacle.setAttribute("display", "none");
  }
  svg.append(actionTentacle);

  return svg;
}

export function createOllieCharacter({ title = DEFAULT_TITLE } = {}) {
  const character = document.createElement("div");
  character.className = "ollie-character";

  const svg = createOllieSvg({ title });
  svg.setAttribute("width", "96");
  svg.setAttribute("height", "72");

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
  return character;
}

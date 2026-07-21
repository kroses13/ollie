const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

export const SPEECH_BUBBLE_TAIL_SIDE = Object.freeze({
  LEFT: "left",
  RIGHT: "right",
  TOP: "top",
  BOTTOM: "bottom",
});

export const SPEECH_BUBBLE_SPARKLE_TONE = Object.freeze({
  GREY: "grey",
  YELLOW: "yellow",
});

const FRAME_VIEWBOX = Object.freeze({ width: 120, height: 52 });

const BODY_POINTS = Object.freeze({
  outline:
    "16,4 104,4 104,5 108,5 108,6 111,6 111,8 113,8 " +
    "113,11 115,11 115,15 116,15 116,37 115,37 115,41 " +
    "113,41 113,44 111,44 111,46 108,46 108,47 104,47 " +
    "104,48 16,48 16,47 12,47 12,46 9,46 9,44 7,44 7,41 " +
    "5,41 5,37 4,37 4,15 5,15 5,11 7,11 7,8 9,8 9,6 " +
    "12,6 12,5 16,5",
  depth:
    "16,6 104,6 104,7 108,7 108,8 110,8 110,10 112,10 " +
    "112,13 113,13 113,17 114,17 114,36 113,36 113,40 " +
    "112,40 112,42 110,42 110,44 108,44 108,45 104,45 " +
    "104,46 16,46 16,45 12,45 12,44 10,44 10,42 8,42 " +
    "8,40 7,40 7,36 6,36 6,17 7,17 7,13 8,13 8,10 " +
    "10,10 10,8 12,8 12,7 16,7",
  fill:
    "16,6 104,6 104,7 108,7 108,8 110,8 110,10 112,10 " +
    "112,13 113,13 113,17 114,17 114,35 113,35 113,39 " +
    "112,39 112,41 110,41 110,43 108,43 108,44 104,44 " +
    "16,44 16,43 12,43 12,42 10,42 10,40 8,40 8,38 7,38 " +
    "7,35 6,35 6,17 7,17 7,13 8,13 8,10 10,10 10,8 " +
    "12,8 12,7 16,7",
});

const TAIL_POINTS = Object.freeze({
  left: Object.freeze({
    outline: "6,18 6,36 4,36 4,33 2,33 2,30 0,30 0,24 2,24 2,21 4,21 4,18",
    fill: "8,22 8,32 6,32 6,30 4,30 4,28 2,28 2,26 4,26 4,24 6,24 6,22",
  }),
  right: Object.freeze({
    outline: "114,18 114,36 116,36 116,33 118,33 118,30 120,30 120,24 118,24 118,21 116,21 116,18",
    fill: "112,22 112,32 114,32 114,30 116,30 116,28 118,28 118,26 116,26 116,24 114,24 114,22",
  }),
  top: Object.freeze({
    outline: "49,6 71,6 71,5 68,5 68,3 64,3 64,0 56,0 56,3 52,3 52,5 49,5",
    fill: "53,8 67,8 67,7 64,7 64,5 62,5 62,2 58,2 58,5 56,5 56,7 53,7",
  }),
  bottom: Object.freeze({
    outline: "49,46 71,46 71,47 68,47 68,49 64,49 64,52 56,52 56,49 52,49 52,47 49,47",
    fill: "53,44 67,44 67,45 64,45 64,47 62,47 62,50 58,50 58,47 56,47 56,45 53,45",
  }),
});

export function createSpeechBubble({
  sparkleTone = SPEECH_BUBBLE_SPARKLE_TONE.YELLOW,
  text = "",
  tailSide = SPEECH_BUBBLE_TAIL_SIDE.LEFT,
} = {}) {
  const bubble = document.createElement("div");
  bubble.className = "ollie-speech-bubble";
  bubble.dataset.sparkleTone = normalizeSparkleTone(sparkleTone);
  bubble.dataset.tailSide = normalizeTailSide(tailSide);

  const frame = createFrame();
  const message = document.createElement("p");
  message.className = "ollie-speech-bubble__text";

  const sparkle = createSparkle();
  const content = document.createElement("div");
  content.className = "ollie-speech-bubble__content";
  content.append(message, sparkle);

  bubble.append(frame, content);
  setSpeechBubbleText(bubble, text);
  return bubble;
}

export function setSpeechBubbleText(bubble, text) {
  const message = bubble.querySelector(".ollie-speech-bubble__text");
  const normalizedText = typeof text === "string" ? text.trim() : "";
  if (message) {
    message.textContent = normalizedText;
  }
  bubble.dataset.copyLength = normalizedText.length > 42 ? "long" : "short";
  bubble.hidden = !normalizedText;
}

function createFrame() {
  const svg = createSvgElement("svg");
  svg.classList.add("ollie-speech-bubble__frame");
  svg.setAttribute(
    "viewBox",
    `0 0 ${FRAME_VIEWBOX.width} ${FRAME_VIEWBOX.height}`,
  );
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("shape-rendering", "crispEdges");
  svg.setAttribute("focusable", "false");

  appendPolygon(svg, "outline", BODY_POINTS.outline);

  for (const [tailSide, tailPoints] of Object.entries(TAIL_POINTS)) {
    const tail = createSvgElement("g");
    tail.setAttribute(
      "class",
      `ollie-speech-bubble__tail ollie-speech-bubble__tail--${tailSide}`,
    );
    appendPolygon(tail, "outline", tailPoints.outline);
    appendPolygon(tail, "fill", tailPoints.fill);
    svg.append(tail);
  }

  for (const role of ["depth", "fill"]) {
    appendPolygon(svg, role, BODY_POINTS[role]);
  }

  return svg;
}

function appendPolygon(parent, role, points) {
  const polygon = createSvgElement("polygon");
  polygon.setAttribute("points", points);
  polygon.setAttribute("class", `ollie-speech-bubble__${role}`);
  parent.append(polygon);
}

function createSparkle() {
  const svg = createSvgElement("svg");
  svg.classList.add("ollie-speech-bubble__sparkle");
  svg.setAttribute("viewBox", "0 0 7 7");
  svg.setAttribute("shape-rendering", "crispEdges");
  svg.setAttribute("focusable", "false");

  const sparkleCells = [
    [3, 0, "light"],
    [3, 1, "shade"],
    [0, 3, "light"],
    [1, 3, "shade"],
    [2, 2, "light"],
    [3, 2, "shade"],
    [4, 2, "light"],
    [2, 3, "shade"],
    [3, 3, "light"],
    [4, 3, "shade"],
    [5, 3, "light"],
    [2, 4, "light"],
    [3, 4, "shade"],
    [4, 4, "light"],
    [3, 5, "shade"],
    [3, 6, "light"],
  ];

  for (const [x, y, role] of sparkleCells) {
    const cell = createSvgElement("rect");
    cell.setAttribute("x", String(x));
    cell.setAttribute("y", String(y));
    cell.setAttribute("width", "1");
    cell.setAttribute("height", "1");
    cell.setAttribute("class", `ollie-speech-bubble__sparkle-${role}`);
    svg.append(cell);
  }

  return svg;
}

function normalizeTailSide(tailSide) {
  return Object.values(SPEECH_BUBBLE_TAIL_SIDE).includes(tailSide)
    ? tailSide
    : SPEECH_BUBBLE_TAIL_SIDE.LEFT;
}

function normalizeSparkleTone(sparkleTone) {
  return sparkleTone === SPEECH_BUBBLE_SPARKLE_TONE.GREY
    ? SPEECH_BUBBLE_SPARKLE_TONE.GREY
    : SPEECH_BUBBLE_SPARKLE_TONE.YELLOW;
}

function createSvgElement(tagName) {
  return document.createElementNS(SVG_NAMESPACE, tagName);
}

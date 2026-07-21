const REFERENCE_VIEWPORT_AREA = 1280 * 900;
const MINIMUM_VIEWPORT_SCALE = 0.75;
const MAXIMUM_VIEWPORT_SCALE = 1.25;
const WARNING_ASSET = Object.freeze({
  asset: "approved-small",
  width: 41,
  height: 34,
  referenceScale: 3.6,
});
const JITTER_RADIUS_BY_EVENT = Object.freeze({
  1: 42,
  2: 48,
  3: 90,
  4: 100,
  5: 110,
  6: 85,
  7: 95,
  8: 105,
});
const SATELLITE_DROPLETS_PER_UNIT = 2;

const INK_SPRAY_EVENTS = Object.freeze([
  sprayEvent(1, [
    inkUnit("approved-small", 41, 34, 3.6, { top: "8px", right: "-24px" }),
    inkUnit("approved-small", 41, 34, 3.6, { top: "12px", right: "200px" }),
    inkUnit("approved-small", 41, 34, 3.6, { top: "168px", right: "8px" }),
    inkUnit("approved-small", 41, 34, 3.6, { top: "172px", right: "232px" }),
  ]),
  sprayEvent(2, [
    inkUnit("approved-small", 41, 34, 3.6, { top: "350px", right: "4px" }),
    inkUnit("approved-small", 41, 34, 3.6, { top: "352px", right: "232px" }),
    inkUnit("approved-small", 41, 34, 3.6, { top: "516px", right: "14px" }),
    inkUnit("approved-small", 41, 34, 3.6, { top: "514px", right: "236px" }),
  ]),
  sprayEvent(3, [
    inkUnit("approved-medium", 69, 49, 3.2, { top: "20px", left: "36px" }),
    inkUnit("approved-medium", 69, 49, 2.8, { top: "80px", left: "120px" }),
    inkUnit("approved-medium", 69, 49, 3, { top: "210px", left: "8vw" }),
    inkUnit("approved-medium", 69, 49, 3, { top: "30px", left: "55vw" }),
  ]),
  sprayEvent(4, [
    inkUnit("approved-medium", 69, 49, 3.2, { right: "26px", bottom: "20px" }),
    inkUnit("approved-medium", 69, 49, 2.8, { right: "120px", bottom: "90px" }),
    inkUnit("approved-medium", 69, 49, 3, { right: "8vw", bottom: "220px" }),
    inkUnit("approved-medium", 69, 49, 3, { right: "34vw", bottom: "260px" }),
  ]),
  sprayEvent(5, [
    inkUnit("approved-large", 73, 62, 3.36, { bottom: "-130px", left: "50px" }),
    inkUnit("approved-large", 73, 62, 2.8, { bottom: "-40px", left: "150px" }),
    inkUnit("approved-large", 73, 62, 3.1, { bottom: "150px", left: "24vw" }),
    inkUnit("approved-large", 73, 62, 3, { top: "42vh", left: "10vw" }),
  ]),
  sprayEvent(6, [
    inkUnit("approved-large", 73, 62, 3.6, { top: "250px", left: "28vw" }),
    inkUnit("approved-large", 73, 62, 3.2, { top: "390px", left: "52vw" }),
    inkUnit("approved-large", 73, 62, 3.2, { top: "55vh", left: "72vw" }),
    inkUnit("approved-large", 73, 62, 3.1, { top: "14vh", left: "78vw" }),
    inkUnit("approved-large", 73, 62, 3.3, { bottom: "8vh", left: "42vw" }),
  ]),
  sprayEvent(7, [
    inkUnit("approved-large", 73, 62, 4.24, { right: "22vw", bottom: "-90px" }),
    inkUnit("approved-large", 73, 62, 3.7, { right: "48vw", bottom: "20px" }),
    inkUnit("approved-large", 73, 62, 3.4, { right: "8vw", bottom: "180px" }),
    inkUnit("approved-large", 73, 62, 3.3, { top: "52vh", left: "4vw" }),
    inkUnit("approved-large", 73, 62, 3.3, { top: "55vh", left: "58vw" }),
  ]),
  sprayEvent(8, [
    inkUnit("approved-large", 73, 62, 4.4, { top: "40px", left: "38vw" }),
    inkUnit("approved-large", 73, 62, 4, { top: "130px", left: "12vw" }),
    inkUnit("approved-large", 73, 62, 3.6, { top: "32vh", left: "68vw" }),
  ]),
]);

export const INK_SPLATTER_COUNT = INK_SPRAY_EVENTS.length;

export const INK_UNITS_PER_SPRAY_EVENT = Object.freeze(
  INK_SPRAY_EVENTS.map(({ units }) => units.length),
);

export const VISIBLE_SPLATTER_COUNT = Object.freeze({
  idle: 0,
  warning: 0,
  "attack-one": 2,
  "attack-two": 5,
  "attack-final": 8,
});

export function createPixelInkField() {
  const inkField = document.createElement("div");
  const viewportScale = getViewportScaleFactor();
  inkField.className = "ollie-ink-field";
  inkField.dataset.intervention = "idle";
  inkField.dataset.visibleCount = "0";
  inkField.dataset.sprayIndex = "0";
  inkField.dataset.viewportScale = String(viewportScale);
  inkField.dataset.behavior = "idle";
  inkField.append(createPersistentWarningMark(viewportScale));

  let unitIndex = 0;
  INK_SPRAY_EVENTS.forEach(({ eventIndex, units }) => {
    units.forEach((unit) => {
      unitIndex += 1;
      inkField.append(
        ...createInkUnit(unit, eventIndex, unitIndex, viewportScale),
      );
    });
  });

  inkField.dataset.unitCount = String(unitIndex);
  inkField.dataset.warningUnitCount = "1";
  inkField.dataset.satelliteCount = String(
    unitIndex * SATELLITE_DROPLETS_PER_UNIT,
  );
  return inkField;
}

export function randomizePixelInkField(inkField, seed = createRandomSeed()) {
  if (!(inkField instanceof HTMLElement)) {
    return null;
  }

  const random = createSeededRandom(seed);
  const eventGroups = groupUnitsByEvent(inkField);
  eventGroups.forEach((units, eventIndex) => {
    const radius = JITTER_RADIUS_BY_EVENT[eventIndex] ?? 48;
    const startingAngle = random() * Math.PI * 2;
    const flipOffset = Math.floor(random() * 2);

    units.forEach((unit, index) => {
      const spreadAngle =
        startingAngle +
        (Math.PI * 2 * index) / units.length +
        randomBetween(random, -0.22, 0.22);
      const distance = radius * randomBetween(random, 0.58, 1);
      const jitterX = Math.round(Math.cos(spreadAngle) * distance);
      const jitterY = Math.round(Math.sin(spreadAngle) * distance);
      const flipX =
        (flipOffset + index + Math.floor(random() * 2)) % 2 === 0 ? 1 : -1;

      applyUnitTransform(unit, jitterX, jitterY, flipX);
      positionSatelliteDroplets(inkField, unit, random, jitterX, jitterY);
    });
  });

  const firstUnit = inkField.querySelector(
    '.ollie-splatter[data-unit-index="1"]',
  );
  const warningMark = inkField.querySelector(".ollie-warning-mark");
  if (firstUnit && warningMark) {
    applyUnitTransform(
      warningMark,
      Number(firstUnit.dataset.jitterX),
      Number(firstUnit.dataset.jitterY),
      Number(firstUnit.dataset.flipX),
    );
  }

  inkField.dataset.layoutSeed = String(seed >>> 0);
  return seed >>> 0;
}

function createPersistentWarningMark(viewportScale) {
  const image = document.createElement("img");
  image.className = "ollie-warning-mark";
  image.dataset.asset = WARNING_ASSET.asset;
  image.dataset.inkRole = "persistent-warning";
  image.src = createInkAssetUrl(WARNING_ASSET.asset);
  image.alt = "";
  image.draggable = false;
  const renderedScale = getRenderedPixelScale(
    WARNING_ASSET.referenceScale,
    viewportScale,
  );
  image.width = Math.round(WARNING_ASSET.width * renderedScale);
  image.height = Math.round(WARNING_ASSET.height * renderedScale);
  image.style.setProperty("width", `${image.width}px`);
  image.style.setProperty("height", `${image.height}px`);
  return image;
}

function createInkUnit(unit, eventIndex, unitIndex, viewportScale) {
  const image = document.createElement("img");
  image.className = "ollie-splatter";
  image.dataset.asset = unit.asset;
  image.dataset.sprayEvent = String(eventIndex);
  image.dataset.unitIndex = String(unitIndex);
  image.src = createInkAssetUrl(unit.asset);
  image.alt = "";
  image.draggable = false;
  const renderedScale = getRenderedPixelScale(
    unit.referenceScale,
    viewportScale,
  );
  image.width = Math.round(unit.width * renderedScale);
  image.height = Math.round(unit.height * renderedScale);
  image.style.setProperty("width", `${image.width}px`);
  image.style.setProperty("height", `${image.height}px`);
  Object.entries(unit.position).forEach(([property, value]) => {
    image.style.setProperty(property, value);
  });
  return [
    image,
    ...createSatelliteDroplets(eventIndex, unitIndex),
  ];
}

function createSatelliteDroplets(eventIndex, unitIndex) {
  return Array.from({ length: SATELLITE_DROPLETS_PER_UNIT }, (_, index) => {
    const droplet = document.createElement("span");
    droplet.className = "ollie-satellite-droplet";
    droplet.dataset.sprayEvent = String(eventIndex);
    droplet.dataset.unitIndex = String(unitIndex);
    droplet.dataset.dropletIndex = String(index + 1);
    droplet.dataset.inkRole = "offset-satellite";
    const size = index === 0 ? 8 : 6;
    droplet.style.setProperty("width", `${size}px`);
    droplet.style.setProperty("height", `${size}px`);
    return droplet;
  });
}

function groupUnitsByEvent(inkField) {
  const groups = new Map();
  inkField.querySelectorAll(".ollie-splatter").forEach((unit) => {
    const eventIndex = Number(unit.dataset.sprayEvent);
    const eventUnits = groups.get(eventIndex) ?? [];
    eventUnits.push(unit);
    groups.set(eventIndex, eventUnits);
  });
  return groups;
}

function applyUnitTransform(unit, jitterX, jitterY, flipX) {
  unit.dataset.jitterX = String(jitterX);
  unit.dataset.jitterY = String(jitterY);
  unit.dataset.flipX = String(flipX);
  unit.style.setProperty("--ink-jitter-x", `${jitterX}px`);
  unit.style.setProperty("--ink-jitter-y", `${jitterY}px`);
  unit.style.setProperty("--ink-flip-x", String(flipX));
}

function positionSatelliteDroplets(
  inkField,
  unit,
  random,
  jitterX,
  jitterY,
) {
  const droplets = inkField.querySelectorAll(
    `.ollie-satellite-droplet[data-unit-index="${unit.dataset.unitIndex}"]`,
  );
  const centerX = unit.offsetLeft + unit.offsetWidth / 2 + jitterX;
  const centerY = unit.offsetTop + unit.offsetHeight / 2 + jitterY;
  const startingAngle = random() * Math.PI * 2;

  droplets.forEach((droplet, index) => {
    const angle =
      startingAngle + index * randomBetween(random, 1.35, 2.25);
    const horizontalDistance =
      unit.offsetWidth / 2 + randomBetween(random, 10, 34);
    const verticalDistance =
      unit.offsetHeight / 2 + randomBetween(random, 8, 28);
    const size = Number.parseFloat(droplet.style.width);
    const left = Math.round(
      centerX + Math.cos(angle) * horizontalDistance - size / 2,
    );
    const top = Math.round(
      centerY + Math.sin(angle) * verticalDistance - size / 2,
    );
    droplet.style.setProperty("left", `${left}px`);
    droplet.style.setProperty("top", `${top}px`);
  });
}

function createRandomSeed() {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0];
}

function createSeededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function randomBetween(random, minimum, maximum) {
  return minimum + random() * (maximum - minimum);
}

function createInkAssetUrl(asset) {
  return new URL(`../assets/ink/canonical/${asset}.svg`, import.meta.url).href;
}

function getViewportScaleFactor() {
  const viewportArea = window.innerWidth * window.innerHeight;
  const proportionalScale = Math.sqrt(
    viewportArea / REFERENCE_VIEWPORT_AREA,
  );
  return clamp(
    Math.round(proportionalScale * 16) / 16,
    MINIMUM_VIEWPORT_SCALE,
    MAXIMUM_VIEWPORT_SCALE,
  );
}

function getRenderedPixelScale(referenceScale, viewportScale) {
  return Math.round(referenceScale * viewportScale * 4) / 4;
}

function sprayEvent(eventIndex, units) {
  return Object.freeze({
    eventIndex,
    units: Object.freeze(units),
  });
}

function inkUnit(asset, width, height, referenceScale, position) {
  return Object.freeze({
    asset,
    width,
    height,
    referenceScale,
    position: Object.freeze(position),
  });
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

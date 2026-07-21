export const COMMENTARY_SOURCE = Object.freeze({
  PENDING: "pending",
  FALLBACK: "fallback",
  GENERATED: "generated",
});

const FALLBACK_COMMENTARY = Object.freeze({
  greeting: "Ready when you are. Let's get one thing done.",
  idle: Object.freeze([
    "Still with you.",
    "One small step at a time.",
  ]),
  distracted: Object.freeze([
    "That looks like a detour.",
    "Back to the task. We've got this.",
  ]),
  break: Object.freeze([
    "Tentacles down. Break time.",
    "Stretch, breathe, reset.",
  ]),
  celebrate: "You did it. Eight tiny high-fives!",
});

export function createFallbackCommentary() {
  return {
    greeting: FALLBACK_COMMENTARY.greeting,
    idle: [...FALLBACK_COMMENTARY.idle],
    distracted: [...FALLBACK_COMMENTARY.distracted],
    break: [...FALLBACK_COMMENTARY.break],
    celebrate: FALLBACK_COMMENTARY.celebrate,
  };
}

export function normalizeCommentary(value) {
  return isValidCommentary(value)
    ? {
        greeting: value.greeting.trim(),
        idle: value.idle.map((line) => line.trim()),
        distracted: value.distracted.map((line) => line.trim()),
        break: value.break.map((line) => line.trim()),
        celebrate: value.celebrate.trim(),
      }
    : createFallbackCommentary();
}

export function isValidCommentary(value) {
  return (
    value &&
    typeof value === "object" &&
    isShortLine(value.greeting) &&
    isLinePair(value.idle) &&
    isLinePair(value.distracted) &&
    isLinePair(value.break) &&
    isShortLine(value.celebrate)
  );
}

function isLinePair(value) {
  return Array.isArray(value) && value.length === 2 && value.every(isShortLine);
}

function isShortLine(value) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= 120
  );
}

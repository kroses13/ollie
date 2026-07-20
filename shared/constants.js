export const STATE_VERSION = 1;

export const SESSION_PHASE = Object.freeze({
  IDLE: "idle",
  FOCUS: "focus",
  BREAK: "break",
});

export const PHASE_ALARM_NAME = "ollie-phase-end";

export const STORAGE_KEYS = Object.freeze({
  SETTINGS: "ollieSettings",
  SESSION: "ollieSession",
});

export const DEFAULT_SETTINGS = Object.freeze({
  focusMinutes: 25,
  breakMinutes: 5,
  colour: "coral",
});

export const DURATION_LIMITS = Object.freeze({
  focusMinutes: Object.freeze({ min: 1, max: 180 }),
  breakMinutes: Object.freeze({ min: 1, max: 60 }),
});

export const MAX_TASK_LENGTH = 240;

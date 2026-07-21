import {
  DURATION_LIMITS,
  MAX_API_KEY_LENGTH,
  MAX_TASK_LENGTH,
} from "./constants.js";

function parseDuration(value, limits) {
  const duration = Number(value);
  if (!Number.isFinite(duration)) {
    return null;
  }

  const rounded = Math.round(duration);
  if (rounded < limits.min || rounded > limits.max) {
    return null;
  }

  return rounded;
}

export function validateStartSessionPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Session details are missing." };
  }

  const task = typeof payload.task === "string" ? payload.task.trim() : "";
  if (task.length > MAX_TASK_LENGTH) {
    return {
      ok: false,
      error: `Keep the task under ${MAX_TASK_LENGTH} characters.`,
    };
  }

  const focusMinutes = parseDuration(
    payload.focusMinutes,
    DURATION_LIMITS.focusMinutes,
  );
  const breakMinutes = parseDuration(
    payload.breakMinutes,
    DURATION_LIMITS.breakMinutes,
  );

  if (!focusMinutes || !breakMinutes) {
    return { ok: false, error: "Choose valid focus and break durations." };
  }

  return {
    ok: true,
    value: { task, focusMinutes, breakMinutes },
  };
}

export function validateApiKeyPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "API key details are missing." };
  }

  const apiKey =
    typeof payload.apiKey === "string" ? payload.apiKey.trim() : "";
  if (!apiKey) {
    return { ok: false, error: "Enter an API key to save." };
  }

  if (apiKey.length > MAX_API_KEY_LENGTH) {
    return { ok: false, error: "That API key is too long." };
  }

  return { ok: true, value: { apiKey } };
}

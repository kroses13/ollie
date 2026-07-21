export const MESSAGE_TYPE = Object.freeze({
  GET_STATE: "GET_STATE",
  START_SESSION: "START_SESSION",
  STOP_SESSION: "STOP_SESSION",
  API_KEY_CHANGED: "API_KEY_CHANGED",
  STATE_UPDATED: "STATE_UPDATED",
});

export function successResponse(state) {
  return { ok: true, state };
}

export function errorResponse(message) {
  return { ok: false, error: message };
}

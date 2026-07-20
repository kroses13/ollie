import {
  DEFAULT_SETTINGS,
  SESSION_PHASE,
  STATE_VERSION,
} from "./constants.js";

export function createDefaultSettings() {
  return { ...DEFAULT_SETTINGS };
}

export function createIdleSession() {
  return {
    phase: SESSION_PHASE.IDLE,
    task: "",
    startedAt: null,
    phaseStartedAt: null,
    phaseEndsAt: null,
    focusMinutes: DEFAULT_SETTINGS.focusMinutes,
    breakMinutes: DEFAULT_SETTINGS.breakMinutes,
  };
}

export function normalizeSettings(value) {
  const defaults = createDefaultSettings();
  if (!value || typeof value !== "object") {
    return defaults;
  }

  return {
    focusMinutes: Number.isFinite(value.focusMinutes)
      ? value.focusMinutes
      : defaults.focusMinutes,
    breakMinutes: Number.isFinite(value.breakMinutes)
      ? value.breakMinutes
      : defaults.breakMinutes,
    colour: typeof value.colour === "string" ? value.colour : defaults.colour,
  };
}

export function normalizeSession(value) {
  const idle = createIdleSession();
  if (!value || typeof value !== "object") {
    return idle;
  }

  if (![SESSION_PHASE.FOCUS, SESSION_PHASE.BREAK].includes(value.phase)) {
    return idle;
  }

  if (!Number.isFinite(value.phaseEndsAt)) {
    return idle;
  }

  return {
    phase: value.phase,
    task: typeof value.task === "string" ? value.task : "",
    startedAt: Number.isFinite(value.startedAt) ? value.startedAt : null,
    phaseStartedAt: Number.isFinite(value.phaseStartedAt)
      ? value.phaseStartedAt
      : null,
    phaseEndsAt: value.phaseEndsAt,
    focusMinutes: Number.isFinite(value.focusMinutes)
      ? value.focusMinutes
      : idle.focusMinutes,
    breakMinutes: Number.isFinite(value.breakMinutes)
      ? value.breakMinutes
      : idle.breakMinutes,
  };
}

export function createPublicState(
  settings,
  session,
  runtimeContext = {
    focusedWindowId: null,
    activeTabId: null,
    activeHostname: "",
    isDistracting: false,
    distractionService: null,
  },
  viewerTabId = null,
  now = Date.now(),
) {
  const isViewerActiveTab = Number.isInteger(viewerTabId)
    ? viewerTabId === runtimeContext.activeTabId
    : Boolean(runtimeContext.activeTabId);
  const isDistracted =
    session.phase === SESSION_PHASE.FOCUS &&
    runtimeContext.isDistracting &&
    isViewerActiveTab;
  const isContentScriptView = Number.isInteger(viewerTabId);
  const publicRuntimeContext = isContentScriptView
    ? {
        focusedWindowId: null,
        activeTabId: null,
        activeHostname: "",
        isDistracting: isDistracted,
        distractionService: isDistracted
          ? runtimeContext.distractionService
          : null,
      }
    : { ...runtimeContext };

  return {
    stateVersion: STATE_VERSION,
    settings: {
      focusMinutes: settings.focusMinutes,
      breakMinutes: settings.breakMinutes,
      colour: settings.colour,
    },
    session: { ...session },
    runtime: publicRuntimeContext,
    companion: {
      isActiveTab: isViewerActiveTab,
      isDistracted,
      distractionService: isDistracted
        ? runtimeContext.distractionService
        : null,
    },
    remainingMs: session.phaseEndsAt
      ? Math.max(0, session.phaseEndsAt - now)
      : 0,
  };
}

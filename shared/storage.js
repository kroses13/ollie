import { STORAGE_KEYS } from "./constants.js";
import {
  createDefaultSettings,
  createIdleSession,
  normalizeSession,
  normalizeSettings,
} from "./state.js";

export async function loadAppData() {
  const stored = await chrome.storage.local.get([
    STORAGE_KEYS.SETTINGS,
    STORAGE_KEYS.SESSION,
  ]);

  return {
    settings: normalizeSettings(
      stored[STORAGE_KEYS.SETTINGS] ?? createDefaultSettings(),
    ),
    session: normalizeSession(
      stored[STORAGE_KEYS.SESSION] ?? createIdleSession(),
    ),
  };
}

export async function saveSettings(settings) {
  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings });
}

export async function saveSession(session) {
  await chrome.storage.local.set({ [STORAGE_KEYS.SESSION]: session });
}

export async function saveAppData(settings, session) {
  await chrome.storage.local.set({
    [STORAGE_KEYS.SETTINGS]: settings,
    [STORAGE_KEYS.SESSION]: session,
  });
}

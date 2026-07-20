import {
  PHASE_ALARM_NAME,
  SESSION_PHASE,
} from "../shared/constants.js";
import {
  errorResponse,
  MESSAGE_TYPE,
  successResponse,
} from "../shared/messages.js";
import { createPublicState } from "../shared/state.js";
import {
  loadAppData,
  saveAppData,
  saveSession,
} from "../shared/storage.js";
import { validateStartSessionPayload } from "../shared/validation.js";
import {
  reconcileSession,
  startFocusSession,
} from "./session-controller.js";

let settings;
let session;
let initialization = initialize();

chrome.runtime.onInstalled.addListener(() => {
  initialization = initialize();
});

chrome.runtime.onStartup.addListener(() => {
  initialization = initialize();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== PHASE_ALARM_NAME) {
    return;
  }

  void handlePhaseAlarm();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!isTrustedSender(sender)) {
    sendResponse(errorResponse("Untrusted message sender."));
    return false;
  }

  void handleMessage(message, sender)
    .then(sendResponse)
    .catch(() => sendResponse(errorResponse("Ollie could not process that request.")));
  return true;
});

async function initialize() {
  const stored = await loadAppData();
  settings = stored.settings;
  session = reconcileSession(stored.session);
  await saveAppData(settings, session);
  await scheduleCurrentPhase();
}

async function ensureInitialized() {
  await initialization;
}

async function handleMessage(message, sender) {
  await ensureInitialized();

  switch (message?.type) {
    case MESSAGE_TYPE.GET_STATE:
      return successResponse(getPublicState());

    case MESSAGE_TYPE.START_SESSION:
      if (!isPopupSender(sender)) {
        return errorResponse("Only the Ollie popup can start a session.");
      }
      return startSession(message.payload);

    case MESSAGE_TYPE.STOP_SESSION:
      if (!isPopupSender(sender)) {
        return errorResponse("Only the Ollie popup can stop a session.");
      }
      return stopSession();

    default:
      return errorResponse("Unknown Ollie command.");
  }
}

async function startSession(payload) {
  const validated = validateStartSessionPayload(payload);
  if (!validated.ok) {
    return errorResponse(validated.error);
  }

  settings = {
    ...settings,
    focusMinutes: validated.value.focusMinutes,
    breakMinutes: validated.value.breakMinutes,
  };
  session = startFocusSession(validated.value);

  await saveAppData(settings, session);
  await scheduleCurrentPhase();
  await broadcastState();
  return successResponse(getPublicState());
}

async function stopSession() {
  session = {
    phase: SESSION_PHASE.IDLE,
    task: "",
    startedAt: null,
    phaseStartedAt: null,
    phaseEndsAt: null,
    focusMinutes: settings.focusMinutes,
    breakMinutes: settings.breakMinutes,
  };

  await saveSession(session);
  await chrome.alarms.clear(PHASE_ALARM_NAME);
  await broadcastState();
  return successResponse(getPublicState());
}

async function handlePhaseAlarm() {
  await ensureInitialized();
  session = reconcileSession(session);
  await saveSession(session);
  await scheduleCurrentPhase();
  await broadcastState();
}

async function scheduleCurrentPhase() {
  await chrome.alarms.clear(PHASE_ALARM_NAME);
  if (session.phaseEndsAt && session.phase !== SESSION_PHASE.IDLE) {
    await chrome.alarms.create(PHASE_ALARM_NAME, { when: session.phaseEndsAt });
  }
}

function getPublicState() {
  return createPublicState(settings, session);
}

async function broadcastState() {
  const message = {
    type: MESSAGE_TYPE.STATE_UPDATED,
    payload: getPublicState(),
  };

  const tabs = await chrome.tabs.query({});
  const deliveries = tabs
    .filter((tab) => tab.id && /^https?:/.test(tab.url ?? ""))
    .map((tab) => chrome.tabs.sendMessage(tab.id, message));

  deliveries.push(chrome.runtime.sendMessage(message));
  await Promise.allSettled(deliveries);
}

function isTrustedSender(sender) {
  return sender.id === chrome.runtime.id;
}

function isPopupSender(sender) {
  return sender.url?.startsWith(chrome.runtime.getURL("popup/")) ?? false;
}

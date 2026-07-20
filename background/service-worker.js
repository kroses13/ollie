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
import {
  resolveActivatedTabContext,
  resolveFocusedTabContext,
  resolveUpdatedTabContext,
  resolveWindowFocusContext,
} from "./tab-monitor.js";

let settings;
let session;
let tabContext;
let initialization = initialize();
let tabContextUpdateQueue = Promise.resolve();

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

chrome.tabs.onActivated.addListener((activeInfo) => {
  enqueueTabContextUpdate((currentContext) =>
    resolveActivatedTabContext(activeInfo, currentContext),
  );
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!("url" in changeInfo)) {
    return;
  }

  enqueueTabContextUpdate((currentContext) =>
    resolveUpdatedTabContext(tabId, changeInfo, tab, currentContext),
  );
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  enqueueTabContextUpdate(() => resolveWindowFocusContext(windowId));
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
  const [stored, initialTabContext] = await Promise.all([
    loadAppData(),
    resolveFocusedTabContext(),
  ]);
  settings = stored.settings;
  session = reconcileSession(stored.session);
  tabContext = initialTabContext;
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
      return successResponse(getPublicState(sender.tab?.id ?? null));

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

function getPublicState(viewerTabId = null) {
  return createPublicState(settings, session, tabContext, viewerTabId);
}

async function broadcastState() {
  const message = {
    type: MESSAGE_TYPE.STATE_UPDATED,
    payload: getPublicState(),
  };

  const tabs = await chrome.tabs.query({});
  const deliveries = tabs
    .filter((tab) => tab.id && /^https?:/.test(tab.url ?? ""))
    .map((tab) =>
      chrome.tabs.sendMessage(tab.id, {
        ...message,
        payload: getPublicState(tab.id),
      }),
    );

  deliveries.push(chrome.runtime.sendMessage(message));
  await Promise.allSettled(deliveries);
}

function enqueueTabContextUpdate(updateContext) {
  tabContextUpdateQueue = tabContextUpdateQueue
    .then(async () => {
      await ensureInitialized();
      const nextContext = await updateContext(tabContext);
      if (tabContextsMatch(tabContext, nextContext)) {
        return;
      }

      tabContext = nextContext;
      await broadcastState();
    })
    .catch(() => undefined);
}

function tabContextsMatch(left, right) {
  return (
    left.focusedWindowId === right.focusedWindowId &&
    left.activeTabId === right.activeTabId &&
    left.activeHostname === right.activeHostname &&
    left.isDistracting === right.isDistracting &&
    left.distractionService === right.distractionService
  );
}

function isTrustedSender(sender) {
  return sender.id === chrome.runtime.id;
}

function isPopupSender(sender) {
  return sender.url?.startsWith(chrome.runtime.getURL("popup/")) ?? false;
}

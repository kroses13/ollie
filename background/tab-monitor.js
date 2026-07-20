import { classifyDistractionUrl } from "../shared/domains.js";

export function createEmptyTabContext() {
  return {
    focusedWindowId: null,
    activeTabId: null,
    activeHostname: "",
    isDistracting: false,
    distractionService: null,
  };
}

export async function resolveFocusedTabContext() {
  const windows = await chrome.windows.getAll({
    populate: true,
    windowTypes: ["normal"],
  });
  const focusedWindow = windows.find((window) => window.focused);
  if (!focusedWindow) {
    return createEmptyTabContext();
  }

  const activeTab = focusedWindow.tabs?.find((tab) => tab.active);
  return createTabContext(focusedWindow.id, activeTab);
}

export async function resolveActivatedTabContext(activeInfo, currentContext) {
  if (activeInfo.windowId !== currentContext.focusedWindowId) {
    return currentContext;
  }

  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    return createTabContext(activeInfo.windowId, tab);
  } catch {
    return createEmptyTabContext();
  }
}

export function resolveUpdatedTabContext(
  tabId,
  changeInfo,
  tab,
  currentContext,
) {
  if (
    tabId !== currentContext.activeTabId ||
    tab.windowId !== currentContext.focusedWindowId ||
    !tab.active ||
    !("url" in changeInfo)
  ) {
    return currentContext;
  }

  return createTabContext(tab.windowId, tab);
}

export async function resolveWindowFocusContext(windowId) {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    return createEmptyTabContext();
  }

  const tabs = await chrome.tabs.query({ active: true, windowId });
  return createTabContext(windowId, tabs[0]);
}

function createTabContext(windowId, tab) {
  if (!Number.isInteger(windowId) || !tab?.id) {
    return createEmptyTabContext();
  }

  const classification = classifyDistractionUrl(tab.url ?? "");
  return {
    focusedWindowId: windowId,
    activeTabId: tab.id,
    activeHostname: classification.hostname,
    isDistracting: classification.isDistracting,
    distractionService: classification.service,
  };
}

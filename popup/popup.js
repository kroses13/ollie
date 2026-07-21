import { createOllieSvg } from "../content/companion-view.js";
import { STORAGE_KEYS } from "../shared/constants.js";
import { MESSAGE_TYPE } from "../shared/messages.js";
import { validateApiKeyPayload } from "../shared/validation.js";

const elements = {
  companionMark: document.querySelector("#companion-mark"),
  currentTask: document.querySelector("#current-task"),
  error: document.querySelector("#error-message"),
  focusMinutes: document.querySelector("#focus-minutes"),
  breakMinutes: document.querySelector("#break-minutes"),
  apiKey: document.querySelector("#api-key"),
  apiKeyForm: document.querySelector("#api-key-form"),
  apiKeyStatus: document.querySelector("#api-key-status"),
  commentaryStatus: document.querySelector("#commentary-status"),
  form: document.querySelector("#session-form"),
  phaseLabel: document.querySelector("#phase-label"),
  removeApiKey: document.querySelector("#remove-api-key"),
  saveApiKey: document.querySelector("#save-api-key"),
  sessionCard: document.querySelector("#session-card"),
  startButton: document.querySelector("#start-button"),
  stopButton: document.querySelector("#stop-button"),
  task: document.querySelector("#task"),
  timer: document.querySelector("#timer"),
};

let appState = null;
const hasExtensionRuntime =
  window.location.protocol === "chrome-extension:" &&
  typeof chrome !== "undefined" &&
  Boolean(chrome.runtime?.sendMessage);
const previewState = hasExtensionRuntime
  ? ""
  : new URLSearchParams(window.location.search).get("preview");

const mark = createOllieSvg({ title: "Ollie" });
mark.setAttribute("width", "48");
mark.setAttribute("height", "36");
elements.companionMark.append(mark);

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!hasExtensionRuntime) {
    return;
  }
  clearError();
  setPending(true);

  sendCommand({
    type: MESSAGE_TYPE.START_SESSION,
    payload: {
      task: elements.task.value,
      focusMinutes: elements.focusMinutes.value,
      breakMinutes: elements.breakMinutes.value,
    },
  }).finally(() => setPending(false));
});

elements.stopButton.addEventListener("click", () => {
  if (!hasExtensionRuntime) {
    return;
  }
  clearError();
  setPending(true);
  sendCommand({ type: MESSAGE_TYPE.STOP_SESSION }).finally(() => setPending(false));
});

elements.apiKeyForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!hasExtensionRuntime) {
    return;
  }
  clearError();
  setPending(true);

  const validated = validateApiKeyPayload({ apiKey: elements.apiKey.value });
  if (!validated.ok) {
    showError(validated.error);
    setPending(false);
    return;
  }

  try {
    await chrome.storage.local.set({
      [STORAGE_KEYS.OPENAI_API_KEY]: validated.value.apiKey,
    });
    const state = await sendCommand({ type: MESSAGE_TYPE.API_KEY_CHANGED });
    if (state) {
      elements.apiKey.value = "";
    }
  } catch {
    showError("Ollie could not save that API key.");
  } finally {
    setPending(false);
  }
});

elements.removeApiKey.addEventListener("click", async () => {
  if (!hasExtensionRuntime) {
    return;
  }
  clearError();
  setPending(true);

  try {
    await chrome.storage.local.remove(STORAGE_KEYS.OPENAI_API_KEY);
    const state = await sendCommand({ type: MESSAGE_TYPE.API_KEY_CHANGED });
    if (state) {
      elements.apiKey.value = "";
    }
  } catch {
    showError("Ollie could not remove that API key.");
  } finally {
    setPending(false);
  }
});

if (hasExtensionRuntime) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === MESSAGE_TYPE.STATE_UPDATED) {
      appState = message.payload;
      render();
    }
  });

  sendCommand({ type: MESSAGE_TYPE.GET_STATE });
  setInterval(renderTimer, 1_000);
} else if (previewState) {
  appState = createPreviewState(previewState);
  render();
}

function sendCommand(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        showError("Ollie could not reach the background worker.");
        resolve(null);
        return;
      }

      if (!response?.ok) {
        showError(response?.error ?? "Ollie could not complete that action.");
        resolve(null);
        return;
      }

      appState = response.state;
      render();
      resolve(response.state);
    });
  });
}

function render() {
  if (!appState) {
    return;
  }

  const { session, settings } = appState;
  const isActive = session.phase === "focus" || session.phase === "break";
  const hasApiKey = settings.hasApiKey;

  elements.companionMark.hidden = isActive;
  elements.sessionCard.dataset.phase = session.phase;
  elements.phaseLabel.textContent = getPhaseLabel(
    session.phase,
    appState.companion,
  );
  elements.currentTask.textContent = isActive
    ? session.task || "Focus session"
    : "Choose one thing to finish.";
  const commentaryStatus = getCommentaryStatus(session.commentarySource);
  elements.commentaryStatus.hidden = !isActive || !commentaryStatus;
  elements.commentaryStatus.textContent = commentaryStatus;
  elements.apiKeyForm.dataset.keyState = hasApiKey ? "saved" : "empty";
  elements.apiKeyStatus.textContent = hasApiKey ? "✓ Saved" : "No key saved";
  elements.apiKey.hidden = hasApiKey;
  elements.apiKey.placeholder = "Paste a key to enable task-aware lines";
  elements.saveApiKey.hidden = hasApiKey;
  elements.removeApiKey.hidden = !hasApiKey;
  elements.focusMinutes.value = String(settings.focusMinutes);
  elements.breakMinutes.value = String(settings.breakMinutes);
  elements.task.disabled = isActive;
  elements.focusMinutes.disabled = isActive;
  elements.breakMinutes.disabled = isActive;
  elements.startButton.hidden = isActive;
  elements.stopButton.hidden = !isActive;
  renderTimer();
}

function renderTimer() {
  if (!appState) {
    return;
  }

  const { session, settings } = appState;
  const remainingMs = session.phaseEndsAt
    ? Math.max(0, session.phaseEndsAt - Date.now())
    : settings.focusMinutes * 60_000;
  elements.timer.textContent = formatDuration(remainingMs);
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1_000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getPhaseLabel(phase, companion) {
  if (phase === "focus" && companion?.isDistracted) {
    return companion.distractionService
      ? `${companion.distractionService} distraction detected`
      : "Distraction detected";
  }
  if (phase === "focus") {
    return "Focus time";
  }
  if (phase === "break") {
    return "Break time";
  }
  return "Ready when you are";
}

function setPending(isPending) {
  elements.startButton.disabled = isPending;
  elements.stopButton.disabled = isPending;
  elements.saveApiKey.disabled = isPending;
  elements.removeApiKey.disabled = isPending;
}

function getCommentaryStatus(source) {
  if (source === "pending") {
    return "Ollie is preparing task-aware lines…";
  }
  if (source === "generated") {
    return "";
  }
  return "Using Ollie's bundled lines";
}

function showError(message) {
  elements.error.textContent = message;
  elements.error.hidden = false;
}

function clearError() {
  elements.error.textContent = "";
  elements.error.hidden = true;
}

function createPreviewState(mode) {
  const isActive = mode === "saved-active";
  return {
    settings: {
      focusMinutes: 25,
      breakMinutes: 5,
      hasApiKey: isActive,
    },
    session: {
      phase: isActive ? "focus" : "idle",
      phaseEndsAt: isActive ? Date.now() + 24 * 60_000 + 18_000 : null,
      task: isActive ? "Finish the onboarding flow" : "",
      commentarySource: isActive ? "generated" : "fallback",
    },
    companion: {
      isDistracted: false,
    },
  };
}

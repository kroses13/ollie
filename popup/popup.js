import { createOllieSvg } from "../content/companion-view.js";
import { MESSAGE_TYPE } from "../shared/messages.js";

const elements = {
  companionMark: document.querySelector("#companion-mark"),
  currentTask: document.querySelector("#current-task"),
  error: document.querySelector("#error-message"),
  focusMinutes: document.querySelector("#focus-minutes"),
  breakMinutes: document.querySelector("#break-minutes"),
  form: document.querySelector("#session-form"),
  phaseLabel: document.querySelector("#phase-label"),
  sessionCard: document.querySelector("#session-card"),
  startButton: document.querySelector("#start-button"),
  stopButton: document.querySelector("#stop-button"),
  task: document.querySelector("#task"),
  timer: document.querySelector("#timer"),
};

let appState = null;

const mark = createOllieSvg({ title: "Ollie" });
mark.setAttribute("width", "48");
mark.setAttribute("height", "36");
elements.companionMark.append(mark);

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
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
  clearError();
  setPending(true);
  sendCommand({ type: MESSAGE_TYPE.STOP_SESSION }).finally(() => setPending(false));
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === MESSAGE_TYPE.STATE_UPDATED) {
    appState = message.payload;
    render();
  }
});

sendCommand({ type: MESSAGE_TYPE.GET_STATE });
setInterval(renderTimer, 1_000);

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

  elements.sessionCard.dataset.phase = session.phase;
  elements.phaseLabel.textContent = getPhaseLabel(
    session.phase,
    appState.companion,
  );
  elements.currentTask.textContent = isActive
    ? session.task
    : "Choose one thing to finish.";
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
}

function showError(message) {
  elements.error.textContent = message;
  elements.error.hidden = false;
}

function clearError() {
  elements.error.textContent = "";
  elements.error.hidden = true;
}

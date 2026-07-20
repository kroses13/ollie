import { SESSION_PHASE } from "../shared/constants.js";
import { createIdleSession } from "../shared/state.js";

const MINUTE_IN_MS = 60_000;

export function startFocusSession(details, now = Date.now()) {
  return {
    phase: SESSION_PHASE.FOCUS,
    task: details.task,
    startedAt: now,
    phaseStartedAt: now,
    phaseEndsAt: now + details.focusMinutes * MINUTE_IN_MS,
    focusMinutes: details.focusMinutes,
    breakMinutes: details.breakMinutes,
  };
}

export function reconcileSession(session, now = Date.now()) {
  if (session.phase === SESSION_PHASE.IDLE || session.phaseEndsAt > now) {
    return session;
  }

  if (session.phase === SESSION_PHASE.FOCUS) {
    const breakEndsAt = session.phaseEndsAt + session.breakMinutes * MINUTE_IN_MS;
    if (breakEndsAt > now) {
      return {
        ...session,
        phase: SESSION_PHASE.BREAK,
        phaseStartedAt: session.phaseEndsAt,
        phaseEndsAt: breakEndsAt,
      };
    }
  }

  return createIdleSession();
}

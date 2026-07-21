import { setOlliePose } from "./companion-view.js";
import { OLLIE_POSE } from "./ollie-grid.js";

export const OLLIE_BEHAVIOR_TIMING = Object.freeze({
  poseAnticipationMs: 170,
  poseActionMs: 210,
  poseSettleMs: 220,
  thinkingHoldMs: 520,
  speakingQuietPeriodMs: 7_000,
  lookDelayMinMs: 16_000,
  lookDelayMaxMs: 32_000,
  lookHoldMinMs: 1_100,
  lookHoldMaxMs: 2_000,
  laptopDelayMinMs: 45_000,
  laptopDelayMaxMs: 90_000,
  laptopHoldMinMs: 6_000,
  laptopHoldMaxMs: 9_000,
  hammerFirstStrikeMs: 900,
  hammerFirstRecoverMs: 1_400,
  hammerSecondStrikeMs: 2_600,
  hammerSecondRecoverMs: 3_100,
});

const THINKING_CHOREOGRAPHY_BEHAVIORS = new Set(["think"]);

export function createOllieBehaviorController({
  character,
  speechBubbleController,
  timing = OLLIE_BEHAVIOR_TIMING,
  random = Math.random,
  onFootprintChange = () => {},
  schedule = (callback, delay) => window.setTimeout(callback, delay),
  cancel = (timerId) => window.clearTimeout(timerId),
}) {
  let phase = "idle";
  let isDistracted = false;
  let choreographyBehavior = "idle";
  let activePose = OLLIE_POSE.IDLE;
  let ambientPose = null;
  let requestedMessage = "";
  let speakingQuietUntil = 0;
  let poseVersion = 0;
  let speechVersion = 0;
  let lookTimerId = null;
  let laptopTimerId = null;
  let nextWorkPose = OLLIE_POSE.WORKING_LAPTOP;
  const poseTimers = new Set();
  const ambientActionTimers = new Set();
  const speechTimers = new Set();

  setOlliePose(character, activePose);

  function setSessionState(nextState) {
    const nextPhase = nextState?.phase ?? "idle";
    const nextDistracted = Boolean(nextState?.isDistracted);
    const contextChanged =
      phase !== nextPhase || isDistracted !== nextDistracted;

    phase = nextPhase;
    isDistracted = nextDistracted;
    if (!contextChanged) {
      return;
    }

    if (!isAmbientEligible()) {
      cancelAmbientSchedule();
      cancelAmbientAction();
    }

    if (phase === "break") {
      transitionToPose(OLLIE_POSE.SLEEPING, { skipAnticipation: true });
      return;
    }

    if (phase !== "focus") {
      transitionToPose(OLLIE_POSE.IDLE, { skipAnticipation: true });
      return;
    }

    if (isDistracted) {
      transitionToPose(resolveChoreographyPose(), {
        skipAnticipation: true,
      });
      return;
    }

    transitionToPose(OLLIE_POSE.IDLE, { skipAnticipation: true });
    scheduleAmbientBehaviors();
  }

  function setChoreographyBehavior(behavior) {
    choreographyBehavior = behavior;
    if (phase === "focus" && !isDistracted) {
      if (behavior === "idle") {
        scheduleAmbientBehaviors();
      }
      return;
    }

    if (phase !== "focus") {
      return;
    }

    transitionToPose(resolveChoreographyPose(), {
      skipAnticipation: behavior !== "think",
    });
  }

  function present(message) {
    const normalizedMessage = typeof message === "string" ? message.trim() : "";
    if (!normalizedMessage) {
      requestedMessage = "";
      speechVersion += 1;
      clearTimerSet(speechTimers);
      speechBubbleController.present("");
      return;
    }

    if (normalizedMessage === requestedMessage) {
      return;
    }

    requestedMessage = normalizedMessage;
    speechVersion += 1;
    const activeSpeech = speechVersion;
    clearTimerSet(speechTimers);

    if (!canUseThinkingSequence()) {
      speechBubbleController.present(normalizedMessage);
      return;
    }

    cancelAmbientAction();
    transitionToPose(OLLIE_POSE.THINKING);
    queue(
      speechTimers,
      timing.thinkingHoldMs,
      () => {
        if (activeSpeech !== speechVersion || requestedMessage !== normalizedMessage) {
          return;
        }
        transitionToPose(OLLIE_POSE.IDLE);
        speechBubbleController.present(normalizedMessage);
        speakingQuietUntil = Date.now() + timing.speakingQuietPeriodMs;
        scheduleAmbientBehaviors();
      },
    );
  }

  function transitionToPose(pose, { skipAnticipation = false } = {}) {
    if (!Object.values(OLLIE_POSE).includes(pose)) {
      return;
    }

    poseVersion += 1;
    const activeTransition = poseVersion;
    clearTimerSet(poseTimers);

    const applyPose = () => {
      if (activeTransition !== poseVersion) {
        return;
      }
      activePose = pose;
      setOlliePose(character, pose);
      onFootprintChange(pose);
      character.dataset.poseMotion = "action";
      queue(poseTimers, timing.poseActionMs, () => {
        if (activeTransition !== poseVersion) {
          return;
        }
        character.dataset.poseMotion = "settle";
        queue(poseTimers, timing.poseSettleMs, () => {
          if (activeTransition === poseVersion) {
            delete character.dataset.poseMotion;
          }
        });
      });
    };

    if (skipAnticipation || activePose === pose) {
      applyPose();
      return;
    }

    character.dataset.poseMotion = "anticipate";
    queue(poseTimers, timing.poseAnticipationMs, applyPose);
  }

  function scheduleAmbientBehaviors() {
    if (!isAmbientEligible()) {
      return;
    }

    if (lookTimerId === null) {
      lookTimerId = schedule(() => {
        lookTimerId = null;
        runLookBehavior();
      }, randomBetween(timing.lookDelayMinMs, timing.lookDelayMaxMs));
    }

    if (laptopTimerId === null) {
      laptopTimerId = schedule(() => {
        laptopTimerId = null;
        runWorkBehavior();
      }, randomBetween(timing.laptopDelayMinMs, timing.laptopDelayMaxMs));
    }
  }

  function runLookBehavior() {
    if (!isAmbientEligible() || ambientPose) {
      scheduleAmbientBehaviors();
      return;
    }

    ambientPose = random() < 0.5 ? OLLIE_POSE.LOOK_LEFT : OLLIE_POSE.LOOK_RIGHT;
    transitionToPose(ambientPose);
    queue(
      ambientActionTimers,
      randomBetween(
        timing.lookHoldMinMs,
        timing.lookHoldMaxMs,
      ),
      finishAmbientBehavior,
    );
  }

  function runWorkBehavior() {
    if (!isAmbientEligible() || ambientPose) {
      scheduleAmbientBehaviors();
      return;
    }

    ambientPose = nextWorkPose;
    nextWorkPose =
      nextWorkPose === OLLIE_POSE.WORKING_LAPTOP
        ? OLLIE_POSE.HOLDING_HAMMER
        : OLLIE_POSE.WORKING_LAPTOP;
    const workDuration = randomBetween(
      timing.laptopHoldMinMs,
      timing.laptopHoldMaxMs,
    );

    if (ambientPose === OLLIE_POSE.HOLDING_HAMMER) {
      runHammerSequence(workDuration);
      return;
    }

    transitionToPose(OLLIE_POSE.WORKING_LAPTOP);
    queue(
      ambientActionTimers,
      workDuration,
      finishAmbientBehavior,
    );
  }

  function runHammerSequence(workDuration) {
    transitionToPose(OLLIE_POSE.HOLDING_HAMMER);
    queue(ambientActionTimers, timing.hammerFirstStrikeMs, () => {
      transitionToPose(OLLIE_POSE.HAMMER_STRIKE);
    });
    queue(ambientActionTimers, timing.hammerFirstRecoverMs, () => {
      transitionToPose(OLLIE_POSE.HOLDING_HAMMER);
    });
    queue(ambientActionTimers, timing.hammerSecondStrikeMs, () => {
      transitionToPose(OLLIE_POSE.HAMMER_STRIKE);
    });
    queue(ambientActionTimers, timing.hammerSecondRecoverMs, () => {
      transitionToPose(OLLIE_POSE.HOLDING_HAMMER);
    });
    queue(ambientActionTimers, workDuration, finishAmbientBehavior);
  }

  function finishAmbientBehavior() {
    ambientPose = null;
    if (isAmbientEligible()) {
      transitionToPose(OLLIE_POSE.IDLE);
      scheduleAmbientBehaviors();
    }
  }

  function isAmbientEligible() {
    return (
      phase === "focus" &&
      !isDistracted &&
      choreographyBehavior === "idle" &&
      Date.now() >= speakingQuietUntil
    );
  }

  function canUseThinkingSequence() {
    return phase === "focus" && !isDistracted;
  }

  function resolveChoreographyPose() {
    return THINKING_CHOREOGRAPHY_BEHAVIORS.has(choreographyBehavior)
      ? OLLIE_POSE.THINKING
      : OLLIE_POSE.IDLE;
  }

  function cancelAmbientAction() {
    ambientPose = null;
    clearTimerSet(ambientActionTimers);
  }

  function cancelAmbientSchedule() {
    if (lookTimerId !== null) {
      cancel(lookTimerId);
      lookTimerId = null;
    }
    if (laptopTimerId !== null) {
      cancel(laptopTimerId);
      laptopTimerId = null;
    }
  }

  function queue(timerSet, delay, callback) {
    const timerId = schedule(() => {
      timerSet.delete(timerId);
      callback();
    }, delay);
    timerSet.add(timerId);
    return timerId;
  }

  function clearTimerSet(timerSet) {
    timerSet.forEach((timerId) => cancel(timerId));
    timerSet.clear();
  }

  function randomBetween(minimum, maximum) {
    return Math.round(minimum + random() * (maximum - minimum));
  }

  function dispose() {
    poseVersion += 1;
    speechVersion += 1;
    cancelAmbientSchedule();
    cancelAmbientAction();
    clearTimerSet(poseTimers);
    clearTimerSet(speechTimers);
  }

  return Object.freeze({
    dispose,
    getPose: () => activePose,
    present,
    setChoreographyBehavior,
    setSessionState,
  });
}

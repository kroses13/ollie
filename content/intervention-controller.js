export const INTERVENTION_TIMING = Object.freeze({
  WARNING_GRACE_MS: 6_000,
  PHASE_ONE_DURATION_MS: 4_000,
  PHASE_TWO_DURATION_MS: 4_000,
});

export const INTERVENTION_STAGE = Object.freeze({
  IDLE: "idle",
  WARNING: "warning",
  ATTACK_ONE: "attack-one",
  ATTACK_TWO: "attack-two",
  ATTACK_FINAL: "attack-final",
});

export function createInterventionController({
  onStageChange,
  schedule = (callback, delay) => setTimeout(callback, delay),
  cancel = (timerId) => clearTimeout(timerId),
}) {
  let isDistracted = false;
  let stage = INTERVENTION_STAGE.IDLE;
  let pendingTimer = null;

  function setDistracted(nextIsDistracted) {
    const normalizedValue = Boolean(nextIsDistracted);
    if (normalizedValue === isDistracted) {
      return;
    }

    isDistracted = normalizedValue;
    cancelPendingTimer();

    if (!isDistracted) {
      setStage(INTERVENTION_STAGE.IDLE);
      return;
    }

    setStage(INTERVENTION_STAGE.WARNING);
    queueStage(
      INTERVENTION_STAGE.ATTACK_ONE,
      INTERVENTION_TIMING.WARNING_GRACE_MS,
    );
  }

  function queueStage(nextStage, delay) {
    pendingTimer = schedule(() => {
      pendingTimer = null;
      if (!isDistracted) {
        return;
      }

      setStage(nextStage);
      if (nextStage === INTERVENTION_STAGE.ATTACK_ONE) {
        queueStage(
          INTERVENTION_STAGE.ATTACK_TWO,
          INTERVENTION_TIMING.PHASE_ONE_DURATION_MS,
        );
      } else if (nextStage === INTERVENTION_STAGE.ATTACK_TWO) {
        queueStage(
          INTERVENTION_STAGE.ATTACK_FINAL,
          INTERVENTION_TIMING.PHASE_TWO_DURATION_MS,
        );
      }
    }, delay);
  }

  function setStage(nextStage) {
    if (stage === nextStage) {
      return;
    }

    stage = nextStage;
    onStageChange(stage);
  }

  function cancelPendingTimer() {
    if (pendingTimer === null) {
      return;
    }

    cancel(pendingTimer);
    pendingTimer = null;
  }

  function dispose() {
    isDistracted = false;
    cancelPendingTimer();
    setStage(INTERVENTION_STAGE.IDLE);
  }

  return Object.freeze({
    dispose,
    getStage: () => stage,
    setDistracted,
  });
}

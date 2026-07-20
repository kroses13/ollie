const HOME_POSITION = Object.freeze({
  x: "0px",
  y: "0px",
  aimX: "-18px",
  aimY: "8px",
  depth: "front",
});

const PHASE_PLAN = Object.freeze({
  "attack-one": Object.freeze({
    baseline: 0,
    confidence: "cautious",
    waypoints: Object.freeze([
      waypoint(1, "-8vw", "3vh", 180, 560, 240, 340, "-20px", "10px"),
      waypoint(2, "-19vw", "27vh", 230, 640, 210, 300, "-18px", "12px"),
    ]),
  }),
  "attack-two": Object.freeze({
    baseline: 2,
    confidence: "mischievous",
    waypoints: Object.freeze([
      waypoint(
        3,
        "-72vw",
        "4vh",
        150,
        500,
        180,
        200,
        "-18px",
        "8px",
        "behind",
      ),
      waypoint(4, "-9vw", "67vh", 100, 450, 160, 180, "-16px", "12px"),
      waypoint(5, "-71vw", "69vh", 120, 500, 170, 190, "-18px", "-8px"),
    ]),
  }),
  "attack-final": Object.freeze({
    baseline: 5,
    confidence: "delighted",
    waypoints: Object.freeze([
      waypoint(6, "-50vw", "35vh", 110, 460, 170, 180, "-15px", "10px"),
      waypoint(
        7,
        "-34vw",
        "70vh",
        90,
        420,
        150,
        160,
        "16px",
        "-8px",
        "behind",
      ),
      waypoint(8, "-42vw", "13vh", 130, 490, 160, 190, "-17px", "8px"),
    ]),
  }),
});

export const CHOREOGRAPHY_TIMING = Object.freeze({
  LAND_MS: 90,
  SPRAY_MS: 150,
  EMERGE_MS: 120,
  WARNING_NOTICE_MS: 240,
  WARNING_AIM_MS: 220,
  WARNING_SPRAY_MS: 150,
  WARNING_INSPECT_MS: 460,
});

export function createOllieChoreography({
  onBehaviorChange,
  onPositionChange,
  onVisibleCountChange,
  schedule = (callback, delay) => setTimeout(callback, delay),
  cancel = (timerId) => clearTimeout(timerId),
}) {
  let pendingTimers = new Set();
  let visibleCount = 0;
  let runVersion = 0;

  function setInterventionStage(stage) {
    cancelPendingActions();
    runVersion += 1;
    const activeRun = runVersion;

    if (stage === "idle") {
      visibleCount = 0;
      onVisibleCountChange(0, null);
      onPositionChange(HOME_POSITION, 0);
      onBehaviorChange("idle", "cautious");
      return;
    }

    if (stage === "warning") {
      visibleCount = 0;
      onVisibleCountChange(0, null);
      onPositionChange(HOME_POSITION, 0);
      runWarningSequence(activeRun);
      return;
    }

    const phase = PHASE_PLAN[stage];
    if (!phase) {
      return;
    }

    visibleCount = phase.baseline;
    onVisibleCountChange(visibleCount, null);
    runWaypoint(phase, 0, activeRun);
  }

  function runWarningSequence(activeRun) {
    onBehaviorChange("notice", "cautious");
    queue(activeRun, CHOREOGRAPHY_TIMING.WARNING_NOTICE_MS, () => {
      onBehaviorChange("aim", "cautious");
      queue(activeRun, CHOREOGRAPHY_TIMING.WARNING_AIM_MS, () => {
        onBehaviorChange("spray", "cautious");
        queue(activeRun, CHOREOGRAPHY_TIMING.WARNING_SPRAY_MS, () => {
          onBehaviorChange("inspect", "cautious");
          queue(activeRun, CHOREOGRAPHY_TIMING.WARNING_INSPECT_MS, () => {
            onBehaviorChange("warning-wait", "cautious");
          });
        });
      });
    });
  }

  function runWaypoint(phase, index, activeRun) {
    const stop = phase.waypoints[index];
    if (!stop) {
      onBehaviorChange("decide", phase.confidence);
      return;
    }

    onBehaviorChange("think", phase.confidence);
    queue(activeRun, stop.thinkMs, () => {
      onBehaviorChange("hop", phase.confidence);
      onPositionChange(stop, stop.travelMs);
      queue(activeRun, stop.travelMs, () => {
        onBehaviorChange("land", phase.confidence);
        queue(activeRun, CHOREOGRAPHY_TIMING.LAND_MS, () => {
          if (stop.depth === "behind") {
            onPositionChange({ ...stop, depth: "front" }, 0);
            onBehaviorChange("emerge", phase.confidence);
          }

          queue(
            activeRun,
            stop.depth === "behind" ? CHOREOGRAPHY_TIMING.EMERGE_MS : 0,
            () => {
              onBehaviorChange("aim", phase.confidence);
              queue(activeRun, stop.anticipateMs, () => {
                onBehaviorChange("spray", phase.confidence);
                visibleCount = Math.max(visibleCount, stop.splatter);
                onVisibleCountChange(visibleCount, stop.splatter);
                queue(activeRun, CHOREOGRAPHY_TIMING.SPRAY_MS, () => {
                  onBehaviorChange("inspect", phase.confidence);
                  queue(activeRun, stop.inspectMs, () => {
                    runWaypoint(phase, index + 1, activeRun);
                  });
                });
              });
            },
          );
        });
      });
    });
  }

  function queue(activeRun, delay, callback) {
    const timerId = schedule(() => {
      pendingTimers.delete(timerId);
      if (activeRun !== runVersion) {
        return;
      }
      callback();
    }, delay);
    pendingTimers.add(timerId);
  }

  function cancelPendingActions() {
    pendingTimers.forEach((timerId) => cancel(timerId));
    pendingTimers = new Set();
  }

  function dispose() {
    runVersion += 1;
    cancelPendingActions();
  }

  return Object.freeze({
    dispose,
    getVisibleCount: () => visibleCount,
    setInterventionStage,
  });
}

function waypoint(
  splatter,
  x,
  y,
  thinkMs,
  travelMs,
  anticipateMs,
  inspectMs,
  aimX,
  aimY,
  depth = "front",
) {
  return Object.freeze({
    splatter,
    x,
    y,
    thinkMs,
    travelMs,
    anticipateMs,
    inspectMs,
    aimX,
    aimY,
    depth,
  });
}

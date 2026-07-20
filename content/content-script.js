(() => {
  const ROOT_ID = "ollie-extension-companion-root";
  const GET_STATE = "GET_STATE";
  const STATE_UPDATED = "STATE_UPDATED";
  if (document.getElementById(ROOT_ID)) {
    return;
  }

  let companionElements = null;
  let interventionController = null;

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === STATE_UPDATED) {
      applyState(message.payload);
    }
  });

  void mountCompanion();

  async function mountCompanion() {
    try {
      const [
        { createOllieCharacter },
        { createInterventionController },
        { createPixelInkField, randomizePixelInkField },
        { createOllieChoreography },
        overlayCss,
        animationCss,
      ] = await Promise.all([
        import(chrome.runtime.getURL("content/companion-view.js")),
        import(chrome.runtime.getURL("content/intervention-controller.js")),
        import(chrome.runtime.getURL("content/ink-splatter-view.js")),
        import(chrome.runtime.getURL("content/ollie-choreography.js")),
        loadTextAsset("content/overlay.css"),
        loadTextAsset("content/animations.css"),
      ]);

      if (document.getElementById(ROOT_ID)) {
        return;
      }

      const host = document.createElement("div");
      host.id = ROOT_ID;
      setHostStyles(host);

      const shadowRoot = host.attachShadow({ mode: "closed" });
      const styles = document.createElement("style");
      styles.textContent = `${overlayCss}\n${animationCss}`;

      const stage = document.createElement("div");
      stage.className = "ollie-stage";
      stage.dataset.phase = "idle";
      stage.dataset.intervention = "idle";
      stage.dataset.behavior = "idle";
      stage.dataset.confidence = "cautious";
      stage.dataset.depth = "front";

      const inkField = createPixelInkField();
      stage.append(createOllieCharacter({ title: "Ollie" }));
      shadowRoot.append(styles, inkField, stage);
      document.documentElement.append(host);

      companionElements = {
        host,
        inkField,
        randomizePixelInkField,
        stage,
      };
      companionElements.choreography = createOllieChoreography({
        onBehaviorChange: applyCharacterBehavior,
        onPositionChange: applyCharacterPosition,
        onVisibleCountChange: applyVisibleInk,
      });
      interventionController = createInterventionController({
        onStageChange: applyInterventionStage,
      });
      window.addEventListener(
        "pagehide",
        () => {
          interventionController?.dispose();
          companionElements?.choreography?.dispose();
        },
        { once: true },
      );
      requestState();
    } catch {
      // Restricted or unloading pages may reject extension resource requests.
    }
  }

  async function loadTextAsset(path) {
    const response = await fetch(chrome.runtime.getURL(path));
    if (!response.ok) {
      throw new Error(`Unable to load ${path}.`);
    }
    return response.text();
  }

  function requestState() {
    chrome.runtime.sendMessage({ type: GET_STATE }, (response) => {
      if (chrome.runtime.lastError || !response?.ok) {
        return;
      }
      applyState(response.state);
    });
  }

  function applyState(state) {
    if (!companionElements || !state?.session) {
      return;
    }

    const phase = state.session.phase;
    const isSessionActive = phase === "focus" || phase === "break";
    companionElements.host.style.setProperty(
      "display",
      isSessionActive ? "block" : "none",
      "important",
    );
    companionElements.stage.dataset.phase = phase;
    interventionController?.setDistracted(
      Boolean(state.companion?.isDistracted),
    );
  }

  function applyInterventionStage(interventionStage) {
    if (!companionElements) {
      return;
    }

    if (interventionStage === "warning") {
      companionElements.randomizePixelInkField(companionElements.inkField);
    }

    companionElements.stage.dataset.intervention = interventionStage;
    companionElements.inkField.dataset.intervention = interventionStage;
    companionElements.choreography.setInterventionStage(interventionStage);
  }

  function applyCharacterBehavior(behavior, confidence) {
    companionElements.stage.dataset.behavior = behavior;
    companionElements.inkField.dataset.behavior = behavior;
    companionElements.stage.dataset.confidence = confidence;
  }

  function applyCharacterPosition(position, travelMs) {
    companionElements.stage.style.setProperty("--ollie-x", position.x);
    companionElements.stage.style.setProperty("--ollie-y", position.y);
    companionElements.stage.style.setProperty(
      "--ollie-travel-ms",
      `${travelMs}ms`,
    );
    companionElements.stage.style.setProperty("--ollie-aim-x", position.aimX);
    companionElements.stage.style.setProperty("--ollie-aim-y", position.aimY);
    companionElements.stage.dataset.depth = position.depth;
  }

  function applyVisibleInk(visibleCount, sprayIndex) {
    companionElements.inkField.dataset.visibleCount = String(visibleCount);
    companionElements.inkField.dataset.sprayIndex = String(sprayIndex ?? 0);
  }

  function setHostStyles(host) {
    const styles = {
      position: "fixed",
      top: "16px",
      right: "16px",
      width: "96px",
      height: "72px",
      margin: "0",
      padding: "0",
      border: "0",
      display: "none",
      zIndex: "2147483000",
      pointerEvents: "none",
      contain: "style",
    };

    Object.entries(styles).forEach(([property, value]) => {
      const cssProperty = property.replace(
        /[A-Z]/g,
        (character) => `-${character.toLowerCase()}`,
      );
      host.style.setProperty(cssProperty, value, "important");
    });
  }
})();

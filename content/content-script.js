(() => {
  const ROOT_ID = "ollie-extension-companion-root";
  const GET_STATE = "GET_STATE";
  const STATE_UPDATED = "STATE_UPDATED";

  if (document.getElementById(ROOT_ID)) {
    return;
  }

  let companionElements = null;

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === STATE_UPDATED) {
      applyState(message.payload);
    }
  });

  void mountCompanion();

  async function mountCompanion() {
    try {
      const [{ createOllieSvg }, overlayCss, animationCss] = await Promise.all([
        import(chrome.runtime.getURL("content/companion-view.js")),
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

      const svg = createOllieSvg({ title: "Ollie" });
      svg.setAttribute("width", "96");
      svg.setAttribute("height", "72");
      stage.append(svg);
      shadowRoot.append(styles, stage);
      document.documentElement.append(host);

      companionElements = { host, stage };
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
      contain: "layout style paint",
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

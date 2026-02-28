(function () {
  const START_MODAL_ID = "campusflow-start-modal";
  const TOAST_CONTAINER_ID = "campusflow-toast-container";

  function removeStartModal() {
    const existing = document.getElementById(START_MODAL_ID);
    if (existing) {
      existing.remove();
    }
  }

  function ensureToastContainer() {
    let container = document.getElementById(TOAST_CONTAINER_ID);
    if (container) return container;

    container = document.createElement("div");
    container.id = TOAST_CONTAINER_ID;
    container.className = "cf-toast-container";
    document.documentElement.appendChild(container);

    return container;
  }

  function showToast(kind, message) {
    const container = ensureToastContainer();

    const toast = document.createElement("div");
    toast.className = `cf-toast ${kind === "PAUSED" ? "cf-toast-paused" : "cf-toast-resumed"}`;
    toast.textContent = message;

    container.appendChild(toast);

    window.setTimeout(() => {
      toast.classList.add("cf-toast-exit");
      window.setTimeout(() => toast.remove(), 220);
    }, 2600);
  }

  function showStartModal(domain, mode) {
    removeStartModal();

    const overlay = document.createElement("div");
    overlay.id = START_MODAL_ID;
    overlay.className = "cf-start-overlay";

    const card = document.createElement("section");
    card.className = "cf-start-card";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "cf-start-close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.textContent = "×";

    const title = document.createElement("h2");
    title.className = "cf-start-title";
    title.textContent = "MaintAIn";

    const body = document.createElement("p");
    body.className = "cf-start-body";
    body.textContent = mode === "resume" ? "Resume studying?" : "Start studying?";

    const domainTag = document.createElement("p");
    domainTag.className = "cf-start-domain";
    domainTag.textContent = domain;

    const actions = document.createElement("div");
    actions.className = "cf-start-actions";

    const startBtn = document.createElement("button");
    startBtn.type = "button";
    startBtn.className = "cf-btn cf-btn-primary";
    startBtn.textContent = mode === "resume" ? "Resume" : "Start";

    const notNowBtn = document.createElement("button");
    notNowBtn.type = "button";
    notNowBtn.className = "cf-btn cf-btn-secondary";
    notNowBtn.textContent = "Not now";

    const dismiss = () => {
      chrome.runtime.sendMessage({ type: "USER_DISMISS_START" });
      removeStartModal();
    };

    closeBtn.addEventListener("click", dismiss);
    notNowBtn.addEventListener("click", dismiss);

    startBtn.addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "USER_START" });
      removeStartModal();
    });

    actions.appendChild(startBtn);
    actions.appendChild(notNowBtn);

    card.appendChild(closeBtn);
    card.appendChild(title);
    card.appendChild(body);
    card.appendChild(domainTag);
    card.appendChild(actions);

    overlay.appendChild(card);
    document.documentElement.appendChild(overlay);
  }

  /* ── Dashboard postMessage bridge ── */

  function isDashboardPage() {
    return window.location.pathname.startsWith("/dashboard");
  }

  function postStudyDataToPage() {
    chrome.runtime.sendMessage({ type: "GET_POPUP_DATA" }, (response) => {
      if (chrome.runtime.lastError || !response || !response.ok) return;
      window.postMessage({
        type: "MAINTAIN_EXTENSION_DATA",
        payload: {
          connected: true,
          timerState: response.timerState,
          totalStudySeconds: response.totalStudySeconds,
          websiteTotals: response.websiteTotals,
          version: chrome.runtime.getManifest().version,
        },
      }, "*");
    });
  }

  if (isDashboardPage()) {
    // Initial sync after short delay to let React hydrate
    setTimeout(postStudyDataToPage, 500);
    // Periodic sync every 2 seconds
    setInterval(postStudyDataToPage, 2000);
  }

  // Listen for on-demand sync requests from the dashboard page
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.data && event.data.type === "MAINTAIN_REQUEST_DATA") {
      postStudyDataToPage();
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || typeof message !== "object") return;

    if (message.type === "SHOW_START_MODAL") {
      const modalMode = message.mode === "resume" ? "resume" : "start";
      showStartModal(typeof message.domain === "string" ? message.domain : "", modalMode);
      sendResponse({ ok: true });
      return;
    }

    if (message.type === "SHOW_TOAST") {
      const kind = message.kind === "PAUSED" ? "PAUSED" : "RESUMED";
      const text =
        typeof message.message === "string" && message.message.trim().length > 0
          ? message.message
          : kind === "PAUSED"
            ? "Study timer paused (distracting site)."
            : "Resumed study timer.";

      showToast(kind, text);
      sendResponse({ ok: true });
    }
  });
})();

(function () {
  const START_MODAL_ID = "campusflow-start-modal";
  const TOAST_CONTAINER_ID = "campusflow-toast-container";
  const MINI_POPUP_ID = "campusflow-mini-popup";

  function safeRuntimeSendMessage(message) {
    if (!chrome.runtime || !chrome.runtime.id) {
      return;
    }

    try {
      chrome.runtime.sendMessage(message, () => {
        void chrome.runtime.lastError;
      });
    } catch {
      // Ignore extension reload races.
    }
  }

  function removeStartModal() {
    const existing = document.getElementById(START_MODAL_ID);
    if (existing) {
      existing.remove();
    }
  }

  function ensureToastContainer() {
    if (!document.documentElement) return null;

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
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `cf-toast ${kind === "PAUSED" ? "cf-toast-paused" : "cf-toast-resumed"} cf-auto-dismiss`;
    toast.textContent = message;

    container.appendChild(toast);
    while (container.childElementCount > 3) {
      container.firstElementChild?.remove();
    }
  }

  function showMiniPopup(titleText, bodyText) {
    if (!document.documentElement) return;

    const existing = document.getElementById(MINI_POPUP_ID);
    if (existing) {
      existing.remove();
    }

    const popup = document.createElement("aside");
    popup.id = MINI_POPUP_ID;
    popup.className = "cf-mini-popup cf-auto-dismiss";

    const title = document.createElement("p");
    title.className = "cf-mini-title";
    title.textContent = titleText;

    const body = document.createElement("p");
    body.className = "cf-mini-body";
    body.textContent = bodyText;

    popup.appendChild(title);
    popup.appendChild(body);
    document.documentElement.appendChild(popup);
  }

  function showStartModal(domain, mode) {
    if (!document.documentElement) return;

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
      safeRuntimeSendMessage({ type: "USER_DISMISS_START" });
      removeStartModal();
    };

    closeBtn.addEventListener("click", dismiss);
    notNowBtn.addEventListener("click", dismiss);

    startBtn.addEventListener("click", () => {
      safeRuntimeSendMessage({ type: "USER_START" });
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

      if (kind === "PAUSED") {
        showMiniPopup("Auto distraction detected", text);
      } else {
        showToast(kind, text);
      }
      sendResponse({ ok: true });
    }
  });
})();

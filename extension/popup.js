const STUDY_DOMAINS = [
  "carmen.osu.edu",
  "canvas.osu.edu",
  "docs.google.com",
  "drive.google.com",
  "www.overleaf.com"
];

const DISTRACTING_DOMAINS = [
  "instagram.com",
  "www.instagram.com",
  "tiktok.com",
  "www.tiktok.com",
  "youtube.com",
  "www.youtube.com"
];
const OFF_TASK_HINTS = [
  "reddit",
  "amazon",
  "walmart",
  "target",
  "coupang",
  "ebay",
  "shopping",
  "shop",
  "store",
  "game",
  "games",
  "steam",
  "netflix",
  "twitch",
  "discord",
  "facebook",
  "twitter",
  "x.com"
];
const STUDY_HINTS = [
  ".edu",
  "canvas",
  "moodle",
  "blackboard",
  "coursera",
  "edx",
  "khanacademy",
  "scholar.google",
  "arxiv",
  "jstor",
  "overleaf",
  "docs.google",
  "drive.google",
  "notion"
];

function formatMmSs(totalSeconds) {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function sendRuntimeMessage(message, callback) {
  if (!chrome.runtime || !chrome.runtime.id) {
    if (typeof callback === "function") {
      callback(null);
    }
    return;
  }

  try {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        if (typeof callback === "function") {
          callback(null);
        }
        return;
      }

      if (typeof callback === "function") {
        callback(response);
      }
    });
  } catch {
    if (typeof callback === "function") {
      callback(null);
    }
  }
}

function matchesDomain(host, baseDomain) {
  return host === baseDomain || host.endsWith(`.${baseDomain}`);
}

function classifyDomain(domain) {
  return classifyDomainWithCache(domain, {});
}

function classifyDomainWithCache(domain, classificationCache) {
  const cachedLabel = classificationCache && typeof classificationCache === "object"
    ? classificationCache[domain]
    : null;

  if (OFF_TASK_HINTS.some((hint) => domain.includes(hint))) {
    return "distracting";
  }
  if (domain.endsWith(".edu")) {
    return "study";
  }
  if (STUDY_HINTS.some((hint) => domain.includes(hint))) {
    return "study";
  }

  if (cachedLabel === "1") {
    return "distracting";
  }
  if (cachedLabel === "0") {
    return "study";
  }

  if (DISTRACTING_DOMAINS.some((base) => matchesDomain(domain, base))) {
    return "distracting";
  }
  if (STUDY_DOMAINS.some((base) => matchesDomain(domain, base))) {
    return "study";
  }
  return "other";
}

function renderTimerState(timerState, pauseReason) {
  const line = document.getElementById("timer-state");
  if (!line) return;

  if (timerState === "PAUSED" && pauseReason === "AUTO_DISTRACTION") {
    line.textContent = "Timer: PAUSED (auto distraction)";
    return;
  }

  if (timerState === "PAUSED" && pauseReason === "MANUAL") {
    line.textContent = "Timer: PAUSED (manual)";
    return;
  }

  line.textContent = `Timer: ${timerState || "STOPPED"}`;
}

function renderStudyingTimer(totalStudySeconds) {
  const timerEl = document.getElementById("studying-timer");
  if (!timerEl) return;
  timerEl.textContent = formatMmSs(totalStudySeconds);
}

function renderWebsiteList(websiteTotals, classificationCache) {
  const listEl = document.getElementById("website-list");
  if (!listEl) return;

  const rows = Object.entries(websiteTotals || {})
    .filter(([domain]) => typeof domain === "string" && !/[/?#]/.test(domain))
    .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
    .slice(0, 5);

  listEl.innerHTML = "";

  if (rows.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No website activity yet.";
    listEl.appendChild(empty);
    return;
  }

  for (const [domain, seconds] of rows) {
    const li = document.createElement("li");
    const kind = classifyDomainWithCache(domain, classificationCache);
    li.className = `website-row ${kind}`;

    const domainSpan = document.createElement("span");
    domainSpan.className = "domain";
    domainSpan.textContent = domain;

    const timeSpan = document.createElement("span");
    timeSpan.className = "time";
    timeSpan.textContent = formatMmSs(seconds);

    li.appendChild(domainSpan);
    li.appendChild(timeSpan);
    listEl.appendChild(li);
  }
}

function refreshPopupData() {
  sendRuntimeMessage({ type: "GET_POPUP_DATA" }, (response) => {
    if (!response || !response.ok) {
      renderTimerState("STOPPED", null);
      renderStudyingTimer(0);
      renderWebsiteList({}, {});
      return;
    }

    renderTimerState(response.timerState, response.pauseReason);
    renderStudyingTimer(response.totalStudySeconds || 0);
    renderWebsiteList(response.websiteTotals || {}, response.domainClassificationCache || {});
  });
}

function sendAction(actionType) {
  sendRuntimeMessage({ type: actionType }, () => {
    refreshPopupData();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const btnStart = document.getElementById("btn-start");
  const btnStop = document.getElementById("btn-stop");
  const btnPause = document.getElementById("btn-pause");
  const btnResume = document.getElementById("btn-resume");
  const openDashboard = document.getElementById("open-dashboard");

  if (btnStart) {
    btnStart.addEventListener("click", () => sendAction("MANUAL_START"));
  }

  if (btnStop) {
    btnStop.addEventListener("click", () => sendAction("MANUAL_STOP"));
  }

  if (btnPause) {
    btnPause.addEventListener("click", () => sendAction("MANUAL_PAUSE"));
  }

  if (btnResume) {
    btnResume.addEventListener("click", () => sendAction("MANUAL_RESUME"));
  }

  if (openDashboard) {
    openDashboard.addEventListener("click", () => {
      sendRuntimeMessage({ type: "OPEN_DASHBOARD" });
    });
  }

  refreshPopupData();
  const refreshIntervalId = window.setInterval(refreshPopupData, 1000);
  window.addEventListener("beforeunload", () => {
    window.clearInterval(refreshIntervalId);
  });
});

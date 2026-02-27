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

function formatMmSs(totalSeconds) {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function matchesDomain(host, baseDomain) {
  return host === baseDomain || host.endsWith(`.${baseDomain}`);
}

function classifyDomain(domain) {
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

function renderWebsiteList(websiteTotals) {
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
    const kind = classifyDomain(domain);
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
  chrome.runtime.sendMessage({ type: "GET_POPUP_DATA" }, (response) => {
    if (!response || !response.ok) {
      renderTimerState("STOPPED", null);
      renderStudyingTimer(0);
      renderWebsiteList({});
      return;
    }

    renderTimerState(response.timerState, response.pauseReason);
    renderStudyingTimer(response.totalStudySeconds || 0);
    renderWebsiteList(response.websiteTotals || {});
  });
}

function sendAction(actionType) {
  chrome.runtime.sendMessage({ type: actionType }, () => {
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
      chrome.runtime.sendMessage({ type: "OPEN_DASHBOARD" });
    });
  }

  refreshPopupData();
  window.setInterval(refreshPopupData, 1000);
});

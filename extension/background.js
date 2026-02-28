// Privacy guarantee:
// - Never store full URLs.
// - Only store hostname-level aggregates and total timer seconds.

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

// Update this URL when deployed (e.g., to IBM Code Engine URL)
const DASHBOARD_URL = "https://maintain-ai.vercel.app/dashboard";

const TIMER_STATES = {
  RUNNING: "RUNNING",
  PAUSED: "PAUSED",
  STOPPED: "STOPPED"
};

const PAUSE_REASONS = {
  AUTO_DISTRACTION: "AUTO_DISTRACTION",
  MANUAL: "MANUAL"
};

const lastHandledUrlByTabId = new Map();

function isObjectLike(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function clampNonNegative(value) {
  return Math.max(0, value);
}

function sanitizeTimerState(rawState) {
  if (rawState === TIMER_STATES.RUNNING) return TIMER_STATES.RUNNING;
  if (rawState === TIMER_STATES.PAUSED) return TIMER_STATES.PAUSED;
  return TIMER_STATES.STOPPED;
}

function sanitizePauseReason(rawReason) {
  if (rawReason === PAUSE_REASONS.AUTO_DISTRACTION) return PAUSE_REASONS.AUTO_DISTRACTION;
  if (rawReason === PAUSE_REASONS.MANUAL) return PAUSE_REASONS.MANUAL;
  return null;
}

function sanitizeHostname(hostname) {
  if (!hostname || typeof hostname !== "string") return null;
  const normalized = hostname.trim().toLowerCase();

  if (/[/?#]/.test(normalized)) return null;
  if (!/^[a-z0-9.-]+$/.test(normalized)) return null;

  return normalized;
}

function extractHostnameFromUrl(url) {
  try {
    if (!url || typeof url !== "string") return null;
    if (!/^https?:\/\//i.test(url)) return null;
    return sanitizeHostname(new URL(url).hostname);
  } catch {
    return null;
  }
}

function sanitizeWebsiteTotals(rawTotals) {
  const safeTotals = {};
  if (!isObjectLike(rawTotals)) return safeTotals;

  for (const [domain, seconds] of Object.entries(rawTotals)) {
    const safeDomain = sanitizeHostname(domain);
    if (!safeDomain) continue;
    safeTotals[safeDomain] = clampNonNegative(Math.floor(Number(seconds) || 0));
  }

  return safeTotals;
}

function matchesDomain(host, baseDomain) {
  return host === baseDomain || host.endsWith(`.${baseDomain}`);
}

function isStudyDomain(host) {
  if (!host) return false;
  return STUDY_DOMAINS.some((baseDomain) => matchesDomain(host, baseDomain));
}

function isDistractingDomain(host) {
  if (!host) return false;
  return DISTRACTING_DOMAINS.some((baseDomain) => matchesDomain(host, baseDomain));
}

async function getState() {
  const result = await chrome.storage.local.get([
    "timerState",
    "pauseReason",
    "lastStartMs",
    "isStudyContext",
    "totalStudySeconds",
    "activeDomain",
    "lastContextMs",
    "websiteTotals"
  ]);

  return {
    timerState: sanitizeTimerState(result.timerState),
    pauseReason: sanitizePauseReason(result.pauseReason),
    lastStartMs: Math.floor(Number(result.lastStartMs) || 0) || null,
    isStudyContext: result.isStudyContext === true,
    totalStudySeconds: clampNonNegative(Math.floor(Number(result.totalStudySeconds) || 0)),
    activeDomain: sanitizeHostname(result.activeDomain),
    lastContextMs: Math.floor(Number(result.lastContextMs) || 0) || null,
    websiteTotals: sanitizeWebsiteTotals(result.websiteTotals)
  };
}

async function saveState(state) {
  await chrome.storage.local.set({
    timerState: sanitizeTimerState(state.timerState),
    pauseReason: sanitizePauseReason(state.pauseReason),
    lastStartMs: state.lastStartMs ? Math.floor(state.lastStartMs) : null,
    isStudyContext: state.isStudyContext === true,
    totalStudySeconds: clampNonNegative(Math.floor(Number(state.totalStudySeconds) || 0)),
    activeDomain: sanitizeHostname(state.activeDomain),
    lastContextMs: state.lastContextMs ? Math.floor(state.lastContextMs) : null,
    websiteTotals: sanitizeWebsiteTotals(state.websiteTotals)
  });
}

function applyWebsiteElapsed(state, nowMs) {
  if (!state.activeDomain || !state.lastContextMs) return;

  const elapsedSec = clampNonNegative(Math.floor((nowMs - state.lastContextMs) / 1000));
  if (elapsedSec <= 0) return;

  const prev = Number(state.websiteTotals[state.activeDomain] || 0);
  state.websiteTotals[state.activeDomain] = clampNonNegative(prev + elapsedSec);
}

function applyStudyElapsedIfNeeded(state, nowMs) {
  if (state.timerState !== TIMER_STATES.RUNNING || !state.lastStartMs || !state.isStudyContext) {
    return;
  }

  const elapsedSec = clampNonNegative(Math.floor((nowMs - state.lastStartMs) / 1000));
  if (elapsedSec <= 0) return;

  state.totalStudySeconds = clampNonNegative(state.totalStudySeconds + elapsedSec);
}

function safeSendToTab(tabId, payload) {
  if (!Number.isInteger(tabId)) return;

  chrome.tabs.sendMessage(tabId, payload, () => {
    void chrome.runtime.lastError;
  });
}

async function getActiveTabInfo() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const tab = tabs && tabs[0] ? tabs[0] : null;

  if (!tab) return { tabId: null, domain: null, url: null };

  return {
    tabId: Number.isInteger(tab.id) ? tab.id : null,
    domain: extractHostnameFromUrl(tab.url),
    url: typeof tab.url === "string" ? tab.url : null
  };
}

async function handleContextChange(tabId, nextDomain) {
  const nowMs = Date.now();
  const state = await getState();
  const previousDomain = state.activeDomain;
  const wasStudyContext = state.isStudyContext;

  applyWebsiteElapsed(state, nowMs);
  applyStudyElapsedIfNeeded(state, nowMs);

  const onStudy = isStudyDomain(nextDomain);
  const onDistracting = isDistractingDomain(nextDomain);

  state.activeDomain = nextDomain;
  state.lastContextMs = nowMs;
  state.isStudyContext = onStudy;
  state.lastStartMs = nowMs;

  if (onDistracting) {
    if (state.timerState === TIMER_STATES.RUNNING) {
      state.timerState = TIMER_STATES.PAUSED;
      state.pauseReason = PAUSE_REASONS.AUTO_DISTRACTION;

      safeSendToTab(tabId, {
        type: "SHOW_TOAST",
        kind: "PAUSED",
        message: "Study timer paused (distracting site)."
      });
    }

    await saveState(state);
    return;
  }

  if (onStudy) {
    const enteredStudyContext = !wasStudyContext || previousDomain !== nextDomain;
    if (
      enteredStudyContext &&
      state.timerState === TIMER_STATES.PAUSED &&
      state.pauseReason === PAUSE_REASONS.AUTO_DISTRACTION
    ) {
      state.timerState = TIMER_STATES.RUNNING;
      state.pauseReason = null;
      state.lastStartMs = nowMs;

      safeSendToTab(tabId, {
        type: "SHOW_TOAST",
        kind: "RESUMED",
        message: "Resumed study timer."
      });
    } else if (enteredStudyContext && state.timerState === TIMER_STATES.STOPPED) {
      safeSendToTab(tabId, {
        type: "SHOW_START_MODAL",
        domain: nextDomain,
        mode: "start"
      });
    }
  }

  await saveState(state);
}

async function initializeState() {
  const nowMs = Date.now();
  const state = await getState();
  const active = await getActiveTabInfo();

  if (!state.lastStartMs) {
    state.lastStartMs = nowMs;
  }

  if (!state.lastContextMs) {
    state.lastContextMs = nowMs;
  }

  state.activeDomain = active.domain;
  state.isStudyContext = isStudyDomain(active.domain);

  await saveState(state);
}

async function handleActivated(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    const domain = extractHostnameFromUrl(tab.url);
    await handleContextChange(tabId, domain);
    if (tab.url) {
      lastHandledUrlByTabId.set(tabId, tab.url);
    }
  } catch {
    await handleContextChange(tabId, null);
  }
}

async function handleUpdated(tabId, changeInfo, tab) {
  if (!tab.active) return;

  if (typeof changeInfo.url === "string") {
    lastHandledUrlByTabId.set(tabId, changeInfo.url);
    const domain = extractHostnameFromUrl(changeInfo.url);
    await handleContextChange(tabId, domain);
    return;
  }

  if (changeInfo.status === "complete" && typeof tab.url === "string") {
    const lastUrl = lastHandledUrlByTabId.get(tabId);
    if (lastUrl === tab.url) return;

    lastHandledUrlByTabId.set(tabId, tab.url);
    const domain = extractHostnameFromUrl(tab.url);
    await handleContextChange(tabId, domain);
  }
}

async function manualStartOrResume() {
  const nowMs = Date.now();
  const state = await getState();
  const active = await getActiveTabInfo();

  applyWebsiteElapsed(state, nowMs);
  applyStudyElapsedIfNeeded(state, nowMs);

  state.activeDomain = active.domain;
  state.lastContextMs = nowMs;
  state.isStudyContext = isStudyDomain(active.domain);

  state.timerState = TIMER_STATES.RUNNING;
  state.pauseReason = null;
  state.lastStartMs = nowMs;

  await saveState(state);
  return state;
}

async function manualPause() {
  const nowMs = Date.now();
  const state = await getState();
  const active = await getActiveTabInfo();

  applyWebsiteElapsed(state, nowMs);
  applyStudyElapsedIfNeeded(state, nowMs);

  state.activeDomain = active.domain;
  state.lastContextMs = nowMs;
  state.isStudyContext = isStudyDomain(active.domain);

  state.timerState = TIMER_STATES.PAUSED;
  state.pauseReason = PAUSE_REASONS.MANUAL;
  state.lastStartMs = nowMs;

  await saveState(state);
  return state;
}

async function manualStop() {
  const nowMs = Date.now();
  const state = await getState();
  const active = await getActiveTabInfo();

  applyWebsiteElapsed(state, nowMs);
  applyStudyElapsedIfNeeded(state, nowMs);

  state.activeDomain = active.domain;
  state.lastContextMs = nowMs;
  state.isStudyContext = isStudyDomain(active.domain);

  state.timerState = TIMER_STATES.STOPPED;
  state.pauseReason = PAUSE_REASONS.MANUAL;
  state.lastStartMs = nowMs;

  await saveState(state);
  return state;
}

async function buildPopupSnapshot() {
  const nowMs = Date.now();
  const state = await getState();

  let liveStudyTotal = state.totalStudySeconds;
  if (state.timerState === TIMER_STATES.RUNNING && state.lastStartMs && state.isStudyContext) {
    const elapsedStudy = clampNonNegative(Math.floor((nowMs - state.lastStartMs) / 1000));
    liveStudyTotal = clampNonNegative(liveStudyTotal + elapsedStudy);
  }

  const liveWebsiteTotals = { ...state.websiteTotals };
  if (state.activeDomain && state.lastContextMs) {
    const elapsedWeb = clampNonNegative(Math.floor((nowMs - state.lastContextMs) / 1000));
    if (elapsedWeb > 0) {
      const prev = Number(liveWebsiteTotals[state.activeDomain] || 0);
      liveWebsiteTotals[state.activeDomain] = clampNonNegative(prev + elapsedWeb);
    }
  }

  return {
    timerState: state.timerState,
    pauseReason: state.pauseReason,
    totalStudySeconds: liveStudyTotal,
    websiteTotals: sanitizeWebsiteTotals(liveWebsiteTotals)
  };
}

chrome.runtime.onInstalled.addListener(async () => {
  await initializeState();
});

chrome.runtime.onStartup.addListener(async () => {
  await initializeState();
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  await handleActivated(tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  await handleUpdated(tabId, changeInfo, tab);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  lastHandledUrlByTabId.delete(tabId);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!isObjectLike(message)) return;

  if (message.type === "USER_START") {
    (async () => {
      const state = await manualStartOrResume();
      sendResponse({ ok: true, timerState: state.timerState, pauseReason: state.pauseReason });
    })();
    return true;
  }

  if (message.type === "USER_DISMISS_START") {
    sendResponse({ ok: true });
    return;
  }

  if (message.type === "MANUAL_START") {
    (async () => {
      const state = await manualStartOrResume();
      sendResponse({ ok: true, timerState: state.timerState, pauseReason: state.pauseReason });
    })();
    return true;
  }

  if (message.type === "MANUAL_RESUME") {
    (async () => {
      const state = await manualStartOrResume();
      sendResponse({ ok: true, timerState: state.timerState, pauseReason: state.pauseReason });
    })();
    return true;
  }

  if (message.type === "MANUAL_PAUSE") {
    (async () => {
      const state = await manualPause();
      sendResponse({ ok: true, timerState: state.timerState, pauseReason: state.pauseReason });
    })();
    return true;
  }

  if (message.type === "MANUAL_STOP") {
    (async () => {
      const state = await manualStop();
      sendResponse({ ok: true, timerState: state.timerState, pauseReason: state.pauseReason });
    })();
    return true;
  }

  if (message.type === "GET_POPUP_DATA") {
    (async () => {
      const snapshot = await buildPopupSnapshot();
      sendResponse({ ok: true, ...snapshot });
    })();
    return true;
  }

  if (message.type === "OPEN_DASHBOARD") {
    chrome.tabs.create({ url: DASHBOARD_URL });
    sendResponse({ ok: true });
  }
});

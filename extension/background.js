// Privacy guarantee:
// - Never store full URLs.
// - Store only hostname aggregates and timer/session metadata.

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

const DASHBOARD_URL = "https://naver.com";
const CLASSIFIER_URL = "http://localhost:3000/classify";
const CLASSIFICATION_CACHE_VERSION = 3;
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

const TIMER_STATES = {
  RUNNING: "RUNNING",
  PAUSED: "PAUSED",
  STOPPED: "STOPPED"
};

const PAUSE_REASONS = {
  AUTO_DISTRACTION: "AUTO_DISTRACTION",
  MANUAL: "MANUAL"
};

const SESSION_EVENT_TYPES = {
  START: "START",
  PAUSE: "PAUSE",
  RESUME: "RESUME",
  STOP: "STOP"
};

const lastHandledUrlByTabId = new Map();
const pendingClassificationByDomain = new Map();
const pendingUiMessagesByTabId = new Map();
const pendingUiRetryTimersByTabId = new Map();

const CLASSIFICATION_LABELS = {
  STUDY: "0",
  OFF_TASK: "1"
};

function logClassification(message, details = {}) {
  const suffix =
    details && Object.keys(details).length > 0 ? ` ${JSON.stringify(details)}` : "";
  console.log(`[MaintAIn][classification] ${message}${suffix}`);
}

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

function sanitizeSessionEventType(rawType) {
  if (rawType === SESSION_EVENT_TYPES.START) return SESSION_EVENT_TYPES.START;
  if (rawType === SESSION_EVENT_TYPES.PAUSE) return SESSION_EVENT_TYPES.PAUSE;
  if (rawType === SESSION_EVENT_TYPES.RESUME) return SESSION_EVENT_TYPES.RESUME;
  if (rawType === SESSION_EVENT_TYPES.STOP) return SESSION_EVENT_TYPES.STOP;
  return null;
}

function sanitizeClassificationLabel(rawLabel) {
  if (rawLabel === CLASSIFICATION_LABELS.STUDY) return CLASSIFICATION_LABELS.STUDY;
  if (rawLabel === CLASSIFICATION_LABELS.OFF_TASK) return CLASSIFICATION_LABELS.OFF_TASK;
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

function sanitizeFocusByDomain(rawTotals) {
  return sanitizeWebsiteTotals(rawTotals);
}

function sanitizeDomainClassificationCache(rawCache) {
  const safeCache = {};
  if (!isObjectLike(rawCache)) return safeCache;

  for (const [domain, label] of Object.entries(rawCache)) {
    const safeDomain = sanitizeHostname(domain);
    const safeLabel = sanitizeClassificationLabel(label);
    if (!safeDomain || !safeLabel) continue;
    safeCache[safeDomain] = safeLabel;
  }

  return safeCache;
}

function sanitizeSessionEvents(rawEvents) {
  if (!Array.isArray(rawEvents)) return [];

  const safe = [];
  for (const item of rawEvents) {
    if (!isObjectLike(item)) continue;

    const type = sanitizeSessionEventType(item.type);
    const timestamp = Math.floor(Number(item.timestamp) || 0);
    const reason = sanitizePauseReason(item.reason);

    if (!type || timestamp <= 0) continue;
    safe.push({ type, timestamp, reason });
  }

  return safe;
}

function sanitizeCurrentSession(rawSession) {
  if (!isObjectLike(rawSession)) return null;

  const sessionId = typeof rawSession.sessionId === "string" ? rawSession.sessionId : null;
  const startedAt = Math.floor(Number(rawSession.startedAt) || 0);
  const updatedAt = Math.floor(Number(rawSession.updatedAt) || 0);
  const focusSeconds = clampNonNegative(Math.floor(Number(rawSession.focusSeconds) || 0));
  const events = sanitizeSessionEvents(rawSession.events);
  const focusByDomain = sanitizeFocusByDomain(rawSession.focusByDomain);

  if (!sessionId || startedAt <= 0) return null;

  return {
    sessionId,
    startedAt,
    updatedAt: updatedAt > 0 ? updatedAt : startedAt,
    focusSeconds,
    events,
    focusByDomain
  };
}

function createSession(nowMs) {
  return {
    sessionId: `session-${new Date(nowMs).toISOString()}`,
    startedAt: nowMs,
    updatedAt: nowMs,
    focusSeconds: 0,
    events: [],
    focusByDomain: {}
  };
}

function appendSessionEvent(state, type, timestamp, reason = null) {
  if (!state.currentSession) return;

  const safeType = sanitizeSessionEventType(type);
  const safeTimestamp = Math.floor(Number(timestamp) || 0);
  const safeReason = sanitizePauseReason(reason);

  if (!safeType || safeTimestamp <= 0) return;

  state.currentSession.events.push({
    type: safeType,
    timestamp: safeTimestamp,
    reason: safeReason
  });
  state.currentSession.updatedAt = safeTimestamp;
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
    "websiteTotals",
    "currentSession",
    "domainClassificationCache",
    "domainClassificationCacheVersion"
  ]);

  const cacheVersion = Number(result.domainClassificationCacheVersion || 0);
  const domainClassificationCache =
    cacheVersion === CLASSIFICATION_CACHE_VERSION
      ? sanitizeDomainClassificationCache(result.domainClassificationCache)
      : {};

  return {
    timerState: sanitizeTimerState(result.timerState),
    pauseReason: sanitizePauseReason(result.pauseReason),
    lastStartMs: Math.floor(Number(result.lastStartMs) || 0) || null,
    isStudyContext: result.isStudyContext === true,
    totalStudySeconds: clampNonNegative(Math.floor(Number(result.totalStudySeconds) || 0)),
    activeDomain: sanitizeHostname(result.activeDomain),
    lastContextMs: Math.floor(Number(result.lastContextMs) || 0) || null,
    websiteTotals: sanitizeWebsiteTotals(result.websiteTotals),
    currentSession: sanitizeCurrentSession(result.currentSession),
    domainClassificationCache,
    domainClassificationCacheVersion: CLASSIFICATION_CACHE_VERSION
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
    websiteTotals: sanitizeWebsiteTotals(state.websiteTotals),
    currentSession: sanitizeCurrentSession(state.currentSession),
    domainClassificationCache: sanitizeDomainClassificationCache(state.domainClassificationCache),
    domainClassificationCacheVersion: CLASSIFICATION_CACHE_VERSION
  });
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

function getStaticClassification(domain) {
  if (!domain) return null;
  if (isDistractingDomain(domain)) return CLASSIFICATION_LABELS.OFF_TASK;
  if (isStudyDomain(domain)) return CLASSIFICATION_LABELS.STUDY;
  if (OFF_TASK_HINTS.some((hint) => domain.includes(hint))) {
    return CLASSIFICATION_LABELS.OFF_TASK;
  }
  if (domain.endsWith(".edu")) {
    return CLASSIFICATION_LABELS.STUDY;
  }
  if (STUDY_HINTS.some((hint) => domain.includes(hint))) {
    return CLASSIFICATION_LABELS.STUDY;
  }
  return null;
}

async function fetchClassificationFromBackend(domain) {
  logClassification("backend_fetch_start", { domain, url: CLASSIFIER_URL });
  const response = await fetch(CLASSIFIER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ domain })
  });

  if (!response.ok) {
    logClassification("backend_fetch_http_error", { domain, status: response.status });
    throw new Error(`classifier_http_${response.status}`);
  }

  const data = await response.json();
  const label = sanitizeClassificationLabel(data.label);
  logClassification("backend_fetch_success", { domain, label });
  return label;
}

async function resolveDomainClassification(state, domain) {
  if (!domain) return null;

  const staticLabel = getStaticClassification(domain);
  if (staticLabel) {
    state.domainClassificationCache[domain] = staticLabel;
    logClassification("static_classification", { domain, label: staticLabel });
    return staticLabel;
  }

  const cachedLabel = sanitizeClassificationLabel(state.domainClassificationCache[domain]);
  if (cachedLabel) {
    logClassification("cache_hit", { domain, label: cachedLabel });
    return cachedLabel;
  }

  if (pendingClassificationByDomain.has(domain)) {
    logClassification("pending_request_reused", { domain });
    return pendingClassificationByDomain.get(domain);
  }

  const request = (async () => {
    try {
      const label = await fetchClassificationFromBackend(domain);
      logClassification("backend_fetch_resolved", { domain, label });
      return sanitizeClassificationLabel(label);
    } catch {
      logClassification("backend_fetch_failed", { domain });
      return null;
    } finally {
      pendingClassificationByDomain.delete(domain);
    }
  })();

  pendingClassificationByDomain.set(domain, request);
  const resolvedLabel = await request;

  if (resolvedLabel) {
    state.domainClassificationCache[domain] = resolvedLabel;
    logClassification("cache_store", { domain, label: resolvedLabel });
  }

  return resolvedLabel;
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

  if (state.currentSession) {
    state.currentSession.focusSeconds = clampNonNegative(state.currentSession.focusSeconds + elapsedSec);
    state.currentSession.updatedAt = nowMs;

    if (state.activeDomain) {
      const prev = Number(state.currentSession.focusByDomain[state.activeDomain] || 0);
      state.currentSession.focusByDomain[state.activeDomain] = clampNonNegative(prev + elapsedSec);
    }
  }
}

function setContext(state, domain, isStudyContext, nowMs) {
  state.activeDomain = domain;
  state.lastContextMs = nowMs;
  state.isStudyContext = isStudyContext === true;
  state.lastStartMs = nowMs;
}

function queueUiMessage(tabId, payload) {
  if (!Number.isInteger(tabId)) return;
  const pending = pendingUiMessagesByTabId.get(tabId) || [];
  pending.push(payload);
  pendingUiMessagesByTabId.set(tabId, pending);
}

function scheduleUiRetry(tabId, attempt = 0) {
  if (!Number.isInteger(tabId) || attempt >= 8) return;
  if (pendingUiRetryTimersByTabId.has(tabId)) return;

  const timerId = setTimeout(() => {
    pendingUiRetryTimersByTabId.delete(tabId);
    flushPendingUiMessages(tabId, attempt + 1);
  }, 100);

  pendingUiRetryTimersByTabId.set(tabId, timerId);
}

function safeSendToTab(tabId, payload, options = {}) {
  if (!Number.isInteger(tabId)) return;

  chrome.tabs.sendMessage(tabId, payload, () => {
    if (chrome.runtime.lastError && options.queueOnFailure === true) {
      queueUiMessage(tabId, payload);
      scheduleUiRetry(tabId, options.attempt || 0);
    }
  });
}

function flushPendingUiMessages(tabId, attempt = 0) {
  if (!Number.isInteger(tabId)) return;
  const pending = pendingUiMessagesByTabId.get(tabId);
  if (!Array.isArray(pending) || pending.length === 0) return;

  pendingUiMessagesByTabId.delete(tabId);
  for (const payload of pending) {
    safeSendToTab(tabId, payload, { queueOnFailure: true, attempt });
  }
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

async function exportSessionJson(session, stoppedAtMs) {
  const safeSession = sanitizeCurrentSession(session);
  if (!safeSession) return;

  const payload = {
    schemaVersion: 1,
    sessionId: safeSession.sessionId,
    startedAt: new Date(safeSession.startedAt).toISOString(),
    stoppedAt: new Date(stoppedAtMs).toISOString(),
    focusSeconds: safeSession.focusSeconds,
    events: safeSession.events.map((event) => ({
      type: event.type,
      timestamp: new Date(event.timestamp).toISOString(),
      reason: event.reason
    })),
    focusByDomain: sanitizeFocusByDomain(safeSession.focusByDomain)
  };

  const encoded = `data:application/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(payload, null, 2)
  )}`;

  const fileTimestamp = new Date(stoppedAtMs).toISOString().replace(/[:.]/g, "-");
  const filename = `maintain-session-${fileTimestamp}.json`;

  try {
    await chrome.downloads.download({
      url: encoded,
      filename,
      saveAs: false
    });
  } catch {
    // Ignore export failures to avoid breaking timer state transitions.
  }
}

async function handleContextChange(tabId, nextDomain) {
  const nowMs = Date.now();
  const state = await getState();
  const previousDomain = state.activeDomain;
  const wasStudyContext = state.isStudyContext;

  applyWebsiteElapsed(state, nowMs);
  applyStudyElapsedIfNeeded(state, nowMs);

  const nextLabel = await resolveDomainClassification(state, nextDomain);
  const onStudy = nextLabel === CLASSIFICATION_LABELS.STUDY;
  const onDistracting = nextLabel === CLASSIFICATION_LABELS.OFF_TASK;

  setContext(state, nextDomain, onStudy, nowMs);

  if (onDistracting) {
    if (state.timerState === TIMER_STATES.RUNNING) {
      state.timerState = TIMER_STATES.PAUSED;
      state.pauseReason = PAUSE_REASONS.AUTO_DISTRACTION;
      appendSessionEvent(state, SESSION_EVENT_TYPES.PAUSE, nowMs, PAUSE_REASONS.AUTO_DISTRACTION);

      safeSendToTab(tabId, {
        type: "SHOW_TOAST",
        kind: "PAUSED",
        message: "Study timer paused (distracting site)."
      }, { queueOnFailure: true });
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
      appendSessionEvent(state, SESSION_EVENT_TYPES.RESUME, nowMs, PAUSE_REASONS.AUTO_DISTRACTION);

      safeSendToTab(tabId, {
        type: "SHOW_TOAST",
        kind: "RESUMED",
        message: "Resumed study timer."
      }, { queueOnFailure: true });
    } else if (enteredStudyContext && state.timerState === TIMER_STATES.STOPPED) {
      safeSendToTab(tabId, {
        type: "SHOW_START_MODAL",
        domain: nextDomain,
        mode: "start"
      }, { queueOnFailure: true });
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

  if (!state.activeDomain) {
    state.activeDomain = active.domain;
    const activeLabel = await resolveDomainClassification(state, active.domain);
    state.isStudyContext = activeLabel === CLASSIFICATION_LABELS.STUDY;
  }

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

  if (changeInfo.status === "loading") {
    flushPendingUiMessages(tabId);
  }

  if (changeInfo.status === "complete" && typeof tab.url === "string") {
    flushPendingUiMessages(tabId);

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
  const previousState = state.timerState;

  applyWebsiteElapsed(state, nowMs);
  applyStudyElapsedIfNeeded(state, nowMs);

  const activeLabel = await resolveDomainClassification(state, active.domain);
  setContext(state, active.domain, activeLabel === CLASSIFICATION_LABELS.STUDY, nowMs);

  state.timerState = TIMER_STATES.RUNNING;
  state.pauseReason = null;
  state.lastStartMs = nowMs;

  if (previousState === TIMER_STATES.STOPPED || !state.currentSession) {
    state.currentSession = createSession(nowMs);
    appendSessionEvent(state, SESSION_EVENT_TYPES.START, nowMs, PAUSE_REASONS.MANUAL);
  } else if (previousState === TIMER_STATES.PAUSED) {
    appendSessionEvent(state, SESSION_EVENT_TYPES.RESUME, nowMs, PAUSE_REASONS.MANUAL);
  }

  await saveState(state);
  return state;
}

async function manualPause() {
  const nowMs = Date.now();
  const state = await getState();
  const active = await getActiveTabInfo();

  applyWebsiteElapsed(state, nowMs);
  applyStudyElapsedIfNeeded(state, nowMs);

  const activeLabel = await resolveDomainClassification(state, active.domain);
  setContext(state, active.domain, activeLabel === CLASSIFICATION_LABELS.STUDY, nowMs);

  if (state.timerState === TIMER_STATES.RUNNING) {
    appendSessionEvent(state, SESSION_EVENT_TYPES.PAUSE, nowMs, PAUSE_REASONS.MANUAL);
  }

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

  const activeLabel = await resolveDomainClassification(state, active.domain);
  setContext(state, active.domain, activeLabel === CLASSIFICATION_LABELS.STUDY, nowMs);

  const hadSession = !!state.currentSession;
  if (hadSession) {
    appendSessionEvent(state, SESSION_EVENT_TYPES.STOP, nowMs, PAUSE_REASONS.MANUAL);
    await exportSessionJson(state.currentSession, nowMs);
  }

  state.timerState = TIMER_STATES.STOPPED;
  state.pauseReason = PAUSE_REASONS.MANUAL;
  state.lastStartMs = nowMs;

  // Reset current session counters on stop.
  state.totalStudySeconds = 0;
  state.websiteTotals = {};
  state.currentSession = null;

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
    websiteTotals: sanitizeWebsiteTotals(liveWebsiteTotals),
    domainClassificationCache: sanitizeDomainClassificationCache(state.domainClassificationCache)
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
  pendingUiMessagesByTabId.delete(tabId);
  const retryTimerId = pendingUiRetryTimersByTabId.get(tabId);
  if (retryTimerId) {
    clearTimeout(retryTimerId);
    pendingUiRetryTimersByTabId.delete(tabId);
  }
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

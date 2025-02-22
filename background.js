let totalSeconds = 0;
let isActive = true;
let hueShiftSpeed = 4; // Degrees per second
let colorTheme = "blue-red";

// Load settings AND timer state
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['totalSeconds'], (result) => {
    totalSeconds = result.totalSeconds || 0;
  });
  chrome.storage.sync.get(['speed', 'theme'], (result) => {
    hueShiftSpeed = result.speed || 4;
    colorTheme = result.theme || "blue-red";
  });
});

// Listen for setting changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.speed) hueShiftSpeed = changes.speed.newValue;
  if (changes.theme) colorTheme = changes.theme.newValue;
});

// Color logic for all themes
function getColorFromTime(seconds) {
  let hue;
  const maxHue = colorTheme === "blue-red" ? 240 : 120; // Blue or Green
  
  if (colorTheme === "blue-red") {
    hue = Math.max(maxHue - (seconds * hueShiftSpeed), 0);
  } else {
    hue = Math.min(120 + (seconds * hueShiftSpeed), 270); // Green → Purple
  }
  
  return `hsla(${hue}, 100%, 50%, 0.7)`;
}

// Reset on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ totalSeconds: 0 });
});

// Force updates on tab load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    const color = getColorFromTime(totalSeconds);
    chrome.tabs.sendMessage(tabId, { type: 'update', color, seconds: totalSeconds });
  }
});

// Timer logic
chrome.alarms.create('timer', { periodInMinutes: 1/60 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'timer' && isActive) {
    totalSeconds++;
    chrome.storage.local.set({ totalSeconds });
    
    const color = getColorFromTime(totalSeconds);
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id && tab.url?.startsWith("http")) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'update',
            color: color,
            seconds: totalSeconds
          }).catch(err => console.debug("Tab error:", tab.id, err.message));
        }
      });
    });
  }
});

// Activity detection
chrome.idle.onStateChanged.addListener((state) => {
  isActive = state !== "idle";
});
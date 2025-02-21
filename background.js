let totalSeconds = 0;
let isActive = true;

// Load saved time
chrome.storage.local.get(['totalSeconds'], (result) => {
  totalSeconds = result.totalSeconds || 0;
  console.log("[BACKGROUND] Initialized with:", totalSeconds, "seconds");
});

// Timer logic
chrome.alarms.create('timer', { delayInMinutes: 0, periodInMinutes: 1/60 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'timer' && isActive) {
    totalSeconds++;
    chrome.storage.local.set({ totalSeconds });
    console.log("[BACKGROUND] Timer updated:", totalSeconds);
  }
});

// Activity detection
chrome.idle.onStateChanged.addListener((state) => {
  isActive = state !== "idle";
  console.log("[BACKGROUND] Activity state:", state);
});

// Color calculation (Blue → Red)
function getColorFromTime(seconds) {
  const maxHue = 240; // Blue
  const hue = Math.max(maxHue - (seconds * 0.0666), 0); // 1-hour transition
  return `hsla(${hue}, 100%, 50%, 0.3)`; // Increased opacity
}

// Send updates to tabs
setInterval(() => {
  const color = getColorFromTime(totalSeconds);
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.url?.startsWith("http")) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'update',
          color: color,
          seconds: totalSeconds
        }).catch((err) => {
          console.debug("[BACKGROUND] Tab comms error:", err);
        });
      }
    });
  });
}, 1000);


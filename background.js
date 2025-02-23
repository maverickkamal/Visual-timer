let totalSeconds = 0;
let isActive = true;
let isEnabled = true;
let isPaused = false;
let targetSeconds = 7200; // Default 2 hours
let opacity = 70; // Default opacity
let colorStages = [
  { hue: 240, percent: 0 },    // Blue
  { hue: 120, percent: 33 },   // Green
  { hue: 270, percent: 66 },   // Purple
  { hue: 0, percent: 100 }     // Red
];

// Load settings AND timer state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ totalSeconds: 0 });
  chrome.storage.sync.set({ 
    enabled: true, 
    isPaused: false,
    targetTime: { hours: 2, minutes: 0 },
    opacity: 70
  });
});

chrome.runtime.onStartup.addListener(() => {
  loadState();
});

function loadState() {
  chrome.storage.local.get(['totalSeconds'], (result) => {
    totalSeconds = result.totalSeconds || 0;
    updateAllTabs(); // Update all tabs with current state
  });
  
  chrome.storage.sync.get(['enabled', 'isPaused', 'targetTime', 'opacity'], (result) => {
    isEnabled = result.enabled !== false;
    isPaused = result.isPaused || false;
    if (result.targetTime) {
      targetSeconds = (result.targetTime.hours * 3600) + (result.targetTime.minutes * 60);
    }
    opacity = result.opacity || 70;
    updateAllTabs(); // Update all tabs with current state
  });
}

// Listen for setting changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled !== undefined) {
    isEnabled = changes.enabled.newValue;
    if (!isEnabled) {
      isPaused = false;
      chrome.storage.sync.set({ isPaused: false });
    }
    updateAllTabs();
  }
  if (changes.isPaused !== undefined) {
    isPaused = changes.isPaused.newValue;
    updateAllTabs();
  }
  if (changes.targetTime) {
    const newTime = changes.targetTime.newValue;
    targetSeconds = (newTime.hours * 3600) + (newTime.minutes * 60);
    updateAllTabs();
  }
  if (changes.opacity !== undefined) {
    opacity = changes.opacity.newValue;
    updateAllTabs();
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'resetTimer':
      totalSeconds = 0;
      chrome.storage.local.set({ totalSeconds: 0 });
      updateAllTabs();
      break;
    case 'togglePause':
      isPaused = message.isPaused;
      updateAllTabs();
      break;
    case 'settingsUpdated':
      if (message.data?.enabled !== undefined) {
        isEnabled = message.data.enabled;
        if (!isEnabled) {
          isPaused = false;
          chrome.storage.sync.set({ isPaused: false });
        }
        updateAllTabs();
      }
      break;
    case 'timeSettingsUpdated':
      const newTime = message.targetTime;
      targetSeconds = (newTime.hours * 3600) + (newTime.minutes * 60);
      updateAllTabs();
      break;
    case 'opacityUpdated':
      opacity = message.opacity;
      updateAllTabs();
      break;
  }
  sendResponse({ success: true }); // Always send an immediate response
  return false; // Don't keep the message channel open
});

// Color logic
function getColorFromTime(seconds) {
  if (seconds >= targetSeconds) {
    return `hsl(0, 100%, 50%)`; // Red at target time
  }

  const progress = (seconds / targetSeconds) * 100;
  
  // Find the current color stage
  let startStage = colorStages[0];
  let endStage = colorStages[1];
  
  for (let i = 0; i < colorStages.length - 1; i++) {
    if (progress >= colorStages[i].percent && progress <= colorStages[i + 1].percent) {
      startStage = colorStages[i];
      endStage = colorStages[i + 1];
      break;
    }
  }
  
  // Calculate the hue between the two stages
  const stageProgress = (progress - startStage.percent) / (endStage.percent - startStage.percent);
  const hue = startStage.hue + (endStage.hue - startStage.hue) * stageProgress;
  
  return `hsl(${hue}, 100%, 50%)`; // Remove opacity from color
}

// Force updates on tab load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.startsWith("http")) {
    updateTab(tabId);
  }
});

// Timer logic
chrome.alarms.create('timer', { periodInMinutes: 1/60 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'timer' && isActive && isEnabled && !isPaused) {
    totalSeconds++;
    chrome.storage.local.set({ totalSeconds });
    updateAllTabs();
  }
});

// Activity detection
chrome.idle.onStateChanged.addListener((state) => {
  isActive = state !== "idle";
});

// Helper function to update all tabs
function updateAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id && tab.url?.startsWith("http")) {
        updateTab(tab.id);
      }
    });
  });
}

// Helper function to update a single tab
function updateTab(tabId) {
  const message = {
    type: 'update',
    color: getColorFromTime(totalSeconds),
    seconds: totalSeconds,
    enabled: isEnabled,
    opacity: opacity
  };
  
  try {
    chrome.tabs.sendMessage(tabId, message)
      .catch(() => {}); // Silently handle connection errors
  } catch (error) {
    console.debug("Tab update error:", tabId);
  }
}
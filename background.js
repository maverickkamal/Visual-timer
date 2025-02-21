// Track time spent (in seconds)
let totalSeconds = 0;
let isActive = true;

// Load saved time on startup
chrome.storage.local.get(['totalSeconds'], (result) => {
  totalSeconds = result.totalSeconds || 0;
});

// Update timer every second
const timer = setInterval(() => {
  if (isActive) {
    totalSeconds++;
    chrome.storage.local.set({ totalSeconds });
  }
}, 1000);

// Pause timer when browser is inactive
chrome.runtime.onSuspend.addListener(() => {
  isActive = false;
});
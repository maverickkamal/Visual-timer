let totalSeconds = 0;
const overlay = document.createElement('div');
overlay.id = 'visual-timer-overlay';
document.body.appendChild(overlay);

const timeDisplay = document.createElement('div');
timeDisplay.id = 'visual-timer-display';
document.body.appendChild(timeDisplay);

// Initialize from storage
chrome.storage.local.get(['totalSeconds'], (result) => {
  totalSeconds = result.totalSeconds || 0;
  updateDisplay();
});

// Message listener
// Update the message listener to avoid async response errors
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'update') {
    overlay.style.backgroundColor = message.color;
    totalSeconds = message.seconds;
    updateDisplay();
  }
  return false; // Explicitly indicate no async response
});

function updateDisplay() {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  timeDisplay.textContent = `${minutes}m ${seconds}s`;
}

// Fix YouTube/LinkedIn overlay issues
if (window.location.hostname.includes('youtube.com')) {
  const style = document.createElement('style');
  style.textContent = `
    ytd-watch-flexy[theater] #player-theater-container,
    #player-container {
      z-index: 2147483646 !important;
    }
  `;
  document.head.appendChild(style);
}
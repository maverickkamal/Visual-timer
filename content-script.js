console.log("[CONTENT] Script injected into:", window.location.href);

// Create overlay and time display elements
const overlay = document.createElement('div');
overlay.id = 'visual-timer-overlay';
document.body.appendChild(overlay);

const timeDisplay = document.createElement('div');
timeDisplay.id = 'visual-timer-display';
document.body.appendChild(timeDisplay);

let totalSeconds = 0;
let isInitialized = false;

// Handle settings changes and updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'updateVisibility') {
    updateTimeDisplayVisibility(message.showTime);
    sendResponse({ success: true }); // Send immediate response
    return false; // Don't keep channel open
  } else if (message.type === 'update') {
    updateDisplay(message.color, message.seconds, message.enabled);
    sendResponse({ success: true }); // Send immediate response
    return false; // Don't keep channel open
  }
});

// Initialize visibility once DOM is fully loaded
function initializeVisibility() {
  if (!isInitialized) {
    chrome.storage.sync.get(['enabled', 'showTime', 'opacity'], (result) => {
      const enabled = result.enabled !== false;
      const showTime = result.showTime !== false;
      const opacity = result.opacity || 70;
      updateOverlayVisibility(enabled);
      updateTimeDisplayVisibility(showTime && enabled);
      overlay.style.opacity = opacity / 100;
      isInitialized = true;
    });
  }
}

// Initialize as soon as possible
initializeVisibility();
// Also try again when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeVisibility);

function updateTimeDisplayVisibility(show) {
  if (timeDisplay) {
    timeDisplay.style.display = show ? 'block' : 'none';
  }
}

function updateOverlayVisibility(show) {
  if (overlay) {
    overlay.style.display = show ? 'block' : 'none';
  }
}

// Initialize from storage and handle updates
function updateDisplay(color, seconds, enabled) {
  if (!overlay || !timeDisplay) return;

  updateOverlayVisibility(enabled);
  
  if (!enabled) {
    updateTimeDisplayVisibility(false);
  } else {
    chrome.storage.sync.get(['showTime', 'opacity'], (result) => {
      updateTimeDisplayVisibility(result.showTime && enabled);
      // Set opacity directly on the overlay element
      overlay.style.opacity = (result.opacity || 70) / 100;
    });
  }
  
  if (color) {
    overlay.style.backgroundColor = color;
  }
  
  if (seconds !== undefined) {
    totalSeconds = seconds;
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    timeDisplay.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

// YouTube compatibility fix
if (window.location.hostname.includes('youtube.com')) {
  const style = document.createElement('style');
  style.textContent = `
    #player-container { 
      z-index: 2147483646 !important; 
    }
    #visual-timer-overlay {
      mix-blend-mode: screen !important;
    }
  `;
  document.head.appendChild(style);
}


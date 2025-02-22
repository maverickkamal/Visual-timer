console.log("[CONTENT] Script injected into:", window.location.href);

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

// Message listener with debug logs
// Add this after creating the overlay
let lastColor = '';
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'update') {
    // Force DOM update for color change
    if (message.color !== lastColor) {
      overlay.style.cssText = `background-color: ${message.color} !important;`;
      lastColor = message.color;
    }
    
    totalSeconds = message.seconds;
    updateDisplay();
  }
});

// Modify updateDisplay() for live feedback
function updateDisplay() {
  timeDisplay.textContent = `${Math.floor(totalSeconds/60)}m ${totalSeconds%60}s`;
  timeDisplay.style.color = `hsl(${240 - (totalSeconds * hueShiftSpeed)}, 100%, 70%)`;
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


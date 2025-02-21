// Create overlay element
const overlay = document.createElement('div');
overlay.id = 'visual-timer-overlay';
document.body.appendChild(overlay);

// Listen for time updates from background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'updateColor') {
    overlay.style.backgroundColor = message.color;
  }
});
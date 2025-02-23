// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Load saved settings after DOM is fully loaded
  chrome.storage.sync.get(['enabled', 'showTime', 'isPaused', 'targetTime', 'opacity'], (result) => {
    document.getElementById('toggleEnabled').checked = result.enabled !== false;
    document.getElementById('showTime').checked = result.showTime !== false;
    
    // Set time inputs
    const targetTime = result.targetTime || { hours: 2, minutes: 0 };
    document.getElementById('hoursInput').value = targetTime.hours;
    document.getElementById('minutesInput').value = targetTime.minutes;

    // Set opacity
    const opacity = result.opacity || 70;
    document.getElementById('opacityControl').value = opacity;
    document.getElementById('opacityValue').textContent = `${opacity}%`;
    
    updatePauseButtonText(result.isPaused || false);
    updatePauseButtonState(result.enabled !== false);
  });

  // Save settings
  document.getElementById('toggleEnabled').addEventListener('change', (e) => {
    const enabled = e.target.checked;
    chrome.storage.sync.set({ enabled }, () => {
      chrome.runtime.sendMessage({ 
        type: 'settingsUpdated',
        data: { enabled }
      });
      updatePauseButtonState(enabled);
      updateTabsVisibility();
    });
  });

  document.getElementById('showTime').addEventListener('change', (e) => {
    const showTime = e.target.checked;
    const enabled = document.getElementById('toggleEnabled').checked;
    chrome.storage.sync.set({ showTime }, () => {
      updateTabsVisibility();
    });
  });

  // Opacity control
  document.getElementById('opacityControl').addEventListener('input', (e) => {
    const opacity = parseInt(e.target.value);
    document.getElementById('opacityValue').textContent = `${opacity}%`;
    chrome.storage.sync.set({ opacity }, () => {
      chrome.runtime.sendMessage({ 
        type: 'opacityUpdated',
        opacity: opacity
      });
    });
  });

  // Time input controls
  document.getElementById('hoursInput').addEventListener('change', updateTargetTime);
  document.getElementById('minutesInput').addEventListener('change', updateTargetTime);

  // Timer controls
  document.getElementById('resetTimer').addEventListener('click', () => {
    chrome.storage.local.set({ totalSeconds: 0 }, () => {
      chrome.runtime.sendMessage({ type: 'resetTimer' });
    });
  });

  document.getElementById('pauseTimer').addEventListener('click', () => {
    chrome.storage.sync.get(['isPaused'], (result) => {
      const newPausedState = !result.isPaused;
      chrome.storage.sync.set({ isPaused: newPausedState }, () => {
        chrome.runtime.sendMessage({ 
          type: 'togglePause', 
          isPaused: newPausedState 
        });
        updatePauseButtonText(newPausedState);
      });
    });
  });
});

// Helper function to safely update tab visibility
function updateTabsVisibility() {
  const enabled = document.getElementById('toggleEnabled').checked;
  const showTime = document.getElementById('showTime').checked;
  
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.url?.startsWith("http")) {
        try {
          chrome.tabs.sendMessage(tab.id, {
            type: 'updateVisibility',
            showTime: showTime && enabled
          }).catch(() => {}); // Silently handle rejected promises
        } catch (error) {
          console.debug('Tab not ready:', tab.id);
        }
      }
    });
  });
}

// Time input controls
function updateTargetTime() {
  const hours = parseInt(document.getElementById('hoursInput').value) || 0;
  const minutes = parseInt(document.getElementById('minutesInput').value) || 0;
  const targetTime = { hours, minutes };
  
  chrome.storage.sync.set({ targetTime }, () => {
    chrome.runtime.sendMessage({ 
      type: 'timeSettingsUpdated',
      targetTime
    });
  });
}

// Helper functions
function updatePauseButtonText(isPaused) {
  const pauseButton = document.getElementById('pauseTimer');
  if (pauseButton) {
    pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    pauseButton.classList.toggle('btn-primary', isPaused);
    pauseButton.classList.toggle('btn-secondary', !isPaused);
  }
}

function updatePauseButtonState(enabled) {
  const pauseButton = document.getElementById('pauseTimer');
  if (pauseButton) {
    pauseButton.disabled = !enabled;
    pauseButton.style.opacity = enabled ? '1' : '0.5';
  }
}
// Prevent multiple injections
if (window.hasOwnProperty('__visualTimerInjected')) {
  console.debug("[CONTENT] Script already injected, skipping initialization");
} else {
  window.__visualTimerInjected = true;

  console.log("[CONTENT] Script injected into:", window.location.href);

  let overlay = null;
  let timeDisplay = null;
  let totalSeconds = 0;
  let isInitialized = false;
  let isEnabled = false;

  // Function to safely create and append elements
  function createElements() {
    if (!document.body) {
      console.debug("[CONTENT] Document body not ready, will retry");
      return false;
    }

    try {
      // Only create elements if they don't exist and previous ones aren't in the DOM
      const existingOverlay = document.getElementById('visual-timer-overlay');
      const existingDisplay = document.getElementById('visual-timer-display');

      if (existingOverlay) {
        overlay = existingOverlay;
      } else if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'visual-timer-overlay';
        overlay.style.display = 'none';
        overlay.style.opacity = '0';
        document.body.appendChild(overlay);
      }

      if (existingDisplay) {
        timeDisplay = existingDisplay;
      } else if (!timeDisplay) {
        timeDisplay = document.createElement('div');
        timeDisplay.id = 'visual-timer-display';
        timeDisplay.style.display = 'none';
        timeDisplay.style.opacity = '0';
        document.body.appendChild(timeDisplay);
      }

      return true;
    } catch (error) {
      console.debug("[CONTENT] Error creating elements:", error);
      return false;
    }
  }

  // Attempt to create elements at different stages
  function initializeElements() {
    if (!createElements()) {
      // If creation fails, try again when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          if (!createElements()) {
            // If it still fails, try one last time after a short delay
            setTimeout(createElements, 500);
          }
        });
      } else {
        // If DOM is already ready, try again after a short delay
        setTimeout(createElements, 500);
      }
    }
  }

  // Initialize elements as soon as possible
  initializeElements();

  // Check enabled state and set up initial state once elements are created
  function initializeState() {
    if (!overlay || !timeDisplay) return;

    chrome.storage.sync.get(['enabled', 'showTime'], (result) => {
      isEnabled = result.enabled !== false;
      const showTime = result.showTime !== false;
      
      if (!isEnabled) {
        ensureDisabled();
      } else {
        updateOverlayVisibility(true);
        updateTimeDisplayVisibility(showTime);
      }
    });
  }

  // Handle settings changes and updates
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ping') {
      sendResponse({ success: true });
      return false;
    }

    // Ensure elements exist before handling messages
    if (!overlay || !timeDisplay) {
      if (createElements()) {
        initializeState();
      }
    }

    try {
      switch (message.type) {
        case 'forceDisable':
          ensureDisabled();
          break;
        case 'updateVisibility':
          if (!isEnabled) {
            ensureDisabled();
          } else {
            updateTimeDisplayVisibility(message.showTime);
          }
          break;
        case 'update':
          isEnabled = message.enabled;
          if (!isEnabled) {
            ensureDisabled();
          } else {
            updateDisplay(message.color, message.seconds, message.enabled, message.opacity);
          }
          break;
      }
      sendResponse({ success: true });
    } catch (error) {
      console.error("[CONTENT] Error handling message:", error);
      sendResponse({ success: false, error: error.message });
    }
    return false;
  });

  function ensureDisabled() {
    if (overlay) {
      overlay.style.visibility = 'hidden';
      overlay.style.opacity = '0';
      requestAnimationFrame(() => {
        overlay.style.display = 'none';
      });
    }
    if (timeDisplay) {
      timeDisplay.style.visibility = 'hidden';
      timeDisplay.style.opacity = '0';
      requestAnimationFrame(() => {
        timeDisplay.style.display = 'none';
      });
    }
  }

  function updateTimeDisplayVisibility(show) {
    if (!timeDisplay || !isEnabled) return;
    
    if (!show) {
      timeDisplay.style.visibility = 'hidden';
      timeDisplay.style.opacity = '0';
      requestAnimationFrame(() => {
        timeDisplay.style.display = 'none';
      });
    } else {
      timeDisplay.style.display = 'block';
      requestAnimationFrame(() => {
        timeDisplay.style.visibility = 'visible';
        timeDisplay.style.opacity = '1';
      });
    }
  }

  function updateOverlayVisibility(show) {
    if (!overlay) return;
    
    if (!show) {
      overlay.style.visibility = 'hidden';
      overlay.style.opacity = '0';
      requestAnimationFrame(() => {
        overlay.style.display = 'none';
      });
    } else {
      overlay.style.display = 'block';
      requestAnimationFrame(() => {
        overlay.style.visibility = 'visible';
      });
    }
  }

  function updateDisplay(color, seconds, enabled, overlayOpacity) {
    if (!overlay || !timeDisplay) return;

    if (!enabled) {
      ensureDisabled();
      return;
    }

    updateOverlayVisibility(enabled);
    
    chrome.storage.sync.get(['showTime'], (result) => {
      updateTimeDisplayVisibility(result.showTime && enabled);
      if (overlay) {
        overlay.style.backgroundColor = color;
        overlay.style.opacity = overlayOpacity / 100;
      }
    });
    
    if (seconds !== undefined && timeDisplay) {
      totalSeconds = seconds;
      const minutes = Math.floor(totalSeconds / 60);
      const remainingSeconds = totalSeconds % 60;
      timeDisplay.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }

  // Re-verify elements and state periodically
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      if (!overlay || !timeDisplay) {
        if (createElements()) {
          initializeState();
        }
      } else {
        chrome.storage.sync.get(['enabled'], (result) => {
          const shouldBeEnabled = result.enabled !== false;
          if (shouldBeEnabled !== isEnabled) {
            isEnabled = shouldBeEnabled;
            if (!isEnabled) {
              ensureDisabled();
            }
          }
        });
      }
    }
  }, 5000);

  // Handle visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (!overlay || !timeDisplay) {
        if (createElements()) {
          initializeState();
        }
      }
      chrome.storage.sync.get(['enabled'], (result) => {
        isEnabled = result.enabled !== false;
        if (!isEnabled) {
          ensureDisabled();
        }
      });
    }
  });

  // YouTube compatibility fix - only if we're on YouTube
  if (window.location.hostname.includes('youtube.com')) {
    const addYouTubeStyle = () => {
      try {
        if (document.head) {
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
        } else {
          setTimeout(addYouTubeStyle, 100);
        }
      } catch (error) {
        console.debug("[CONTENT] Error adding YouTube style:", error);
      }
    };
    addYouTubeStyle();
  }

  // Make sure we clean up on unload
  window.addEventListener('unload', () => {
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    if (timeDisplay && timeDisplay.parentNode) {
      timeDisplay.parentNode.removeChild(timeDisplay);
    }
  });
}


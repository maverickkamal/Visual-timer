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
  let targetOpacity = 0.7; // Default target opacity
  let targetSeconds = 7200; // Default to 2 hours

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
        // If timer is disabled, hide both overlay and time display
        hideOverlay();
        hideTimeDisplay();
      } else {
        updateOverlayVisibility(true);
        // Only show time display if both timer is enabled AND showTime is true
        updateTimeDisplayVisibility(showTime);
        
        // Get current timer value
        chrome.runtime.sendMessage({ type: 'getState' }, (response) => {
          if (response && response.totalSeconds !== undefined) {
            updateTimeDisplay(response.totalSeconds);
          }
        });
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
          hideOverlay();
          hideTimeDisplay(); // Always hide time display when force disabled
          isEnabled = false;
          break;
        case 'updateVisibility':
          if (!isEnabled) {
            hideOverlay();
            hideTimeDisplay(); // Always hide time display when timer is disabled
          } else {
            // Only update time display visibility if timer is enabled
            updateTimeDisplayVisibility(message.showTime);
            
            // Request current time
            chrome.runtime.sendMessage({ type: 'getState' }, (response) => {
              if (response && response.totalSeconds !== undefined) {
                updateTimeDisplay(response.totalSeconds);
              }
            });
          }
          break;
        case 'update':
          isEnabled = message.enabled;
          if (message.targetSeconds) {
            targetSeconds = message.targetSeconds;
          }
          
          if (!isEnabled) {
            hideOverlay();
            hideTimeDisplay(); // Hide time display when timer is disabled
          } else {
            updateDisplay(message.color, message.seconds, message.enabled, message.opacity);
            
            // Update time display if timer is enabled
            if (message.seconds !== undefined && timeDisplay) {
              updateTimeDisplay(message.seconds);
            }
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

  // Function to only hide the overlay, not the time display
  function hideOverlay() {
    if (overlay) {
      overlay.style.visibility = 'hidden';
      overlay.style.opacity = '0';
      requestAnimationFrame(() => {
        overlay.style.display = 'none';
      });
    }
  }
  
  // New function to explicitly hide the time display
  function hideTimeDisplay() {
    if (timeDisplay) {
      timeDisplay.style.visibility = 'hidden';
      timeDisplay.style.opacity = '0';
      requestAnimationFrame(() => {
        timeDisplay.style.display = 'none';
      });
    }
  }

  // Function to ensure disabled state - hides both overlay and time display
  function ensureDisabled() {
    hideOverlay();
    hideTimeDisplay();
  }

  function updateTimeDisplayVisibility(show) {
    if (!timeDisplay) return;
    
    // Only show time display if extension is enabled AND showTime is true
    if (!show || !isEnabled) {
      hideTimeDisplay();
    } else {
      timeDisplay.style.display = 'block';
      requestAnimationFrame(() => {
        timeDisplay.style.visibility = 'visible';
        timeDisplay.style.opacity = '1';
      });
    }
  }

  function updateTimeDisplay(seconds) {
    if (!timeDisplay) return;
    
    totalSeconds = seconds;
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    timeDisplay.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

    // Update time display only if timer is enabled
    if (seconds !== undefined && enabled) {
      updateTimeDisplay(seconds);
    }

    if (!enabled) {
      hideOverlay();
      hideTimeDisplay(); // Hide time display when disabled
      return;
    }

    updateOverlayVisibility(enabled);
    
    chrome.storage.sync.get(['showTime'], (result) => {
      // Only show time display if both timer is enabled AND showTime is true
      updateTimeDisplayVisibility(result.showTime !== false);
      
      if (overlay) {
        overlay.style.backgroundColor = color;
        
        // Calculate a reduced opacity for early stages
        const progress = seconds / targetSeconds;
        const startOpacity = 0.05; // Start with just 5% of the target opacity
        const currentOpacity = startOpacity + (progress * (overlayOpacity / 100 - startOpacity));
        
        // Clamp the opacity between the start value and the target
        const finalOpacity = Math.min(overlayOpacity / 100, Math.max(startOpacity, currentOpacity));
        
        // Store target opacity for future calculations
        targetOpacity = overlayOpacity / 100;
        
        overlay.style.opacity = finalOpacity;
      }
    });
  }

  // Re-verify elements and state periodically
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      if (!overlay || !timeDisplay) {
        if (createElements()) {
          initializeState();
        }
      } else {
        // Always check timer enabled state and time display visibility
        chrome.storage.sync.get(['enabled', 'showTime'], (result) => {
          const shouldBeEnabled = result.enabled !== false;
          const shouldShowTime = result.showTime !== false;
          
          // If timer is disabled, always hide both overlay and time display
          if (!shouldBeEnabled) {
            if (isEnabled !== shouldBeEnabled) {
              isEnabled = shouldBeEnabled;
              hideOverlay();
              hideTimeDisplay(); // Hide time display when disabled
            }
          } else {
            isEnabled = shouldBeEnabled;
            // Only update time display visibility if timer is enabled
            updateTimeDisplayVisibility(shouldShowTime);
            
            // Request current time from background if timer is enabled
            chrome.runtime.sendMessage({ type: 'getState' }, (response) => {
              if (response && response.totalSeconds !== undefined && isEnabled) {
                updateTimeDisplay(response.totalSeconds);
              }
            });
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
      chrome.storage.sync.get(['enabled', 'showTime'], (result) => {
        isEnabled = result.enabled !== false;
        const shouldShowTime = result.showTime !== false;
        
        if (!isEnabled) {
          hideOverlay();
          hideTimeDisplay(); // Hide time display when disabled
        } else {
          // Only update time display visibility if timer is enabled
          updateTimeDisplayVisibility(shouldShowTime);
          
          // Request current timer value from background
          chrome.runtime.sendMessage({ type: 'getState' }, (response) => {
            if (response && response.totalSeconds !== undefined) {
              updateTimeDisplay(response.totalSeconds);
            }
          });
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

  // Use safer cleanup method (pagehide instead of unload)
  try {
    window.addEventListener('pagehide', cleanupElements);
    // Fallback cleanup with beforeunload (more widely supported)
    window.addEventListener('beforeunload', cleanupElements);
  } catch (error) {
    console.debug("[CONTENT] Error adding cleanup listeners:", error);
  }
  
  function cleanupElements() {
    try {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      if (timeDisplay && timeDisplay.parentNode) {
        timeDisplay.parentNode.removeChild(timeDisplay);
      }
    } catch (error) {
      console.debug("[CONTENT] Error during cleanup:", error);
    }
  }
}


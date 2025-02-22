document.getElementById("save").addEventListener("click", () => {
    const speed = document.getElementById("speed").value;
    const theme = document.getElementById("theme").value;
    
    chrome.storage.sync.set({ speed, theme }, () => {
      chrome.runtime.sendMessage({ type: 'reload' }); // Notify background
      window.close();
    });
  });
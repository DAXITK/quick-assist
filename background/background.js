// Background service worker

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.local.set({
      autoTrack: true,
      confirmFill: false,
      highlightFilled: true
    });
    
    console.log('Quick Assist extension installed successfully!');
  }
});

// Badge to show extension is active
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if page has forms
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => document.querySelectorAll('form').length > 0
    }).then((results) => {
      if (results && results[0]?.result) {
        chrome.action.setBadgeText({ text: '✓', tabId: tabId });
        chrome.action.setBadgeBackgroundColor({ color: '#34a853', tabId: tabId });
      } else {
        chrome.action.setBadgeText({ text: '', tabId: tabId });
      }
    }).catch(() => {});
  }
});

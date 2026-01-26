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

// Helper function to inject content scripts if not already present
async function ensureContentScriptLoaded(tabId) {
  try {
    // Try to ping the content script
    await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    return true;
  } catch (error) {
    // Content script not loaded, inject it
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['utils/fieldMatcher.js', 'content/contentScript.js']
      });
      
      // Wait a bit for scripts to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    } catch (injectionError) {
      console.error('Failed to inject content script:', injectionError);
      return false;
    }
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ensureContentScript') {
    ensureContentScriptLoaded(request.tabId)
      .then(success => sendResponse({ success }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
});

// Badge to show extension is active
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Skip chrome:// and extension pages
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      return;
    }
    
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
    }).catch(() => {
      // Silently fail for pages where we can't execute scripts
    });
  }
});

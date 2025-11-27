// Admin Panel Background Script

// Handle when clicking on extension icon
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('index.html')
  });
});

console.log('Admin Panel Extension loaded');

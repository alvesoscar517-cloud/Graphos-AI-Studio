// Admin Panel Background Script

// Xử lý khi click vào icon extension
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('index.html')
  });
});

console.log('Admin Panel Extension loaded');

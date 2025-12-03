// Handle when clicking on extension icon - ensure only one window is open
chrome.action.onClicked.addListener(async (tab) => {
  const extensionUrl = chrome.runtime.getURL('index.html');
  
  // Find existing extension tab
  const tabs = await chrome.tabs.query({});
  const existingTab = tabs.find(t => t.url && t.url.startsWith(extensionUrl.split('?')[0]));
  
  if (existingTab) {
    // Focus existing tab instead of creating new one
    await chrome.tabs.update(existingTab.id, { active: true });
    // Also focus the window containing the tab
    await chrome.windows.update(existingTab.windowId, { focused: true });
  } else {
    // Create new tab only if no existing tab found
    chrome.tabs.create({ url: extensionUrl });
  }
});

// Handle when extension is installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[SUCCESS] Extension installed');
  } else if (details.reason === 'update') {
    console.log('[SUCCESS] Extension updated');
  }
});

// Handle URL with share parameter
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  const url = new URL(details.url);
  const shareId = url.searchParams.get('share');
  
  if (shareId && details.frameId === 0) {
    // Redirect to extension with share parameter
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL(`index.html?share=${shareId}`)
    });
  }
});

// Check authentication status
async function checkAuthStatus() {
  const result = await chrome.storage.local.get(['userInfo', 'accessToken']);
  return result.userInfo && result.accessToken;
}

// Handle Google sign in
async function signInWithGoogle() {
  try {
    console.log('[SECURE] Starting Google sign in...');
    
    // Clear any old cached token first
    try {
      const oldTokenResult = await chrome.identity.getAuthToken({ interactive: false });
      const oldToken = typeof oldTokenResult === 'string' ? oldTokenResult : oldTokenResult?.token;
      if (oldToken && typeof oldToken === 'string') {
        await chrome.identity.removeCachedAuthToken({ token: oldToken });
        console.log('[TRASH] Removed old token');
      }
    } catch (e) {
      // Ignore errors, just continue
      console.log('[INFO] No old token to remove');
    }
    
    // Get fresh auth token
    const tokenResult = await chrome.identity.getAuthToken({ interactive: true });
    
    // Extract token string from result
    const token = typeof tokenResult === 'string' ? tokenResult : tokenResult?.token;
    
    if (!token || typeof token !== 'string') {
      console.error('[FAIL] No valid token received:', tokenResult);
      return { success: false, error: 'No valid token received' };
    }
    
    console.log('[SUCCESS] Got auth token');
    
    // Get user information words Google API
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      // If 401, token is invalid - try one more time
      if (response.status === 401) {
        console.log('[SYNC] Token invalid, getting fresh token...');
        
        // Remove the invalid token - ensure it's a string
        if (token && typeof token === 'string') {
          await chrome.identity.removeCachedAuthToken({ token: token });
        }
        
        const newTokenResult = await chrome.identity.getAuthToken({ interactive: true });
        
        // Extract token string from result
        const newToken = typeof newTokenResult === 'string' ? newTokenResult : newTokenResult?.token;
        
        if (!newToken || typeof newToken !== 'string') {
          console.error('[FAIL] Failed to get valid token on retry:', newTokenResult);
          throw new Error('Failed to get valid token on retry');
        }
        
        const retryResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${newToken}`
          }
        });
        
        if (!retryResponse.ok) {
          throw new Error(`Failed to fetch user info: ${retryResponse.status}`);
        }
        
        const userInfo = await retryResponse.json();
        const userData = {
          email: userInfo.email,
          name: userInfo.name || 'User',
          picture: userInfo.picture || ''
        };
        
        await chrome.storage.local.set({
          userInfo: userData,
          accessToken: newToken
        });
        
        console.log('[SUCCESS] Saved to storage (retry):', userData);
        
        return { 
          success: true, 
          userInfo: userData
        };
      }
      
      throw new Error(`Failed to fetch user info: ${response.status}`);
    }
    
    const userInfo = await response.json();
    console.log('[USER] User info from Google:', userInfo);
    
    // Validate user info
    if (!userInfo || !userInfo.email) {
      throw new Error('Invalid user info: missing email');
    }
    
    // Prepare data to save
    const userData = {
      email: userInfo.email,
      name: userInfo.name || 'User',
      picture: userInfo.picture || ''
    };
    
    // Save user information
    await chrome.storage.local.set({
      userInfo: userData,
      accessToken: token
    });
    
    console.log('[SUCCESS] Saved to storage:', userData);
    
    return { 
      success: true, 
      userInfo: userData
    };
  } catch (error) {
    console.error('[FAIL] Sign in error:', error);
    return { success: false, error: error.message };
  }
}

// Handle sign out (only clear storage, keep token cache)
async function signOut() {
  try {
    console.log('[DOOR] Starting sign out...');
    
    // Clear storage only, keep token cached for quick re-login
    await chrome.storage.local.remove(['userInfo', 'accessToken']);
    console.log('[SUCCESS] Sign out complete');
    
    return { success: true };
  } catch (error) {
    console.error('[FAIL] Sign out error:', error);
    return { success: false, error: error.message };
  }
}

// Handle account switching (completely remove token and revoke)
async function switchAccount() {
  try {
    console.log('[SYNC] Starting account switch...');
    
    const result = await chrome.storage.local.get(['accessToken']);
    
    // Remove cached token completely
    if (result.accessToken && typeof result.accessToken === 'string') {
      try {
        await chrome.identity.removeCachedAuthToken({ 
          token: result.accessToken 
        });
        console.log('[SUCCESS] Token removed from cache');
      } catch (tokenError) {
        console.warn('[WARNING] Could not remove token:', tokenError);
      }
      
      // Revoke token from Google
      try {
        await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${result.accessToken}`);
        console.log('[SUCCESS] Token revoked from Google');
      } catch (revokeError) {
        console.warn('[WARNING] Could not revoke token:', revokeError);
      }
    }
    
    // Clear all cached tokens (force account picker)
    try {
      const allTokens = await chrome.identity.getAuthToken({ interactive: false });
      const tokenStr = typeof allTokens === 'string' ? allTokens : allTokens?.token;
      if (tokenStr) {
        await chrome.identity.removeCachedAuthToken({ token: tokenStr });
        console.log('[SUCCESS] All cached tokens cleared');
      }
    } catch (e) {
      console.log('[INFO] No additional tokens to clear');
    }
    
    // Clear storage
    await chrome.storage.local.remove(['userInfo', 'accessToken']);
    console.log('[SUCCESS] Account switch complete - will show account picker on next login');
    
    return { success: true };
  } catch (error) {
    console.error('[FAIL] Account switch error:', error);
    return { success: false, error: error.message };
  }
}

// Listen for messages words content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkAuth') {
    checkAuthStatus().then(sendResponse);
    return true;
  }
  
  if (request.action === 'signIn') {
    signInWithGoogle().then(sendResponse);
    return true;
  }
  
  if (request.action === 'signOut') {
    signOut().then(sendResponse);
    return true;
  }
  
  if (request.action === 'switchAccount') {
    switchAccount().then(sendResponse);
    return true;
  }
  
  if (request.action === 'getUserInfo') {
    chrome.storage.local.get(['userInfo']).then(result => {
      sendResponse(result.userInfo || null);
    });
    return true;
  }
});

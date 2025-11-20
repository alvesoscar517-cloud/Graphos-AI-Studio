// Xử lý khi click vào icon extension
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('index.html')
  });
});

// Kiểm tra trạng thái đăng nhập
async function checkAuthStatus() {
  const result = await chrome.storage.local.get(['userInfo', 'accessToken']);
  return result.userInfo && result.accessToken;
}

// Xử lý đăng nhập Google
async function signInWithGoogle() {
  try {
    console.log('🔐 Starting Google sign in...');
    
    // Clear any old cached token first
    try {
      const oldTokenResult = await chrome.identity.getAuthToken({ interactive: false });
      const oldToken = typeof oldTokenResult === 'string' ? oldTokenResult : oldTokenResult?.token;
      if (oldToken && typeof oldToken === 'string') {
        await chrome.identity.removeCachedAuthToken({ token: oldToken });
        console.log('🗑️ Removed old token');
      }
    } catch (e) {
      // Ignore errors, just continue
      console.log('ℹ️ No old token to remove');
    }
    
    // Get fresh auth token
    const tokenResult = await chrome.identity.getAuthToken({ interactive: true });
    
    // Extract token string from result
    const token = typeof tokenResult === 'string' ? tokenResult : tokenResult?.token;
    
    if (!token || typeof token !== 'string') {
      console.error('❌ No valid token received:', tokenResult);
      return { success: false, error: 'No valid token received' };
    }
    
    console.log('✅ Got auth token');
    
    // Lấy thông tin người dùng từ Google API
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      // If 401, token is invalid - try one more time
      if (response.status === 401) {
        console.log('🔄 Token invalid, getting fresh token...');
        
        // Remove the invalid token - ensure it's a string
        if (token && typeof token === 'string') {
          await chrome.identity.removeCachedAuthToken({ token: token });
        }
        
        const newTokenResult = await chrome.identity.getAuthToken({ interactive: true });
        
        // Extract token string from result
        const newToken = typeof newTokenResult === 'string' ? newTokenResult : newTokenResult?.token;
        
        if (!newToken || typeof newToken !== 'string') {
          console.error('❌ Failed to get valid token on retry:', newTokenResult);
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
          name: userInfo.name || 'Người dùng',
          picture: userInfo.picture || ''
        };
        
        await chrome.storage.local.set({
          userInfo: userData,
          accessToken: newToken
        });
        
        console.log('✅ Saved to storage (retry):', userData);
        
        return { 
          success: true, 
          userInfo: userData
        };
      }
      
      throw new Error(`Failed to fetch user info: ${response.status}`);
    }
    
    const userInfo = await response.json();
    console.log('👤 User info from Google:', userInfo);
    
    // Validate user info
    if (!userInfo || !userInfo.email) {
      throw new Error('Invalid user info: missing email');
    }
    
    // Prepare data to save
    const userData = {
      email: userInfo.email,
      name: userInfo.name || 'Người dùng',
      picture: userInfo.picture || ''
    };
    
    // Lưu thông tin người dùng
    await chrome.storage.local.set({
      userInfo: userData,
      accessToken: token
    });
    
    console.log('✅ Saved to storage:', userData);
    
    return { 
      success: true, 
      userInfo: userData
    };
  } catch (error) {
    console.error('❌ Sign in error:', error);
    return { success: false, error: error.message };
  }
}

// Xử lý đăng xuất (chỉ xóa storage, giữ token cache)
async function signOut() {
  try {
    console.log('🚪 Starting sign out...');
    
    // Clear storage only, keep token cached for quick re-login
    await chrome.storage.local.remove(['userInfo', 'accessToken']);
    console.log('✅ Sign out complete');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Sign out error:', error);
    return { success: false, error: error.message };
  }
}

// Xử lý chuyển tài khoản (xóa hoàn toàn token và revoke)
async function switchAccount() {
  try {
    console.log('🔄 Starting account switch...');
    
    const result = await chrome.storage.local.get(['accessToken']);
    
    // Remove cached token completely
    if (result.accessToken && typeof result.accessToken === 'string') {
      try {
        await chrome.identity.removeCachedAuthToken({ 
          token: result.accessToken 
        });
        console.log('✅ Token removed from cache');
      } catch (tokenError) {
        console.warn('⚠️ Could not remove token:', tokenError);
      }
      
      // Revoke token from Google
      try {
        await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${result.accessToken}`);
        console.log('✅ Token revoked from Google');
      } catch (revokeError) {
        console.warn('⚠️ Could not revoke token:', revokeError);
      }
    }
    
    // Clear all cached tokens (force account picker)
    try {
      const allTokens = await chrome.identity.getAuthToken({ interactive: false });
      const tokenStr = typeof allTokens === 'string' ? allTokens : allTokens?.token;
      if (tokenStr) {
        await chrome.identity.removeCachedAuthToken({ token: tokenStr });
        console.log('✅ All cached tokens cleared');
      }
    } catch (e) {
      console.log('ℹ️ No additional tokens to clear');
    }
    
    // Clear storage
    await chrome.storage.local.remove(['userInfo', 'accessToken']);
    console.log('✅ Account switch complete - will show account picker on next login');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Account switch error:', error);
    return { success: false, error: error.message };
  }
}

// Lắng nghe message từ content script
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

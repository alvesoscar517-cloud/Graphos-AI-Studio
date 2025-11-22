/**
 * Development Configuration
 * Cấu hình cho môi trường development để tránh tạo profile mới mỗi lần test
 */

export const DEV_CONFIG = {
  // Bật chế độ development (sử dụng profile test mặc định)
  ENABLE_DEV_MODE: true,
  
  // Profile test mặc định (sẽ được tạo một lần và tái sử dụng)
  DEFAULT_TEST_PROFILE: {
    profile_id: 'dev_test_profile_001',
    profile_name: 'Test Profile (Dev)',
    theme: 'work',
    user_id: 'dev_test_user',
    status: 'active',
    sample_count: 5,
    created_at: new Date().toISOString()
  },
  
  // User test mặc định
  DEFAULT_TEST_USER: {
    userId: 'dev_test_user',
    email: 'dev@test.local',
    name: 'Dev Test User'
  },
  
  // Tự động chọn profile test khi khởi động
  AUTO_SELECT_TEST_PROFILE: true,
  
  // Skip profile setup trong dev mode
  SKIP_PROFILE_SETUP: false, // Set true nếu muốn skip hoàn toàn
  
  // Log chi tiết trong dev mode
  VERBOSE_LOGGING: true
}

/**
 * Kiểm tra xem có đang ở dev mode không
 */
export function isDevMode() {
  return import.meta.env.DEV && DEV_CONFIG.ENABLE_DEV_MODE
}

/**
 * Log trong dev mode
 */
export function devLog(...args) {
  if (isDevMode() && DEV_CONFIG.VERBOSE_LOGGING) {
    console.log('[DEV]', ...args)
  }
}

/**
 * Lấy profile test mặc định
 */
export function getDefaultTestProfile() {
  if (!isDevMode()) return null
  
  // Kiểm tra xem đã có profile test trong localStorage chưa
  const stored = localStorage.getItem('dev_test_profile')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.warn('Failed to parse stored test profile')
    }
  }
  
  return DEV_CONFIG.DEFAULT_TEST_PROFILE
}

/**
 * Lưu profile test vào localStorage
 */
export function saveTestProfile(profile) {
  if (!isDevMode()) return
  
  localStorage.setItem('dev_test_profile', JSON.stringify(profile))
  devLog('Saved test profile:', profile.profile_name)
}

/**
 * Xóa profile test
 */
export function clearTestProfile() {
  localStorage.removeItem('dev_test_profile')
  devLog('Cleared test profile')
}

/**
 * Lấy user test mặc định
 */
export function getDefaultTestUser() {
  if (!isDevMode()) return null
  return DEV_CONFIG.DEFAULT_TEST_USER
}

/**
 * Kiểm tra xem có nên sử dụng profile test không
 */
export function shouldUseTestProfile() {
  return isDevMode() && DEV_CONFIG.AUTO_SELECT_TEST_PROFILE
}

/**
 * Tạo hoặc lấy profile test
 */
export async function getOrCreateTestProfile() {
  if (!isDevMode()) return null
  
  // Kiểm tra localStorage trước
  const existing = getDefaultTestProfile()
  if (existing) {
    devLog('Using existing test profile:', existing.profile_name)
    return existing
  }
  
  // Nếu chưa có, tạo mới
  devLog('Creating new test profile...')
  const profile = DEV_CONFIG.DEFAULT_TEST_PROFILE
  saveTestProfile(profile)
  
  return profile
}

/**
 * Reset dev environment
 */
export function resetDevEnvironment() {
  if (!isDevMode()) return
  
  clearTestProfile()
  localStorage.removeItem('activeProfileId')
  localStorage.removeItem('activeProfileName')
  devLog('Dev environment reset')
}

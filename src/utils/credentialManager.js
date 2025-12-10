/**
 * Credential Management API Utility
 * Tích hợp với browser password manager (Chrome, Firefox, Safari, Edge)
 * Hoạt động với 1Password, Bitwarden, LastPass, etc.
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Credential_Management_API
 */

/* eslint-disable no-undef */
// @ts-nocheck - Credential Management API types not fully supported

import { logger } from './logger'

/**
 * Kiểm tra browser có hỗ trợ Credential Management API không
 * @returns {boolean}
 */
export function isCredentialAPISupported() {
  return typeof window !== 'undefined' && 
         'credentials' in navigator && 
         typeof window.PasswordCredential !== 'undefined'
}

/**
 * Lưu credentials vào browser password manager
 * Browser sẽ hiển thị popup "Save password?" 
 * 
 * @param {string} email - Email người dùng
 * @param {string} password - Mật khẩu
 * @param {string} name - Tên hiển thị (optional)
 */
export async function saveCredentials(email, password, name = '') {
  if (!isCredentialAPISupported()) {
    logger.credential('API not supported')
    return false
  }

  try {
    // @ts-ignore - PasswordCredential is a browser API
    const credential = new PasswordCredential({
      id: email,
      password: password,
      name: name || email.split('@')[0],
    })

    await navigator.credentials.store(credential)
    logger.credential('Credentials saved')
    return true
  } catch (error) {
    // User có thể từ chối lưu - không phải lỗi
    logger.credential('Save skipped:', error?.message || error)
    return false
  }
}

/**
 * Lấy credentials đã lưu từ browser
 * Tự động điền form nếu có credentials
 * 
 * @param {'silent' | 'optional' | 'required'} mediation
 *   - 'silent': Không hiện UI, chỉ lấy nếu có 1 credential
 *   - 'optional': Hiện account chooser nếu có nhiều
 *   - 'required': Luôn hiện account chooser
 */
export async function getStoredCredentials(mediation = 'optional') {
  if (!isCredentialAPISupported()) {
    return null
  }

  try {
    // @ts-ignore - mediation types
    const credential = await navigator.credentials.get({
      password: true,
      mediation,
    })

    if (credential && credential.type === 'password') {
      // @ts-ignore - PasswordCredential properties
      return {
        email: credential.id,
        password: credential.password,
        name: credential.name,
      }
    }
    
    return null
  } catch (error) {
    logger.credential('Get failed:', error?.message || error)
    return null
  }
}

/**
 * Ngăn browser tự động điền khi user đăng xuất
 * Gọi khi user sign out
 */
export async function preventAutoSignIn() {
  if (!isCredentialAPISupported()) {
    return
  }

  try {
    await navigator.credentials.preventSilentAccess()
    logger.credential('Silent access prevented')
  } catch (error) {
    logger.credential('Prevent silent access failed:', error.message)
  }
}

/**
 * Hook-friendly wrapper để sử dụng trong React components
 */
export const credentialManager = {
  isSupported: isCredentialAPISupported,
  save: saveCredentials,
  get: getStoredCredentials,
  preventAutoSignIn: preventAutoSignIn,
}

export default credentialManager

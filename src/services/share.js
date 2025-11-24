/**
 * Share Service
 * Handles sharing and retrieving shared content
 */

import { CONFIG } from '../utils/config'

/**
 * Create a shareable link
 */
export const createShare = async (type, title, content, messages, metadata = {}) => {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        title,
        content,
        messages,
        metadata
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create share')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Share creation error:', error)
    throw error
  }
}

/**
 * Get shared content by ID
 */
export const getShare = async (shareId) => {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/share/${shareId}`)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Share not found')
      }
      if (response.status === 410) {
        throw new Error('Share has expired')
      }
      throw new Error('Failed to retrieve share')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Share retrieval error:', error)
    throw error
  }
}

/**
 * Delete a share
 */
export const deleteShare = async (shareId) => {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/share/${shareId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Failed to delete share')
    }

    return true
  } catch (error) {
    console.error('Share deletion error:', error)
    throw error
  }
}

/**
 * Check if extension is installed
 */
export const isExtensionInstalled = () => {
  return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id
}

/**
 * Get Chrome Web Store URL
 */
export const getChromeWebStoreUrl = () => {
  // Replace with your actual extension ID
  const extensionId = chrome?.runtime?.id || 'your-extension-id'
  return `https://chromewebstore.google.com/detail/ai-content-authenticator/${extensionId}`
}

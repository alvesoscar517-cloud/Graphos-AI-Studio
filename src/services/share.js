/**
 * Share Service
 * Handles sharing and retrieving shared content
 */

import apiClient from './api/client'

/**
 * Create a shareable link
 */
export const createShare = async (type, title, content, messages, metadata = {}) => {
  try {
    const { data } = await apiClient.post('/api/share', {
      type,
      title,
      content,
      messages,
      metadata
    })
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
    const { data } = await apiClient.get(`/api/share/${shareId}`, {
      includeAuth: false // Public endpoint
    })
    return data
  } catch (error) {
    if (error.statusCode === 404) {
      throw new Error('Share not found')
    }
    if (error.statusCode === 410) {
      throw new Error('Share has expired')
    }
    console.error('Share retrieval error:', error)
    throw error
  }
}

/**
 * Delete a share
 */
export const deleteShare = async (shareId) => {
  try {
    await apiClient.delete(`/api/share/${shareId}`)
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

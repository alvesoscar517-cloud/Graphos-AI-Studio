/**
 * useCredentials Hook
 * Auto-fill login form từ browser password manager
 */

import { logger } from '@/utils/logger'
import { useEffect, useState } from 'react'
import { getStoredCredentials, isCredentialAPISupported } from '@/utils/credentialManager'

/**
 * Hook để lấy stored credentials và auto-fill form
 * @param {Function} setValue - react-hook-form setValue function
 * @param {boolean} autoFill - Có tự động điền không (default: true)
 */
export function useCredentials(setValue, autoFill = true) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasCredentials, setHasCredentials] = useState(false)

  useEffect(() => {
    if (!autoFill || !isCredentialAPISupported()) {
      return
    }

    const fetchCredentials = async () => {
      setIsLoading(true)
      try {
        // Dùng 'silent' để không hiện popup nếu chỉ có 1 account
        // @ts-ignore
        const credentials = await getStoredCredentials('silent')
        
        if (credentials) {
          setHasCredentials(true)
          
          // Auto-fill form nếu có setValue
          if (setValue) {
            setValue('email', credentials.email)
            // Không auto-fill password vì lý do bảo mật
            // User cần click vào field để browser điền
          }
        }
      } catch (error) {
        logger.log('[useCredentials] Error:', error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCredentials()
  }, [setValue, autoFill])

  return { isLoading, hasCredentials }
}

export default useCredentials

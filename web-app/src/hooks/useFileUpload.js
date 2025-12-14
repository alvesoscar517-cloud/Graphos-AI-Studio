/**
 * File Upload Hook
 * Handles file selection, validation, and upload
 */

import { useState, useCallback, useRef } from 'react'

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB
const DEFAULT_ACCEPTED_TYPES = ['image/*', 'application/pdf', '.txt', '.doc', '.docx']

/**
 * Custom hook for file upload handling
 * @param {Object} options - Configuration options
 */
export function useFileUpload(options = {}) {
  const {
    maxSize = DEFAULT_MAX_SIZE,
    acceptedTypes = DEFAULT_ACCEPTED_TYPES,
    multiple = false,
    onUpload,
    onError,
  } = options

  const [files, setFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const validateFile = useCallback((file) => {
    // Check file size
    if (file.size > maxSize) {
      return `File "${file.name}" exceeds maximum size of ${Math.round(maxSize / 1024 / 1024)}MB`
    }

    // Check file type
    const fileType = file.type
    const fileExt = '.' + file.name.split('.').pop().toLowerCase()
    
    const isAccepted = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.replace('/*', '/'))
      }
      if (type.startsWith('.')) {
        return fileExt === type.toLowerCase()
      }
      return fileType === type
    })

    if (!isAccepted) {
      return `File type "${fileType || fileExt}" is not accepted`
    }

    return null
  }, [maxSize, acceptedTypes])

  const handleFiles = useCallback(async (fileList) => {
    setError(null)
    const newFiles = Array.from(fileList)
    
    // Validate all files
    for (const file of newFiles) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        onError?.(new Error(validationError))
        return
      }
    }

    // Update state
    if (multiple) {
      setFiles(prev => [...prev, ...newFiles])
    } else {
      setFiles(newFiles.slice(0, 1))
    }

    // Auto upload if handler provided
    if (onUpload) {
      setIsUploading(true)
      setProgress(0)
      try {
        await onUpload(multiple ? newFiles : newFiles[0], setProgress)
      } catch (err) {
        setError(err.message)
        onError?.(err)
      } finally {
        setIsUploading(false)
      }
    }
  }, [multiple, validateFile, onUpload, onError])

  const openFilePicker = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const removeFile = useCallback((index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const clearFiles = useCallback(() => {
    setFiles([])
    setError(null)
    setProgress(0)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const droppedFiles = e.dataTransfer?.files
    if (droppedFiles?.length) {
      handleFiles(droppedFiles)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  // Input props for file input element
  const inputProps = {
    ref: inputRef,
    type: 'file',
    accept: acceptedTypes.join(','),
    multiple,
    onChange: (e) => {
      if (e.target.files?.length) {
        handleFiles(e.target.files)
      }
    },
    style: { display: 'none' },
  }

  // Drop zone props
  const dropZoneProps = {
    onDrop: handleDrop,
    onDragOver: handleDragOver,
    onDragEnter: handleDragOver,
  }

  return {
    files,
    isUploading,
    progress,
    error,
    inputProps,
    dropZoneProps,
    openFilePicker,
    removeFile,
    clearFiles,
    handleFiles,
  }
}

export default useFileUpload

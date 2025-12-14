/**
 * useSpeech Hook
 * Text-to-Speech using Web Speech API
 * Supports 15 languages with automatic voice selection
 */
import { useState, useCallback, useRef, useEffect } from 'react'

// Language code mapping for Web Speech API
const LANG_MAP = {
  en: 'en-US',
  vi: 'vi-VN',
  'zh-CN': 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  pt: 'pt-BR',
  it: 'it-IT',
  ru: 'ru-RU',
  ar: 'ar-SA',
  hi: 'hi-IN',
  th: 'th-TH',
  id: 'id-ID'
}

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState([])
  const utteranceRef = useRef(null)
  const synthRef = useRef(null)

  // Check if Web Speech API is supported
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  // Initialize synth and load voices
  useEffect(() => {
    if (!isSupported) return

    synthRef.current = window.speechSynthesis

    // Load voices - they may load async
    const loadVoices = () => {
      const availableVoices = synthRef.current.getVoices()
      if (availableVoices.length > 0) {
        setVoices(availableVoices)
      }
    }

    // Load immediately (may work on some browsers)
    loadVoices()

    // Also listen for voiceschanged event (Chrome loads async)
    synthRef.current.addEventListener('voiceschanged', loadVoices)

    return () => {
      synthRef.current?.removeEventListener('voiceschanged', loadVoices)
    }
  }, [isSupported])

  // Get best voice for language
  const getVoice = useCallback((lang) => {
    if (voices.length === 0) return null
    
    const targetLang = LANG_MAP[lang] || lang
    const langPrefix = lang.split('-')[0]
    
    // Priority 1: Exact match (e.g., vi-VN)
    let voice = voices.find(v => v.lang === targetLang)
    
    // Priority 2: Same language prefix (e.g., vi matches vi-VN)
    if (!voice) {
      voice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()))
    }
    
    // Priority 3: Any voice with the language code
    if (!voice) {
      voice = voices.find(v => v.lang.toLowerCase().includes(langPrefix.toLowerCase()))
    }
    
    return voice
  }, [voices])

  // Speak text
  const speak = useCallback((text, lang = 'en') => {
    if (!isSupported || !text || !synthRef.current) return

    // Cancel any ongoing speech
    synthRef.current.cancel()

    // Clean text (remove markdown, code blocks, etc.)
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
      .replace(/[#*_~]/g, '') // Remove markdown symbols
      .replace(/\n+/g, '. ') // Convert newlines to pauses
      .trim()

    if (!cleanText) return

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utteranceRef.current = utterance

    // IMPORTANT: Always set lang first - this is the key for correct pronunciation
    const targetLang = LANG_MAP[lang] || lang
    utterance.lang = targetLang

    // Try to find a matching voice
    const voice = getVoice(lang)
    if (voice) {
      utterance.voice = voice
    }

    // Settings
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Event handlers
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = (e) => {
      console.warn('Speech error:', e.error)
      setIsSpeaking(false)
    }

    // Chrome bug fix: resume if paused
    if (synthRef.current.paused) {
      synthRef.current.resume()
    }

    synthRef.current.speak(utterance)
  }, [isSupported, getVoice])

  // Stop speaking
  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }, [])

  // Pause speaking
  const pause = useCallback(() => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.pause()
    }
  }, [isSpeaking])

  // Resume speaking
  const resume = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.resume()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isSupported
  }
}

export default useSpeech

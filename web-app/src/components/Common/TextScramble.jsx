import { useEffect, useRef, useState, useCallback } from 'react'

const TextScramble = ({ children, className = '' }) => {
  const [displayText, setDisplayText] = useState('')
  const frameRef = useRef(0)
  const rafRef = useRef(null)
  const queueRef = useRef([])
  const resolveRef = useRef(null)
  const isMountedRef = useRef(true)
  const targetText = typeof children === 'string' ? children : ''

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  const randomChar = useCallback(() => {
    return chars[Math.floor(Math.random() * chars.length)]
  }, [])

  const update = useCallback(() => {
    if (!isMountedRef.current) return

    let output = ''
    let complete = 0

    for (let i = 0, n = queueRef.current.length; i < n; i++) {
      let { from, to, start, end, char } = queueRef.current[i]

      if (frameRef.current >= end) {
        complete++
        output += to
      } else if (frameRef.current >= start) {
        if (!char || Math.random() < 0.28) {
          char = randomChar()
          queueRef.current[i].char = char
        }
        output += `<span class="text-primary opacity-70 animate-pulse">${char}</span>`
      } else {
        output += from
      }
    }

    setDisplayText(output)

    if (complete === queueRef.current.length) {
      if (resolveRef.current) {
        resolveRef.current()
      }
    } else {
      frameRef.current++
      rafRef.current = requestAnimationFrame(update)
    }
  }, [randomChar])

  const setText = useCallback((newText) => {
    const oldText = displayText
    const length = Math.max(oldText.length, newText.length)
    const promise = new Promise((resolve) => {
      resolveRef.current = resolve
    })

    queueRef.current = []
    
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || ''
      const to = newText[i] || ''
      const start = i * 3
      const end = start + 15
      queueRef.current.push({ from, to, start, end })
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    frameRef.current = 0
    update()
    return promise
  }, [displayText, update])

  useEffect(() => {
    isMountedRef.current = true
    
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        setText(targetText)
      }
    }, 100)

    return () => {
      isMountedRef.current = false
      clearTimeout(timer)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [targetText])

  return (
    <span 
      className={`inline-block font-sans ${className}`}
      dangerouslySetInnerHTML={{ __html: displayText }}
    />
  )
}

export default TextScramble

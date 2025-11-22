import { useEffect, useRef, useState } from 'react'

const TextScramble = ({ children, className = '' }) => {
  const [displayText, setDisplayText] = useState('')
  const frameRef = useRef(0)
  const queueRef = useRef([])
  const resolveRef = useRef(null)
  const targetText = typeof children === 'string' ? children : ''

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  const randomChar = () => {
    return chars[Math.floor(Math.random() * chars.length)]
  }

  const setText = (newText) => {
    const oldText = displayText
    const length = Math.max(oldText.length, newText.length)
    const promise = new Promise((resolve) => {
      resolveRef.current = resolve
    })

    queueRef.current = []
    
    // Scramble from left to right
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || ''
      const to = newText[i] || ''
      const start = i * 3 // Each character starts 3 frames after the previous one
      const end = start + 15 // Scramble for 15 frames
      queueRef.current.push({ from, to, start, end })
    }

    cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
    update()
    return promise
  }

  const update = () => {
    let output = ''
    let complete = 0

    for (let i = 0, n = queueRef.current.length; i < n; i++) {
      let { from, to, start, end, char } = queueRef.current[i]

      if (frameRef.current >= end) {
        complete++
        output += to
      } else if (frameRef.current >= start) {
        // Scramble
        if (!char || Math.random() < 0.28) {
          char = randomChar()
          queueRef.current[i].char = char
        }
        output += `<span class="scramble-char">${char}</span>`
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
      requestAnimationFrame(update)
    }
  }

  useEffect(() => {
    // Start scramble effect after a short delay
    const timer = setTimeout(() => {
      setText(targetText)
    }, 100)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(frameRef.current)
    }
  }, [targetText])

  return (
    <span 
      className={className}
      dangerouslySetInnerHTML={{ __html: displayText }}
    />
  )
}

export default TextScramble

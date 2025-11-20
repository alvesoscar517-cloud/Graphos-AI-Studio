import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('system')

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'system'
    setTheme(savedTheme)
    applyTheme(savedTheme)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const applyTheme = (newTheme) => {
    document.body.classList.remove('dark-theme', 'light-theme')
    
    if (newTheme === 'dark') {
      document.body.classList.add('dark-theme')
    } else if (newTheme === 'light') {
      document.body.classList.add('light-theme')
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.body.classList.add(prefersDark ? 'dark-theme' : 'light-theme')
    }
  }

  const changeTheme = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  const value = {
    theme,
    changeTheme
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

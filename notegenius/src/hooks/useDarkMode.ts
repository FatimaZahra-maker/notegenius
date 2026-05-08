import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('notegenius_theme')
    return saved === 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('notegenius_theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('notegenius_theme', 'light')
    }
  }, [isDark])

  const toggle = () => setIsDark(prev => !prev)

  return { isDark, toggle }
}
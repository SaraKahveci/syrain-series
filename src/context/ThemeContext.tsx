import { createContext, useContext, useEffect, useState } from 'react'

type ThemeContextType = {
  dark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({ dark: true, toggleTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') !== 'light'
  })

 useEffect(() => {
  if (dark) {
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.add('light')
  }
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}, [dark])
  function toggleTheme() {
    setDark(prev => !prev)
  }

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
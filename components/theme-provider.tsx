"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  attribute?: string
}

const ThemeProviderContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
}>({
  theme: "light",
  setTheme: () => null,
})

export function ThemeProvider({ children, defaultTheme = "light", attribute = "class", ...props }: ThemeProviderProps) {
  // Use state with no initial value to prevent hydration mismatch
  const [theme, setTheme] = useState<Theme | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Get stored theme or default to light
    const storedTheme = localStorage.getItem("theme") as Theme
    setTheme(storedTheme || defaultTheme)
  }, [defaultTheme])

  useEffect(() => {
    if (!isMounted || theme === null) return

    const root = window.document.documentElement

    // Remove all theme classes
    root.classList.remove("light", "dark")

    // Add the current theme class
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
      root.style.colorScheme = systemTheme
    } else {
      root.classList.add(theme)
      root.style.colorScheme = theme
    }

    // Save theme to localStorage
    localStorage.setItem("theme", theme)
  }, [theme, isMounted])

  const value = {
    theme: theme || defaultTheme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme)
    },
  }

  // Only render context provider after mounting to avoid hydration mismatch
  if (!isMounted) {
    return <>{children}</>
  }

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

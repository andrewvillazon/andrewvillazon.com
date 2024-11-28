import React, { useState, useEffect } from "react"
import { SunMedium, Moon } from "lucide-react"

// Check if window is defined (so if in the browser or in node.js).
const isBrowser = typeof window !== "undefined"

// Adapted from: https://www.joshwcomeau.com/react/dark-mode/
function getCurrentTheme() {
  if (isBrowser) {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      return savedTheme
    }

    const hasThemePreference = window.matchMedia("(prefers-color-scheme: dark)")
    if (hasThemePreference) {
      return hasThemePreference.matches ? "dark" : "light"
    }
  }

  return "light"
}

export default function DarkModeToggle() {
  // Track if Dark Mode is on/off
  const [darkMode, setDarkMode] = useState(getCurrentTheme() === "dark")

  // Make sure we apply the right theme on component rendering
  useEffect(() => {
    const savedTheme = getCurrentTheme()

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setDarkMode(true)
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setDarkMode(false)
    }
  }, [])

  const toggleDarkMode = () => {
    if (isBrowser) {
      if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark")
        localStorage.setItem("theme", "light")
        setDarkMode(false)
      } else {
        document.documentElement.classList.add("dark")
        localStorage.setItem("theme", "dark")
        setDarkMode(true)
      }
    }
  }

  return (
    <button onClick={toggleDarkMode}>
      {darkMode ? (
        <SunMedium className="dark:stroke-gray-200 dark:fill-gray-800 h-6 w-6" />
      ) : (
        <Moon className="stroke-gray-700 h-6 w-6" />
      )}
    </button>
  )
}

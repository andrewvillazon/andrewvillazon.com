import React, { useState, useEffect } from "react"
import { SunMedium, Moon } from "lucide-react"

// Adapted from: https://www.joshwcomeau.com/react/dark-mode/
function getCurrentTheme() {
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme) {
    return savedTheme
  }

  const hasThemePreference = window.matchMedia("(prefers-color-scheme: dark)")
  if (hasThemePreference) {
    return hasThemePreference.matches ? "dark" : "light"
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

  return (
    <button onClick={toggleDarkMode} className="py-1 px-1 border border-gray-400 bg-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700">
      {darkMode ? <SunMedium className="dark:stroke-orange-200 dark:fill-gray-800" /> : <Moon className="stroke-gray-600 fill-amber-300"/>}
    </button>
  )
}

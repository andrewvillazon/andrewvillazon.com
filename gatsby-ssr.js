const React = require("react")

const noFlash = `
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

(function() {
    if (getCurrentTheme() === "dark") {
        document.documentElement.classList.add("dark")
        localStorage.setItem("theme", "dark")
    } else {
        document.documentElement.classList.add("")
        localStorage.setItem("theme", "light")
    }
})();
`

exports.onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <script key={"no-flash"} dangerouslySetInnerHTML={{ __html: noFlash }} />,
  ])
}

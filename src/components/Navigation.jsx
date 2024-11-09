import React from "react"
import { Link } from "gatsby"
import DarkModeToggle from "./DarkModeToggle"

const Navigation = () => {
  const navItems = [
    { url: "/", text: "Home" },
    { url: "/articles", text: "Articles" },
    { url: "/about", text: "About" },
  ]

  return (
    <section>
      <nav className="h-16 w-full border-b border-gray-300 dark:border-gray-700 md:h-24">
        <div className="container h-full mx-auto px-5 flex items-center justify-between">
          <div className="flex space-x-5 ">
            {navItems.map((item) => (
              <Link
                to={item.url}
                key={item.url}
                className="font-semibold uppercase text-sm text-gray-600 dark:text-green-500 md:block md:text-lg"
              >
                {item.text}
              </Link>
            ))}
          </div>
          <DarkModeToggle />
        </div>
      </nav>
    </section>
  )
}

export default Navigation

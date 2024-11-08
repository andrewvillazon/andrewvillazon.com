import React from "react"
import { Link } from "gatsby"
import { FileText, UserRound, Mail, House } from "lucide-react"
import DarkModeToggle from "./DarkModeToggle"

const Navigation = () => {
  const navItems = [
    { url: "/articles", text: "Articles", icon: FileText },
    { url: "/about", text: "About", icon: UserRound },
  ]

  return (
    <section>
      <nav className="h-16 w-full border-b border-gray-300 dark:border-gray-700 md:h-24">
        <div className="container mx-auto px-5 h-full flex items-center justify-between">
          <Link to="/" className="flex-1 flex">
            <House size="24" className="stroke-sky-700 dark:stroke-green-500 md:hidden" />
            <span className="hidden text-sky-700 dark:text-green-500 md:block md:text-lg">Andrew Villazon</span>
          </Link>
          <div className="flex space-x-5">
            {navItems.map((item) => (
              <Link to={item.url} key={item.url} className="flex">
                <item.icon size={24} className="stroke-sky-700 dark:stroke-green-500 md:hidden" />
                <span className="hidden text-sky-700 dark:text-green-500 md:block md:text-lg">{item.text}</span>
              </Link>
            ))}
          </div>
          <div className="ml-8">
            <DarkModeToggle />
          </div>
        </div>
      </nav>
    </section>
  )
}

export default Navigation

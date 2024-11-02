import React from "react"
import { Link } from "gatsby"
import { Shrub, FileText, UserRound, Mail, House } from "lucide-react"
import DarkModeToggle from "./DarkModeToggle"

const Navigation = () => {
  const navItems = [
    { url: "/articles", text: "Blog", icon: FileText },
    { url: "/about", text: "About", icon: UserRound },
    { url: "/about/#contact", text: "Contact", icon: Mail },
  ]

  return (
    <section>
      <nav className="h-16 w-full border-b border-gray-300 dark:border-gray-700">
        <div className="container mx-auto px-5 h-full flex items-center justify-between">
          <Link to="/" className="flex-1">
            <House size="24" className="stroke-cyan-700 dark:stroke-yellow-500" />
            <span className="hidden">Andrew Villazon</span>
          </Link>
          <div className="flex space-x-5">
            {navItems.map((item) => (
              <Link to={item.url} key={item.url}>
                <item.icon size={24} className="stroke-cyan-700 dark:stroke-yellow-500" />
                <span className="hidden">{item.text}</span>
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

import React from "react"
import { Link } from "gatsby"
import { Sunset, Shrub, FileText, UserRound, Mail } from "lucide-react"

const Navigation = () => {
  const navItems = [
    { url: "/articles", text: "Blog", icon: FileText },
    { url: "/about", text: "About", icon: UserRound },
    { url: "/about/#contact", text: "Contact", icon: Mail },
  ]

  return (
    <section>
      <nav className="h-16 w-full border-b border-gray-300">
        <div className="container mx-auto px-5 h-full flex items-center justify-between">
          <Link to="/" className="flex-1">
            <Shrub size="24" />
            <span className="hidden">Andrew Villazon</span>
          </Link>
          <div className="flex space-x-5">
            {navItems.map((item) => (
              <Link to={item.url} key={item.url}>
                <item.icon size={24} />
                <span className="hidden">{item.text}</span>
              </Link>
            ))}
          </div>
          <button className="ml-8">
            <Sunset size="24" />
          </button>
        </div>
      </nav>
    </section>
  )
}

export default Navigation

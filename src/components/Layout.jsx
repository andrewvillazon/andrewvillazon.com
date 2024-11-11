import React from "react"
import Footer from "./Footer"
import Navigation from "./Navigation"

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen justify-between">
      <Navigation />
      <main className="mb-auto">
        <div className="mt-10 mb-auto container mx-auto px-5 md:mt-28">{children}</div>
      </main>
      <Footer />
    </div>
  )
}

export default Layout

import React from "react"
import { Link } from "gatsby"
import { Github, FileText, UserRound, Mail, Linkedin } from "lucide-react"

const Footer = () => {
  return (
    <section>
      <footer className="mt-24 border-t border-gray-300 dark:border-gray-700">
        <div className="container mx-auto px-5 py-14 max-w-3xl">
          <nav className="flex flex-wrap justify-center gap-5">
            <Link to={"/articles"}>
              <FileText size={24} className="stroke-sky-700 dark:stroke-teal-500"/>
            </Link>
            <Link to={"/about"}>
              <UserRound size={24} className="stroke-sky-700 dark:stroke-teal-500" />
            </Link>
            <Link to={"/about/#contact"}>
              <Mail size={24} className="stroke-sky-700 dark:stroke-teal-500" />
            </Link>
            <a
              href="https://www.linkedin.com/in/andrew-villazon/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin size={24} className="stroke-sky-700 dark:stroke-teal-500"/>
            </a>
            <a
              href="https://github.com/andrewvillazon"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={24} className="stroke-sky-700 dark:stroke-teal-500"/>
            </a>
          </nav>
          <div className="text-sm text-center mt-8 text-gray-500">
            &copy; {new Date().getFullYear()} Andrew Villazon. All rights
            reserved.
          </div>
        </div>
      </footer>
    </section>
  )
}

export default Footer

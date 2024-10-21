import React from "react"
import { Link } from "gatsby"
import { Github, FileText, UserRound, Mail, Linkedin } from "lucide-react"

const Footer = () => {
  return (
    <section>
      <footer className=" bg-gray-300 mt-24 border border-t border-gray-400">
        <div className="container mx-auto px-5 py-14">
          <nav className="flex flex-wrap justify-center gap-5">
            <Link to={"/articles"}>
              <FileText size={24} />
            </Link>
            <Link to={"/about"}>
              <UserRound size={24} />
            </Link>
            <Link to={"/about/#contact"}>
              <Mail size={24} />
            </Link>
            <a
              href="https://www.linkedin.com/in/andrew-villazon/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin size={24} />
            </a>
            <a
              href="https://github.com/andrewvillazon"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={24} />
            </a>
          </nav>
          <div className="text-sm text-center mt-6 text-gray-500">
            &copy; {new Date().getFullYear()} Andrew Villazon. All rights
            reserved.
          </div>
        </div>
      </footer>
    </section>
  )
}

export default Footer

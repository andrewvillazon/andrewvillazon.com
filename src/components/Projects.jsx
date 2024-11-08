import React from "react"
import { projects } from "../data/projects"
import { Boxes, Github, ExternalLink } from "lucide-react"

const Projects = () => {
  return (
    <div>
      {projects.map((project) => (
        <div key={project.name}>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-700 dark:text-green-500"
            >
              {project.name}
            </a>
          </h3>
          <p className="mt-4 mb-5 text-gray-600 dark:text-gray-400 text-sm">
            {project.description}
          </p>
          <div className="flex flex-wrap">
            {project.additional_links.map((link) => (
              <a href={link.url} className="mr-4 text-sm text-sky-700 font-medium dark:text-green-500">{link.text} <ExternalLink className="h-3 w-3 inline" /> </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Projects

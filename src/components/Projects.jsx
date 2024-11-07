import React from "react"
import { projects } from "../data/projects"
import { Boxes, Github } from "lucide-react"

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
              className="text-cyan-700 dark:text-yellow-500"
            >
              {project.name}
            </a>
          </h3>
          <p className="mt-4 mb-5 text-gray-600 dark:text-gray-400 text-sm">
            {project.description}
          </p>
          <div className="flex">
            <a
              href={project.pypi}
              target="_blank"
              rel="noopener noreferrer"
              className="mr-2 py-1 px-2 text-sm inline-flex bg-gray-300 border border-gray-400 rounded-md dark:border-gray-600 dark:bg-gray-700"
            >
              <Boxes
                size={24}
                className="stroke-gray-600 dark:stroke-gray-400"
              />
            </a>
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 py-1 px-2 text-sm inline-flex bg-gray-300 border border-gray-400 rounded-md dark:border-gray-600 dark:bg-gray-600"
            >
              <Github
                size="24"
                className="stroke-gray-600 dark:stroke-gray-400"
              />
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Projects

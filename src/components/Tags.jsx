import { Link } from "gatsby"
import React from "react"
import kebabCase from "lodash/kebabCase"

const Tags = ({ tags }) => {
  return (
    <div className="flex flex-wrap">
      {tags.map((tag) => (
        <Link
          key={tag.fieldValue}
          to={`/tags/${kebabCase(tag.fieldValue)}`}
          className="font-mono mr-4 mb-3 pt-2 pb-1 text-cyan-700 dark:text-yellow-500"
        >
          <span>#</span>
          <span className="border-b-2 border-dotted border-cyan-800 dark:border-yellow-500">{tag.fieldValue}</span>
          <sup>
            &nbsp;{tag.totalCount}
          </sup>
        </Link>
      ))}
    </div>
  )
}

export default Tags

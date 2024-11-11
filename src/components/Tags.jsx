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
          className="font-mono text-sm mr-4 mb-3 pt-2 pb-1 text-sky-700 dark:text-teal-500 md:text-base md:mr-5"
        >
          <span>#</span>
          <span className="border-b-2 border-dotted border-sky-800 dark:border-teal-500">{tag.fieldValue}</span>
          <sup>
            &nbsp;{tag.totalCount}
          </sup>
        </Link>
      ))}
    </div>
  )
}

export default Tags

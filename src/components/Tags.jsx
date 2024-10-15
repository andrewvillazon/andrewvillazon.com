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
          className="inline-flex overflow-hidden border border-gray-800 rounded group font-mono text-sm mr-4 mb-3"
        >
          <span className="pl-2 pr-2 py-2">{tag.fieldValue}</span>
          <span className="px-3 py-2 flex border-l border-gray-800 bg-gray-300">
            {tag.totalCount}
          </span>
        </Link>
      ))}
    </div>
  )
}

export default Tags

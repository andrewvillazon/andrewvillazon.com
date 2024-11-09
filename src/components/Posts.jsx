import { Link } from "gatsby"
import * as React from "react"

const Posts = ({ posts, groupByYears = false }) => {
  function formatDate(date) {
    const properDate = new Date(date)
    return `${properDate.getUTCDate()} ${properDate.toLocaleString("default", {
      month: "short",
    })}`
  }

  //   Re-organise if grouping by year
  if (groupByYears) {
    const postsByYear = {}

    posts.forEach((post) => {
      const year = new Date(post.frontmatter.date).getFullYear().toString()
      postsByYear[year] = [...(postsByYear[year] || []), post]
    })

    const years = Object.keys(postsByYear).reverse()

    return years.map((year) => (
      <div className="mb-12">
        <h2 className="text-2xl font-semibold font-mono mb-8 text-gray-700 dark:text-gray-300" key={year}>
          {year}
        </h2>
        {postsByYear[year].map((node) => (
          <div key={node.id} className="border-b border-gray-500 border-dotted last:border-hidden mt-4">
            <article>
              <Link to={`${node.fields.slug}`}>
                <h3 className="text-base font-semibold text-sky-700 dark:text-teal-500 mb-2">
                  {node.frontmatter.title}
                </h3>
                <time className="block text-sm text-gray-400 dark:text-gray-500 font-mono mb-3">
                  {formatDate(node.frontmatter.date)}
                </time>
                {node.frontmatter.description && (
                  <p className="text-sm text-gray-700 dark:text-gray-400 mb-3">
                    {node.frontmatter.description}
                  </p>
                )}
              </Link>
            </article>
          </div>
        ))}
      </div>
    ))
  } else {
    return (
      <div>
        {posts.map((node) => (
          <div key={node.id} className="border-b border-gray-500 border-dotted last:border-hidden mt-4">
            <article>
              <Link to={`${node.fields.slug}`}>
                <h3 className="text-base font-semibold text-sky-700 mb-2 dark:text-teal-500">
                  {node.frontmatter.title}
                </h3>
                <time className="block text-sm text-gray-400 dark:text-gray-500 font-mono mb-3">
                  {formatDate(node.frontmatter.date)}
                </time>
                {node.frontmatter.description && (
                  <p className="text-sm text-gray-500 mb-5 dark:text-gray-400">
                    {node.frontmatter.description}
                  </p>
                )}
              </Link>
            </article>
          </div>
        ))}
      </div>
    )
  }
}

export default Posts

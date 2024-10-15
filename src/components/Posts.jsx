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
      <>
        <h2
          className="text-3xl font-semibold mb-8 text-slate-900 dark:text-slate-300"
          key={year}
        >
          {year}
        </h2>
        <div className="mb-12">
          <ul>
            {postsByYear[year].map((node) => (
              <li className="py-4 border-b border-gray-200 last:border-hidden dark:border-slate-700">
                <article key={node.id}>
                  <Link
                    to={`${node.fields.slug}`}
                    className="flex justify-between items-center"
                  >
                    <h2 className="text-lg text-slate-800 hover:text-blue-600 font-medium dark:text-slate-300 dark:hover:text-blue-500">
                      {node.frontmatter.title}
                    </h2>
                    <time className="text-sm text-slate-400 font-semibold dark:text-slate-500">
                      {formatDate(node.frontmatter.date)}
                    </time>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </>
    ))
  } else {
    return (
      <>
        {posts.map((node) => (
          <article key={node.id}>
            <div className="border-b border-gray-500 border-dotted mt-4">
              <Link to={`${node.fields.slug}`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {node.frontmatter.title}
                </h3>
                <time className="block text-sm text-gray-500 font-mono mb-3">
                  {formatDate(node.frontmatter.date)}
                </time>
                {node.frontmatter.description && <p className="text-base text-gray-700 mb-5">{node.frontmatter.description}</p>}
              </Link>
            </div>
          </article>
        ))}
      </>
    )
  }
}

export default Posts

import React from "react"
import { graphql } from "gatsby"
import Posts from "../components/Posts"
import Layout from "../components/Layout"

const Tags = ({ pageContext, data }) => {
  const { tag } = pageContext
  const { nodes, totalCount } = data.allMarkdownRemark

  return (
    <Layout>
      <section>
          <h1 className="mb-12 text-4xl font-extrabold tracking-tight text-gray-700 dark:text-gray-300">
            Posts tagged <u>{tag}</u> ({totalCount})
          </h1>
          <Posts posts={nodes} groupByYears={true} />
      </section>
    </Layout>
  )
}

export default Tags

export const pageQuery = graphql`
  query ($tag: String) {
    allMarkdownRemark(
      sort: { frontmatter: { date: DESC } }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      totalCount
      nodes {
        frontmatter {
          date
          title
        }
        id
        fields {
          slug
        }
      }
    }
  }
`

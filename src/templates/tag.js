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
        <h1 className="mb-12 text-3xl font-bold tracking-tight text-gray-700 dark:text-gray-300 md:text-4xl md:mb-20">
          <u>#{tag}</u>
          <sup>&nbsp;{totalCount}</sup>
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

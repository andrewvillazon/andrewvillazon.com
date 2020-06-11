import React from "react"
import Layout from "../components/layout"
import { graphql } from "gatsby"
import PostListing from "../components/post-listing"

const Tags = ({ pageContext, data }) => {
  const { tag } = pageContext
  const postEdges = data.allMarkdownRemark.edges
  
  console.log(postEdges)

  return (
    <Layout>
    <div>
      <h1>{tag}</h1>
      <PostListing postEdges={postEdges} />
    </div>
    </Layout>
  )
}

export default Tags

export const pageQuery = graphql`
  query($tag: String) {
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      totalCount
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
          }
        }
      }
    }
  }
`
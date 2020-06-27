import React from "react"

import Introduction from "../components/introduction"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { Link, graphql } from "gatsby"
import PostListing from "../components/post-listing"

const IndexPage = ({data}) => {
  const postEdges = data.allMarkdownRemark.edges

  return(
  <Layout>
    <SEO title="Home" />
    <Introduction />
    <section className="margin-top padding-top margin-bottom">
    <h2>Latest <Link to="/articles/">Articles</Link></h2>
    <PostListing postEdges={postEdges} />
    </section>
  </Layout>
  )
}

export default IndexPage

export const pageQuery = graphql`
  query {
    allMarkdownRemark(
      limit: 5
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
            date(formatString: "DD MMMM, YYYY")
          }
        }
      }
    }
  }
`
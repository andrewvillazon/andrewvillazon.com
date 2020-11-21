import React from "react"

import Introduction from "../components/introduction"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { Link, graphql } from "gatsby"
import PostListing from "../components/post-listing"
import ArticleCount from "../components/article-count"

const IndexPage = ({ data }) => {
  const postEdges = data.allMarkdownRemark.edges

  return (
    <Layout>
      <SEO title="Home" />
      <section class="introduction">
        <div class="container">
          <h1>Hi, I'm Andrew.</h1>
          <p>
            I'm a Data Professional that specialises in SQL, Python, and Data
            Visualisation. My website is a collection of the things I've learned
            over the years - a place to document those "Aha!" moments.
          </p>
          <p>
            Feel free to read my <a href="#">posts</a> or{" "}
            <a href="#">get in touch</a>.
          </p>
        </div>
      </section>
      <section className="margin-top padding-top margin-bottom">
        <h2 className="latest-header">Latest Articles</h2>
        <div className="article-count">
          <Link to="/articles/">
            <small>
              View all <ArticleCount /> articles
            </small>
          </Link>
        </div>
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

import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { graphql } from "gatsby"
import PostListing from "../components/post-listing"
import DistinctTags from "../components/distinct-tags"

const IndexPage = ({ data }) => {
  const postEdges = data.allMarkdownRemark.edges

  return (
    <Layout>
      <SEO title="Home" />

      {/* Intro Hero */}
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

      {/* Latest Articles */}
      <section>
        <div class="container">
          <h2>Latest</h2>
          <PostListing postEdges={postEdges} />
        </div>
      </section>

      {/* Topics */}
      <section>
        <div class="container">
          <h2>Topics</h2>
          <div class="flex article-tags">
            <DistinctTags />
          </div>
        </div>
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
      filter: { fileAbsolutePath: { regex: "*/content/blog/" } }
    ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
            date(formatString: "DD MMM")
          }
        }
      }
    }
  }
`

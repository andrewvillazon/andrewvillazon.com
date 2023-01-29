import { graphql } from "gatsby"
import * as React from "react"
import Posts from "../components/Posts"
import Tags from "../components/Tags"
import Layout from "../components/Layout"

const ArticlePage = ({ data }) => {
  const posts = data.allMdx.nodes

  return (
    <Layout>
      <section>
        <div className="container mx-auto">
          <h1 className="mb-12 text-5xl font-extrabold tracking-tight">Articles</h1>
          <h2 className="text-3xl font-semibold mb-8">Tags</h2>
          <div className="flex mb-12">
            <Tags />
          </div>
          <Posts posts={posts} groupByYears={true} />
        </div>
      </section>
    </Layout>
  )
}

export const query = graphql`
  query {
    allMdx(sort: { frontmatter: { date: DESC } }) {
      nodes {
        frontmatter {
          date
          slug
          title
        }
        id
      }
    }
  }
`

export const Head = () => <title>Articles</title>

export default ArticlePage

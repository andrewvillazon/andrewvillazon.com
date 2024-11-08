import { graphql } from "gatsby"
import * as React from "react"
import Posts from "../components/Posts"
import Tags from "../components/Tags"
import Layout from "../components/Layout"
import { Seo } from "../components/Seo"

const ArticlePage = ({ data }) => {
  const posts = data.allMarkdownRemark.nodes
  const tags = data.allTags.group

  return (
    <Layout>
      <section>
        <h1 className="mb-12 text-3xl font-bold tracking-tight text-gray-700 dark:text-gray-300">Articles</h1>
        <h2 className="text-2xl font-semibold mb-8 text-gray-700 dark:text-gray-300">Tags</h2>
        <div className="mb-12">
          <Tags tags={tags} />
        </div>
        <Posts posts={posts} groupByYears={true} />
      </section>
    </Layout>
  )
}

export const query = graphql`
  query {
    allMarkdownRemark(
      sort: { frontmatter: { date: DESC } }
      filter: { fields: { contentType: { eq: "post" } } }
    ) {
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
    allTags: allMarkdownRemark {
      group(field: { frontmatter: { tags: SELECT } }) {
        totalCount
        fieldValue
      }
    }
  }
`

export const Head = () => <Seo title={"Articles"} />

export default ArticlePage

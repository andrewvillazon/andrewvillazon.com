import * as React from "react"
import { graphql } from "gatsby"
import Layout from "../components/Layout"
import Tags from "../components/Tags"

const MarkdownPage = ({ data }) => {
  const { markdownRemark } = data
  const { frontmatter, html } = markdownRemark

  return (
    <Layout>
      <section>
        <div className="container mx-auto">
          <h1 className="mb-8 text-5xl font-extrabold tracking-tight">
            {frontmatter.title}
          </h1>
          {frontmatter.date ? (
            <p className="text-base mb-8">{frontmatter.date}</p>
          ) : null}
          {frontmatter.tags ? (
            <div className="mb-12">
              <Tags tags={frontmatter.tags} />
            </div>
          ) : null}
          <div
            className="markdown"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </section>
    </Layout>
  )
}

export const pageQuery = graphql`
  query ($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        tags
      }
    }
  }
`

export const Head = () => <title>Home Page</title>

export default MarkdownPage
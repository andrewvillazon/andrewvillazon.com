import * as React from "react"
import { graphql } from "gatsby"
import Layout from "../components/Layout"
import Tags from "../components/Tags"
import { Seo } from "../components/Seo"

const MarkdownPage = ({ data }) => {
  const { markdownRemark } = data
  const { frontmatter, html } = markdownRemark

  const tags = frontmatter.tags
    ? frontmatter.tags.map((tag) => ({ fieldValue: tag }))
    : null

  function Header({ title }) {
    if (title === "About me") {
      return (
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-700 dark:text-gray-300 md:text-4xl">
          {title}
        </h1>
      )
    }
    return (
      <h1 className="mb-3 text-2xl font-bold tracking-tight text-gray-700 dark:text-gray-300 md:text-3xl">
        {title}
      </h1>
    )
  }

  return (
    <Layout>
      <section>
        <div className="container mx-auto">
          <Header title={frontmatter.title} />
          {frontmatter.date ? (
            <p className="text-sm text-gray-500 font-mono mb-4">
              <time className="">{frontmatter.date}</time>
            </p>
          ) : null}
          {frontmatter.tags ? (
            <div className="mb-8">
              <Tags tags={tags} />
            </div>
          ) : null}
          <div
            className="prose max-w-none prose-h2:border-b prose-h2:border-gray-300 prose-h2:py-2 prose-a:text-sky-700 prose-code:before:content-none prose-code:after:content-none dark:prose-invert dark:prose-a:text-teal-500 dark:prose-h2:border-gray-700 md:prose-lg"
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
    allMarkdownRemark {
      tagCounts: group(field: { frontmatter: { tags: SELECT } }) {
        fieldValue
        totalCount
      }
    }
  }
`

export const Head = ({ data }) => (
  <Seo title={data.markdownRemark.frontmatter.title} />
)

export default MarkdownPage

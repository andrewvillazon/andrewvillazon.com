import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/Layout"
import Tags from "../components/Tags"

const Post = ({ data, children }) => {
  return (
    <Layout>
      <section>
        <div className="container mx-auto">
          <h1 className="mb-8 text-5xl font-extrabold tracking-tight">
            {data.mdx.frontmatter.title}
          </h1>
          <p className="text-base mb-8">{data.mdx.frontmatter.date}</p>
          <div className="mb-8">
            <Tags tags={data.mdx.frontmatter.tags} />
          </div>
          {children}
        </div>
      </section>
    </Layout>
  )
}

export const query = graphql`
  query ($id: String) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
        date(formatString: "MMMM D, YYYY")
        tags
      }
    }
  }
`

export const Head = () => <title>Home Page</title>

export default Post

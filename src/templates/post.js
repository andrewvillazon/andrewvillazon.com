import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { Link } from "gatsby"
const _ = require("lodash");

export default function BlogPost({ data }) {
    const post = data.markdownRemark
    const tags = post.frontmatter.tags;

    return (
        <Layout>
            <SEO title={post.frontmatter.title} description={post.excerpt} />
            <article>
                <header className="post-header padding-bottom margin-bottom">
                    <h1>{post.frontmatter.title}</h1>
                    <p className="post-info">
                        <small><time>{post.frontmatter.date}</time></small>
                    </p>
                    <div className="tag-container">
                        {
                            tags.map(tag => (
                                <Link 
                                to={`/tags/${_.kebabCase(tag)}/`}
                                className="tag">{tag}</Link>
                            ))
                        }
                    </div>
                </header>
                <div dangerouslySetInnerHTML={{ __html: post.html }} />
            </article>
        </Layout>
    )
}

export const query = graphql`
    query($slug: String!) {
        markdownRemark(fields: { slug: { eq: $slug } }) {
            html
            frontmatter {
                title
                date(formatString: "DD MMMM, YYYY")
                tags
            }
            excerpt
        }
    }
`
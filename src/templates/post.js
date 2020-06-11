import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import { Link } from "gatsby"
const _ = require("lodash");

export default function BlogPost({ data }) {
    const post = data.markdownRemark
    const tags = post.frontmatter.tags;

    return (
        <Layout>
            <article>
                <h1>{post.frontmatter.title}</h1>
                <div className="post-info">
                    <Link to="/about/">Andrew</Link>
                    {' '}
                    <small><time className="publish-date">{post.frontmatter.date}</time></small>
                    <div>
                        {
                            tags.map(tag => (
                                <Link to={`/tags/${_.kebabCase(tag)}/`}>{tag}</Link>
                            ))
                        }
                    </div>
                </div>
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
        }
    }
`
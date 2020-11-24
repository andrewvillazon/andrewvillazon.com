import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"
import PostListing from "../components/post-listing"
import { graphql, Link } from "gatsby"
import DistinctTags from "../components/distinct-tags"
const _ = require("lodash")

const ArticlePage = ({ data }) => {
    const tags = data.tagsGroup.group
    const postEdges = data.allMarkdownRemark.edges

    return (
        <Layout>
            <SEO title="Articles" />
            <section>
                <div className="container">
                    <header>
                        <h1>Articles</h1>
                        <div className="flex">
                            <DistinctTags/>
                        </div>
                    </header>
                    <section>
                        <PostListing postEdges={postEdges} />
                    </section>
                </div>
            </section>
        </Layout>
    )
}

export default ArticlePage

export const query = graphql`
    query PageQuery {
        allMarkdownRemark(sort: {fields: [frontmatter___date], order: DESC}) {
        edges {
            node {
            id
            frontmatter {
                title
                summary
                date(formatString:  "DD MMM")
            }
            fields {
                slug
                }
            }
            }
        }
        tagsGroup: allMarkdownRemark {
            group(field: frontmatter___tags) {
              fieldValue
            }
          }
    }  
`
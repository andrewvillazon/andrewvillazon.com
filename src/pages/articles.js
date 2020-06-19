import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { graphql, Link } from "gatsby"
const _ = require("lodash")

const ArticlePage = ({ data }) => {
    const tags = data.tagsGroup.group

    return (
        <Layout>
            <SEO title="Articles" />
            <section>
                <h1>Articles</h1>
                <div className="article-tag-container">
                    {
                        tags.map(tag => {
                            return (
                                <Link 
                                    to={`/tags/${_.kebabCase(tag.fieldValue)}/`}
                                    key={tag.fieldValue}
                                >{tag.fieldValue}</Link>
                            )
                        })
                    }
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
                date(formatString: "DD MMMM, YYYY")
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
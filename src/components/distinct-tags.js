import React from "react"
import { graphql, Link, useStaticQuery } from "gatsby"
const _ = require("lodash");

export default function DistinctTags() {
    const query = useStaticQuery(graphql`
    {
    allMarkdownRemark {
      distinct(field: frontmatter___tags)
        }
    }
    `)

    const tags = query.allMarkdownRemark.distinct;
    console.log(tags)

    return (
        <>
        {
            tags.map(tag => (
                <Link 
                to={`/tags/${_.kebabCase(tag)}/`}
                className="topic"
                key={tag}>{tag}</Link>
            ))
        }
        </>
    )
}


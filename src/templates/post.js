import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { Link } from "gatsby"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faPython, faReact} from "@fortawesome/free-brands-svg-icons"
const _ = require("lodash")

export default function BlogPost({ data }) {
  const post = data.markdownRemark
  const tags = post.frontmatter.tags

  const icons = {
    "Github": faGithub,
    "Python": faPython,
    "SQL Server": faDatabase,
    "Gatsby": faReact,
  }

  return (
    <Layout>
      <SEO title={post.frontmatter.title} description={post.excerpt} />
      <section>
        <article>
          <div class="container">
            <header>
              <h1>Automatically deploying a Gatsby site with Github Actions</h1>
              <p>
                <time class="article-time">17 July, 2020</time>
              </p>
              <div class="flex article-tags">
                {tags.map(tag => (
                  <Link to={`/tags/${_.kebabCase(tag)}/`} className="tag"><FontAwesomeIcon icon={icons[tag]} />{tag}</Link>
                ))}
              </div>
            </header>
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
          </div>
        </article>
      </section>
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

import * as React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/Layout"
import Posts from "../components/Posts"
import Tags from "../components/Tags"
import { projects } from "../data/projects"
import { Seo } from "../components/Seo"
import Projects from "../components/Projects"

const IndexPage = ({ data }) => {
  const latestPosts = data.latestPosts.nodes
  const allTags = data.allTags.group

  return (
    <Layout>
      <section>
        <div className="text-gray-700 dark:text-gray-300">
          <h1 className="text-4xl mb-8 font-semibold">
            Hi, I'm{" "}
            <span className="text-cyan-700 dark:text-yellow-500">Andrew</span>
          </h1>
          <p className="mb-4 text-lg">
            I'm a Data Engineer writing about some of the things I've learned
            working in Data & Analytics.
          </p>
          <p className="mb-4 text-lg">
            On this site, you can read some of my&nbsp;
            <Link
              to="/articles"
              className="text-cyan-700 dark:text-yellow-500 font-semibold"
            >
              articles
            </Link>
            , learn more&nbsp;
            <Link
              to="/about"
              className="text-cyan-700 dark:text-yellow-500 font-semibold"
            >
              about me
            </Link>
            , or&nbsp;
            <Link
              to="/about/#contact"
              className="text-cyan-700 dark:text-yellow-500 font-semibold"
            >
              get in touch
            </Link>
            !
          </p>
        </div>
      </section>

      <section>
        <div className="mt-12">
          <h2 className="text-3xl font-semibold mb-8 text-gray-700 dark:text-gray-300">
            Latest
          </h2>
          <Posts posts={latestPosts} />
          <div className="mt-8">
            <Link
              to={"/articles"}
              className="text-sm text-cyan-700 dark:text-yellow-500"
            >
              All articles →
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mt-12">
          <h2 className="text-3xl font-semibold mb-8 text-gray-700 dark:text-gray-300">
            Explore
          </h2>
          <Tags tags={allTags} />
        </div>
      </section>

      <section>
        <div className="mt-12">
          <div>
            <h2 className="text-3xl font-semibold mb-8 text-gray-700 dark:text-gray-300">
              Open Source
            </h2>
          </div>
          <Projects />
        </div>
      </section>
    </Layout>
  )
}

export const query = graphql`
  query {
    latestPosts: allMarkdownRemark(
      limit: 5
      sort: { frontmatter: { date: DESC } }
      filter: { fields: { contentType: { eq: "post" } } }
    ) {
      nodes {
        frontmatter {
          date
          title
          description
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

export default IndexPage

export const Head = () => <Seo />

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
        <div className="">
          <h1 className="text-gray-700 dark:text-gray-300 text-4xl mb-8 font-semibold">
            Hi, I'm{" "}
            <span className="text-sky-700 dark:text-green-500">Andrew</span>
          </h1>
          <div className="text-gray-700 dark:text-gray-400">
            <p className="mb-6 text-lg leading-8">
              I'm a <span className="font-semibold">Data Engineer</span> sharing a few of the things I've picked up working in Data & Analytics.
            </p>
            <p className="mb-6 text-lg leading-8">
              On this site, you can read my&nbsp;
              <Link
                to="/articles"
                className="text-sky-700 dark:text-green-500 font-semibold"
              >
                articles
              </Link>
              , learn more&nbsp;
              <Link
                to="/about"
                className="text-sky-700 dark:text-green-500 font-semibold"
              >
                about me
              </Link>
              , or&nbsp;
              <Link
                to="/about/#contact"
                className="text-sky-700 dark:text-green-500 font-semibold"
              >
                get in touch
              </Link>
              !
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-8 text-gray-700 dark:text-gray-300">
            Latest
          </h2>
          <Posts posts={latestPosts} />
          <div className="mt-8">
            <Link
              to={"/articles"}
              className="text-base text-sky-700 dark:text-green-500"
            >
              All articles →
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-8 text-gray-700 dark:text-gray-300">
            Explore
          </h2>
          <Tags tags={allTags} />
        </div>
      </section>

      <section>
        <div className="mt-12">
          <div>
            <h2 className="text-2xl font-semibold mb-8 text-gray-700 dark:text-gray-300">
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

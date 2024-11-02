import * as React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/Layout"
import Posts from "../components/Posts"
import Tags from "../components/Tags"
import { projects } from "../data/projects"
import { Seo } from "../components/Seo"
import { Boxes, Github } from "lucide-react"

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
          <div>
            {projects.map((project) => {
              return (
                <div key={project.name}>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    <a href={project.github} target="_blank" className="text-cyan-700 dark:text-yellow-500">{project.name}</a>
                  </h3>
                  <p className="mt-4 mb-5 text-gray-600 dark:text-gray-400 text-sm">
                    {project.description}
                  </p>
                  <div className="flex">
                    <a
                      href={project.pypi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mr-2 py-1 px-2 text-sm inline-flex bg-gray-300 border border-gray-400 rounded-md dark:border-gray-600 dark:bg-gray-700"
                    >
                      <Boxes size={24} className="stroke-gray-600 dark:stroke-gray-400" />
                    </a>
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 py-1 px-2 text-sm inline-flex bg-gray-300 border border-gray-400 rounded-md dark:border-gray-600 dark:bg-gray-600"
                    >
                      <Github size="24" className="stroke-gray-600 dark:stroke-gray-400" />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
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

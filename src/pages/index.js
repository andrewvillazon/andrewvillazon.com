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
        <h1 className="text-4xl mb-8 font-semibold">
          Hi, I'm <span className="text-red-600">Andrew</span>
        </h1>
        <p className="mb-4 text-lg">
          I'm a Data Engineer writing about some of the things I've learned
          working in Data & Analytics.
        </p>
        <p className="mb-4 text-lg">
          On this site, you can read some of my&nbsp;
          <Link to="/articles" className="text-red-600">
            articles
          </Link>
          , learn more&nbsp;
          <Link to="/about" className="text-red-600">
            about me
          </Link>
          , or&nbsp;
          <Link to="/about/#contact" className="text-red-600">
            get in touch
          </Link>
          !
        </p>
      </section>

      <section>
        <div className="mt-12">
          <h2 className="text-3xl font-semibold mb-8">Latest</h2>
          <Posts posts={latestPosts} />
          <div className="mt-8">
            <Link to={"/articles"} className="text-sm text-gray-700">
              All articles →
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mt-12">
          <h2 className="text-3xl font-semibold mb-8">Explore</h2>
          <Tags tags={allTags} />
        </div>
      </section>

      <section>
        <div className="mt-12">
          <div>
            <h2 className="text-3xl font-semibold mb-8">Open Source</h2>
          </div>
          <div>
            {projects.map((project) => {
              return (
                <div className="border border-gray-300 bg-gray-100 rounded-lg px-3 pt-2 pb-3 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {project.name}
                  </h3>
                  <p className="mt-4 mb-5 text-gray-600">{project.description}</p>
                  <div className="flex">
                    <a
                      href={project.pypi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mr-2"
                    >
                      <Boxes size={24} />
                    </a>
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2"
                    >
                      <Github size="24" />
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

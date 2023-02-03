const { createFilePath } = require(`gatsby-source-filesystem`)
const path = require("path")
const _ = require("lodash")

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `blog` })

    createNodeField({
      node,
      name: `slug`,
      value: slug,
    })
  }
}

exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions

  const result = await graphql(`
    query {
      allMarkdownRemark {
        distinct(field: { frontmatter: { tags: SELECT } })
      }
    }
  `)

  // Make tag pages
  const tagTemplate = path.resolve("src/templates/tag.js")
  const tags = result.data.allMarkdownRemark.distinct

  tags.forEach((tag) => {
    console.log(tag)
    createPage({
      path: `/tags/${_.kebabCase(tag)}/`,
      component: tagTemplate,
      context: {
        tag: tag,
      },
    })
  })
}

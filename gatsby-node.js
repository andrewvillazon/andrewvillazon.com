const { createFilePath } = require(`gatsby-source-filesystem`)
const path = require(`path`);

/* 
 Creates a slug (path) on a node based on where it is in the file
 system. Once on the node we can use the slug to dynamically 
 generate pages.
*/
exports.onCreateNode = ({ node, getNode, actions }) => {
    const { createNodeField } = actions
    const contentPath = `content/blog`

    if (node.internal.type === `MarkdownRemark`) {
        const slug = createFilePath({ node, getNode, basePath: contentPath })

        createNodeField({ node, name: `slug`, value: slug })
    }
}

exports.createPages = async ({ graphql, actions }) => {
    const { createPage } = actions

    const result = await graphql(`
    query {
      allMarkdownRemark {
        edges {
          node {
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
    `)

    // Create blog post pages
    result.data.allMarkdownRemark.edges.forEach(({ node }) => {
        createPage(
            {
                path: node.fields.slug,
                component: path.resolve(`./src/templates/post.js`),
                context: {
                    slug: node.fields.slug,
                }
            }
        )
    });
}
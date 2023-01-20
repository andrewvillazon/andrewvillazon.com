const path = require("path");
const _ = require("lodash");

exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions;

  const tagTemplate = path.resolve("src/templates/tag.js");

  const result = await graphql(`
    query {
      allMdx {
        distinct(field: { frontmatter: { tags: SELECT } })
      }
    }
  `);

  const tags = result.data.allMdx.distinct

  // Make tag pages
  tags.forEach(tag => {
    console.log(tag)
    createPage({
      path: `/tags/${_.kebabCase(tag)}/`,
      component: tagTemplate,
      context: {
        tag: tag,
      },
    })
  })
};

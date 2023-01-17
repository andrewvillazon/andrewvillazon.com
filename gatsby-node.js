// Add Year value to frontmatter of a blog post.
exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions;

  if (node.internal.type == "Mdx") {
    const frontmatterDate = new Date(node.frontmatter.date);

    const year = frontmatterDate.getFullYear();

    createNodeField({ node, name: "year", value: year });
  }
};

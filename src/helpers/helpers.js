export function postsFromNodes(nodes) {
  return nodes.map((post) => ({
    id: post.node.id,
    frontmatter: post.node.frontmatter,
  }));
}

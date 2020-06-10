const { createFilePath } = require(`gatsby-source-filesystem`)

/* 
 Creates a slug (path) on a node based on where it is in the file
 system. Once on the node we can use the slug to dynamically 
 generate pages.
*/
exports.onCreateNode = ( {node, getNode, actions} ) => {
    const { createNodeField } = actions
    const contentPath = `content/blog`

    if (node.internal.type === `MarkdownRemark`) {
        const slug = createFilePath({ node, getNode, basePath: contentPath})
        
        createNodeField({node,name:`slug`, value: slug})
    }
}
import React from "react";
import { graphql } from "gatsby";

const Post = ({ data, children }) => {
  return (
    <div>
      <h1>{data.mdx.frontmatter.title}</h1>
      <p>{data.mdx.frontmatter.date}</p>
      {children}
    </div>
  );
};

export const query = graphql`
  query ($id: String) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
        date(formatString: "MMMM D, YYYY")
      }
    }
  }
`;

export const Head = () => <title>Home Page</title>;

export default Post;

import React from "react";
import { graphql } from "gatsby";
import { postsFromNodes } from "../helpers/helpers";
import Posts from "../components/Posts";

const Tags = ({ pageContext, data }) => {
  const { tag } = pageContext;
  const { edges, totalCount } = data.allMdx;
  const tagHeader = `${totalCount} post${
    totalCount === 1 ? "" : "s"
  } tagged with "${tag}"`;

  const posts = postsFromNodes(edges);

  return (
    <div>
      <h1>{tagHeader}</h1>
      <Posts posts={posts} groupByYears={true} />
    </div>
  );
};

export default Tags;

export const pageQuery = graphql`
  query ($tag: String) {
    allMdx(
      sort: { frontmatter: { date: DESC } }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      totalCount
      edges {
        node {
          frontmatter {
            slug
            title
            date
          }
          id
        }
      }
    }
  }
`;

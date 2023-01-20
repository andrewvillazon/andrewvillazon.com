import { graphql } from "gatsby";
import * as React from "react";
import Posts from "../components/Posts";
import Tags from "../components/Tags";
import { postsFromNodes } from "../helpers/helpers";

const ArticlePage = ({ data }) => {
  const posts = postsFromNodes(data.allMdx.edges);

  return (
    <div>
      <Tags />
      <Posts posts={posts} groupByYears={true} />
    </div>
  );
};

export const query = graphql`
  query {
    allMdx {
      edges {
        node {
          id
          frontmatter {
            date
            slug
            title
          }
        }
      }
    }
  }
`;

export const Head = () => <title>Articles</title>;

export default ArticlePage;

import { graphql } from "gatsby";
import * as React from "react";
import Posts from "../components/Posts";
import Tags from "../components/Tags";

const ArticlePage = ({ data }) => {
  const posts = data.allMdx.nodes;

  return (
    <div>
      <Tags />
      <Posts posts={posts} groupByYears={true} />
    </div>
  );
};

export const query = graphql`
  query {
    allMdx(sort: { frontmatter: { date: DESC } }) {
      nodes {
        frontmatter {
          date
          slug
          title
        }
        id
      }
    }
  }
`;

export const Head = () => <title>Articles</title>;

export default ArticlePage;

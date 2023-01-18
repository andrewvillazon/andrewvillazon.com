import { graphql, Link } from "gatsby";
import * as React from "react";

const ArticlePage = ({ data }) => {
  return (
    <div>
      {/* {data.allMdx.nodes.map((node) => (
          <article key={node.id}>
            <h2>
              <Link to={`/${node.frontmatter.slug}`}>
                {node.frontmatter.title}
              </Link>
            </h2>
            <p>Posted: {node.frontmatter.date}</p>
          </article>
        ))} */}
      {data.allMdx.group.map((node) => {
        const year = node.fieldValue;
        const posts = node.nodes;

        return (
          <>
            <h1 key={year}>{year}</h1>
            {posts.map((node) => (
              <article key={node.id}>
                <h2>
                  <Link to={`/${node.frontmatter.slug}`}>
                    {node.frontmatter.title}
                  </Link>
                </h2>
                <p>Posted: {node.frontmatter.date}</p>
              </article>
            ))}
          </>
        );
      })}
    </div>
  );
};

export const query = graphql`
  query {
    allMdx {
      group(field: { fields: { year: SELECT } }) {
        fieldValue
        nodes {
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

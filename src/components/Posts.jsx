import { graphql, useStaticQuery, Link } from "gatsby";
import * as React from "react";

const Posts = ({ groupByYears = false, limit = null }) => {
  const data = useStaticQuery(graphql`
    query {
      allMdx(sort: { frontmatter: { date: DESC } }) {
        nodes {
          frontmatter {
            date
            slug
            title
          }
        }
      }
    }
  `);

  //   Setup the data to work with
  const posts = data.allMdx.nodes;
  const postLimit = limit ? Math.min(posts.length, limit) : posts.length;
  posts.length = postLimit;

  //   Re-organise if grouping by year
  if (groupByYears) {
    const postsByYear = {};

    posts.forEach((post) => {
      const year = new Date(post.frontmatter.date).getFullYear().toString();
      postsByYear[year] = [...(postsByYear[year] || []), post];
    });

    const years = Object.keys(postsByYear).reverse();

    return years.map((year) => (
      <>
        <h2 key={year}>{year}</h2>
        {postsByYear[year].map((node) => (
            <article key={node.id}>
              <h3>
                <Link to={`/${node.frontmatter.slug}`}>
                  {node.frontmatter.title}
                </Link>
              </h3>
              <p>Posted: {node.frontmatter.date}</p>
            </article>
          ))}
      </>
    ));
  } else {
    return (
      <div>
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
      </div>
    );
  }
};

export default Posts;

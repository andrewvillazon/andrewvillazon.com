import { Link } from "gatsby";
import * as React from "react";

const Posts = ({ posts, groupByYears = false }) => {
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
            <Link
              to={`/${node.frontmatter.slug}`}
              className="flex justify-between items-center py-3 border-b-2 border-nord-3"
            >
              <h2 className="text-lg">{node.frontmatter.title}</h2>
              <time>{node.frontmatter.date}</time>
            </Link>
          </article>
        ))}
      </div>
    );
  }
};

export default Posts;

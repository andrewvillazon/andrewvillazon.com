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
        <h2 className="text-3xl font-semibold mb-8 text-slate-900" key={year}>{year}</h2>
        <div className="mb-12">
          {postsByYear[year].map((node) => (
            <article key={node.id}>
              <Link
                to={`${node.fields.slug}`}
                className="flex justify-between items-center py-3 border-b border-gray-200"
              >
                <h2 className="text-lg text-slate-800 hover:text-blue-600 font-medium">{node.frontmatter.title}</h2>
                <time>{node.frontmatter.date}</time>
              </Link>
            </article>
          ))}
        </div>
      </>
    ));
  } else {
    return (
      <div>
        {posts.map((node) => (
          <article key={node.id}>
            <Link
              to={`${node.fields.slug}`}
              className="flex justify-between items-center py-3 border-b border-gray-200"
            >
              <h2 className="text-lg text-slate-800 hover:text-blue-600 font-medium">{node.frontmatter.title}</h2>
              <time>{node.frontmatter.date}</time>
            </Link>
          </article>
        ))}
      </div>
    );
  }
};

export default Posts;

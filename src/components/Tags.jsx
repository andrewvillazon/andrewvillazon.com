import { graphql, Link, useStaticQuery } from "gatsby";
import React from "react";
import kebabCase from "lodash/kebabCase";

const Tags = () => {
  const data = useStaticQuery(graphql`
    query {
      allMdx {
        group(field: { frontmatter: { tags: SELECT } }) {
          fieldValue
        }
      }
    }
  `);

  const tags = data.allMdx.group;

  return (
    <div>
      {tags.map((tag) => (
        <Link
          key={tag.fieldValue}
          to={`/tags/${kebabCase(tag.fieldValue)}`}
          className="font-semibold border rounded py-2 px-2 border-nord-0 mr-2"
        >
          {tag.fieldValue}
        </Link>
      ))}
    </div>
  );
};

export default Tags;

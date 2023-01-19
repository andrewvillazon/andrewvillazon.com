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

  console.log(tags);

  return (
    <div>
      {tags.map((tag) => (
        <Link key={tag.fieldValue} to={`/tags/${kebabCase(tag.fieldValue)}`}>
          {tag.fieldValue}
        </Link>
      ))}
    </div>
  );
};

export default Tags;

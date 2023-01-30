import { Link } from "gatsby";
import React from "react";
import kebabCase from "lodash/kebabCase";

const Tags = ({tags}) => {
  return (
    <div>
      {tags.map((tag) => (
        <Link
          key={tag}
          to={`/tags/${kebabCase(tag)}`}
          className="font-semibold border rounded py-2 px-2 border-nord-0 mr-2"
        >
          {tag}
        </Link>
      ))}
    </div>
  );
};

export default Tags;

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
          className="font-semibold text-slate-700 border rounded py-2 px-2 border-slate-400 mr-2 bg-slate-100"
        >
          {tag}
        </Link>
      ))}
    </div>
  );
};

export default Tags;

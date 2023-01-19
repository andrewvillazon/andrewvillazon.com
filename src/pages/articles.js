import * as React from "react";

import Posts from "../components/Posts";
import Tags from "../components/Tags";

const ArticlePage = () => {
  return (
    <div>
      <Tags/>
      <Posts groupByYears={true} />
    </div>
  );
};

export const Head = () => <title>Articles</title>;

export default ArticlePage;

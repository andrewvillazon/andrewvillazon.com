import * as React from "react";

import Posts from "../components/Posts";

const ArticlePage = () => {
  return (
    <div>
      <Posts/>
    </div>
  );
};

export const Head = () => <title>Articles</title>;

export default ArticlePage;

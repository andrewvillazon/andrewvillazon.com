import React from "react"

import Introduction from "../components/introduction"
import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <Introduction />
  </Layout>
)

export default IndexPage

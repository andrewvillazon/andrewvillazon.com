import * as React from "react"
import { Link } from "gatsby"
import Layout from "../components/Layout"

const NotFoundPage = () => {
  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="mb-6 text-7xl font-extrabold tracking-tight">404</h1>
        <p class="text-2xl font-semibold mb-12">Page not found.</p>
        <p className="mb-8">Whoops. It looks like there's nothing here.</p>
        <p>
          <Link to="/" className="font-medium text-blue-600 hover:underline">
            Head home →
          </Link>
        </p>
      </div>
    </Layout>
  )
}

export default NotFoundPage

export const Head = () => <title>Not found</title>

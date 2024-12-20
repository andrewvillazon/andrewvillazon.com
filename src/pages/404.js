import * as React from "react"
import { Link } from "gatsby"
import Layout from "../components/Layout"
import { Seo } from "../components/Seo"

const NotFoundPage = () => {
  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="mb-5 text-5xl font-bold tracking-tight text-gray-700 dark:text-gray-300 md:text-7xl md:mb-7">404</h1>
        <p className="text-2xl text-gray-700 font-semibold mb-8 dark:text-gray-300 md:text-3xl md:mb-12">Page not found.</p>
        <p className="mb-8 text-base dark:text-gray-400 md:text-lg md:mb-12">Whoops. It looks like there's nothing here.</p>
        <p>
          <Link to="/" className="text-base font-medium text-sky-700 hover:underline dark:text-teal-500">
            Head home →
          </Link>
        </p>
      </div>
    </Layout>
  )
}

export default NotFoundPage

export const Head = () => <Seo title={"Page Not Found"} />

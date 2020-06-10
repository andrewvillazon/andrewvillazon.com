import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"

const AboutPage = () => (
    <Layout>
        <SEO title="About me" />
        <section>
            <h1>About me</h1>
            <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam, esse doloribus ipsa quas velit aperiam labore ipsam magni quaerat, accusantium in, incidunt voluptas dolorem. Rem consequatur nostrum eaque neque commodi?
            </p>
        </section>
        <section>
            <h2>About this site</h2>
            <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Reprehenderit, ipsa facere? Molestiae ducimus consectetur architecto fugiat! Voluptatem reiciendis aspernatur molestiae vitae quas neque officiis inventore dolores omnis voluptas, culpa commodi.
            </p>
        </section>
    </Layout>
)

export default AboutPage
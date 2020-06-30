import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import {Link} from "gatsby"

const AboutPage = () => (
    <Layout>
        <SEO title="About me" />
        <section>
            <h1>About me</h1>
            <p>
            I'm Andrew Villazon, a Data Professional. Day to day I write SQL and Python in a Data Warehouse environment. I also use tools like Tableau and PowerBI for Data Visualisation.
            </p>
        </section>
        <section>
            <h3>About this site</h3>
            <p>
                This site was built with <a href="https://www.gatsbyjs.org/">Gatsby</a> and styled with <a href="https://taniarascia.github.io/primitive/">Primitive</a>. 
            </p>
            <p>
                If you're interested in reading about the experience of working with Gatsby I documented it <Link to="/building-my-personal-site-in-gatsby/">here</Link>.
            </p>
            <p>
                The design of this site is heavily influenced by the design of <a href="https://www.taniarascia.com/">taniaracsia.com</a>, the author of Primitive. I hope she doesn't mind. I like the clean minimal design that really helps focus in on the content. I've never met Tania but have really enjoyed using her site and it's full of useful content.
        </p>
        </section>
    </Layout>
)

export default AboutPage
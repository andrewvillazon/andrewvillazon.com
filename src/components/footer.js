import React from "react"
import GatsbyLogo from "../components/gatsby-logo"
import "../styles/main.scss"

const Footer = () => (
    <footer>
        <div className="small-container">
            <div className="footer-container">
                <i class="fa fa-envelope" aria-hidden="true"></i>
                <i class="fa fa-github" aria-hidden="true"></i>
                <a id="gatsby-href" href="https://www.gatsbyjs.org/" title="Made with Gatsby" target="_blank" rel="noreferrer">
                    <GatsbyLogo />
                </a>
            </div>
        </div>
    </footer>
)

export default Footer
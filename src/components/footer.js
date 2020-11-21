import React from "react"
import GatsbyLogo from "../components/gatsby-logo"
import Octocat from "../components/octocat"

const Footer = () => (
    <footer className="footer">
        <div className="small-container">
            <div className="footer-container">
                <div>
                    &copy; 2020 Andrew Villazon
                </div>
                <div className="footer-right">
                    <a className="footer-logo" href="https://github.com/andrewvillazon" title="See the source code for this site and more on my GitHub!" target="_blank" rel="noreferrer">
                        <Octocat />
                    </a>
                    <a className="footer-logo" href="https://www.gatsbyjs.org/" title="Made with Gatsby!" target="_blank" rel="noreferrer">
                        <GatsbyLogo />
                    </a>
                </div>
            </div>
        </div>
    </footer>
)

export default Footer
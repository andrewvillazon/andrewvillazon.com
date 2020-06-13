import React from "react"
import { Link } from "gatsby"
import "../styles/styles.scss"

const Footer = () => (
    <footer className="footer" id="page-footer">
        <div className="container">
            <span className="icon is-medium mr-5">
                <Link to="/contact/">
                    <i className="fa fa-envelope fa-2x has-text-grey-darker"></i>
                </Link>
            </span>
            <span className="icon is-medium mr-5">
                <a href="https://github.com/andrewvillazon">
                    <i className="fa fa-github fa-2x has-text-grey-darker"></i>
                </a>
            </span>
        </div>
    </footer>
)

export default Footer
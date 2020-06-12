import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"
import "../styles/styles.scss"

const Header = ({ siteTitle }) => (
  <nav className="navbar is-white">
    <div className="container">
      <div className="navbar-brand">
        <Link to="/" className="navbar-item">{siteTitle}</Link>
      </div>
      <div className="navbar-end">
        <div className="navbar-item">
          <div className="buttons">
            <Link to="/blog/" className="button is-white">Articles</Link>
            <Link to="/about/" className="button is-white">About</Link>
            <Link to="/contact/" className="button is-white">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  </nav>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header

import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"

const Header = ({ siteTitle }) => (
  <nav className="navigation">
    <div className="small-container">
      <div className="nav-container">
          <Link to="/">{siteTitle}</Link>
        <div className="nav-links">
          <Link to="/articles/" className="button">Articles</Link>
          <Link to="/about/" className="button">About</Link>
          <Link to="/contact/" className="button">Contact</Link>
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

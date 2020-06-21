import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"

const Header = ({ siteTitle }) => (
  <nav>
    <div className="small-container">
      <div className="nav-container">
        <h2>
          <Link to="/">{siteTitle}</Link>
        </h2>
        <div className="nav-links">
          <Link to="/articles/" className="nav-link">Articles</Link>
          <Link to="/about/" className="nav-link">About</Link>
          <Link to="/contact/" className="nav-link">Contact</Link>
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

import React from "react"
import {Link} from "gatsby"
import githublogo from "../images/GitHub-Mark-32px.png"
import gatsbylogo from "../images/Gatsby_Monogram_Black.png"

const Footer = () => (

<footer>
<div class="container">
  <div class="flex footer-nav">
      <nav class="flex">
        {/* Internal Links */}
          <Link to="/">Home</Link>
          <Link to="/articles/">Articles</Link>
          <Link to="/about/">About</Link>
          <Link to="/contact/">Contact</Link>
      </nav>
      {/* External Links */}
      <nav class="flex">
            <a href="#"
              ><img
                src={githublogo}
                alt="See the source code for this site and more on my GitHub!"
            /></a>
            <a href="#"
              ><img
                src={gatsbylogo}
                width="32px"
                height="32px"
                alt="Made with Gatsby!"
            /></a>
      </nav>
  </div>
  <p>&copy; Andrew Villazon 2020</p>
</div>
</footer>
)

export default Footer
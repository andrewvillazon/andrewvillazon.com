import * as React from "react";
import { Link } from "gatsby";
import Navigation from "../components/Navigation";
import Layout from "../components/Layout";

const IndexPage = () => {
  return (
    <Layout>

      <section>
        <div className="container mx-auto">
          <h1>Hi, I'm Andrew.</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur,
            odit necessitatibus? In minus nulla hic aliquam eaque! Magnam
            voluptate quod commodi aperiam possimus! Placeat porro odit
            quibusdam suscipit accusamus corrupti!
          </p>
          <p>Iusto, nobis accusantium omnis veniam tempore nesciunt ad.</p>
        </div>
      </section>

      <section>
        <div className="container mx-auto">
          <div>
            <h2>Latest</h2>
            <a href="#">View All</a>
          </div>
          <article>
            <a href="#">
              <div>
                <h3>
                  Sed tristique erat eget eros malesuada, at dictum mi
                  vulputate.
                </h3>
                <time>16 Jan</time>
              </div>
            </a>
          </article>
          <article>
            <a href="#">
              <div>
                <h3>Pellentesque pretium vulputate velit ac luctus.</h3>
                <time>17 Jan</time>
              </div>
            </a>
          </article>
          <article>
            <a href="#">
              <div>
                <h3>In porta vulputate condimentum.</h3>
                <time>16 Jan</time>
              </div>
            </a>
          </article>
          <article>
            <a href="#">
              <div>
                <h3>
                  Proin ex mauris, placerat condimentum maximus ut, faucibus non
                  lorem.
                </h3>
                <time>16 Jan</time>
              </div>
            </a>
          </article>
          <article>
            <a href="#">
              <div>
                <h3>Vivamus accumsan orci quis quam feugiat lacinia.</h3>
                <time>16 Jan</time>
              </div>
            </a>
          </article>
        </div>
      </section>

      <section>
        <div className="container mx-auto">
          <h2>Explore</h2>
          <div>
            <a href="#">Python</a>
            <a href="#">SQL Server</a>
            <a href="#">Snippets</a>
            <a href="#">Github</a>
            <a href="#">Gatsby</a>
            <a href="#">Discussion</a>
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto">
          <div>
            <h2>Projects</h2>
          </div>
          <div>
            <div>
              <a href="#">pbipy</a>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              <div>
                <a href="#">Source</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <footer>
          <div className="container mx-auto">
            <nav>
              <a href="#">Home</a><a href="#">About</a><a href="">Contact</a><a href="#">Github</a>
            </nav>
            <div>&copy; Andrew Villazon 2020</div>
          </div>
        </footer>
      </section>
    </Layout>
  );
};

export default IndexPage;

export const Head = () => <title>Home Page</title>;

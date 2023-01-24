import * as React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/Layout";
import Posts from "../components/Posts";

const IndexPage = ({ data }) => {
  const latestPosts = data.allMdx.nodes;

  return (
    <Layout>
      <section>
        <div className="container mx-auto pr-72">
          <h1 className="mb-8 text-6xl font-extrabold tracking-tight">
            Hi, I'm Andrew.
          </h1>
          <p className="text-xl mb-6">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur,
            odit necessitatibus? In minus nulla hic aliquam eaque! Magnam
            voluptate quod commodi aperiam possimus! Placeat porro odit
            quibusdam suscipit accusamus corrupti!
          </p>
          <p className="text-xl mb-6">
            Iusto, nobis accusantium omnis veniam tempore nesciunt ad.
          </p>
        </div>
      </section>

      <section>
        <div className="container mx-auto mt-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-semibold">Latest</h2>
            <Link
              to={"/articles"}
              className="bg-nord-3 text-nord-6 font-bold py-2 px-4 rounded"
            >
              View All
            </Link>
          </div>
          <div>
            <Posts posts={latestPosts} />
          </div>
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
              <a href="#">Home</a>
              <a href="#">About</a>
              <a href="">Contact</a>
              <a href="#">Github</a>
            </nav>
            <div>&copy; Andrew Villazon 2020</div>
          </div>
        </footer>
      </section>
    </Layout>
  );
};

export const query = graphql`
  query {
    allMdx(limit: 5, sort: { frontmatter: { date: DESC } }) {
      nodes {
        frontmatter {
          date
          slug
          title
        }
        id
      }
    }
  }
`;

export default IndexPage;

export const Head = () => <title>Home Page</title>;

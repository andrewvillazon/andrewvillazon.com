import React, { Component } from 'react'
import { Link } from 'gatsby'

class PostListing extends Component {
    getPostList() {
        const { postEdges } = this.props;
        const postList = [];

        postEdges.forEach(postEdge => {
            postList.push({
                path: postEdge.node.fields.slug,
                title: postEdge.node.frontmatter.title,
                date: postEdge.node.frontmatter.date,
            });
        });

        return postList;
    }

    render() {
        const postList = this.getPostList();

        return (
            <div>
                {
                    postList.map(post => (
                        <article className="post-list-item">
                            <Link to={post.path} key={post.title}>
                                <h2>{post.title}</h2>
                                <div className="post-date"><time>{post.date}</time></div>
                            </Link>
                        </article>
                    ))}
            </div>
        )
    }
}

export default PostListing
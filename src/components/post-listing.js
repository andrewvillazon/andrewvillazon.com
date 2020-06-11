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
                        <article>
                            <Link to={post.path} key={post.title}>
                                <h4>{post.title}</h4>
                            </Link>
                        </article>
                    ))}
            </div>
        )
    }
}

export default PostListing
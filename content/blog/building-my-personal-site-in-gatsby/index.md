---
title: "Building my personal site in Gatsby without web development experience"
date: "2020-07-01"
tags:
    - Gatsby
---

Earlier this year I wanted to try something a bit different and create a personal website. Before this project I had tinkered with HTML, CSS, and JavaScript but had no real web development experience to speak of.

I chose to build the site with the Static Site Generator [Gatsby](https://www.gatsbyjs.org/) which, looking back, probably seemed like an odd choice without web development experience. This article reflects on what the experience was like.

### Choosing Gatsby

These are the main reasons I chose Gatsby:

#### Static content

Listening to the [Syntax podcast](https://syntax.fm/) one day they were discussing Static Site Generators (SSG). Tools that help generate static html. At first it seemed a bit strange, almost primitive. Generate static HTML in this era of ubiquitous web apps? But the more I thought about it the more it made sense. Afterall what more is a blog other than static content?

Essentialy with a Static Site Generator pages are built in advance and don't originate in a back-end at request time.

The appeal of this approach is there's less moving parts. No back-end configuration, no database, and less security to consider (famous last words).

#### Speed

What stands out when you encounter a Gatsby site is how fast it feels. There's a real 'snap' to the page loading. It's a nice alternative to the modern web experience.

Gatsby does a bunch of cool things like pre-fetch data and predict where the next page request will come from. It's hard to believe that  website can be that fast.

#### Blog posts as Markdown

However what really caught my attention was the ability to store content as Markdown and have Gatsby turn it into pages.

I liked this for a couple of reasons. Firstly you can store your posts as an '.md' file in your project and secondly if you're developing with git you can use it to version control your content. A kind of rudementary form of content management.

### The development experience

As someone without web dev experience when they began I found the development experience to be pretty smooth. There were moments of frustration of course (why are there 50 different ways to define a component?!) but on the whole it was a positive experience.

The process I followed was based on the [official tutorial](https://www.gatsbyjs.org/tutorial/ "Gatsby Official Tutorial"). Here are some of the highlights:

#### The Gatsby approach

Gatsby seemed a little vague at first but it quickly became intuitive. Gatsby's approach is something like this: 
* You have data you want to put into a site e.g. in text files or a database, etc.
* via plugins, Gatsby provides the means to injest your data into it's GraphQL database
* from there you can query and combine your data with HTML using React components
* then you take those components and combine them into a static site.

Once I understood this process development became relatively straightforward.

#### Modularity with React

I really liked working in [React](https://reactjs.org/).

How I understand React is you break up a website into self-contained components which have data, JavaScript, and HMTL. A component can be just about anything, a nav bar, an image, a list of items. Components can be composed of other components and pass data between them. You then construct your site using these components and React handles rendering out the HTML.

This approach feels very natural if you're familiar with a programming language like Python where you compose an application from packages, modules, and classes. In fact a React component feels very much like a class which represents a part of a site and knows how to render itself as HTML.

#### Plugins! Lots of Plugins.

Extending the site and adding new features was simple with Gatsby's massive plugin library. It's not an exaggeration to say there are thousands of plugins. If I wanted to add a feature to the site I always ended up with a plugin.

As well as the plugins that went with the offical tutorial I also used:
* [gatsby-remark-prismjs](https://www.gatsbyjs.org/packages/gatsby-remark-prismjs/) - code block formatting using prismjs
* [gatsby-remark-autolink-headers](https://www.gatsbyjs.org/packages/gatsby-remark-autolink-headers/) - automatically adds links to header tags
* [gatsby-plugin-sass](https://www.gatsbyjs.org/packages/gatsby-plugin-sass/) - enables the use of SASS for css styling and management

#### Documentation

The Gatsby documentation was a super useful resource throughout and is a credit to the project. 

You don't really need a lot of web development experience to get the most out of the docs and the offical tutorial is based around building a blog which was perfect for this project.

## It would've been useful to know...

I'm reluctant to say that you should know XYZ before using Gatsby but there's a few things that, had I known them, it would've made development easier:

* HTML, CSS, and JavaScript
* Modern JavaScript, ES6 syntax and object destructuring
* [React](https://reactjs.org/)
* GraphQL
* npm, packages, and JavaScript build tools
* How modern web projects are built

## Conclusion

Overall I'm very happy with how the site turned out. 

I put this site together in just over a month working on it for a couple hours each evening. Two weeks of that was learning how to set everything up in Gatsby while the remainder was spent in HTML and CSS. The actual challenge has been figuring out the modern web development eco system.

I've managed to create a 'set and forget' platform where new content is as simple as creating a Markdown file and running a site build. Now I just need to get writing...

If you're considering a personal site definately take a look at [Gatsby](https://www.gatsbyjs.org/)!
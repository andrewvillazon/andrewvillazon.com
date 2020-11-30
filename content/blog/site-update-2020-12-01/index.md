---
title: "Site update: November 2020"
date: "2020-11-30"
tags:
    - Site
---

For the past few weeks, I've taken a break from posting to work on an assortment of site changes.

What started as a bit of experimentation morphed into a rework of the site. I learned a ton along the way, taking leaps forward in **CSS** and using more [Gatsby](https://www.gatsbyjs.com/docs/plugins/) features.

## What's changed?

### Single stylesheet

Initially, with limited CSS knowledge and wanting to get going, I opted to use a [CSS framework](https://taniarascia.github.io/primitive/). 

The framework did the job, but CSS is something I've always wanted to understand more. To speed up the process, I decided to convert the site to a single stylesheet.

CSS started to click when I looked at these concepts:
* **The cascade and specificity**: Knowing how CSS applies rules to each element. What does CSS do when two or more rules can apply to the same element?
* **Selectors**: Target elements for styling by being general and specific.
* **Organizing CSS**: Ways of writing CSS so that it's efficient and easy to maintain. Specifically, [BEM](http://getbem.com/introduction/) and [OOCSS](https://www.slideshare.net/stubbornella/object-oriented-css) methodologies.

### Markdown site pages

If you follow the [Gatsby Tutorial](https://www.gatsbyjs.com/tutorial/), you'll create your site pages as JavaScript files and your blog posts pages from [Markdown](https://daringfireball.net/projects/markdown/syntax).

However, it's also possible to use the same method to create site pages from Markdown.

To do this involved:
1. Adding the site pages or content directory to the `gatsby-source-filesystem` plugin. Doing this makes any `.md` content in the directories visible to the `gatsby-transformer-remark` plugin.
2. Because the `.md` files are visible to the plugin, slugs are created and added to both blog post and site content nodes.
3. Create a template for rendering site content.
4. Filter for site or blog content and use the appropriate template to generate each page.

Markdown site content is useful for text-heavy content like my [About Page](/about/). I can define a site content as Markdown, then have Gatsby create the page and render the HTML.

### Layout changes

I decided to tweak the layout and made the following changes:
* Use [8pt grid](https://spec.fm/specifics/8-pt-grid), a design system that uses **multiples of 8** to define a site's dimensions. **8pt grid** works quite well and doesn't require too much thinking to get a consistent site layout.
* Sticky Nav is gone. I like [Sticky Navs](https://www.w3schools.com/howto/howto_js_navbar_sticky.asp) on other sites, but here I don't think it adds much. 
* Include useful links in the Footer.
* Use a [Dark Theme](https://github.com/sdras/night-owl-vscode-theme) for code blocks to improve the separation of article text and code samples.

## In the pipeline

* **Dark Mode**: Implement a toggle to change the site colors and [experiment](https://www.gatsbyjs.com/blog/2019-01-31-using-react-context-api-with-gatsby/) with Themes.
* **Responsive Layout**: Mobile-first is conventional wisdom. This site's design breaks down at smaller screen sizes, and this is another area of CSS I'd like to learn.


## Final thoughts

**50+** commits later, and I'm pretty happy with the result. There are still some things to fix, but as the saying goes - **progress over perfection!**
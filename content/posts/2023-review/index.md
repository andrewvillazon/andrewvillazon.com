---
title: "2023 Year in review"
date: "2024-01-19"
tags:
    - Site
---

With 2023 all but over, it's time to reflect on the past year's highlights.

## Publishing

2023 was another quiet year for the Blog, with my spare time taken up by other projects and learning. I'm content with publishing when inspiration strikes.

Despite the writing taking a back seat to other things, I still managed to complete three articles. In reverse chronological order:

* [Connect SQLAlchemy and Databricks](/connect-databricks-sqlalchemy)
* [Replacing multiple UNION ALLs with a Temporary Table](/replacing-multiple-union-all-with-temp-table)
* [Understanding file paths in Databricks](/file-paths-databricks)

## Data Engineer

At the start of Q4, 2023, I changed roles and became a **Data Engineer**. The switch sees me taking on tasks like landing data, building pipelines, and Data Platform maintenance.

The technology stack includes tooling such as [Terraform](https://www.terraform.io), [Databricks](https://www.databricks.com/), and [dbt](https://www.getdbt.com/). I'm looking forward to learning a heap of new and exciting things.

## Site revamp

While the site visually remains unchanged, there were a few internal changes—the most significant being a switch to [Tailwind CSS](https://tailwindcss.com/) for styling.

I don't use CSS enough to know how to use it well, so Tailwind is a good alternative that is relatively straightforward to use and does most of what's needed without being too granular.

## Published an open-source library

Late In 2022, I started working on [pbipy](https://github.com/andrewvillazon/pbipy), a **Python library** for interacting with the Power BI Rest API. The library was created to let users perform tasks on their Power BI instances using Python as an alternative to [Powershell](https://learn.microsoft.com/en-us/powershell/power-bi/overview?view=powerbi-ps) scripts.

Its design was influenced by the experience of using the [Jira Python library](https://github.com/pycontribs/jira) and Wynn Netherland's 2009 article, [What makes a good API wrapper?](https://wynnnetherland.com/journal/what-makes-a-good-api-wrapper)

In 2023, I spent a good chunk of my spare time developing the library further and published it to [pypi](https://pypi.org/project/pbipy/), which makes it widely available using `pip install pbipy`. It's been a fantastic learning experience for understanding both code design and the development process.

The code lives on [GitHub](https://github.com/andrewvillazon/pbipy), which means being able to receive feedback from users, and it's been great to see bugs discovered and questions asked, which all help to improve the library. The library is getting consistent views, new visitors, and even the occasional star, which tells me that others are finding it and getting some value from it.

## Thoughts on 2024

Here are a few things I'm thinking about for the coming year (in no particular order):

* Responsive and mobile support for the site (long overdue)
* Explore [Pelican](https://docs.getpelican.com/en/latest/index.html) or [Nextjs](https://nextjs.org/) for future iterations of the site
* Collect a few of the SQL query tips I've learned over the years
* Keep extending and maintaining pbypi
* Databricks and Spark

Thanks for reading in **2023**!
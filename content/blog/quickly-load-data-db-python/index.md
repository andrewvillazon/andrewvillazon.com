---
title: "Use Python to quickly load lots of data to a Database"
date: "2020-11-11"
tags:
    - Python
---

In this post, I'm going walk through a way to quickly move a large amount of data to a Database using Python.

This post came from a project requirement to read around 20 million JSON records and load their contents to a SQL Server Database.

*Prerequisites*

I'm going to assume a couple of things:
* First, you're somewhat familiar with Python and some concepts like using modules, importing libraries, and common data structures.
* You're familiar with using Python to move data to a Database and using Database connectors.
* Lastly, I will assume the destination Database is an enterprise-level Relational Database such as Postgres or SQL Server. These have features that are helpful for loading data quickly, such as concurrency and multiple connections.

This post intends to walk through an approach to a problem rather than provide a tutorial.

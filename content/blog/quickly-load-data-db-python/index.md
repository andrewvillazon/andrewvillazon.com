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

## The challenges of lots of data

There are two main challenges when moving large volumes of data to a Database.

1. **Time** - An operation, such as inserting a record, may take microseconds but can add up to minutes or hours when performed millions of times.
2. **Memory** - If a dataset's size is more than our available RAM, we're not going to be able to put it all in a list and process it.

In this post, we'll explore how to deal with these challenges.

## Going faster

Before we look at code, let's explore some ways to go faster when loading data to a Database.

#### Threads

Repeatedly performing the same action on data is a good hint that the task could benefit from concurrency, namely Threads.

Threading allows us to break up a task into chunks of work and execute them concurrently instead of sequentially. We can do more work in the same amount of time.

#### Avoiding Bottlenecks

Inserting one row at a time might only take a microsecond but adds up if done millions of times.

To maximize speed, we'll commit the maximum records possible in a single Database transaction. The specific INSERT statement used is called a Multi-row Insert.

#### Raw SQL

Usually, it makes sense to use an ORM (Object Relational Mapper) to interact with a Database in Python.  However, creating thousands or millions of ORM specific objects adds overhead we could avoid.

Instead, raw SQL will be built from the data and executed with the Database API.

Let's take a look at the code.
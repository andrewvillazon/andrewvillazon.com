---
title: "6 lessons from a Machine Learning project"
date: "2022-05-26"
tags:
    - Discussion
---

Machine Learning is a lot of fun, but it's not always straightforward and can be complex and sometimes messy. This post aims to reflect on some of the key learnings I took from recent work on a Machine Learning project.

Information about the practice of Machine Learning doesn't always get the attention it should. Hopefully, these thoughts give some insight that the practitioner finds useful.

### The project

The goal of this project was to develop Machine Learning models that could usefully predict Hospital Admissions from the Emergency Department of a tertiary Hospital. The purpose being to give Hospital managers advanced notice of incoming pressures on Hospital capacity.

I've been the sole practitioner on the project and responsible for every aspect, from data engineering to predictive modeling to deployment. It's been a steep learning curve, at times frustrating and slow, but ultimately a very satisfying project to have worked on.

Now, onto the lessons learned.

## Know your data

The recommended first step in most Data Science tutorials is Exploratory Data Analysis (EDA), typically done with data visualizations. EDA is helpful, but arguably more essential is developing a detailed understanding of your data.

That means drilling deeper into the context of your data, trying to understand these kinds of things:

* How is data entered? Is it a machine or a person?
* Who enters data? How do they make decisions about what they enter?
* What are the rules that govern data entry?
* Why would a feature contain missing data?
* Is the data or feature reliable? Is it subject to change over time?

Real-world data comes from Information Systems, and those Information Systems aren't always built to help you do Machine Learning.

When you know the data, it can help to speed up development. For example, it's easy to drop a feature knowing it's unreliable rather than wasting time searching for a signal that isn't there.

It's also essential to have access to a Domain Expert who can help you along the way. Domain Experts can help you understand what's happening in the data, direct you to valuable features, and also help to validate your models.

## Don't underestimate the "Data Work"

>"80% of a project is spent on data wrangling."
>
> <cite>Common Data Science trope</cite>

If you hang around Machine Learning long enough, you'll run into some variation of this classic quote. 80% seems wildly exaggerated, but the important message is that a lot of time gets spent on data.

While the quote is probably directed at data cleansing, it's also essential to think about Data Management - the collection, organizing, and accessing of the data you'll use for modeling.

It involves thinking about the following:

* How do you source the data? Is it coming from a single source or multiple different sources?
* How diverse are those sources, e.g., a spreadsheet, a rest API, or a Database?
* Do you load raw data into a single repository, say a Database, and shape it from there? Or do you do the work in, say, Python?
* How will you organize and coordinate data collection?
* Will it be easy to bring in new data?

When Data Management is good, it's easy to add new data, and updating your Data is simple. Managing the data well also means more time and resources to put into activities that improve model performance.

## Pay attention to Technical Debt

Technical Debt is the idea that there is a cost to choosing an "easy" solution now instead of a better approach that takes longer. Working with code, you'll inevitably encounter times where you'll accrue Technical Debt, and a Machine Learning project is no different.

Throwaway code and quick solutions have a habit of becoming embedded. Before you know it, your project is difficult to change, breaks easily (brittle), or needs significant amounts of rework to make progress.

A little upfront thinking and planning can go a long way to mitigating Technical Debt. It's helpful to step back and ask questions such as:

* How easy will this be to change?
* Can I build on this without much difficulty? e.g., will it be easy to add new data to an existing dataset or into an existing pipeline?
* Is this the right place to be doing this? e.g., does it make sense to do data transformations in SQL, or better to do them in Python?
* What Tools are available to manage complexity e.g., scikit-learn Pipelines and Transformers?

For a detailed discussion on the kinds of Technical Debt that can come with Machine Learning, see: [Machine Learning: The High-Interest Credit Card of Technical Debt](https://research.google/pubs/pub43146/) by the Google Research Team, which is well worth a read.

## Make decisions to make progress

One of the most enjoyable aspects of Machine Learning is how deep and varied the subject is. There are many different models, transformations, variables selection methods, tuning methods, technologies, etc.

Given that the field is so deep and varied, it can be tempting to try many different things hoping that it will improve performance, e.g., an unexplored model, encoding categoricals differently, etc.

Endlessly trying additional things, often taking a lot of time, and finding more or less the same results, means you're not advancing towards completion.

To break out of this loop, it's helpful to decide if performance is "good enough" and move into the next stage of development. If trying different things isn't generating improvement, but the model is useful, then it's probably worth getting it to your customer.

The idea of "good enough" is closely related to the next point.

## Target the Minimum Viable Model

The Minimum Viable Model (MVM) is the Machine Learning equivalent of the Minimum Viable Product. Like the MVP, an MVM is a model that is just good enough to provide value for its users for the least amount of effort.

Defining "good enough" is something negotiated with your customer or end-user, but the characteristics of an MVM could include simple models, a small feature set, minimal tuning, etc.

By targeting a Minimum Viable Model, we aim to realize the value of a "good enough" model sooner rather than going without while waiting for the optimal model. Over time the MVM is steadily built upon until finally arriving at an optimal model.

## Exciting results are not guaranteed

> "Exciting results are what everyone wants to find, but they're not exactly guaranteed."

Lastly, this quote was something that I came across on StackOverflow, and it succinctly captures what can happen on a Machine Learning project.

Perhaps you'll get excellent results, perhaps your models will be marginally better than a random guess, or perhaps somewhere in the middle. But sometimes, that's what it's like trying to solve real-world problems with real-world data.

Thanks for reading.

## Further Reading

* [Machine Learning in Practice](https://medium.com/machine-learning-in-practice)
* [What is CRISP DM?](https://www.datascience-pm.com/crisp-dm-2/)
* [Machine Learning: The High-Interest Credit Card of Technical Debt](https://research.google/pubs/pub43146/)
* [Full Stack Deep Learning Lecture 8: Data Management](https://fullstackdeeplearning.com/spring2021/lecture-8/)

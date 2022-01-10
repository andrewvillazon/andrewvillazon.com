---
title: "Creating custom scikit-learn Transformers"
date: "2022-01-17"
tags:
    - Python
---

In scikit-learn, Transformers are objects that transform a dataset into a new one to prepare the dataset for predictive modeling, e.g., scaling numeric values, one-hot encoding categoricals, etc.

While scikit-learn has many standard Transformers, it's often helpful to create our own. In this post, we'll look at how to create custom Transformers that operate like scikit-learn Transformers.

Before looking at Custom Transformers, here are a couple of things worth being familiar with:
* Using scikit-learn Transformers and using Transformers in Pipelines.
* Creating classes and inheritance.
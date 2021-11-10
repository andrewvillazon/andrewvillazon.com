---
title: "Logistic Regression in Python with statsmodels"
date: "2021-11-15"
tags:
    - Python
---

In this post, we'll look at performing Logistic Regression in Python with the statsmodels package.

First, we'll look at the different ways to do Logistic Regression in statsmodels and inspect the results. Then we'll look at some of the other things you might do with a Logistic Regression, such as accessing the model parameters, calculating odds ratios, and setting reference levels for categorical variables. 

Note that we won't cover using statsmodels Logistic Regression to make predictions (e.g., in a Machine Learning context). Instead, we'll cover using it as a tool for data exploration.

## What is the statsmodels package?

statsmodels is a Python package orientated towards data exploration with statistical methods. It provides a wide range of statistical models, tests, plotting functions, etc.

Notably, it supports the standard data analysis tools associated with Python, such as NumPy and Pandas, and can use the "R-style" formula specifications for fitting models.

### Installing

The easiest way to install statsmodels is via pip:

```bash
pip install statsmodels
```
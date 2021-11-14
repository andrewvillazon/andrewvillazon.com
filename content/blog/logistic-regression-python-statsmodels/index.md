---
title: "Logistic Regression in Python with statsmodels"
date: "2021-11-15"
tags:
    - Python
---

[Logistic Regression](https://www.ibm.com/topics/logistic-regression) is a relatively simple, powerful, and fast statistical model and an excellent tool for Data Analysis. In this post, we'll look at Logistic Regression in Python with the [statsmodels](https://www.statsmodels.org/stable/index.html) package.

We'll look at how to fit a Logistic Regression to data, inspect the results, and related tasks such as accessing model parameters, calculating odds ratios, and setting reference values.

For this post, I'm going to assume a couple of things:
* Basic knowledge of Python.
* Familiar with popular data libraries like Pandas and NumPy.
* Have an understanding of Logistic Regression and associated statistical modeling terms such as coefficients and parameters.

If you're unfamiliar with Logistic Regression, I highly recommend starting with the [Logistic Regression Playlist](https://youtube.com/playlist?list=PLblh5JKOoLUKxzEP5HA2d-Li7IJkHfXSe) from [StatQuest with Josh Starmer](https://www.youtube.com/c/joshstarmer) on YouTube.

## Overview

```toc
exclude: ["Overview"]
from-heading: 2
to-heading: 3
```

## What is statsmodels?

[statsmodels](https://www.statsmodels.org/stable/index.html) is a Python package geared towards data exploration with statistical methods. It provides a wide range of statistical tools, integrates with Pandas and NumPy, and uses the **R-style** formula strings to define models.

### Installing

The easiest way to install statsmodels is via **pip**:

```bash
pip install statsmodels
```

## Logistic Regression with statsmodels

Before starting, it's worth mentioning there are **two** ways to do Logistic Regression in statsmodels:

* `statsmodels.api`: The Standard API. Data gets separated into explanatory variables ([exog](https://www.statsmodels.org/devel/endog_exog.html)) and a response variable ([endog](https://www.statsmodels.org/devel/endog_exog.html)). Specifying a model is done through classes.
* `statsmodels.formula.api`: The Formula API. It uses the R-style formula syntax and dataframes.

For this guide, I've opted to use the **Formula API**. The Formula API is a more convenient way of building models that abstracts away the boilerplate required by the Standard API. 

Under the hood, both the Standard and Formula APIs use the same underlying models.

### Imports

First we need import Pandas and the statsmodels Formula API. Convention is to alias `statsmodels.formula.api` to `smf`.

```python
import pandas as pd
import statsmodels.formula.api as smf
```

### Load data

Next, we'll load some data. We'll use a subset of the data and drop rows with missing values to keep things simple.

```python
titanic = pd.read_csv("titanic.csv")
titanic = titanic[["survived", "pclass", "sex", "age", "embark_town"]]
titanic = titanic.dropna()
```

The data we're using is the [seaborn](https://seaborn.pydata.org/) version of the Titanic Dataset and can be downloaded [here](https://raw.githubusercontent.com/mwaskom/seaborn-data/master/titanic.csv). The seaborn version is a minimal dataset with some pre-processing applied.

### Fitting a Logistic Regression

Fitting is a two-step process. First, we **specify** a model, then we **fit**. Typically the `fit()` call is chained to the model specification.

The string provided to logit, `"survived ~ sex + age + embark_town"`, is called the formula string and defines the model to build. 

```python
log_reg = smf.logit("survived ~ sex + age + embark_town", data=titanic).fit()
```
We read the formula string as *"survived given (~) sex and age and emark town"* —an explanation of formula strings can be found [below](#what-happens-with-formula-strings-patsy-and-design-matrices).

### Examining fit results

Lastly, we can inspect the results of the fit using the `summary()` method. The summary includes information on the fit process as well as the estimated coefficients.

```
Optimization terminated successfully.
         Current function value: 0.509889
         Iterations 6
                           Logit Regression Results                           
==============================================================================
Dep. Variable:               survived   No. Observations:                  712
Model:                          Logit   Df Residuals:                      707
Method:                           MLE   Df Model:                            4
Date:                Fri, 12 Nov 2021   Pseudo R-squ.:                  0.2444
Time:                        09:59:50   Log-Likelihood:                -363.04
converged:                       True   LL-Null:                       -480.45
Covariance Type:            nonrobust   LLR p-value:                 1.209e-49
==============================================================================================
                                 coef    std err          z      P>|z|      [0.025      0.975]
----------------------------------------------------------------------------------------------
Intercept                      2.2046      0.322      6.851      0.000       1.574       2.835
sex[T.male]                   -2.4760      0.191    -12.976      0.000      -2.850      -2.102
embark_town[T.Queenstown]     -1.8156      0.535     -3.393      0.001      -2.864      -0.767
embark_town[T.Southampton]    -1.0069      0.237     -4.251      0.000      -1.471      -0.543
age                           -0.0081      0.007     -1.233      0.217      -0.021       0.005
==============================================================================================
```

The `summary()` method has some helpful features explored further [below](#customizing-the-fit-summary).

### In-full

Here's our minimal example in full.

```python
import pandas as pd
import statsmodels.formula.api as smf


# Load data
titanic = pd.read_csv("titanic.csv")
titanic = titanic[["survived", "pclass", "sex", "age", "embark_town"]]
titanic = titanic.dropna()

# Define and fit model
log_reg = smf.logit("survived ~ sex + age + embark_town", data=titanic).fit()

# Summary of results
print(log_reg.summary())
```

## Advanced Usage

Here we'll look at some of the more advanced features of statsmodels and its Logistic Regression implementation.

### Accessing model parameters

In statsmodels, the `fit()` method returns a `Result` object. The model coefficients, standard errors, p-values, etc., are all available from this `Result` object.

Conveniently these are stored as Pandas dataframes with the parameter name as the dataframe index.

```python
# ... imports, load data, etc.

# Define and fit model
log_reg = smf.logit("survived ~ sex + age + embark_town", data=titanic).fit()

# Inspect paramaters
print(log_reg.params)
```

```
Intercept                     0.321796
sex[T.male]                   0.190807
embark_town[T.Queenstown]     0.535031
embark_town[T.Southampton]    0.236857
age                           0.006550
dtype: float64
```

Here are some of the relevant values for a Logistic Regression.

| Attr/func | Description |
|---|---|---|
| `params`  | Estimated model parameters. Appears as `coef` when calling `summary()` on a fitted model. |
| `bse` | Standard error. |
| `tvalues` | `z` column when calling `summary()` on a fitted model. |
| `pvalues` | Model's p values. |
| `conf_int(alpha)` | Method that calculates the confidence interval for the estimated parameters. To call: `model.conf_int(0.05)` |

To see the complete list of available attributes and methods, use Python's built-in `dir()` function on the fitted model.

```python
print(dir(log_reg))
```

### Calculating Odds Ratios

After fitting a Logistic Regression, you'll likely want to calculate the [Odds Ratios](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2938757/) of the estimated parameters. As mentioned above, everything we need is available from the `Results` object that comes from a model fit.

Here we take the estimated parameters and confidence intervals, combine them into a dataframe and apply NumPy's `exp()` function to the whole dataframe.

```python
# ... imports, load data, etc.
import numpy as np

# ... Define and fit model

odds_ratios = pd.DataFrame(
    {
        "OR": log_reg.params,
        "Lower CI": log_reg.conf_int()[0],
        "Upper CI": log_reg.conf_int()[1],
    }
)
odds_ratios = np.exp(odds_ratios)

print(odds_ratios)
```

```
                                  OR  Lower CI   Upper CI
Intercept                   9.066489  4.825321  17.035387
sex[T.male]                 0.084082  0.057848   0.122213
embark_town[T.Queenstown]   0.162742  0.057027   0.464428
embark_town[T.Southampton]  0.365332  0.229654   0.581167
age                         0.991954  0.979300   1.004771
```

Hat tip to [hedz.nz](https://heds.nz/) for the inspiration for this [approach](https://heds.nz/posts/logistic-regression-python/).

### What happens with formula strings? Patsy, and Design Matrices

Most of the models in statsmodels require [design matrices](https://www.statlect.com/glossary/design-matrix). You can think of design matrices as **representing data** in a way compatible with model building.

When we use the formula api with a formula string, internally, this formula string is turned into a design matrix by the [Patsy](https://patsy.readthedocs.io/en/latest/overview.html) library.

We can explore how Patsy transforms the data by using the `patsy.dmatrices()` function.

```python{2, 7-9}
import pandas as pd
import patsy


titanic = pd.read_csv("titanic.csv")

y, X = patsy.dmatrices("survived ~ sex + age + embark_town",
                        data=titanic,
                        return_type="dataframe")

```

Inspecting `X`, we can see that Patsy converted categorical variables into dummy variables and added a constant `Intercept` column.

```python
print(X[:5])
```

```
   Intercept  sex[T.male]  ...  embark_town[T.Southampton]   age
0        1.0          1.0  ...                         1.0  22.0
1        1.0          0.0  ...                         0.0  38.0
2        1.0          0.0  ...                         1.0  26.0
3        1.0          0.0  ...                         1.0  35.0
4        1.0          1.0  ...                         1.0  35.0
```

Specifically for building design matrices, Patsy is well worth exploring if you're coming from the R language or need advanced variable treatment.

### Setting a reference or base level for categorical variables

With Categorical Variables, you'll sometimes want to set the reference category to be a specific value. This can help make the results more interpretable.

In the Titanic Dataset used above, we could examine how likely survival was for first-class passengers relative to third-class. We can do this with Patsy's **categorical treatments**.

In the Titanic dataset, the `pclass` column gets interpreted as an integer. We change this by wrapping it in an uppercase `C` and parentheses `()`.

```python{1}
formula = "survived ~ C(pclass)"
log_reg = smf.logit(formula, data=titanic).fit()
```

```
==================================================================================
                     coef    std err          z      P>|z|      [0.025      0.975]
----------------------------------------------------------------------------------
Intercept          0.6286      0.155      4.061      0.000       0.325       0.932
C(pclass)[T.2]    -0.7096      0.217     -3.269      0.001      -1.135      -0.284
C(pclass)[T.3]    -1.7844      0.199     -8.987      0.000      -2.174      -1.395
==================================================================================
```

Notice, though, this only signals to Patsy to treat `pclass` as categorical. The reference level hasn't changed. To set the reference level, we include a `Treatment` argument with a `reference` set to the desired value.

```python{1}
formula = "survived ~ C(pclass, Treatment(reference=3))"
log_reg = smf.logit(formula, data=titanic).fit()
```

```
==========================================================================================================
                                             coef    std err          z      P>|z|      [0.025      0.975]
----------------------------------------------------------------------------------------------------------
Intercept                                 -1.1558      0.124     -9.293      0.000      -1.400      -0.912
C(pclass, Treatment(reference=3))[T.1]     1.7844      0.199      8.987      0.000       1.395       2.174
C(pclass, Treatment(reference=3))[T.2]     1.0748      0.197      5.469      0.000       0.690       1.460
==========================================================================================================
```

For more on categorical treatments, see [here](https://patsy.readthedocs.io/en/latest/categorical-coding.html) and [here](https://patsy.readthedocs.io/en/latest/API-reference.html#handling-categorical-data) from the [Patsy docs](https://patsy.readthedocs.io/en/latest/index.html).

### Customizing the fit summary

After we've fit a model, we'll typically inspect the results by calling `summary()` on the returned result. Let's look at some of the helpful things this method can do.

#### Accessing the summary tables

When we print `summary()`, we see two areas of information, fit details and a table of parameter estimates. We can access these tables from the `Summary` object's `tables` attribute.

```python
fit_summary = log_reg.summary().tables[0]
```

These tables can also be outputted as [LaTeX](https://www.latex-project.org/about/) or HTML with the `as_latex_tabular()` or `as_html()` methods.

```python
fit_summary = log_reg.summary().tables[0]
fit_summary.as_html()
```

#### Relabel parameter names

To relabel the parameter names, the `summary()` method provides an `xname` argument. 

`xname` is a list of labels that will be applied to each row of the summary's coefficient table. The length `xname` must match the length of the `params` attribute of the `Result` object returned by calling `fit()`.

Default:

```python
print(log_reg.summary())
```

```
==================================================================================
                     coef    std err          z      P>|z|      [0.025      0.975]
----------------------------------------------------------------------------------
Intercept          0.6286      0.155      4.061      0.000       0.325       0.932
C(pclass)[T.2]    -0.7096      0.217     -3.269      0.001      -1.135      -0.284
C(pclass)[T.3]    -1.7844      0.199     -8.987      0.000      -2.174      -1.395
==================================================================================
```

Using `xname`:

```python
print(log_reg.summary(xname=["1st class", "2nd class", "3rd class"]))
```

```
==============================================================================
                 coef    std err          z      P>|z|      [0.025      0.975]
------------------------------------------------------------------------------
1st class      0.6286      0.155      4.061      0.000       0.325       0.932
2nd class     -0.7096      0.217     -3.269      0.001      -1.135      -0.284
3rd class     -1.7844      0.199     -8.987      0.000      -2.174      -1.395
==============================================================================
```

### Output summary to various formats

As you saw above, after we fit the model to the data, we called and printed the `summary()` method to examine the specific details of the model fit.

The summary method also returns a `Summary` object. The `Summary` object has some useful methods for outputting to other formats.

| Format | Method | Note |
|---|---|---|
| LaTeX | `log_reg.summary().as_latex()` | Merges into a single table. statsmodels documentation recommend using `as_latex_tabular()` directly on individual summary tables. |
| HTML | `log_reg.summary().as_html()` | Output to an HTML `<table>` |
| CSV | `log_reg.summary().as_csv()` |  |

## Conclusion

In this guide, we looked at how to do Logistic Regression in Python with the statsmodels package. We covered how to fit the model to data and some of the other things associated with Logistic Regression. I hope you found it helpful!

### Further reading

* [statsmodels.org Getting started](https://www.statsmodels.org/stable/gettingstarted.html)
* [Regression with Discrete Dependent Variable](https://www.statsmodels.org/stable/discretemod.html)
* [endog, exog, what’s that?](https://www.statsmodels.org/stable/endog_exog.html)
* [Patsy: How formulas work](https://patsy.readthedocs.io/en/latest/formulas.html)
* [Patsy: Coding categorical data](https://patsy.readthedocs.io/en/latest/categorical-coding.html)
* [Simple logistic regression with Python](https://heds.nz/posts/logistic-regression-python/)
* [StatQuest: Logistic Regression](https://youtube.com/playlist?list=PLblh5JKOoLUKxzEP5HA2d-Li7IJkHfXSe)
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

## Logistic Regression with statsmodels

Before we get started, it's worth mentioning there are two ways to do Logistic Regression in statsmodels:

* `statsmodels.api`: The standard API. Data gets separated into explanatory variables (exog) and a response variable (endog). Specifying a model is done through classes.
* `statsmodels.formula.api`: The formula API. It uses the R-style formula syntax and dataframes.

For this guide, I've opted to use the formula api. The formula api is a more convenient way of building models that abstracts away the boilerplate required by the standard api. 

Under the hood, both the standard and formula APIs use the same underlying models.

### Imports

First we need import pandas and the statsmodels formula api. Convention is to alias `statsmodels.formula.api` to `smf`.

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

The data we're using is the seaborn version of the Titanic Dataset and can be downloaded [here](https://raw.githubusercontent.com/mwaskom/seaborn-data/master/titanic.csv). The seaborn version is a minimal dataset with some pre-processing applied.

### Fitting a Logistic Regression

Fitting is a two-step process. First, we specify a model, then we fit. Typically the `fit()` call is chained to the model specification.

```python
log_reg = smf.logit("survived ~ sex + age + embark_town", data=titanic).fit()
```

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

The `summary()` method has several features helpful for outputting results explored further below in this guide.

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

In statsmodels, the `fit()` method returns a `Result` object. The model coefficients, standard errors, p-values, etc., are all available from this object.

Conveniently these are stored as pandas data frames with the parameter name as the data frame index.

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

| attr/func | Description |
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

After fitting a Logistic Regression, you'll likely want to calculate the Odds Ratios of the estimated parameters. As mentioned above, everything we need is available from the `Results` object that comes from a model fit.

Here we take the estimated parameters and confidence intervals, combine them into a DataFrame and apply NumPy's `exp()` function to the whole DataFrame.

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

Most of the models in statsmodels require design matrices. You can think of design matrices as representing data in a way compatible with model building.

When we use the formula api with a formula string, internally, this formula string is turned into a design matrix by the Patsy library.

We can explore how patsy is transforming the data by using the `patsy.dmatrices()` function.

```python{2, 7-9}
import pandas as pd
import patsy


titanic = pd.read_csv("titanic.csv")

y, X = patsy.dmatrices("survived ~ sex + age + embark_town",
                        data=titanic,
                        return_type="dataframe")

```

Inspecting `X`, we can see that patsy converted categorical variables into dummy variables and added a constant `Intercept` column.

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

In the Titanic Dataset used above, we could examine how likely survival was for first-class passengers relative to third-class. We can do this with Patsy's categorical treatments.

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

For more on categorical treatments, see here and here from the Patsy docs.
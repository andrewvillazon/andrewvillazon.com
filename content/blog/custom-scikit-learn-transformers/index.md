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

## Creating a Custom Transformer

To create a Custom Transformer, we only need to meet a couple of basic requirements:
* The Transformer is a class (function transformers detailed below).
* The class inherits from the `BaseEstimator` and `TransformerMixin` classes found in the `sklearn.base` module.
* The class implements the instance methods `fit()` and `transform()`. The `transform()` method should return a pandas DataFrame or numpy array (typically called `X`) to ensure compatibility with the other parts of scikit-learn.

```python
from numpy.random import randint
from sklearn.base import BaseEstimator, TransformerMixin


class CustomTransformer(BaseEstimator, TransformerMixin):
    def fit(self, y=None):
        return self

    def transform(self, X, y=None):
        # Perform arbitary transformation
        X["random_int"] = randint(0, 10, X.shape[0])
        return X

```

And we can use it as an ordinary scikit-learn Transformer.

```python{9}
import pandas as pd
from sklearn.pipeline import Pipeline


df = pd.DataFrame({"a": [1, 2, 3], "b": [4, 5, 6], "c": [7, 8, 9]})

pipe = Pipeline(
    steps=[
        ("use_custom_transformer", CustomTransformer())
    ]
)
transformed_df = pipe.fit_transform(df)

print(df)

```
```
   a  b  c  random_int
0  1  4  7           5
1  2  5  8           0
2  3  6  9           6
```
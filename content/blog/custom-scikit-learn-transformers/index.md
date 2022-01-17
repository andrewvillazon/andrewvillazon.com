---
title: "Creating custom scikit-learn Transformers"
date: "2022-01-17"
tags:
    - Python
---

In scikit-learn, Transformers are objects that transform a dataset into a new one to prepare the dataset for predictive modeling, e.g., scaling numeric values, one-hot encoding categoricals, etc.

While scikit-learn has many Transformers, it's often helpful to create our own. This post will look at three ways to make your own Custom Transformers: Creating a Custom Transformer from scratch, using the `FunctionTransformer`, and subclassing an existing Transformer.

Before looking at Custom Transformers, here are a couple of things worth being familiar with:
* Using scikit-learn Transformers either with the `fit_transform()` method or in Pipelines.
* Creating classes, inheritance, and the `super()` function.

## Creating a Custom Transformer

To create a Custom Transformer, we only need to meet a couple of basic requirements:
* The Transformer is a class (for function transformers, see below).
* The class inherits from the `BaseEstimator` and `TransformerMixin` classes found in the `sklearn.base` module.
* The class implements the instance methods `fit()` and `transform()`. These methods need to have both `X` and `y` parameters, and `transform()` should return a DataFrame or NumPy array to ensure compatibility with Pipelines.

```python
from numpy.random import randint
from sklearn.base import BaseEstimator, TransformerMixin


class CustomTransformer(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
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

### Passing arguments to a Custom Transformer

If you need to pass extra data or objects to the Custom Transformer, give the custom Transformer an `__init__()` (initialize) method. This additional data will then be available to use in the transformation.

Here we include a parameter to specify the columns the Transformer should modify.

```python{7,8,9,29}
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline


class MultiplyColumns(BaseEstimator, TransformerMixin):
    def __init__(self, by=1, columns=None):
        self.by = by
        self.columns = columns
    
    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        cols_to_transform = list(X.columns)

        if self.columns:
            cols_to_transform = self.columns

        X[cols_to_transform] = X[cols_to_transform] * self.by
        return X


# Use Custom Transformer
df = pd.DataFrame({"a": [1, -2, 3], "b": [-4, 5, 6], "c": [-7, -8, 9]})

pipe = Pipeline(
    steps=[
        ("multiply_cols_by_3", MultiplyColumns(3, columns=["a", "c"]))
    ]
)
transformed_df = pipe.fit_transform(df)

print(df)

```

```
   a  b   c
0  3 -4 -21
1 -6  5 -24
2  9  6  27
```

## Function Transformers

Sometimes it makes more sense for a transformation to come from a function rather than a class. For this, scikit-learn provides the `FunctionTransformer` class. The `FunctionTransformer` wraps a function and makes it work as a Transformer.

In the below example, we wrap the `pandas.get_dummies` function to perform one-hot encoding as part of a pipeline.

```python{14}
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer


data = {
    "id": [1, 2, 3, 4, 5,],
    "fruit": ["Apple", "Apple", "Peach", "Banana"],
}
df = pd.DataFrame({k: pd.Series(v) for k, v in data.items()})

pipe = Pipeline(
    steps=[
        ("simple_one_hot_encode", FunctionTransformer(pd.get_dummies))
    ]
)
transformed_df = pipe.fit_transform(df)

print(transformed_df)

```

```
   id  fruit_Apple  fruit_Banana  fruit_Peach
0   1            1             0            0
1   2            1             0            0
2   3            0             0            1
3   4            0             1            0
4   5            0             0            0
```

If the wrapped function has additional arguments, these are passed to the function using the `kw_args` argument.

```python{15-17}
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer


data = {
    "id": [1, 2, 3, 4, 5,],
    "fruit": ["Apple", "Apple", "Peach", "Banana"],
}
df = pd.DataFrame({k: pd.Series(v) for k, v in data.items()})

pipe = Pipeline(
    steps=[
        (
            "simple_one_hot_encode",
            FunctionTransformer(
                pd.get_dummies, kw_args={"dummy_na": True, "dtype": "float"}
            ),
        )
    ]
)
transformed_df = pipe.fit_transform(df)

print(transformed_df)

```

```
   id  fruit_Apple  fruit_Banana  fruit_Peach  fruit_nan
0   1          1.0           0.0          0.0        0.0
1   2          1.0           0.0          0.0        0.0
2   3          0.0           0.0          1.0        0.0
3   4          0.0           1.0          0.0        0.0
4   5          0.0           0.0          0.0        1.0
```

## Customizing existing scikit-learn Transformers

What if you want to modify the functionality of an existing scikit-learn Transformer? A way to do this is to take advantage of Python's inheritance mechanism and subclass the Transformer. Credit to [Sebastian Flennerhag](http://flennerhag.com/2017-01-08-Recursive-Override/) for this method.

In the example below, we're creating an Ordinal Encoder that returns a pandas DataFrame instead of the usual NumPy array.

```python
import pandas as pd
from sklearn.preprocessing import OrdinalEncoder


class CustomOrdinalEncoder(OrdinalEncoder):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
    
    def transform(self, X, y=None):
        transformed_X = super().transform(X)
        new_X = pd.DataFrame(transformed_X, columns=self.feature_names_in_)

        return new_X

```

Here's how it works.

The first step is to create an `__init__()` method. The method does two things. It initializes the scikit-learn OrdinalEncoder via the `super()` method, allowing us access to the OrdinalEncoder functionality, *and* passes on keyword arguments using `**kwargs`.

```python{3}
class CustomOrdinalEncoder(OrdinalEncoder):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
```

To have a DataFrame returned instead of an array, we override the transform method and define our own. Inside our transform method, the scikit-learn OrdinalEncoder performs the transformation via `super().transform(X)`, however, we map the result back to a DataFrame and return that.

```python{5-9}
class CustomOrdinalEncoder(OrdinalEncoder):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
    
    def transform(self, X, y=None):
        transformed_X = super().transform(X)
        new_X = pd.DataFrame(transformed_X, columns=self.feature_names_in_)

        return new_X
```

And thanks to inheritance, our `CustomOrdinalEncoder` behaves just like the scikit-learn OrdinalEncoder.

```python
import pandas as pd
from sklearn.preprocessing import OrdinalEncoder


class CustomOrdinalEncoder(OrdinalEncoder):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def transform(self, X, y=None):
        transformed_X = super().transform(X)
        new_X = pd.DataFrame(transformed_X, columns=self.feature_names_in_)

        return new_X


data = pd.DataFrame(
    {
        "fruits": ["Apple", "Pears", "Cherry"],
        "colors": ["Green", "Green", "Red"],
    }
)

enc = CustomOrdinalEncoder(dtype=int)
new_data = enc.fit_transform(data)

print(new_data)
print("Categories: ", enc.categories_)

```

```
   fruits  colors
0       0       0
1       2       0
2       1       1
Categories:  [array(['Apple', 'Cherry', 'Pears'], dtype=object), array(['Green', 'Red'], dtype=object)]
```

## Custom scikit-learn Transformer libraries

Lastly, it's worth considering some of the existing projects dedicated to scikit-learn Transformers before creating your own:

* Category Encoders - a large set of Categorical Variable transformations. 
* Feature Engine - excellent range of Numeric and Categorical variable transformations. Easy to use with a lot of useful functionality.
* sklearn-pandas - Useful library for mapping the results of a transformation back to a DataFrame.
* scikit-lego

## Conclusion

As we've seen, Custom Transformers give you a lot of flexibility and control over your Data Preprocessing. I've found them particularly good for encapsulating a step in the Data Processing process, making the code much more manageable. They're well worth a try.

### Further Reading

* [Dataset transformations](https://scikit-learn.org/stable/data_transforms.html)
* [FunctionTransformer](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.FunctionTransformer.html#sklearn.preprocessing.FunctionTransformer)
* [Wrapping sklearn classes](http://flennerhag.com/2017-01-08-Recursive-Override)
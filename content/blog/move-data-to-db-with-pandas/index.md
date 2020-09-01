---
title: "Move data to a Database with Python: Pandas"
date: "2020-09-02"
tags:
    - Python
---
In Data Analysis, a common task is taking data from external sources, such as CSV files, and storing their data in a Database. Many tools exist for this, but a great option is to use [Python](https://www.python.org/downloads/).

In the final article of this series, we'll look at one more method for moving data to a Database using the popular data library, [pandas](pandas.pydata.org/). Pandas is *the* Python library for data manipulation and analysis. Think of pandas as the data swiss army knife for Python.

In the previous articles in this series, we looked at using [pure Python](https://www.andrewvillazon.com/move-data-to-db-with-pure-python/) and [SQLAlchemy](https://www.andrewvillazon.com/move-data-to-db-with-pure-python/). These methods offer high levels of flexibility but are somewhat "code-heavy" when compared to pandas.

##### Prerequisites:

In this article, I'm going to assume a couple of things:

* You're familiar with Python, installing and using packages, and running a Python script
* Some familiarity with databases and SQL

You won't need to know anything about pandas to understand this tutorial. I'll explain everything along the way.

## Setting up

For this tutorial, we'll be using the [New York City Airbnb Open Data](https://www.kaggle.com/dgomonov/new-york-city-airbnb-open-data) from Kaggle's excellent [public dataset repository](https://www.kaggle.com/datasets). 

Each row of the CSV represents a listing on [Airbnb](https://www.airbnb.com) and includes a range of data types. I've chosen this dataset because its typical of the kinds of datasets encountered in the real world.

You can find the [CSV file](https://github.com/andrewvillazon/move-data-to-a-db-python/raw/master/AB_NYC_2019.csv) and [final code](https://github.com/andrewvillazon/move-data-to-a-db-python/blob/master/pd.py) in the [accompanying repository](https://github.com/andrewvillazon/move-data-to-a-db-python) for this tutorial on my [GitHub](https://github.com/andrewvillazon).

Let's get started.

## Reading the data

To begin, we need to load the data from our CSV file into a pandas **DataFrame**. If you've never encountered a [DataFrame](https://pandas.pydata.org/pandas-docs/stable/reference/frame.html) before, these are a pandas data structure representing data in a **tabular** format with **rows** and **columns**.

We start with importing pandas. The standard convention with pandas is to alias the library to `pd` To read the CSV, we use the `read_csv` [method](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.read_csv.html). 

<div class="code-filename">pd.py</div>

```python
import pandas as pd


df = pd.read_csv(
    filepath_or_buffer="AB_NYC_2019.csv",
    header=0,
    index_col="id",
    quotechar='"',
    parse_dates=["last_review"],
)
```

You'll have noticed that we've passed in a few arguments to the `read_csv` method. Let's take a closer look at those:

* `filepath_or_buffer` - The path to the CSV file we want to read
* `header` - The row number of the header row. Including this instructs pandas to use the header row values as column names in the returned DataFrame.
* `index_col` - The name of the column that contains the indexes (row labels) for the DataFrame. The index column is typically a unique id. While not required in this scenario in non-trivial data analysis, it is useful to include
* `quotechar` - Character indicating the start and end of a quoted item. These will typically include the delimiter (in our file, a comma)
* `parse_dates` - A list of column names containing dates. By default, pandas will not attempt to parse strings that look like dates, so we must provide a list of column names we want to convert to dates. For date parsing, pandas uses the popular [dateutil](https://dateutil.readthedocs.io/en/stable/) library.

At this point, we should have a functioning DataFrame. While outside the scope of this article, this would be an excellent time to [inspect the DataFrame](https://realpython.com/pandas-python-explore-dataset/) to ensure data was loaded as expected.

Now that we have prepared a DataFrame let's look at how we can use it to move data into a Database.

## Store the data in the Database

One of the (many) useful features of pandas is it works with [SQLAlchemy](https://www.sqlalchemy.org/). Pandas can use any Database supported by SQLAlchemy.

Because we'll use SQLAlchemy for Database support, we need to generate a SQLAlchemy `Engine` object. The [Engine object](https://docs.sqlalchemy.org/en/13/core/connections.html) gives pandas the database connectivity it needs to store the data. We do this through the `create_engine` method and pass in a [database URL](https://docs.sqlalchemy.org/en/13/core/engines.html?highlight=database%20urls#database-urls) (similar to a connection string).

We'll connect to the Database using the `engine.connect` method inside a `with` statement ([context manager](https://stackabuse.com/python-context-managers/)). See the note below about closing Database connections.

To store the data, we call the `to_sql` [method](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.to_sql.html) of our DataFrame. 

<div class="code-filename">pd.py</div>

```python
import pandas as pd
import sqlalchemy


df = pd.read_csv(
    filepath_or_buffer="AB_NYC_2019.csv",
    header=0,
    index_col="id",
    quotechar='"',
    parse_dates=["last_review"],
)

engine = sqlalchemy.create_engine("sqlite:///ab_nyc.sqlite3")

with engine.connect() as connection:
    df.to_sql(
        name="listings_pandas",
        con=connection,
        if_exists="replace",
        index=True,
        index_label="id",
        dtype={"last_review": sqlalchemy.Date},
    )

```

To fine-tune the load process, we included some additional arguments. Let's look further at what those do:
* `name` - The destination table name.
* `con` - The connection to use to connect to the Database.
* `if_exists` - Sets what to do if the table already exists in the Database. In our case, we'll replace the table and its contents.
* `index` - A True or False value indicating whether or not to include the index as a column in the destination table.
* `index_label` - Column label if including the index in the destination table.
* `dtype` - A dictionary mapping column names in the DataFrame to SQLAlchemy data types. We can use this option to force the last_review column to be stored as a Date Type.

#### A note about Database connections

You might have noticed the work of storing the data occurs inside a `with` statement. There's a reason for that.

It's important to note that pandas doesn't close a Database connection when it's finished. According to their [documentation](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.to_sql.html), *"The user is responsible for engine disposal and connection closure for the SQLAlchemy connectable."*

Using `to_sql` inside a `with` statement ensures that the database connection will be closed appropriately and released when the code block finishes. Not explicitly closing a Database connection can lead to other Database users getting locked out of a table because pandas hasn't released the lock on the table.

#### Finishing up

Here is a look at the final code.

<div class="code-filename">pd.py</div>

```python
import pandas as pd
import sqlalchemy


df = pd.read_csv(
    filepath_or_buffer="AB_NYC_2019.csv",
    header=0,
    index_col="id",
    quotechar='"',
    parse_dates=["last_review"],
)

engine = sqlalchemy.create_engine("sqlite:///ab_nyc.sqlite3")

with engine.connect() as connection:
    df.to_sql(
        name="listings_pandas",
        con=connection,
        if_exists="replace",
        index=True,
        index_label="id",
        dtype={"last_review": sqlalchemy.Date},
    )

```

All that's left now is to run the script and inspect the Database. You should see the newly created table populated with data from the CSV file.

## Conclusion

And we're done! You've successfully moved data from a CSV file into a Database.

As you've seen, this common Data Analysis task was easy with pandas. For a relatively simple import of data such as this, pandas is an excellent choice. But for more complicated scenarios, I'd recommend using [SQLAlchemy](https://www.andrewvillazon.com/move-data-to-db-with-sqlalchemy/) or [pure Python](https://www.andrewvillazon.com/move-data-to-db-with-pure-python/) for more flexibility and control.

I hope you've found this series on moving data to a Database with Python useful. 

#### Further reading


---
title: "Use Python to quickly load lots of data to a Database"
date: "2020-11-09"
tags:
    - Python
---

In this post, I'm going walk through a way to quickly move a large amount of data to a Database using [Python](https://www.python.org/downloads/).

This post came from a project requirement to read around 20 million JSON records and load their contents to a SQL Server Database.

*Prerequisites*

I'm going to assume a couple of things:
* First, you're somewhat familiar with Python and some concepts like using modules, importing libraries, and common data structures.
* You're familiar with [using Python to move data to a Database](https://www.andrewvillazon.com/move-data-to-db-with-pure-python/) and using Database connectors.
* Lastly, I will assume the destination Database is an enterprise-level Relational Database such as [Postgres](https://www.postgresql.org/) or [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads). These have features that are helpful for loading data quickly, such as concurrency and multiple connections.

This post intends to walk through an approach to a problem rather than provide a tutorial.

## The challenges of lots of data

There are two main challenges when moving large volumes of data to a Database.

1. **Time** - An operation, such as inserting a record, may take microseconds but can add up to minutes or hours when performed millions of times.
2. **Memory** - If a dataset's size is more than our available RAM, we're not going to be able to put it all in a list and process it.

In this post, we'll explore how to deal with these challenges.

## Going faster

Before we look at code, let's explore some ways to go faster when loading data to a Database.

#### Threads

Repeatedly performing the same action on data is a good hint that the task could benefit from **concurrency**, namely **Threads**.

Threading allows us to break up a task into chunks of work and execute them concurrently instead of sequentially. We can do more work in the same amount of time.

#### Avoiding Bottlenecks

Inserting one row at a time might only take a microsecond but adds up if done millions of times.

To maximize speed, we'll commit the maximum records possible in a single Database transaction. The specific `INSERT` statement used is called a [Multi-row Insert](https://docs.microsoft.com/en-us/sql/t-sql/queries/table-value-constructor-transact-sql?view=sql-server-ver15#a-inserting-multiple-rows-of-data).

#### Raw SQL

Usually, it makes sense to use an [ORM (Object Relational Mapper)](https://www.andrewvillazon.com/move-data-to-db-with-sqlalchemy/) to interact with a Database in Python.  However, creating thousands or millions of ORM specific objects adds overhead we could avoid.

Instead, raw SQL will be built from the data and executed with the Database API.

Let's take a look at the code.

## Setting Up

If you want to follow along, you'll need some source data. The source in this walkthrough is a **CSV file**.

This post aims to cover loading data quickly, so I won't detail how this works. However, the script uses the excellent [Faker](https://faker.readthedocs.io/en/master/) library to generate fake personal data and [pandas](https://pandas.pydata.org/) to write out to CSV.

<div class="code-filename">data_gen.py</div>

```python
from faker import Faker
import pandas as pd


FAKE = Faker()
Faker.seed(42)
FIELDS = ["job", "company", "name", "sex", "mail", "birthdate"]


def create_dummy_data():
    return {k: v for k, v in FAKE.profile().items() if k in FIELDS}


def create_dummy_file(file_path, n_records=10000):
    data = [create_dummy_data() for _ in range(n_records)]

    df = pd.DataFrame(columns=FIELDS).from_dict(data)
    df.to_csv(file_path, sep="|", index_label="id")


if __name__ == "__main__":
    create_dummy_file("dummy_data.csv", n_records=150366)

```

Unfortunately, this task isn't quick. The script takes about 5 minutes to run on my machine. Change the **n_records** argument to generate larger datasets.

## Loading the data

To make the code more manageable, I've split it across two files (modules):
* `loadcsv.py` - the module that manages the fast loading of the source data
* `sqlactions.py` - module containing functions that perform actions on the destination Database.

You'll find the code in full in the [repository accompanying this post](https://github.com/andrewvillazon/quickly-load-data-db-python).

First, let's look at the module `loadcsv`.

### loadcsv

<div class="code-filename">loadcsv.py</div>

```python
from concurrent import futures
import csv
import queue

import sqlactions


MULTI_ROW_INSERT_LIMIT = 1000
WORKERS = 6


def read_csv(csv_file):
    with open(csv_file, encoding="utf-8", newline="") as in_file:
        reader = csv.reader(in_file, delimiter="|")
        next(reader)  # Header row

        for row in reader:
            yield row


def process_row(row, batch, table_name, conn_params):
    batch.put(row)

    if batch.full():
        sqlactions.multi_row_insert(batch, table_name, conn_params)

    return batch


def load_csv(csv_file, table_def, conn_params):
    # Optional, drops table if it exists before creating
    sqlactions.make_table(table_def, conn_params)

    batch = queue.Queue(MULTI_ROW_INSERT_LIMIT)

    with futures.ThreadPoolExecutor(max_workers=WORKERS) as executor:
        todo = []

        for row in read_csv(csv_file):
            future = executor.submit(
                process_row, row, batch, table_def["name"], conn_params
            )
            todo.append(future)

        for future in futures.as_completed(todo):
            result = future.result()

    # Handle left overs
    if not result.empty():
        sqlactions.multi_row_insert(result, table_def["name"], conn_params)


if __name__ == "__main__":
    table_def = {
        "name": "dummy_data",
        "columns": {
            "id": "INTEGER",
            "job": "VARCHAR(100)",
            "company": "VARCHAR(100)",
            "name": "VARCHAR(100)",
            "sex": "CHAR",
            "mail": "VARCHAR(100)",
            "birthdate": "DATE",
        },
    }

    conn_params = {
        "server": "localhost",
        "database": "TutorialDB",
        "user": "yourUserName",
        "tds_version": "7.4",
        "password": "yourStrong(!)Password",
        "port": 1433,
        "driver": "FreeTDS",
    }

    load_csv("dummy_data.csv", table_def, conn_params)

```

### Initial setup

The module starts by importing the required libraries, `concurrent.futures`, `csv`, and `queue`, all from the standard library, followed by the `sqlactions` module.

After the imports, constants get defined. These include the `MULTI_ROW_INSERT_LIMIT`, determining the queue size (see below), and the number of threads, or `WORKERS`.

### Reading the data

Next comes reading the data from the **CSV file**.

Reading the data is done with a **generator**. [Generators](https://wiki.python.org/moin/Generators) are a particular type of function that returns values one at a time (`yield`) rather than returning them all at once (`return`).

<div class="code-filename">loadcsv.py</div>

```python{9}
# ...

def read_csv(csv_file):
    with open(csv_file, encoding="utf-8", newline="") as in_file:
        reader = csv.reader(in_file, delimiter="|")
        next(reader)  # Header row

        for row in reader:
            yield row

# ...

```

Using a generator avoids putting all the data in a list and running out of memory. 

Instead, data is read in chunks (in this case, a single line), discarding each chunk when finished with it. Remember that once data has made it to the Database, there's no need to keep it in memory.

## Setting up Threads

#### Setting up a queue

Recall earlier that the faster approach is to insert as many records as possible in a single transaction? Or put another way, **batching**. 

Batching requires a data structure to hold row data temporarily. The best choice here is a [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) which has useful features for this kind of task:

1. Queues are locked whenever modifications take place on them. If we pull a value off the queue, no other thread can simultaneously modify the queue. This property is known as being "**thread safe**" and addresses a problem called a [race condition](https://stackoverflow.com/a/34550/7372226).
2. Queues are optimized for pulling data from the start and adding data to the end, i.e., we don't need to access values at any other place in the queue.

<div class="code-filename">loadcsv.py</div>

```python{6}
# ...

def load_csv(csv_file, table_def, conn_params):
    # ...

    batch = queue.Queue(MULTI_ROW_INSERT_LIMIT)

    # ...

```

As a side note, the pattern used here is known as the [producer-consumer](https://en.wikipedia.org/wiki/Producer%E2%80%93consumer_problem).

#### Working with Threads

The simplest way to use Threads is with the [concurrent.futures](https://docs.python.org/3/library/concurrent.futures.html) module, part of the Python standard library. The module abstracts away much of the detail of using Threads.

The recommended way of using Threads is to **instantiate a** `ThreadPoolExecutor` **inside a context manager**.

Inside the context manager, work for the Threads needs to be **scheduled**. 

Scheduling happens by creating a `Future` object with the `executor.submit()` method adding it to a `todo` list. Each future gets passed a function definition (a callable) and any required arguments.

At this point, the work is *scheduled but not executed*.

<div class="call-out call-out-info">
    <h4>What is a Future object?</h4>
    <p>
        A <strong>Future</strong> is a representation of some work to happen in the <em>future</em>. In this context, the future is a call to the <code>process_row()</code> method with some row data and the batch queue.
    </p>
</div>

To execute the scheduled work, we use the method, `futures.as_completed()`, which takes a list (iterable) of futures and yields their result as they complete.

<div class="code-filename">loadcsv.py</div>

```python{9-19}
# ...

def load_csv(csv_file, table_def, conn_params):
    # Optional, drops table if it exists before creating
    sqlactions.make_table(table_def, conn_params)

    batch = queue.Queue(MULTI_ROW_INSERT_LIMIT)

    with futures.ThreadPoolExecutor(max_workers=WORKERS) as executor:
        todo = []

        for row in read_csv(csv_file):
            future = executor.submit(
                process_row, row, batch, table_def["name"], conn_params
            )
            todo.append(future)

        for future in futures.as_completed(todo):
            result = future.result()

# ...
```

The code above is adapted from the book [Fluent Python by Luciano Ramalho](https://www.amazon.com/Fluent-Python-Concise-Effective-Programming/dp/1491946008/ref=sr_1_1?dchild=1&keywords=Fluent+PYthon&qid=1601795080&sr=8-1). The book features two excellent chapters on concurrency with `concurrent.futures` and [`asyncio`](https://docs.python.org/3/library/asyncio.html).

## Processing each row

The `process_row()` function does a couple of things:

1. Takes a row and adds the row to the **batch queue**.
2. Then, checks **if the batch queue is full**. If it is, the batch queue is passed to one of the `sqlactions` functions to insert into the Database.
3. Finally, it **returns the queue**. We could get to the end of the **CSV file** and find the queue isn't full. Returning the partially full queue means we can insert the remaining rows separately.

<div class="code-filename">loadcsv.py</div>

```python
# ...

def process_row(row, batch, table_name, conn_params):
    batch.put(row)

    if batch.full():
        sqlactions.multi_row_insert(batch, table_name, conn_params)

    return batch

# ...
```

### sqlactions

At this point, it's time to introduce the `sqlactions` module.

The module is a collection of functions that do actions on the Database. The module uses the query building library [PyPika](https://pypika.readthedocs.io/en/latest/index.html) to construct SQL queries and combine them with data.

<div class="code-filename">sqlactions.py</div>

```python
import pyodbc
from pypika import Column, Query, Table


def execute_query(q, conn_params):
    connection = pyodbc.connect(**conn_params)
    cursor = connection.cursor()

    cursor.execute(q)
    connection.commit()

    connection.close()


def make_table(table_def, conn_params):
    table = Table(table_def["name"])
    cols = [Column(k, v) for k, v, in table_def["columns"].items()]

    drop = Query.drop_table(table).if_exists()
    create = Query.create_table(table).columns(*cols)

    execute_query(str(drop) + "\n" + str(create), conn_params)


def multi_row_insert(batch, table_name, conn_params):
    row_expressions = []

    for _ in range(batch.qsize()):
        row_data = tuple(batch.get())
        row_expressions.append(row_data)

    table = Table(table_name)
    insert_into = Query.into(table).insert(*row_expressions)

    execute_query(str(insert_into), conn_params)

```

### Inserting each batch

The essential function here is the `multi_row_insert()`. Inserting each batch happens by constructing an `INSERT` statement and executing it on the Database.

<div class="code-filename">sqlactions.py</div>

```python{6-8}
# ...

def multi_row_insert(batch, table_name, conn_params):
    row_expressions = []

    for _ in range(batch.qsize()):
        row_data = tuple(batch.get())
        row_expressions.append(row_data)

    table = Table(table_name)
    insert_into = Query.into(table).insert(*row_expressions)

    execute_query(str(insert_into), conn_params)
```

The code starts building the Multi-row Insert by iterating through the batch queue, removing each row from the front of the queue. The row data is converted to a tuple and added to a `row_expressions` list.

Removing items from the front of the queue creates places at the end that are filled by waiting threads.

With the row data prepared, it gets combined into a Multi-row Insert via the PyPika `Query.into().insert()` function, which **takes tuples as row data**.

Lastly, the statement is executed and uses a [transaction scope](https://docs.sqlalchemy.org/en/13/orm/session_basics.html#when-do-i-construct-a-session-when-do-i-commit-it-and-when-do-i-close-it) that ties a Database connection and transactions to a batch of records.

#### Why build a query?

You may be wondering why we're constructing raw SQL and not using a [parameterized query](https://stackoverflow.com/a/4712113/7372226)? The simple answer is that there are limits on the number of parameters we can use in a parameterized query. In SQL Server, [this limit is 2100](https://docs.microsoft.com/en-us/sql/sql-server/maximum-capacity-specifications-for-sql-server?view=sql-server-ver15).

In a parameterized query, every piece of data is a parameter and significantly decreases the amount of data committed in one transaction.

<div class="call-out call-out-warning">
    <h4>Combining raw SQL and Data</h4>
    <p>
        It's necessary to point out that constructing raw SQL and concatenating with data is a big security no-no. Building raw SQL could make the destination Database prone to <a href="https://www.w3schools.com/sql/sql_injection.asp" target="_blank">SQL injection attacks</a>. 
    </p>
    <p>
        You'll need to evaluate if this approach is right for you and potentially take steps to protect against this.
    </p>
</div>

## Final clean up

The final step in the process is to commit any remaining rows. 

Because records get inserted when the batch queue is full, we may reach the dataset's end and find the queue is not full.

The **partially full queue** is passed to the `sqlactions.multi_row_insert()` function to ensure the remaining records are loaded.

<div class="code-filename">loadcsv.py</div>

```python{21-23}
# ...

def load_csv(csv_file, table_def, conn_params):
    # Optional, drops table if it exists before creating
    sqlactions.make_table(table_def, conn_params)

    batch = queue.Queue(MULTI_ROW_INSERT_LIMIT)

    with futures.ThreadPoolExecutor(max_workers=WORKERS) as executor:
        todo = []

        for row in read_csv(csv_file):
            future = executor.submit(
                process_row, row, batch, table_def["name"], conn_params
            )
            todo.append(future)

        for future in futures.as_completed(todo):
            result = future.result()

    # Handle left overs
    if not result.empty():
        sqlactions.multi_row_insert(result, table_def["name"], conn_params)


# ...
```

## A word on Exceptions

The code we walked through *deliberately omits exceptions* so we can focus on the logic and process.

Loading large amounts of data to a Database can take a non-trivial amount of time. 

It's worth considering handling exceptions in a way that doesn't kill the load and force you to start over—for example, logging any data that caused an insert to fail, continuing, and then addressing those separately.

## Conclusion

Phew! There we have it.

Hopefully, this article has given you a good idea of the techniques you can employ to load large datasets to your Database quickly.

There's a couple of other things we didn't try, derived table Inserts, reading the data in larger chunks, or using [asyncio](https://docs.python.org/3/library/asyncio.html). I'll leave those for you to consider.

For the full code, see the [accompanying repository for this post](https://github.com/andrewvillazon/quickly-load-data-db-python).

### Further reading

* [Python Cookbook: Concurrency](https://www.oreilly.com/content/python-cookbook-concurrency/)
* [Fluent Python, by Luciano Ramalho](https://www.oreilly.com/library/view/fluent-python/9781491946237/)
* [Multi-row Inserts (SQL Server)](https://docs.microsoft.com/en-us/sql/t-sql/queries/table-value-constructor-transact-sql?view=sql-server-ver15#a-inserting-multiple-rows-of-data)
* [Connecting to SQL Server from Mac OSX](https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Mac-OSX)
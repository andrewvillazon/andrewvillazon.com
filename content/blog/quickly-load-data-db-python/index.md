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

## Setting Up

If you want to follow along, you'll need some source data. The source in this walkthrough is a CSV file.

This post aims to cover loading data quickly, so I won't detail how this works. However, the script uses the excellent Faker library to generate fake personal data and pandas to write out to CSV.

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

To make the code more manageable, I've split it across two modules:
* `loadcsv` - the module that manages the fast loading of the source data
* `sqlactions` - module containing functions that perform actions on the destination Database.

You'll find the modules and code in full at the end of this post.

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

After the imports, constants get defined. These include the `MULTI_ROW_INSERT_LIMIT`, determining the queue size, and the number of threads, or `WORKERS`.
---
title: "Move data to a Database with Python: Pure Python"
date: "2020-08-10"
tags:
    - Python
---

In Data Analysis, a common task is taking data from an external source, such as a text file, and storing it in a Database. There are many different tools and methods for this, but a great option to use is [Python](https://www.python.org/downloads/).

External data can often be dirty or in formats that aren't suited to Databases such as **JSON** or **XML** and require transformation before storing. Using a language like Python gives us greater control and flexibility over this process.

This tutorial will cover moving data to a Database with just Python and intentionally avoids using additional libraries. The tutorial uses Python **3.6.5.**

## Setting up

For this tutorial, we'll be using the [New York City Airbnb Open Data](https://www.kaggle.com/dgomonov/new-york-city-airbnb-open-data) from Kaggle's excellent [public dataset repository](https://www.kaggle.com/datasets). 

Each row of the CSV represents a listing on [Airbnb](https://www.airbnb.com) and includes a range of data types. I've chosen this dataset because its typical of the kinds of datasets encountered in the real world.

You can find the [CSV file](https://github.com/andrewvillazon/move-data-to-a-db-python/raw/master/AB_NYC_2019.csv) and [final code](https://github.com/andrewvillazon/move-data-to-a-db-python/blob/master/pp.py) in the [accompanying repository](https://github.com/andrewvillazon/move-data-to-a-db-python) for this tutorial on my [GitHub](https://github.com/andrewvillazon).

Let's get started.

## Getting started

Start by creating a new python file called **pp.py**

To start loading our external data, we'll need to import two libraries:
* `sqlite3` - gives us a Database to work with
* `csv` - for working with CSV files

<div class="code-filename">pp.py</div>

```python
import sqlite3
import csv
```

## Setting up the Database

Before we can store data, we'll need to create the Database and set up a table.

To interact with the Database, we'll use the `sqlite3.connect()` method, which takes the file name of our database. The `sqlite3.connect()` method returns a connection object that we assign to the variable `conn`.

We can use `conn.cursor()` to return a new cursor object from the connection. The cursor object allows us to issue SQL commands to the Database.

<div class="code-filename">pp.py</div>

```python
import sqlite3
import csv


conn = sqlite3.connect("ab_nyc.sqlite3")
curs = conn.cursor()
```

You might have noticed that we're passing in a file name to the `connect()` method. We provide a file name because [SQLite](https://www.sqlite.org/index.html) is a **file-based Database**. If the file name does not exist, SQLite creates it for us.

Now that we have a cursor object, we can use it to perform SQL commands on our Database. The first command we issue is to create the table if it doesn't exist. Our data will go into this table.

<div class="code-filename">pp.py</div>

```python
curs.execute(
    """
    CREATE TABLE IF NOT EXISTS listings_pure_python (
        id INT,
        name TEXT,
        host_id INT,
        host_name TEXT,
        neighbourhood_group TEXT,
        neighbourhood TEXT,
        latitude REAL,
        longitude REAL,
        room_type TEXT,
        price INT,
        minimum_nights INT,
        number_of_reviews INT,
        last_review TEXT,
        reviews_per_month REAL,
        calculated_host_listings_count INT,
        availability_365 INT
    )
 """
)

```

The second part of our Database setup is to remove any existing data so we're working with an empty table. Removing data without deleting the table is known as **truncation**.

<div class="code-filename">pp.py</div>

```python
curs.execute("DELETE FROM listings_pure_python")
```

Finally, we save, or more precisely *commit*, the changes to the Database.

<div class="code-filename">pp.py</div>

```python
conn.commit()
```

It's worth mentioning here that while we have *executed* our SQL commands, the changes actually remain in a tentative state and aren't yet visible on the Database. 

To properly save, we call the `commit()` method saving the changes and ending the Database transaction.

Here is the code so far.

<div class="code-filename">pp.py</div>

```python
import sqlite3
import csv


conn = sqlite3.connect("ab_nyc.sqlite3")
curs = conn.cursor()

# Table setup
curs.execute(
    """
    CREATE TABLE IF NOT EXISTS listings_pure_python (
        id INT,
        name TEXT,
        host_id INT,
        host_name TEXT,
        neighbourhood_group TEXT,
        neighbourhood TEXT,
        latitude REAL,
        longitude REAL,
        room_type TEXT,
        price INT,
        minimum_nights INT,
        number_of_reviews INT,
        last_review TEXT,
        reviews_per_month REAL,
        calculated_host_listings_count INT,
        availability_365 INT
    )
 """
)

curs.execute("DELETE FROM listings_pure_python")
conn.commit()
```


#### A note about Database providers

In this tutorial, we've used [SQLite](https://docs.python.org/3/library/sqlite3.html) because it is part of the standard Python library and easy to use. In the real world, you're likely working with full-featured Databases such as [SQL Server](https://www.microsoft.com/en-us/sql-server), [MySQL](https://www.mysql.com/), or [PostgreSQL](https://www.postgresql.org/).

In this case, you'll need the specific library that talks to your Database provider. This library is also known as the **Database driver** or **connector**. Thankfully these libraries all provide very similar, if not identical, methods making it easy to swap out SQLite for different providers.

Some of the popular database libraries are:
* [pyodbc](https://github.com/mkleehammer/pyodbc/wiki) - for SQL Server
* [mysql-connector-python](https://dev.mysql.com/doc/connector-python/en/connector-python-installation-binary.html) - for MySQL
* [psycopg](https://www.psycopg.org/install/) - for PostgreSQL
* [cx_Oracle](https://oracle.github.io/python-cx_Oracle/) - for Oracle

## Reading and inserting data

Now that we have our Database and table setup we can move data into it. 

We start by opening the CSV file using a **context manager**.

Inside the `with` block we call `csv.reader()` and pass in our file variable. `csv.reader()` returns a **CSV reader object** that we can use to retrieve row data from our CSV file.

<div class="code-filename">pp.py</div>

```python
with open("AB_NYC_2019.csv", "r", encoding="utf-8", newline="") as csv_file:
    data_reader = csv.reader(csv_file, quotechar='"')
    next(data_reader)
```

If you're unfamiliar with context managers, these are a Python language feature that abstracts away the management of things like files, or more broadly resources. When the code exits the `with` block, Python will properly close the file without us explicitly coding it.

You might also be wondering why we call `next()` on `data_reader`? Calling `next(data_reader)` moves the object's pointer to the next line in the CSV, effectively ignoring the header row.

We're now ready to loop through the lines in the file and add them to the Database.

<div class="code-filename">pp.py</div>

```python
with open("AB_NYC_2019.csv", "r", encoding="utf-8", newline="") as csv_file:
    data_reader = csv.reader(csv_file, quotechar='"')
    next(data_reader)  # skip over header row if it has column names

    for row in data_reader:
        curs.execute(
            "INSERT INTO listings_pure_python VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            row,
        )
```

There's a couple of important things to point out here. The first is the statement inside the execute method.

```python
curs.execute("INSERT INTO listings_pure_python VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", row)
```

Here we're using a query with question mark placeholders. A query like this is known as a [parameterized query](https://en.wikipedia.org/wiki/Prepared_statement). 

When we call the `execute` method, it takes a couple of arguments: a statement to execute and our data. Remember that the `row` variable coming from the `data_reader` is a list, and so the `execute()` method will place the row items where there are question marks.

Parameterized queries are also a good security practice as they mitigate against executing malicious SQL posing as data inside our file. By separating the SQL and the data, the Database knows what it should execute and what it should store.

As we did before, we must commit our changes to the Database then close the database connection.

<div class="code-filename">pp.py</div>

```python
conn.commit()
conn.close()
```

The final code will look something like this.

<div class="code-filename">pp.py</div>

```python
import sqlite3
import csv


conn = sqlite3.connect("ab_nyc.sqlite3")
curs = conn.cursor()

curs.execute(
    """
    CREATE TABLE IF NOT EXISTS listings_pure_python (
        id INT,
        name TEXT,
        host_id INT,
        host_name TEXT,
        neighbourhood_group TEXT,
        neighbourhood TEXT,
        latitude REAL,
        longitude REAL,
        room_type TEXT,
        price INT,
        minimum_nights INT,
        number_of_reviews INT,
        last_review TEXT,
        reviews_per_month REAL,
        calculated_host_listings_count INT,
        availability_365 INT
    )
 """
)

curs.execute("DELETE FROM listings_pure_python")
conn.commit()

with open("AB_NYC_2019.csv", "r", encoding="utf-8", newline="") as csv_file:
    data_reader = csv.reader(csv_file, quotechar='"')
    next(data_reader)

    for row in data_reader:
        curs.execute(
            "INSERT INTO listings_pure_python VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            row,
        )

conn.commit()
conn.close()

```

And we're done. The script is complete!

## Conclusion

Hopefully, this article has given you a good feel for how you can move your data into a Database with Python.

For more from this series checkout my other articles using the popular libraries [SQLAlchemy](https://www.andrewvillazon.com/move-data-to-db-with-sqlalchemy/) and [pandas](https://www.andrewvillazon.com/move-data-to-db-with-pandas/).
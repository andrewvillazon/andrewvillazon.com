---
title: "Move data to a Database with Python: Pure Python"
date: "2020-08-13"
tags:
    - Python
---

In Data Analysis a common task is taking data from an external source, such as a text file, and storing it in a Database. There are many different tools and methods for this but a great option to use is Python.

Often external data can be dirty or in formats that aren't suited to Databases such as JSON or XML and require transformation before storing. Using a language like Python gives us greater control and flexibility over this process.

This tutorial will cover moving data to a Database with just Python and intentionally avoids using additional libraries. The tutorial is written using **Python 3.6.5**.

## Setting up

Before we start we'll need some data to work with.

The data we'll be using is a csv file of 1000 rows of various data types. The data was created using the excellent [Faker library](https://pypi.org/project/Faker/). Faker is a library that generates fake data that looks like real-life data.

You can find the data and the code in the repository for this tutorial on github.

## Getting started

To start loading our external data we'll need import two libraries:
* `sqlite3` - gives us a Database to work with
* `csv` - for working with csv files

<div class="code-filename">pure_python.py</div>

```python
import sqlite3
import csv
```

## Setting up the Database

Before we can store data we'll need to create the Database and setup a table.

To interact with the Database we use the `sqlite.connect()` method which takes the file name of our database. 

After this we get a new cursor object from the connection. The cursor object allows us to issue SQL commands to the Database.

```python
import sqlite3
import csv


conn = sqlite3.connect("big_data.db")
curs = conn.cursor()
```

You might have noticed that we're passing in a file name to the `connect()` method. This is because sqlite is a file-based Database. Another feature of sqlite is if the file name does not exist then it will be created for us.

Now that we have a cursor object we can use it to perform SQL commands on our Database. The first command we issue is to create the table if it doesn't exist. Our data will be stored in this table.

```python
curs.execute(
    """
    CREATE TABLE IF NOT EXISTS pure_python (
        transaction_date TEXT,
        bban TEXT,
        color TEXT,
        phone_number TEXT,
        lat REAL,
        long REAL,
        age INT
    )
 """
)
```

The second part of our Database setup is to remove any existing data so we're working with an empty table. This is known as truncating a table.

```python
curs.execute("DELETE FROM pure_python")
```

Finally we save, or more precisely *commit*, the changes to the Database.

```python
conn.commit()
```

It's worth mentioning here that while we have *executed* our SQL commands the changes actually remain in a tentative state and aren't yet visible on the Database. 

To fully save we call the `commit()` method which saves the changes and ends the Database transaction.

#### A note about Database providers

In this tutorial we've used sqlite because its part of the standard Python library and easy to use. In the real-world however, you're likely working with full-featured Databases such as SQL Server, MySQL, or PostgreSQL.

In this case you'll need the specific library that talks to your Database provider. This library is sometimes refered to as the Database driver or connector. Thankfully these libraries all provide very similar, if not identical methods, making it easy to swap out sqlite for a different provider.

Some of the popular database libraries are:
* [pyodbc](https://github.com/mkleehammer/pyodbc/wiki) - for SQL Server
* [mysql-connector-python](https://dev.mysql.com/doc/connector-python/en/connector-python-installation-binary.html) - for MySQL
* [psycopg](https://www.psycopg.org/install/) - for PostgreSQL
* [cx_Oracle](https://oracle.github.io/python-cx_Oracle/) - for Oracle

## Reading and inserting data

Now that we have our Database and table setup we can move data into it. 

We start by opening the csv file using a context manager.

Inside the `with` block we call `csv.reader()`, pass in our file variable, and specify that our columns are seperated by a pipe character `|`. This returns a csv reader object that we can use to retrieve row data from our csv file.

```python
with open("big_data.csv", "r", encoding="utf-8") as csv_file:
    data_reader = csv.reader(csv_file, delimiter="|")
    next(data_reader)
```

If you're unfamiliar with context managers these are a Python language feature that abstract away the management of things like files, or more broadly resources. When the code exits the `with` block Python will make sure to properly close the file without us explicitly coding it.

You might also be wondering why we call `next()` on `data_reader`? This instructs the `data_reader` to move it's pointer to the next line in the csv, effectively ignoring the header row.

We're now ready to loop through the lines in the file and add them to the Database.

```python
with open("big_data.csv", "r", encoding="utf-8") as csv_file:
    data_reader = csv.reader(csv_file, delimiter="|")
    next(data_reader)

    for row in data_reader:
        curs.execute("INSERT INTO pure_python VALUES(?,?,?,?,?,?,?)", row)
```

There's a couple of important things to point out here. The first is the statement inside the execute method.

```python
curs.execute("INSERT INTO pure_python VALUES(?,?,?,?,?,?,?)", row)
```

Here we're using a query with question marks. This is known as a paramterised query. When we call the `execute` method it takes a couple of arguments: a statement to execute and our data. Remember that the `row` variable coming from the `data_reader` is a list and so the `execute()` method will place the row items where there are question marks.

This is also good security practise as it mitigates against executing malicious SQL posing as data inside our file. By sepearting the SQL and the data the database knows what it should execute and what it should store.

As we did before we must commit our changes to the Database and lastly close the database connection.

```python
conn.commit()
conn.close()
```

The final code will look something like this.

```python
import sqlite3
import csv


conn = sqlite3.connect("big_data.db")
curs = conn.cursor()

curs.execute(
    """
    CREATE TABLE IF NOT EXISTS pure_python (
        transaction_date TEXT,
        bban TEXT,
        color TEXT,
        phone_number TEXT,
        lat REAL,
        long REAL,
        age INT
    )
 """
)

curs.execute("DELETE FROM pure_python")
conn.commit()

with open("big_data.csv", "r", encoding="utf-8") as csv_file:
    data_reader = csv.reader(csv_file, delimiter="|")
    next(data_reader)

    for row in data_reader:
        curs.execute("INSERT INTO pure_python VALUES(?,?,?,?,?,?,?)", row)

conn.commit()
conn.close()
```
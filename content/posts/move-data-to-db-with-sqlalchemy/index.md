---
title: "Move data to a Database with Python: SQLAlchemy"
date: "2020-08-26"
tags:
    - Python
---

When analyzing data, a common task is moving data from a source to a database. However, external data isn't always straightforward, and sometimes you need a tool with flexibility and granular control over the process. [Python](https://www.python.org/downloads/) is an excellent choice for this kind of task.

In the [first article](https://www.andrewvillazon.com/move-data-to-db-with-pure-python/) of this series, we looked at how to move data to a Database with just Python. In this article, we'll look at another method using [SQLAlchemy](https://www.sqlalchemy.org/), a popular Python library for working with databases.

SQLAlchemy is an excellent choice of [ETL](https://en.wikipedia.org/wiki/Extract,_transform,_load) tool because it abstracts away a lot of the database-specific code and lets you work just in Python.

The article is not intended to be a definitive tutorial on SQLAlchemy but aims to show how you can take advantage of its features to move data into a database.

##### Prerequisites:

In writing this, I'm assuming a couple of things:
* Familiarity with Python, installing packages, importing them into your code, and running a Python script
* Familiarity with SQL and working with databases.

## Setting up

For this tutorial, we'll be using the [New York City Airbnb Open Data](https://www.kaggle.com/dgomonov/new-york-city-airbnb-open-data) from Kaggle's excellent [public dataset repository](https://www.kaggle.com/datasets). 

Each row of the CSV represents a listing on [Airbnb](https://www.airbnb.com) and includes a range of data types. I've chosen this dataset because its typical of the kinds of datasets encountered in the real world.

You can find the [CSV file](https://github.com/andrewvillazon/move-data-to-a-db-python/raw/master/AB_NYC_2019.csv) and [final code](https://github.com/andrewvillazon/move-data-to-a-db-python/blob/master/sa.py) in the [accompanying repository](https://github.com/andrewvillazon/move-data-to-a-db-python) for this tutorial on my [GitHub](https://github.com/andrewvillazon).

Let's get started.

## ORMs

Before using [SQLAlchemy](https://docs.sqlalchemy.org/en/13/intro.html), we need to cover off a related concept: ORMs. 

##### What's an ORM?

Languages like Python are [Object-Oriented](https://en.wikipedia.org/wiki/Object-oriented_programming), a programming paradigm where code is organized into 'Objects' that have data (attributes) and methods (functions or behavior). However, in a [relational database](https://en.wikipedia.org/wiki/Relational_database), data exists in tables with columns and rows. To bridge across these two different systems, we use an ORM or Object Relational Mapper.

ORMs allow us to map Objects in our code to tables and columns in a database. Objects can be stored (persisted) to and loaded from the database.

As you'll see later, we'll create Python Objects from our CSV data and use SQLAlchemy to store them. We won't need to write any SQL to do this or worry about database specifics. SQLAlchemy will handle this for us.

Now, onto the code.

## Creating a Database Engine

Start by creating a new file. I've called mine **sa.py**

When working with SQLAlchemy, the starting point is the `Engine`. The [Engine](https://docs.sqlalchemy.org/en/13/core/engines.html) gives us database connectivity and related functionality.

We create an `Engine` through the `create_engine` function passing in a [database URL](https://docs.sqlalchemy.org/en/13/core/engines.html?highlight=database%20urls#database-urls) (akin to a connection string).

<div class="code-filename">sa.py</div>

```python
from sqlalchemy import create_engine


engine = create_engine('sqlite:///ab_nyc.sqlite3', echo=True)
```

The optional `echo` flag sets up SQLAlchemy logging. We'll enable it to see the SQL statements produced by SQLAlchemy.

While the `Engine` is our source of database connectivity, we have not yet connected or interacted with the database.

## Setting up a mapping

To enable SQLAlchemy to move our data, we need to *declare* a mapping between our data and a database table. We do this with [SQLAlchemy's Declarative](https://docs.sqlalchemy.org/en/13/orm/extensions/declarative/index.html) system.

To create a mapping, we first define a `Base` Class. We will associate our mapped Classes with the `Base`. We generate the `Base` Class through the `declaritive_base` function.

<div class="code-filename">sa.py</div>

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base


engine = create_engine('sqlite:///ab_nyc.sqlite3', echo=True)

Base = declarative_base()

```

Now we have what we need to create a mapped class.

## Create a mapped class

The work of mapping our data to a table occurs with a mapped Class. This Class describes the **table** we'll be mapping to, its **name**, **columns**, and **data types**.

The mapped Class has a couple of basic requirements. It must inherit from our `Base` Class, have a `__tablename__` attribute (the table to map to), and a **primary key** column.

Let's add this Class to our file. We'll call it `Listing`, to indicate what each row represents.

We create the table's columns and data types by defining attributes on `Listing` and assigning each one a new `Column` object, passing in the respective **data type**.

<div class="code-filename">sa.py</div>

```python
from sqlalchemy import Column, Date, Float, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base


engine = create_engine('sqlite:///ab_nyc.sqlite3', echo=True)

Base = declarative_base()


class Listing(Base):
    __tablename__ = 'listings_sqlalchemy'

    id = Column(Integer, primary_key=True)
    name = Column(String(200))
    
    host_id = Column(Integer)
    host_name = Column(String(50))
    
    neighbourhood_group = Column(String(20))
    neighbourhood = Column(String(20))
    
    latitude = Column(Float)
    longitude = Column(Float)
    
    room_type = Column(String(20))
    price = Column(Integer)
    minimum_nights = Column(Integer)
    
    number_of_reviews = Column(Integer)
    last_review = Column(Date, nullable=True)
    reviews_per_month = Column(Integer)
    calculated_host_listings_count = Column(Integer)
    availability_365 = Column(Integer)

```

Because SQLAlchemy is mapping an Object to a row in a table, it expects that each mapped Class defines a **primary key column**. Without a primary key, SQLAlchemy has no way of knowing which Objects map to which rows.

Later you'll see how we can create rows in our table by creating objects from `Listing`. Let's look at how we can leverage the `Listing` Class to create a table in the database.

## Create the table on the database

Recall from above that a mapped Class was required to inherit from the `Base` Class. When we did this, our mapped Class got placed into a registry on the `Base` Class called **metadata**. 

To create the table defined by our mapped Class we call the `Base.metadata.create_all` function passing in our database `engine`.

<div class="code-filename">sa.py</div>

```python
from sqlalchemy import Column, Date, Float, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base


engine = create_engine('sqlite:///ab_nyc.sqlite3', echo=True)

Base = declarative_base()


class Listing(Base):
    __tablename__ = 'listings_sqlalchemy'

    id = Column(Integer, primary_key=True)
    name = Column(String(200))
    
    host_id = Column(Integer)
    host_name = Column(String(50))
    
    neighbourhood_group = Column(String(20))
    neighbourhood = Column(String(20))
    
    latitude = Column(Float)
    longitude = Column(Float)
    
    room_type = Column(String(20))
    price = Column(Integer)
    minimum_nights = Column(Integer)
    
    number_of_reviews = Column(Integer)
    last_review = Column(Date, nullable=True)
    reviews_per_month = Column(Integer)
    calculated_host_listings_count = Column(Integer)
    availability_365 = Column(Integer)


Base.metadata.create_all(engine)

```

Let's stop at this point and execute the script. Watch what happens. You should see some SQL statements printed to your terminal. If you inspect the database, you should see a new table named `listings_sqlalchemy` with column names corresponding to those on the `Listing` Class.

Pretty neat, right? We haven't had to write any SQL to make this happen. We described the table to SQLAlchemy, and it handled the rest.

Everything is now in place to start moving our data across.

## Insert the data

To insert data into the database, we'll need to do the following:
* Define a database session
* Loop through each line of the CSV and turn its contents into a `Listing` Object
* Pass a list of those objects to a database session to insert them into the database table.

##### Define a database session

To store the data, we'll need a database session. The session handles the specifics of talking to the database and inserting data.

To define a session, we use the `sessionmaker` method and bind our `engine` object to it.

<div class="code-filename">sa.py</div>

```python
from sqlalchemy import Column, Date, Float, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


engine = create_engine('sqlite:///ab_nyc.sqlite3', echo=True)

Base = declarative_base()


class Listing(Base):
    # ...


Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)

```

Although we have our `Session` defined and ready to go, we haven't made any connections to the database yet.

##### Create mapped Objects

We can now start creating mapped Objects from our CSV data.

To do this, we first open the CSV file using the `with` statement ([context manager](https://stackabuse.com/python-context-managers/)).

To read the CSV contents, we use `csv.DictReader`. The `DictReader` returns each row as a dictionary with key names from the header row. By using dictionaries, we'll also be able to use the [dictionary unpacking operator](https://stackabuse.com/unpacking-in-python-beyond-parallel-assignment/) when creating our objects.

With a list comprehension, we loop through each row of the `csvreader`. The function `prepare_listing` performs some light transformation of the data and returns a `Listing` Object made from our previously defined mapped Class.

<div class="code-filename">sa.py</div>

```python
import csv

from dateutil.parser import parse
from sqlalchemy import Column, Date, Float, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


engine = create_engine('sqlite:///ab_nyc.sqlite3', echo=True)

Base = declarative_base()


class Listing(Base):
    # ...


Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)


def parse_none(dt):
    try:
        return parse(dt)
    except:
        return None


def prepare_listing(row):
    row["last_review"] = parse_none(row["last_review"])
    return Listing(**row)


with open('AB_NYC_2019.csv', encoding='utf-8', newline='') as csv_file:
    csvreader = csv.DictReader(csv_file, quotechar='"')

    listings = [prepare_listing(row) for row in csvreader]

```

##### Store in the database

Now we have a list of mapped Objects we have everything we need to insert the data in the database.

We do this by creating a new `Session` object from the `Session` class defined earlier.

Because our list contains thousands of records, we'll use the `session.add_all method`, one of the [bulk insert options](https://docs.sqlalchemy.org/en/13/_modules/examples/performance/bulk_inserts.html) available in SQLAlchemy. The `add_all` method will perform batches of inserts rather than inserting one at a time.

<div class="code-filename">sa.py</div>

```python
import csv

from dateutil.parser import parse
from sqlalchemy import Column, Date, Float, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


engine = create_engine('sqlite:///ab_nyc.sqlite3', echo=True)

Base = declarative_base()


class Listing(Base):
    # ...


Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)


def parse_none(dt):
    try:
        return parse(dt)
    except:
        return None


def prepare_listing(row):
    row["last_review"] = parse_none(row["last_review"])
    return Listing(**row)


with open('AB_NYC_2019.csv', encoding='utf-8', newline='') as csv_file:
    csvreader = csv.DictReader(csv_file, quotechar='"')

    listings = [prepare_listing(row) for row in csvreader]

    session = Session()
    session.add_all(listings)
    session.commit()

```

To complete the database transaction and store the data, we call `session.commit`

Lastly, all that's left to do is run our file and inspect the results in our database browser. You should see the data added as rows in the table.

## Conclusion

There we have it. You've successfully moved data to a database with SQLAlchemy.

The neat thing about this method is we didn't have to write any SQL and kept everything inside Python. And it didn't even matter that [SQLite only supports limited data types](https://www.sqlite.org/datatype3.html), SQLAlchemy took care of this for us.

Check back soon for the final article in this series, where we'll take a look at the most straightforward method for moving data to a database - with pandas.
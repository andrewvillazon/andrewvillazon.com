---
title: "Connect SQLAlchemy and Databricks"
date: "2023-03-12"
tags:
    - Python
    - Databricks
    - Snippets
---

If you want to use Databricks as a SQL data source in Python, you'll likely want to take advantage of sqlalchemy. Here's how we can connect sqlalchemy and Databricks.

**Note: This is tested against sqlalchemy version 1.4 and may vary slightly in version 2.*

## Connecting to Databricks

### Install Connector

Firstly, install the [databricks-sql-python connecter](https://docs.databricks.com/integrations/jdbc-odbc-bi.html#connection-details-cluster) (driver), published by Databricks. 

```sh
pip install databricks-sql-connector
```

The connector adds a **Databricks dialect** for sqlalchemy (the dialect is the system sqlalchemy uses to communicate with the Database).

### Connection Information

Before you connect, you'll need a handful of connection values:

* **Server hostname**: The web address of your Databricks instance (excluding 'https://')
* **Port number**: The specific port number of your Databricks instance, default is **443**
* **HTTP Path**: The HTTP Path of your SQL Warehouse or Cluster
* **Personal Access Token**: Access token that identifies the connecting user or application.

All connection details can be found in the Databricks UI, as outlined [here](https://docs.databricks.com/integrations/jdbc-odbc-bi.html#retrieve-the-connection-details). 

If you don't have Personal Access Token, create one by following the [instructions](https://docs.databricks.com/dev-tools/auth.html#personal-access-tokens-for-users) in the Databricks documentation. Creating a Personal Access Token specifically for Python is also good practice.

### Connection String

The connection string follows the sqlalchemy [Database URL](https://docs.sqlalchemy.org/en/20/core/engines.html#database-urls) format.

```
databricks://token:<token>@<host>:<port>/<database>?http_path=<http_path>
```

There are a couple of things of note: we're using `token` as the username value and your Personal Access Token as the password value; we've specified the `http_path` as a Database URL [query parameter](https://docs.sqlalchemy.org/en/20/core/engines.html#add-parameters-to-the-url-query-string).

### Connecting with engine

Connecting then follows the regular sqlalchemy pattern of creating an engine.

```python
from sqlalchemy import create_engine


hostname = "mydatabrickshostname.databricks.com"
token = "databricks123456789"
port = 443
db = "mydb"
http_path = "/my/warehouse/path"

conn_string = (
    "databricks://token:{token}@{host}:{port}/{database}?http_path={http_path}".format(
        token=token,
        host=hostname,
        port=port,
        database=db,
        http_path=http_path,
    )
)

engine = create_engine(conn_string, echo=True)

```

### Connection string with URL class

Alternatively, we can use sqlalchemy's [URL class](https://docs.sqlalchemy.org/en/20/core/engines.html#creating-urls-programmatically) to build a connection string.

```python
from sqlalchemy import create_engine
from sqlalchemy.engine import URL


hostname = "mydatabrickshostname.databricks.com"
token = "databricks123456789"
port = 443
db = "mydb"
http_path = "/my/warehouse/path"

db_url = URL.create(
    "databricks",
    username="token",
    password=token,
    host=hostname,
    port=port,
    database=db,
    query={"http_path": http_path}
)

engine = create_engine(db_url, echo=True)

```

## Examples

### Reflect a Databricks table

```python
from sqlalchemy import create_engine, MetaData, Table


hostname = "mydatabrickshostname.databricks.com"
token = "databricks123456789"
port = 443
db = "mydb"
http_path = "/my/warehouse/path"

conn_string = (
    "databricks://token:{token}@{host}:{port}/{database}?http_path={http_path}".format(
        token=token,
        host=hostname,
        port=port,
        database=db,
        http_path=http_path,
    )
)

engine = create_engine(conn_string, echo=True)

metadata = MetaData()
table = Table("my_table", metadata, autoload_with=engine, schema="my_schema")

print([col.name for col in table.columns])

```

### Pandas DataFrame

```python
import pandas as pd
from sqlalchemy import create_engine, MetaData, Table, select


hostname = "mydatabrickshostname.databricks.com"
token = "databricks123456789"
port = 443
db = "mydb"
http_path = "/my/warehouse/path"

conn_string = (
    "databricks://token:{token}@{host}:{port}/{database}?http_path={http_path}".format(
        token=token,
        host=hostname,
        port=port,
        database=db,
        http_path=http_path,
    )
)

engine = create_engine(conn_string, echo=True)

metadata = MetaData()
table = Table("my_table", metadata, autoload_with=engine, schema="my_schema")

with engine.connect() as connection:
    stmt = select(table)
    my_df = pd.read_sql(stmt, con=connection)

print(my_df.info())
```

## See also

* [Databricks SQL Connector for Python](https://docs.databricks.com/dev-tools/python-sql-connector.html)
* [Database URLs](https://docs.sqlalchemy.org/en/20/core/engines.html#database-urls)
* [sqlalchemy-databricks](https://github.com/crflynn/sqlalchemy-databricks)
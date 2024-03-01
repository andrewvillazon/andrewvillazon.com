---
title: "Adding source file information to tables in Databricks"
date: "2024-03-01"
tags:
    - Databricks
---

Data pipelines are often complex, and because of this, debugging and pinpointing errors in a pipeline can sometimes be challenging. A practice that can help is including source file information with the data when ingested.

In this post, we'll look at a helpful feature of Spark (Databricks' processing engine) that lets you add source file details as part of SQL-based data ingestion from files. This information can help us more easily identify where an error might be occurring in a pipeline.

## The hidden `_metadata` column

As of [Spark 3.2.0](https://spark.apache.org/releases/spark-release-3-2-0.html), the source file information for a row is readily available through a 'hidden' column named [`_metadata`](https://docs.databricks.com/en/ingestion/file-metadata-column.html). The `_metadata` column is an *always available* column that Spark makes accessible in a SQL Query.

For a given row, the `_metadata` column contains useful information such as the source file name, file path, and file modification time.

To use the column and its information, we only need to include it in our query's `SELECT` statement.

```sql
SELECT
    *
    ,_metadata
FROM
    json.`/path/to/table/data`
```

Because the `_metadata` column is a `STRUCT` type, we can access its values like regular semi-structured data, i.e., using the **extraction paths** syntax.

```sql
SELECT
    *
    ,_metadata
    ,_metadata.file_path
    ,_metadata.file_name
    ,_metadata.file_modification_time
FROM
    json.`/path/to/table/data`
```

## A couple of quick caveats

Now, before adding the `_metadata` column to your ingestions, here are a couple of things to be aware of.

### _metadata behavior

The `_metadata` column has slightly different behavior depending on where it is used.

If using the `_metadata` column in a `SELECT` on an existing table, the `_metadata` column will hold details from the table's underlying files (e.g., parquet files for Delta Tables), not the record's originating source files.

```sql{3}
SELECT
    *
    ,_metadata -- _metadata pertains to the Delta Table parquet files
FROM
    my_delta_table
```

To make the source file information available, we need to include the `_metadata` column at the point where we access the source files.

```sql{7}
CREATE TABLE my_delta_table

AS

SELECT
    *
    ,_metadata AS source_metadata -- _metadata pertains to source files
FROM
    json.`/path/to/table/data`
```

### Naming

Because the `_metadata` column changes depending on where it's used, Databricks [recommends](https://docs.databricks.com/en/ingestion/file-metadata-column.html#use-in-auto-loader) aliasing the `_metadata` column to something else, such as `source_metadata`. 

If you leave the `_metadata` column as is, there is potential to make the `_metadata` column of the destination table inaccessible.

```sql{7}
CREATE TABLE my_table

AS

SELECT
    *
    ,_metadata -- makes _metadata for my_table inaccessible
FROM
    json.`/path/to/table/data`
```

As a side note, a convention I like to use is to prefix the column to indicate the column is system or platform generated rather than part of the data itself, e.g., `sys_source_metadata`, `sys_source_file_name`, and then place these columns at the end of the table.

```sql
CREATE TABLE my_table

AS

SELECT
    *
    ,_metadata AS sys_source__metadata
    ,_metadata.file_path AS sys_source_file_path
    ,_metadata.file_name AS sys_source_file_name
    ,current_timestamp() AS sys_loaded_dtm
FROM
    json.`/path/to/table/data`
```

## Examples

### Use in a CTAS Statement

```sql
CREATE TABLE my_table

AS

SELECT
    *
    ,_metadata AS source_metadata
FROM
    json.`/path/to/table/data`
```

### Use with `COPY INTO`

To include the `_metadata` with a `COPY INTO` statement, we must use the optional `SELECT` expression component of `COPY INTO`

```sql
COPY INTO
    my_table
FROM
    (
        SELECT
            *
            ,_metadata AS source_metadata
        FROM
            '/path/to/table/data'
    )
FILEFORMAT = JSON
```

### Use in a Streaming Table

```sql
CREATE OR REFRESH STREAMING TABLE my_table

AS

SELECT
    *
    ,_metadata AS source_metadata
FROM
    STREAM
    read_files(
        '/path/to/table/data'
        ,format => 'json'
    )
```

## Summing Up

Adding source file information to your table loads in Databricks is as simple as adding Spark's built-in `_metadata` column with your ingestion query. 

Next time you're loading files into a table, try including the `_metadata` column for improved debugging and traceability.

## Further Reading

* [File metadata column](https://docs.databricks.com/en/ingestion/file-metadata-column.html)
* [Load data into a Databricks lakehouse](https://docs.databricks.com/en/ingestion/index.html)
* [Hidden File Metadata Support for Spark SQL](https://issues.apache.org/jira/browse/SPARK-37273)

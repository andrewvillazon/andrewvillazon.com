---
title: "Querying LIST, SHOW, DESCRIBE, and other SQL commands in Snowflake"
date: "2025-12-30"
tags:
    - Snowflake
    - Snippets
description: "How to query the outputs of various Snowflake SQL commands."
---

In Snowflake, there are a number of helpful [SQL commands](https://docs.snowflake.com/en/sql-reference-commands) that provide details about objects in the platform, such as `LIST`, `SHOW`, and `DESCRIBE`.

From time to time, you may find yourself wanting to query the outputs of these commands as part of routine administration or troubleshooting, e.g., finding users that match a specific pattern or searching the contents of a stage.

In this post, we'll take a look at three different ways you can query the results of these commands to increase their utility.

## Using the Pipe Operator

The Snowflake [Pipe Operator](https://docs.snowflake.com/en/sql-reference/operators-flow#pipe) is a special feature of Snowflake's SQL dialect that lets you *pipe* the result set from one statement into the `FROM` clause of the query that follows.

The Pipe operator, `->>`, uses a syntax that references the result set of the previous statement using the dollar sign (`$`) and its number in the sequence, e.g., `$1`

```sql
STATEMENT_1
->> SELECT ... FROM $1
->> SELECT ... FROM $2
->> SELECT ... FROM $3
...

```

Let's see how this works by looking at an example that uses the `LIST` command to count the number of files that arrive at a stage each day.

Here we **pipe** the `LIST` command into our second query, making it accessible via `$1` in the subsequent query. In the subsequent query, we aggregate the file count to the day level and order accordingly.

```sql{1,2,12}
LIST @my_db.my_schema.my_stage
->> SELECT
        CAST(
            TO_TIMESTAMP(
                "last_modified"
                ,'DY, DD MON YYYY HH24:MI:SS GMT'
            ) 
            AS DATE
        ) AS last_modified_date
        ,COUNT(*) AS total_files
    FROM
        $1
    GROUP BY
        ALL
    ORDER BY
        last_modified_date DESC;

```

## Using `LAST_QUERY_ID`, `RESULT_SCAN`, and `TABLE`

Each time a SQL statement runs, Snowflake generates a unique query ID in the background. This ID can be used in conjunction with the [RESULT_SCAN](https://docs.snowflake.com/en/sql-reference/functions/result_scan) function and [TABLE literals](https://docs.snowflake.com/en/sql-reference/literals-table) to query the result set of a previously run statement. 

The syntax for this approach looks something like this.

```sql
STATEMENT;
SELECT 
    cols
FROM
    TABLE(RESULT_SCAN(LAST_QUERY_ID()));

```

To see how this works, let's look at an example where we might want to examine specific IP ranges of a Network Rule.

```sql{6}
DESCRIBE NETWORK RULE MY_DB.MY_SCHEMA.MY_NETWORK_RULE;

SELECT
    IP.VALUE::STRING AS IP
FROM
    TABLE(RESULT_SCAN(LAST_QUERY_ID()))
    ,LATERAL FLATTEN(input=>split("value_list", ',')) AS IP
WHERE
    IP.VALUE LIKE '10%';

```

First, we run `DESCRIBE NETWORK RULE;`, generating a unique query ID. The query ID produced by the statement can be retrieved using the [LAST_QUERY_ID](https://docs.snowflake.com/en/sql-reference/functions/last_query_id) function.

The `DESCRIBE NETWORK RULE` result has the allowed IPs as a comma-separated list in a single column. To turn this into rows, we use `LATERAL`, `FLATTEN`, and `SPLIT`. Lastly, the `WHERE` clause allows us to filter for the desired IPs.

## Using Snowpark

This method uses a feature of [Snowpark](https://www.phdata.io/blog/what-is-snowpark/): the ability to capture the results of a SQL statement as a [DataFrame](https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame), including SQL commands. With the results in a Dataframe, we can perform Dataframe operations to suit.

Consider the example below, where we want to find our Service Users and when they last logged in.

```python{6-8}
from snowflake.snowpark.context import get_active_session


session = get_active_session()

session.sql("SHOW USERS;") \
    .filter('"type" = \'SERVICE\'') \
    .select('"name"', '"comment"', '"last_success_login"')

```

First, we import and generate our session object with `get_active_session()`. Then we run the `SHOW USERS` command using the session's [sql method](https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.Session.sql). Calling the `sql` method returns a regular Dataframe, which we then `filter` and `select` as required.

## Summing Up

In this post, we looked at three different ways to query the results of various Snowflake SQL commands. While the examples briefly covered the `LIST`, `SHOW`, and `DESCRIBE` commands, the techniques explored can also apply to many other commands. 

Next time you've got some complex administration or troubleshooting to do on Snowflake, give these a go!

## Further Reading

* [Flow operators](https://docs.snowflake.com/en/sql-reference/operators-flow)
* [RESULT_SCAN](https://docs.snowflake.com/en/sql-reference/functions/result_scan)
* [LAST_QUERY_ID]()
* [SQL command reference](https://docs.snowflake.com/en/sql-reference-commands)

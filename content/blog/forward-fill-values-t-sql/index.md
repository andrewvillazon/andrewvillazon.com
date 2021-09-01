---
title: "Four ways to forward fill values in T-SQL (the last non null problem)"
date: "2021-08-31"
tags:
    - SQL Server
---

In this post, we will look at how to forward-fill values in T-SQL, also known as the **last non-null problem**.

By forward-filling, we're taking the previous row's value and using it in the current row if the current row value is `NULL` - in effect carrying the last non-null value forward.

The table below demonstrates forward-filling:

```
| value_with_nulls | forward_filled |
|------------------|----------------|
| 12               | 12             |
| NULL             | 12             |
| NULL             | 12             |
| 93               | 93             |
| 27               | 27             |
| NULL             | 27             |
```

## Setting up the data

Before we begin, let's set up some example data. There's just one thing our data needs, and that's a column to order the rows. In this data, I've used a date column, `measured_on`

I've also included a column `event_id`. While it's not strictly required, it adds a grouping element that is more like real-world data.

```sql
DROP TABLE IF EXISTS #demo_data
CREATE TABLE #demo_data (
    event_id INT
    ,measured_on DATE
    ,measurement INT
)

INSERT INTO #demo_data
VALUES
(1,'2021-06-06',NULL)
,(1,'2021-06-07', 5)
,(1,'2021-06-08',NULL)
,(1,'2021-06-09',NULL)
,(2,'2021-05-22',42)
,(2,'2021-05-23',42)
,(2,'2021-05-25',NULL)
,(2,'2021-05-26',11)
,(2,'2021-05-27',NULL)
,(2,'2021-05-27',NULL)
,(3,'2021-07-01',NULL)
,(3,'2021-07-03',NULL);
```

Here's what the final result set should look like:

```
| event_id | measured_on | measurement | forward_filled |
|----------|-------------|-------------|----------------|
| 1        | 2021-06-06  | NULL        | NULL           |
| 1        | 2021-06-07  | 5           | 5              |
| 1        | 2021-06-08  | NULL        | 5              |
| 1        | 2021-06-09  | NULL        | 5              |
| 2        | 2021-05-22  | 42          | 42             |
| 2        | 2021-05-23  | 42          | 42             |
| 2        | 2021-05-25  | NULL        | 42             |
| 2        | 2021-05-26  | 11          | 11             |
| 2        | 2021-05-27  | NULL        | 11             |
| 2        | 2021-05-27  | NULL        | 11             |
| 3        | 2021-07-01  | NULL        | NULL           |
| 3        | 2021-07-03  | NULL        | NULL           |
```

## Using a subquery in the SELECT clause

The first method uses a subquery inside the `SELECT` clause to get the first non-null value before the current row.

The solution has two parts. 

First, we create a subquery that returns the first non-null value before the current row.

```sql{10}
SELECT
    *
    ,(SELECT TOP 1
            inner_table.measurement
        FROM
            #demo_data as inner_table
        WHERE
                inner_table.event_id = #demo_data.event_id
            AND inner_table.measured_on < #demo_data.measured_on
            AND inner_table.measurement IS NOT NULL
        ORDER BY
            inner_table.measured_on DESC) as step_1
FROM
    #demo_data
```

```
| event_id | measured_on | measurement | step_1 |
|----------|-------------|-------------|--------|
| 1        | 2021-06-06  | NULL        | NULL   |
| 1        | 2021-06-07  | 5           | NULL   |
| 1        | 2021-06-08  | NULL        | 5      |
| 1        | 2021-06-09  | NULL        | 5      |
| 2        | 2021-05-22  | 42          | NULL   |
| 2        | 2021-05-23  | 42          | 42     |
| 2        | 2021-05-25  | NULL        | 42     |
| 2        | 2021-05-26  | 11          | 42     |
| 2        | 2021-05-27  | NULL        | 11     |
| 2        | 2021-05-27  | NULL        | 11     |
| 3        | 2021-07-01  | NULL        | NULL   |
| 3        | 2021-07-03  | NULL        | NULL   |
```

However, the last non-null value carries forward but only after the starting row. To fix this, we wrap the subquery in a `CASE` statement which returns the subquery if the current value is `NULL`; otherwise, the non-null value.

```sql{4,16,17}
SELECT
    *
    ,CASE 
        WHEN measurement IS NULL THEN (
            SELECT TOP 1
                inner_table.measurement
            FROM
                #demo_data as inner_table
            WHERE
                    inner_table.event_id = #demo_data.event_id
                AND inner_table.measured_on < #demo_data.measured_on
                AND inner_table.measurement IS NOT NULL
            ORDER BY
                inner_table.measured_on DESC
        )
    ELSE
        measurement
    END as forward_filled
FROM
    #demo_data
```

## Outer Apply Solution

This solution is similar to the above but uses `OUTER APPLY` in place of the subquery in the `SELECT` clause.

If you're unfamiliar with `CROSS` & `OUTER APPLY` in t-sql, these *apply* their subquery results to each row of the table to the left.

```sql
SELECT
    *
FROM
    #demo_data
        OUTER APPLY (
            SELECT TOP 1
                inner_resultset.measurement as forward_filled
            FROM
                #demo_data as inner_resultset
            WHERE
                    inner_resultset.event_id = #demo_data.event_id
                AND inner_resultset.measured_on <= #demo_data.measured_on
                AND inner_resultset.measurement IS NOT NULL
            ORDER BY
                inner_resultset.measured_on DESC
        ) as first_non_null
```

```
| event_id | measured_on | measurement | forward_filled |
|----------|-------------|-------------|----------------|
| 1        | 2021-06-06  | NULL        | NULL           |
| 1        | 2021-06-07  | 5           | 5              |
| 1        | 2021-06-08  | NULL        | 5              |
| 1        | 2021-06-09  | NULL        | 5              |
| 2        | 2021-05-22  | 42          | 42             |
| 2        | 2021-05-23  | 42          | 42             |
| 2        | 2021-05-25  | NULL        | 42             |
| 2        | 2021-05-26  | 11          | 11             |
| 2        | 2021-05-27  | NULL        | 11             |
| 2        | 2021-05-27  | NULL        | 11             |
| 3        | 2021-07-01  | NULL        | NULL           |
| 3        | 2021-07-03  | NULL        | NULL           |
```

Note that if we use `CROSS APPLY` instead of `OUTER APPLY`, we will eliminate the rows with `NULL` inside the column we're trying to carry forward.

## Using a Window Function

The first component of this approach creates a column that groups the last non-null and null rows by `event_id`. 

To create this column, we use the `COUNT` aggregate function with the `OVER` clause. `OVER` turns the `COUNT` into a window function and applies a `COUNT` function per group of `event_id` rows.


```sql{9}
SELECT
    *
FROM
    (
        SELECT
            event_id
            ,measured_on
            ,measurement
            ,COUNT(measurement) OVER (PARTITION BY event_id ORDER BY measured_on) as grouper
        FROM
            #demo_data
    ) as grouped
```

Run this query. You'll see that the `grouper` column increments only if a value is inside the measurement column and per `event_id`.

```
| event_id | measured_on | measurement | grouper |
|----------|-------------|-------------|---------|
| 1        | 2021-06-06  | NULL        | 0       |
| 1        | 2021-06-07  | 5           | 1       |
| 1        | 2021-06-08  | NULL        | 1       |
| 1        | 2021-06-09  | NULL        | 1       |
| 2        | 2021-05-22  | 42          | 1       |
| 2        | 2021-05-23  | 42          | 2       |
| 2        | 2021-05-25  | NULL        | 2       |
| 2        | 2021-05-26  | 11          | 3       |
| 2        | 2021-05-27  | NULL        | 3       |
| 2        | 2021-05-27  | NULL        | 3       |
| 3        | 2021-07-01  | NULL        | 0       |
| 3        | 2021-07-03  | NULL        | 0       |
```

To forward fill, all we do is retrieve the `MAX` value by the new `grouper` column.

```sql{5}
SELECT
    event_id
    ,measured_on
    ,measurement
    ,MAX(measurement) OVER (PARTITION BY event_id, grouper) as forward_filled
FROM
    (
        SELECT
            event_id
            ,measured_on
            ,measurement
            ,COUNT(measurement) OVER (PARTITION BY event_id ORDER BY measured_on) as grouper
        FROM
            #demo_data
    ) as grouped
ORDER BY
    event_id
    ,measured_on
```

```
| event_id | measured_on | measurement | forward_filled |
|----------|-------------|-------------|----------------|
| 1        | 2021-06-06  | NULL        | NULL           |
| 1        | 2021-06-07  | 5           | 5              |
| 1        | 2021-06-08  | NULL        | 5              |
| 1        | 2021-06-09  | NULL        | 5              |
| 2        | 2021-05-22  | 42          | 42             |
| 2        | 2021-05-23  | 42          | 42             |
| 2        | 2021-05-25  | NULL        | 42             |
| 2        | 2021-05-26  | 11          | 11             |
| 2        | 2021-05-27  | NULL        | 11             |
| 2        | 2021-05-27  | NULL        | 11             |
| 3        | 2021-07-01  | NULL        | NULL           |
| 3        | 2021-07-03  | NULL        | NULL           |
```

## Recursive CTE solution

This solution uses a more advanced technique known as a recursive CTE. Recursive CTEs are a special kind of Common Table Expression in which the CTE references itself. The goal of this post is not to explain CTEs, so I'll assume you're familiar with them.

There's a bit to unpack in this solution, but let's start with the recursive CTE itself.

We start with creating a base query and include a column with an incrementing row number per event_id. We call this column `idx` 

```sql{3}
;WITH base_data AS (
    SELECT 
        ROW_NUMBER() OVER (PARTITION BY #demo_data.event_id ORDER BY #demo_data.measured_on) AS idx
        ,#demo_data.event_id
        ,#demo_data.measured_on
        ,#demo_data.measurement
    FROM
        #demo_data
)
```

To set up the recursive query, we first retrieve the first row of each `event_id`. Then we `UNION ALL` the remaining rows from the base query. 

In the `FROM` clause, we `INNER JOIN` the recursing query and offset the `idx` column by 1. This offsetting allows us to access the previous row.

To achieve the forward filling, we use `ISNULL` in the `SELECT` statement to substitute the previous row's value if the current row value is `NULL`.

```sql{3,18,26,30,31}
;WITH base_data AS (
    SELECT 
        ROW_NUMBER() OVER (PARTITION BY #demo_data.event_id ORDER BY #demo_data.measured_on) AS idx
        ,#demo_data.event_id
        ,#demo_data.measured_on
        ,#demo_data.measurement
    FROM
        #demo_data
), recursing_query AS (
    SELECT 
        idx
        ,event_id
        ,measured_on
        ,measurement
    FROM 
        base_data
    WHERE 
        idx = 1
    
    UNION ALL

    SELECT 
        base_data.idx
        ,base_data.event_id
        ,base_data.measured_on
        ,ISNULL(base_data.measurement, recursing_query.measurement)
    FROM
        base_data
            INNER JOIN recursing_query
                ON recursing_query.event_id = base_data.event_id 
                AND recursing_query.idx = base_data.idx - 1
)
```

Now we can `SELECT` the values from the CTE. The `ORDER BY` ensures the rows come out as expected.

```sql{39-41}
;WITH base_data AS (
    SELECT 
        ROW_NUMBER() OVER (PARTITION BY #demo_data.event_id ORDER BY #demo_data.measured_on) AS idx
        ,#demo_data.event_id
        ,#demo_data.measured_on
        ,#demo_data.measurement
    FROM
        #demo_data
), recursing_query AS (
    SELECT 
        idx
        ,event_id
        ,measured_on
        ,measurement
    FROM 
        base_data
    WHERE 
        idx = 1
    
    UNION ALL

    SELECT 
        base_data.idx
        ,base_data.event_id
        ,base_data.measured_on
        ,ISNULL(base_data.measurement, recursing_query.measurement)
    FROM
        base_data
            INNER JOIN recursing_query
                ON recursing_query.event_id = base_data.event_id 
                AND recursing_query.idx = base_data.idx - 1
)
SELECT
    recursing_query.event_id
    ,recursing_query.measured_on
    ,recursing_query.measurement as forward_filled
FROM
    recursing_query
ORDER BY
    recursing_query.event_id
    ,recursing_query.measured_on
```

```
| event_id | measured_on | forward_filled |
|----------|-------------|----------------|
| 1        | 2021-06-06  | NULL           |
| 1        | 2021-06-07  | 5              |
| 1        | 2021-06-08  | 5              |
| 1        | 2021-06-09  | 5              |
| 2        | 2021-05-22  | 42             |
| 2        | 2021-05-23  | 42             |
| 2        | 2021-05-25  | 42             |
| 2        | 2021-05-26  | 11             |
| 2        | 2021-05-27  | 11             |
| 2        | 2021-05-27  | 11             |
| 3        | 2021-07-01  | NULL           |
| 3        | 2021-07-03  | NULL           |
```

At this point, we've forward filled. To arrive at a solution that includes the original last non-null values, `LEFT JOIN` the base data.

```sql{6,10-12}
--- ... Recursive setup

SELECT
    recursing_query.event_id
    ,recursing_query.measured_on
    ,base_data.measurement
    ,recursing_query.measurement as forward_filled
FROM
    recursing_query
        LEFT OUTER JOIN base_data
            ON base_data.event_id = recursing_query.event_id
            AND base_data.idx = recursing_query.idx
ORDER BY
    recursing_query.event_id
    ,recursing_query.measured_on
```
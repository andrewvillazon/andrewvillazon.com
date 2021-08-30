---
title: "Forward fill values in T-SQL (the last non null problem)"
date: "2021-08-31"
tags:
    - SQL Server
---

In this post, we will look at how to forward-fill values in T-SQL, also known as the **last non-null problem**.

By forward-filling, we're taking the previous row's value and using it in the current row if the current row value is `NULL` - in effect carrying the last non-null value forward.

[TABLE DEMO WITH BEFORE AND AFTER]

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


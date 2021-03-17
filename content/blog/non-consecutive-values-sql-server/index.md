---
title: "Identify non-consecutive values in SQL Server"
date: "2021-02-24"
tags:
    - SQL Server
---

In this two-part series, we look at different solutions to a SQL problem - how to **identify consecutive** or **non-consecutive values** in a column. Also known as the **Gaps and Islands** problem. 

Understanding the Gaps and Islands problem is useful for analyzing data that features sequences or breaks in sequences.

This post, part one of the series, will look at methods for identifying non-consecutive values (Gaps). In part two, we explore ways to identify consecutive values (Islands).

## What is the Gaps and Islands problem?

As the name implies, there are two components.

**Gaps** - rows where a row value *does not* sequentially follow another...

```{2-3,6-7,9-10}
1
2
8
9
10
11
15
16
17
22
```

...and **Islands** - rows where a row value follows another in an unbroken succession.

``` {1-2,4-7,9-11}
1
2

8
9
10
11

15
16
17
22
```

## Identifying Gaps

To identify Gaps, we need to **determine where a sequence ends, and another begins**. In between these points are where a gap starts and ends.

In general, each approach compares the current row with the next row to determine if it's the next value in the sequence. If it isn't, then we've found a gap.

### With the LEAD window function

This approach uses the `LEAD` window function. The [LEAD function](https://docs.microsoft.com/en-us/sql/t-sql/functions/lead-transact-sql?view=sql-server-ver15) lets you access values from rows that follow the current row.

First, we apply the `LEAD` function to generate a result set of the current row value and next row value.

```sql{12,13}
-- Data setup
DECLARE @sequences TABLE
(
    value_of_interest INTEGER
)
INSERT INTO @sequences
VALUES (1),(2),(3),(6),(7),(9),(11),(12),(20),(25)

-- Solution begins
SELECT
    value_of_interest
    ,LEAD(value_of_interest,1, value_of_interest) 
        OVER(ORDER BY value_of_interest) as next_row_value
FROM
    @sequences
```

```
| value_of_interest | next_row_value |
|-------------------|----------------|
| 1                 | 2              |
| 2                 | 3              |
| 3                 | 6              |
| 6                 | 7              |
| 7                 | 9              |
| 9                 | 11             |
| 11                | 12             |
| 12                | 20             |
| 20                | 25             |
| 25                | 25             |
```

To identify gaps, we subtract the current row value from the next row value. For rows where a sequence ends, the difference will be **greater than 1**.

```sql
/* Data setup */

SELECT
    value_of_interest
    ,next_row_value
    ,next_row_value - value_of_interest as sequence_ind
FROM
    (
        SELECT
            num_sequence.value_of_interest
            ,LEAD(value_of_interest,1, value_of_interest) 
                OVER(ORDER BY value_of_interest) as next_row_value
        FROM
            @sequences as num_sequence
    ) as curr_and_next
```

```{5,7,8,10,11}
| value_of_interest | next_row_value | sequence_ind |
|-------------------|----------------|--------------|
| 1                 | 2              | 1            |
| 2                 | 3              | 1            |
| 3                 | 6              | 3            |
| 6                 | 7              | 1            |
| 7                 | 9              | 2            |
| 9                 | 11             | 2            |
| 11                | 12             | 1            |
| 12                | 20             | 8            |
| 20                | 25             | 5            |
| 25                | 25             | 0            |
```

To isolate the sequence end and starts, we filter for the rows where the **difference is greater than 1**.

To arrive at the gaps, we **add 1** to the sequence end and **subtract 1** from the sequence start.

```sql{4,5,16}
/* Data setup */

SELECT
    value_of_interest + 1 as gap_starts
    ,next_row_value - 1 as gap_ends
FROM
    (
    SELECT
        num_sequence.value_of_interest
        ,LEAD(value_of_interest,1, value_of_interest) 
            OVER(ORDER BY value_of_interest) as next_row_value
    FROM
        @sequences as num_sequence
    ) as curr_and_next
WHERE
    next_row_value - value_of_interest > 1
```

```
| gap_starts | gap_ends |
|------------|----------|
| 4          | 5        |
| 8          | 8        |
| 10         | 10       |
| 13         | 19       |
| 21         | 24       |
```

### With the ROW_NUMBER function

This approach leverages a [Common Table Expression (CTE)](https://docs.microsoft.com/en-us/sql/t-sql/queries/with-common-table-expression-transact-sql?view=sql-server-ver15) joined to itself to create a result set of the current row and next row. Like the above approach, we compare the current row and the next row to identify a gap.

First, we'll create a CTE of the rows and their [row number](https://docs.microsoft.com/en-us/sql/t-sql/functions/row-number-transact-sql?view=sql-server-ver15).

```sql{8,9}
/* Data setup */

;
WITH current_row AS
(
SELECT
    num_sequence.value_of_interest
    ,ROW_NUMBER() 
        OVER(ORDER BY num_sequence.value_of_interest) as row_num
FROM
    @sequences as num_sequence
)
SELECT
    value_of_interest
    ,row_num
FROM
    current_row;
```

```
| value_of_interest | row_num |
|-------------------|---------|
| 1                 | 1       |
| 2                 | 2       |
| 3                 | 3       |
| 6                 | 4       |
| 7                 | 5       |
| 9                 | 6       |
| 11                | 7       |
| 12                | 8       |
| 20                | 9       |
| 25                | 10      |
```

To get the current row and the next row, we join the CTE to itself based on the **row number plus 1**.

```sql{18-19}
/* Data setup */

;
WITH current_row AS
(
SELECT
    num_sequence.value_of_interest
    ,ROW_NUMBER() 
        OVER(ORDER BY num_sequence.value_of_interest) as row_num
FROM
    @sequences as num_sequence
)
SELECT
    current_row.value_of_interest
    ,next_row.value_of_interest as next_row_value
FROM
    current_row
        INNER JOIN current_row as next_row
            ON next_row.row_num = current_row.row_num + 1
;
```

```
| value_of_interest | next_row_value |
|-------------------|----------------|
| 1                 | 2              |
| 2                 | 3              |
| 3                 | 6              |
| 6                 | 7              |
| 7                 | 9              |
| 9                 | 11             |
| 11                | 12             |
| 12                | 20             |
| 20                | 25             |
```

To identify where a sequence ended, we subtract the current row from the next row. When the sequence ends, the result of the subtraction is **greater than 1**.

As we did in the previous solution, we isolate the sequence ends and starts by placing the subtraction in the `WHERE` clause.

```sql{21}
/* Data setup */

;
WITH current_row AS
(
SELECT
    num_sequence.value_of_interest
    ,ROW_NUMBER() 
        OVER(ORDER BY num_sequence.value_of_interest) as row_num
FROM
    @sequences as num_sequence
)
SELECT
    current_row.value_of_interest as sequence_ended
    ,next_row.value_of_interest as sequence_began
FROM
    current_row
        INNER JOIN current_row as next_row
            ON next_row.row_num = current_row.row_num + 1
WHERE
    next_row.value_of_interest - current_row.value_of_interest > 1
;
```

```
| sequence_ended | sequence_began |
|----------------|----------------|
| 3              | 6              |
| 7              | 9              |
| 9              | 11             |
| 12             | 20             |
| 20             | 25             |
```

To derive the gap start and end points, we **add 1** to the sequence end and **subtract 1** from the sequence start.

```sql{14-15}
/* Data setup */

;
WITH current_row AS
(
SELECT
    num_sequence.value_of_interest
    ,ROW_NUMBER() 
        OVER(ORDER BY num_sequence.value_of_interest) as row_num
FROM
    @sequences as num_sequence
)
SELECT
    current_row.value_of_interest + 1 as gap_start
    ,next_row.value_of_interest - 1 as gap_end
FROM
    current_row
        INNER JOIN current_row as next_row
            ON next_row.row_num = current_row.row_num + 1
WHERE
    next_row.value_of_interest - current_row.value_of_interest > 1
;
```

```
| gap_start | gap_end |
|-----------|---------|
| 4         | 5       |
| 8         | 8       |
| 10        | 10      |
| 13        | 19      |
| 21        | 24      |
```

### Using Subqueries

To see how this technique works, we'll explore its parts and put them together for a final result set.

The first thing we'll need to do is identify where a sequence ended. To do this, we use a subquery inside the `SELECT`. The subquery result is the next row's value if it is the next in the sequence; otherwise, `NULL`.

```sql{5-12}
/* Data setup */

SELECT
    sequences_main.value_of_interest
    ,(
        SELECT
            sub.value_of_interest
        FROM
            @sequences as sub
        WHERE
            sub.value_of_interest = sequences_main.value_of_interest + 1
    ) as sequence_end_ind
FROM
    @sequences as sequences_main
```

Rows with `NULL` indicate a sequence ended.

```{5,7,8,10-12}
| value_of_interest | sequence_end_ind |
|-------------------|------------------|
| 1                 | 2                |
| 2                 | 3                |
| 3                 | NULL             |
| 6                 | 7                |
| 7                 | NULL             |
| 9                 | NULL             |
| 11                | 12               |
| 12                | NULL             |
| 20                | NULL             |
| 25                | NULL             |
```

Next, we need to determine where the next sequence started (or the end of our gap). We do this with another subquery that returns the first value after the current row.

```sql{13-20}
/* Data setup */

SELECT
    sequences_main.value_of_interest
    ,(
        SELECT
            sub.value_of_interest
        FROM
            @sequences as sub
        WHERE
            sub.value_of_interest = sequences_main.value_of_interest + 1
    ) as sequence_end_ind
    ,(
        SELECT
            MIN(sub.value_of_interest)
        FROM
            @sequences as sub
        WHERE
            sub.value_of_interest > sequences_main.value_of_interest
    ) as sequence_start_ind
FROM
    @sequences as sequences_main
```

```
| value_of_interest | sequence_ends | sequence_starts_again |
|-------------------|---------------|-----------------------|
| 1                 | 2             | 2                     |
| 2                 | 3             | 3                     |
| 3                 | NULL          | 6                     |
| 6                 | 7             | 7                     |
| 7                 | NULL          | 9                     |
| 9                 | NULL          | 11                    |
| 11                | 12            | 12                    |
| 12                | NULL          | 20                    |
| 20                | NULL          | 25                    |
| 25                | NULL          | NULL                  |
```

Now we need to filter for the rows that are `NULL` in the sequence ends column. 

We do this by moving our first subquery to the `WHERE` clause and combine it with `NOT EXISTS`. Here we are saying we want the rows where the next row value is not part of a sequence.

```sql{15-23}
/* Data Setup */

SELECT
    sequences_main.value_of_interest
    ,(
        SELECT
            MIN(sub.value_of_interest)
        FROM
            @sequences as sub
        WHERE
            sub.value_of_interest > sequences_main.value_of_interest
    ) as sequence_starts_again
FROM
    @sequences as sequences_main
WHERE NOT EXISTS
    (
        SELECT
            sub.value_of_interest
        FROM
            @sequences as sub
        WHERE
            sub.value_of_interest = sequences_main.value_of_interest + 1
    )
```

```{8}
| sequence_end_ind | sequence_start_ind |
|------------------|-----------------------|
| 3                | 6                     |
| 7                | 9                     |
| 9                | 11                    |
| 12               | 20                    |
| 20               | 25                    |
| 25               | NULL                  |
```

There's just one problem with this result set. The last row gets included. We fix this by adding another `WHERE` condition that filters for values less than the maximum value.

```sql{24}
/* Data Setup */

SELECT
    sequences_main.value_of_interest
    ,(
        SELECT
            MIN(sub.value_of_interest)
        FROM
            @sequences as sub
        WHERE
            sub.value_of_interest > sequences_main.value_of_interest
    ) as sequence_starts_again
FROM
    @sequences as sequences_main
WHERE NOT EXISTS
    (
        SELECT
            num_sequence_where.value_of_interest
        FROM
            @sequences as num_sequence_where
        WHERE
                num_sequence_where.value_of_interest = sequences_main.value_of_interest + 1
        )
    AND sequences_main.value_of_interest < (SELECT MAX(value_of_interest) FROM @sequences)
```

```
| value_of_interest | sequence_starts_again |
|-------------------|-----------------------|
| 3                 | 6                     |
| 7                 | 9                     |
| 9                 | 11                    |
| 12                | 20                    |
| 20                | 25                    |
```

Great, now we have a result set of rows where a sequence ended, and another began - or where a gap started and ended.

All that's left to is **add 1** to the gap start and **subtract 1** from the gap end.

```sql{4,12}
/* Data Setup */

SELECT
    sequences_main.value_of_interest + 1 as gap_starts
    ,(
        SELECT
            MIN(sub.value_of_interest)
        FROM
            @sequences as sub
        WHERE
            sub.value_of_interest > sequences_main.value_of_interest
    ) - 1 as gap_ends
FROM
    @sequences as sequences_main
WHERE NOT EXISTS
    (
        SELECT
            num_sequence_where.value_of_interest
        FROM
            @sequences as num_sequence_where
        WHERE
                num_sequence_where.value_of_interest = sequences_main.value_of_interest + 1
        )
    AND sequences_main.value_of_interest < (SELECT MAX(value_of_interest) FROM @sequences)
```

```
| gap_starts | gap_ends |
|------------|----------|
| 4          | 5        |
| 8          | 8        |
| 10         | 10       |
| 13         | 19       |
| 21         | 24       |
```

### Gaps in DATE or DATETIME sequences

What if the sequences are `DATE` or `DATETIME`? The solutions are the same but use the `DATEDIFF` and `DATEADD` functions.

#### LEAD approach

```sql{12,13,24}
DECLARE @date_sequences TABLE (
    date_of_interest DATE
)
INSERT INTO @date_sequences
VALUES
('2021-01-01'),('2021-01-02'),('2021-01-03'),('2021-01-06')
,('2021-01-07'),('2021-01-09'),('2021-01-11'),('2021-01-12')
,('2021-01-20'),('2021-01-25')


SELECT
    DATEADD(DAY,1, date_of_interest) as gap_starts
    ,DATEADD(DAY,-1, next_row_value) as gap_ends
FROM
(
    SELECT
        date_of_interest
        ,LEAD(date_of_interest,1, date_of_interest) 
            OVER(ORDER BY date_of_interest) as next_row_value
    FROM
        @date_sequences
) as curr_and_next
WHERE
    DATEDIFF(DAY,date_of_interest, next_row_value) > 1
```

#### ROW_NUMBER approach

```sql{22,23,29}
DECLARE @dtm_sequences TABLE (
    dtm_of_interest DATETIME
)
INSERT INTO @dtm_sequences
VALUES
('2021-02-23 00:00:01.000'),('2021-02-23 00:00:02.000'),('2021-02-23 00:00:03.000'),
('2021-02-23 00:00:06.000'),('2021-02-23 00:00:07.000'),('2021-02-23 00:00:09.000'),
('2021-02-23 00:00:11.000'),('2021-02-23 00:00:12.000'),('2021-02-23 00:00:20.000'),
('2021-02-23 00:00:25.000')

;
WITH current_row AS
(
SELECT
    dtm_of_interest
    ,ROW_NUMBER() 
        OVER(ORDER BY dtm_of_interest) as row_num
FROM
    @dtm_sequences
)
SELECT
    DATEADD(SECOND, 1, current_row.dtm_of_interest) as gap_start
    ,DATEADD(SECOND, -1, next_row.dtm_of_interest) as gap_end
FROM
    current_row
        INNER JOIN current_row as next_row
            ON next_row.row_num = current_row.row_num + 1
WHERE
    DATEDIFF(SECOND, current_row.dtm_of_interest, next_row.dtm_of_interest) > 1
;
```

#### Subquery approach

```sql{12,13,32}
DECLARE @date_sequences TABLE (
    date_of_interest DATE
)
INSERT INTO @date_sequences
VALUES
('2021-01-01'),('2021-01-02'),('2021-01-03'),('2021-01-06')
,('2021-01-07'),('2021-01-09'),('2021-01-11'),('2021-01-12')
,('2021-01-20'),('2021-01-25')


SELECT
    DATEADD(DAY,1,sequences_main.date_of_interest) as gap_starts
    ,DATEADD(DAY,-1, 
        (
        SELECT
            MIN(sub.date_of_interest)
        FROM
            @date_sequences as sub
        WHERE
            sub.date_of_interest > sequences_main.date_of_interest
        )
    ) as gap_ends
FROM
    @date_sequences as sequences_main
WHERE NOT EXISTS
    (
    SELECT
        date_sequence_where.date_of_interest
    FROM
        @date_sequences as date_sequence_where
    WHERE
        date_sequence_where.date_of_interest = DATEADD(DAY, 1, sequences_main.date_of_interest)
    )
    AND sequences_main.date_of_interest < (SELECT MAX(date_of_interest) FROM @date_sequences)
```

## Conclusion

In this post, we looked at solutions to the **Gaps** part of the **Gaps and Islands** problem. The key to identifying Gaps is working out where a sequence ends, and another begins.

One aspect we *didn't* examine is the performance of each solution. I opted to avoid this to focus on ways to solve the problem. 

If you're interested in the performance aspects, I highly recommend the book [SQL Server MVP Deep Dives](https://livebook.manning.com/book/sql-server-mvp-deep-dives/about-this-book/). Chapter 5, [Gaps and Islands, by Itzik Ben-Gan](https://livebook.manning.com/book/sql-server-mvp-deep-dives/chapter-5/1), explores the Gaps and Islands solutions in substantial detail. Two solutions in this post are adapted from this chapter.

In the [next post](consecutive-values-sql-server) we'll look at the opposite problem, identifying consecutive values or **Islands**.

## Further Reading
* [SQL Server MVP Deep Dives, Ch 5. Gaps and Islands](https://livebook.manning.com/book/sql-server-mvp-deep-dives/chapter-5/1)
* [Gaps and Islands in SQL Server data](https://www.red-gate.com/simple-talk/sql/t-sql-programming/gaps-islands-sql-server-data/)
* [SQL Server Window Functions Gaps and Islands Problem](https://www.mssqltips.com/sqlservertutorial/9130/sql-server-window-functions-gaps-and-islands-problem/)
* [Introduction to Gaps and Islands Analysis](https://www.red-gate.com/simple-talk/sql/t-sql-programming/introduction-to-gaps-and-islands-analysis/)
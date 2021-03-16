---
title: "Identify consecutive values in SQL Server"
date: "2021-03-18"
tags:
    - SQL Server
---

In this two-part series, we'll look at different solutions to a SQL problem - how to **identify consecutive** or **non-consecutive values** in a column. Also known as the **Gaps and Islands** problem. 

Understanding the Gaps and Islands problem is useful for analyzing data that features sequences or breaks in sequences.

This post, part two of the series, will look at methods for identifying **consecutive values (Islands)**. In part one, we explored ways to identify non-consecutive values (Gaps).

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

## Identifying Islands

To identify islands, there are two approaches. Use a sequence identifier to group values that are in sequence. Or identify where a sequence starts and ends. Let's look at how to do both.

### Using DENSE_RANK

We're going to use `DENSE_RANK` to help create an identifier to group values that are part of a sequence. Begin by applying the `DENSE_RANK` function to the rows.

```sql
-- Data setup
DECLARE @sequences TABLE
(
    value_of_interest INTEGER
)

INSERT INTO @sequences
VALUES (1),(2),(3),(6),(7),(9),(11),(12),(20),(25)

-- Solution begins
SELECT
    num_sequence.value_of_interest
    ,DENSE_RANK() OVER(ORDER BY value_of_interest) as dense_rank_result
FROM
    @sequences as num_sequence
```

```
| value_of_interest | dense_rank_result |
|-------------------|-------------------|
| 1                 | 1                 |
| 2                 | 2                 |
| 3                 | 3                 |
| 6                 | 4                 |
| 7                 | 5                 |
| 9                 | 6                 |
| 11                | 7                 |
| 12                | 8                 |
| 20                | 9                 |
| 25                | 10                |
```

To produce the group identifier, we can subtract the result of `DENSE_RANK` from the row value. As the sequence increases, the result of this calculation remains constant but then changes when a new sequence starts. We use this constant to identify the islands.

```sql{5}
/* Data setup */

SELECT
    num_sequence.value_of_interest
    ,num_sequence.value_of_interest - DENSE_RANK() OVER(ORDER BY value_of_interest) as sequence_identifier
FROM
    @sequences as num_sequence
```

```
| value_of_interest | sequence_identifier |
|-------------------|---------------------|
| 1                 | 0                   |
| 2                 | 0                   |
| 3                 | 0                   |
| 6                 | 2                   |
| 7                 | 2                   |
| 9                 | 3                   |
| 11                | 4                   |
| 12                | 4                   |
| 20                | 11                  |
| 25                | 15                  |
```

To find the sequence start and end, we subquery the result set and aggregate it by the sequence identifier.

If we were doing analysis, at this point, we have enough to summarize a sequence, e.g., `COUNT`, `AVG`, etc.

```sql{4,5,10}
/* Data setup */

SELECT
    MIN(sequences.value_of_interest) as sequence_started
    ,MAX(sequences.value_of_interest) as sequence_started
FROM
(
    SELECT
        num_sequence.value_of_interest
        ,num_sequence.value_of_interest - DENSE_RANK() OVER(ORDER BY value_of_interest) as sequence_identifier
    FROM
        @sequences as num_sequence
) as sequences
GROUP BY
    sequence_identifier
```

```
| sequence_started | sequence_started |
|------------------|------------------|
| 1                | 3                |
| 6                | 7                |
| 9                | 9                |
| 11               | 12               |
| 20               | 20               |
| 25               | 25               |
```

If you need to exclude sequences with only 1 row, include the `HAVING` clause filtering for row counts greater than 1.

```sql{16,17}
/* Data setup */

SELECT
    MIN(sequences.value_of_interest) as sequence_start
    ,MAX(sequences.value_of_interest) as sequence_end
FROM
(
    SELECT
        num_sequence.value_of_interest
        ,num_sequence.value_of_interest - DENSE_RANK() OVER(ORDER BY value_of_interest) as sequence_identifier
    FROM
        @sequences as num_sequence
) as sequences
GROUP BY
    sequence_identifier
HAVING
    COUNT(*) > 1
```

If you're curious about why we're using `DENSE_RANK` and not `ROW_NUMBER`, this is to handle duplicates. The result of `DENSE_RANK` will produce the same group identifier for duplicate sequences.

### Using Subqueries, ROW_NUMBER, and CTEs

Recall from the article on Identifying Gaps that this involves working out where a sequence ends and a new one begins. We can apply the same technique to help identify islands.

This query has a few different parts, so we'll break it apart and build it into a final query.

First, let's look at the following query. It uses two similar subqueries to identify where a sequence started or ended.

Notice that we get `NULL` in the columns when a sequence starts or ends.

[CODE 1]

Now we need a way to filter for the `NULL`s in the `sequence_started` and `sequence_ended` columns. 

To do this, we move the subquery into the `WHERE` clause and combine it with `NOT EXISTS`. This condition filters for rows where the subquery returns `NULL`.

[CODE 2]

At this point, we're still working with two separate result sets—a set of sequence starting points and a set of sequence ending points.

Because each result set contains equal rows, we can connect them with the `ROW_NUMBER` function.

[CODE 3]

To finish, we put each result set in a CTE and combine them based on their row numbers. A temp table would also work in this situation.

[CODE 4]

If you only want sequences with more than 1 row, filter for rows where the sequence's start and end are not the same value.

[CODE 5]

Lastly, as an interesting side note, if we modify the join, it's possible to arrive at the gaps!

[CODE 6]

## Conclusion

In this post, we looked at solutions to the **Islands** part of the **Gaps and Islands** problem.

An aspect we *didn't* examine is the performance of each solution. I opted to avoid this to focus on ways to solve the problem. 

If you're interested in the performance aspects, I highly recommend the book [SQL Server MVP Deep Dives](https://livebook.manning.com/book/sql-server-mvp-deep-dives/about-this-book/). Chapter 5, [Gaps and Islands, by Itzik Ben-Gan](https://livebook.manning.com/book/sql-server-mvp-deep-dives/chapter-5/1), explores the Gaps and Islands solutions in substantial detail.

For the solutions to the Gaps problem, see the [previous post](/non-consecutive-values-sql-server) in this series.

## Further Reading
* [SQL Server MVP Deep Dives, Ch 5. Gaps and Islands](https://livebook.manning.com/book/sql-server-mvp-deep-dives/chapter-5/1)
* [Gaps and Islands in SQL Server data](https://www.red-gate.com/simple-talk/sql/t-sql-programming/gaps-islands-sql-server-data/)
* [SQL Server Window Functions Gaps and Islands Problem](https://www.mssqltips.com/sqlservertutorial/9130/sql-server-window-functions-gaps-and-islands-problem/)
* [Introduction to Gaps and Islands Analysis](https://www.red-gate.com/simple-talk/sql/t-sql-programming/introduction-to-gaps-and-islands-analysis/)
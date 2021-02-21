---
title: "Identify non-consecutive values in SQL Server"
date: "2021-02-21"
tags:
    - SQL Server
---

In this two-part series, we'll look at different solutions to a SQL problem - how to identify consecutive or non-consecutive values in a column. Also known as the Gaps and Islands problem. 

Understanding the Gaps and Islands problem is useful for analyzing data that features sequences or breaks in sequences.

This post, part one of the series, will look at methods for identifying non-consecutive values (or Gaps). In part two, we explore ways to identify consecutive values (Islands).

## What is the Gaps and Islands problem?

As the name implies, there are two components.

Gaps - rows where a row value does not sequentially follow another...

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

...and Islands - rows where a row value follows another in an unbroken succession.

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

To identify Gaps, we need to determine where a sequence ends, and another begins. In between these points are where a gap starts and ends.

In general, each approach compares the current row with the next row to determine if it's the next value in the sequence. If it isn't, then we've found a gap.

### With the LEAD window function

This approach uses the `LEAD` window function. The LEAD function lets you access values from rows that follow the current row.

First, we apply the Lead function to generate a result set of the current row value and next row value.

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

To identify gaps, we subtract the current row value from the next row value. For rows where a sequence ends, the difference will be greater than 1.

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

To isolate the sequence end and starts, we filter for the rows where the difference is greater than 1.

To arrive at the gaps, we add 1 to the sequence end and subtract 1 from the sequence start.

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
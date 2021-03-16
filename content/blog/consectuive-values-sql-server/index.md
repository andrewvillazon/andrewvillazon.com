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

[CODE 1]

To produce the group identifier, we can subtract the result of `DENSE_RANK` from the row value. As the sequence increases, the result of this calculation remains constant but then changes when a new sequence starts. We use this constant to identify the islands.

[CODE 2]

To find the sequence start and end, we subquery the result set and aggregate it by the sequence identifier.

If we were doing analysis, at this point, we have enough to summarize a sequence, e.g., `COUNT`, `AVG`, etc.

[CODE 3]

If you need to exclude sequences with only 1 row, include the `HAVING` clause filtering for row counts greater than 1.

[CODE 4]

If you're curious about why we're using `DENSE_RANK` and not `ROW_NUMBER`, this is to handle duplicates. The result of `DENSE_RANK` will produce the same group identifier for duplicate sequences.
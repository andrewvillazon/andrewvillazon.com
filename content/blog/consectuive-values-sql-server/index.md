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

To identify islands, there are two approaches. Use a sequence identifier to group values that are in sequence. Or identify where a sequence starts and ends. Lets look at how to do both.
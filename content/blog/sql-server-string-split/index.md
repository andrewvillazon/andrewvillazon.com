---
title: "Parse delimited values in SQL Server with STRING_SPLIT"
date: "2020-09-24"
tags:
    - SQL Server
---
Have you ever needed to get values from a delimited string in SQL Server? This post will look at how to do this with the SQL Server function, `STRING_SPLIT`.

Before the inclusion of `STRING_SPLIT`, there were a couple of options to achieve this. Define a [string splitting function](https://stackoverflow.com/questions/10914576/t-sql-split-string) yourself, or use [recursive CTEs](https://stackoverflow.com/questions/5493510/turning-a-comma-separated-string-into-individual-rows). Thankfully there's a way that's simpler and clearer.

**A note on availability:** `STRING_SPLIT` is only available in SQL SERVER 2016 and later and requires the compatibility to be **130** or above.

## STRING_SPLIT

`STRING_SPLIT` takes two required inputs, a string (varchar, nvarchar, nchar, or char type), and a separator. The function has the following syntax.

```sql
```

The function returns a table with a single column called value with a row per separated value.

Let's see a simple example.

```sql
```

Because the function returns a table, we can use it as we would any other table. Here we'll split the values from our simple example and use them to filter a table.

```sql
```

**A quick note about spaces:** the `STRING_SPLIT` function won't trim spaces before or after the delimiter. For example, a string "A, B, C" will include the space before B and C.

## Uses

`STRING_SPLIT` can be used in different ways. We'll set up some dummy data in a temp table as our data source to demonstrate these.

```sql
```

#### Use STRING_SPLIT with a table.

If the separated values are in a column in a table, we can use `CROSS APPLY` to *apply* the function per row. The result is a row per delimited value.

```sql
```

#### As an aggregator

We can take the above technique further and use it to **aggregate** the values returned by `STRING_SPLIT`.

```sql
```

#### Filter value in a separated list

We can use the function to filter records that have a specific value inside the delimited column.

Below, we filter for all players who played at the 1998 World Cup tournament.

```sql
```

#### Combine with ROW_NUMBER

Using `ROW_NUMBER`, we can give each value a row number to act as an index. This is useful for finding the Nth value in the delimited string.

```sql
```

## Conclusion

And there we have it! A brief look at `STRING_SPLIT`, a simple but useful function.

## See also:
* [STRING_SPLIT](https://docs.microsoft.com/en-us/sql/t-sql/functions/string-split-transact-sql?view=sqlallproducts-allversions)
* [Split strings the right way – or the next best way](https://sqlperformance.com/2012/07/t-sql-queries/split-strings)
---
title: "Tame unweildly UNION ALLs with Temporary Tables"
date: "2023-05-28"
tags:
    - SQL Server
---

When combining result sets from different queries, we often use the `UNION ALL` operator to bring these together. In this post, we'll look at an alternative approach that uses Temporary Tables instead of `UNION ALL`.

This approach can help make the code more manageable for complex queries that combine data.

## How UNION ALL gets unwieldy

When we combine the result sets of two or more queries into a single result set, a typical approach is to use the `UNION ALL` operator. 

`UNION ALL` has a couple of basic rules:

* The number and order of columns are the same
* Columns are compatible data types.

If a result set doesn't have the same number of columns, the usual solution is to add `NULL` where missing columns would be to meet the `UNION ALL` requirement.

[CODE]

Adding `NULL` for a missing column isn't a big deal on small, simple queries. However, adding `NULL` to every `UNION ALL` becomes cumbersome as the combined result sets and columns grow.

[CODE]

Look familiar? Adding a new column to the 'X' result set involves adding more `NULL`s to the `SELECT` statements that come before and after.

## Use a Temporary Table instead

Instead of filling our code with `NULL`, we can take advantage of the default behavior of Temp Tables.

When inserting data into a Temp Table, we can provide a column list that maps table columns to the columns of the proceeding `SELECT` or `VALUES`. When a column of the table is not listed in the `INSERT`, by default SQL Server fills that column with `NULL`, eliminating the need to add `NULL` to our code.

### How to use

Here's a combined result using a `UNION ALL` operator.

[CODE]

First, we define the Temp Table that will hold our combined result set.

[CODE]

Then we replace each `UNION ALL` with the required `INSERT`

[CODE]

Lastly, `SELECT` from the Temp Table.

[CODE]

If we add more columns to a constituent result set, we only need to extend the Temporary Table definition.

[CODE]

### Benefits

* Reduce the amount of code. The code becomes cleaner, more concise, and more readable
* We can modify a single result set, of our combined result set, without needing to adjust every other result set
* To extend a single result set, we only need to add new columns to our Temp Table
* If we need to, we can reference records from the temp table

### Disadvantages

* We're storing rows in an intermediate structure which can have performance implications
* If speed and performance are essential, then this approach is unlikely to be faster than a `UNION ALL`

## Conclusion

Here we've seen an alternative way to combine data that can make your SQL simpler, cleaner, and easier to maintain. Next time you're dealing with an unruly `UNION ALL`, give this alternative a go!
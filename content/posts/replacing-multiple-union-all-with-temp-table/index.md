---
title: "Replacing multiple UNION ALLs with a Temporary Table"
date: "2023-05-28"
tags:
    - SQL Server
---

When combining result sets from different queries, we often use the UNION ALL operator to bring these together. In this post, we'll look at an alternative approach that uses Temporary Tables instead of UNION ALL.

This approach can help make the code more manageable for complex queries that combine data.

## When UNION ALL gets unwieldy

When we combine the result sets of two or more queries into a single result set, a typical approach is to use the UNION ALL operator. 

UNION ALL has a couple of basic rules: 
* The number and order of columns are the same
* Columns are compatible data types.

If a result set doesn't have the same number of columns, the usual solution is to add NULL where missing columns would be to meet the UNION ALL requirement.

See the query below, which combines two arbitrary summaries of the StackOverflow Mini database into a single result set.

[CODE]

Look familiar? Adding a new column to the result set involves adding more NULLs to all SELECTs involved in the UNION.

[CODE]

Adding NULL for a missing column isn't a big deal on small, simple queries. However, adding NULL to every UNION ALL becomes cumbersome as the combined result sets and columns grow.

## Use a Temporary Table instead.

Instead of filling our code with NULLs, we can take advantage of the default behavior of Temp Tables.

When inserting data into a Temp Table, we can provide a column list that maps table columns to the columns of the proceeding SELECT or VALUES. When a table column is not listed in the INSERT, by default SQL Server fills that column with NULL, eliminating the need to add extra NULLs in our SELECTs.

### How to use

Recall the result set from above that used the UNION ALL operator.

[CODE]

Now let's rewrite to use a Temp Table. First, we define the Temp Table that will hold our combined result set.

[CODE]

Then we replace each UNION ALL with the required INSERT.

[CODE]

Lastly, SELECT from the Temp Table.

[CODE]

If we want to add more result sets, we only need to extend the Temporary Table definition.

[CODE]

### Benefits

* The code becomes cleaner, more concise, and more readable
* We can modify a single result set, of our combined result set, without needing to adjust every other result set
* To change or add a result set, we only need to change our Temp Table, not every other SELECT
* If we need to, we can reference records from the temp table

### Disadvantages

* We're storing rows in an intermediate structure which can have performance implications.
* If speed and performance are essential, then this approach is unlikely to be faster than a UNION ALL.

## Conclusion

Here we've seen an alternative way to combine data that can make your SQL simpler, cleaner, and easier to maintain. Next time you're dealing with an unruly UNION ALL, give this alternative a go!
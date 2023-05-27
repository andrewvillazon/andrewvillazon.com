---
title: "Replacing multiple UNION ALLs with a Temporary Table"
date: "2023-05-28"
tags:
    - SQL Server
---

When combining result sets from different queries, we often use the `UNION ALL` operator to bring these together. In this post, we'll look at an alternative approach that uses Temporary Tables instead of `UNION ALL`.

This approach can help make the code more manageable for complex queries that combine data.

## When UNION ALL gets unwieldy

When we combine the result sets of two or more queries into a single result set, a typical approach is to use the `UNION ALL` operator. 

`UNION ALL` has a couple of basic rules:

* The **number and order of columns** are the same
* Columns are compatible data types.

If a result set doesn't have the same number of columns, the usual solution is to add `NULL` where missing columns would be to meet the `UNION ALL` requirement.

See the query below, which combines two arbitrary summaries of the [StackOverflow Mini database](https://www.brentozar.com/archive/2023/01/how-to-install-sql-server-and-the-stack-overflow-database-on-a-mac/) into a single result set.

```sql{4,14}
SELECT
    'Most viewed post' AS summary_name
    ,Posts.Title AS most_viewed_post
    ,NULL AS posts_per_day
FROM
    StackOverflowMini.dbo.Posts
        INNER JOIN (SELECT MAX(ViewCount) AS view_count FROM StackOverflowMini.dbo.Posts) AS most_viewed
            ON Posts.ViewCount = most_viewed.view_count

UNION ALL

SELECT
    'Posts per day'
    ,NULL
    ,COUNT(*)
    /
    DATEDIFF(DAY, MIN(Posts.CreationDate), MAX(Posts.CreationDate)) AS posts_per_day
FROM
    StackOverflowMini.dbo.Posts
```

Look familiar? Adding a new column to the result set involves adding more `NULL`s to all `SELECT`s involved in the union.

```sql{4,5,15,19,27,28}
SELECT
    'Most viewed post' AS summary_name
    ,Posts.Title AS most_viewed_post
    ,NULL AS posts_per_day
    ,NULL AS avg_answer_count
FROM
    StackOverflowMini.dbo.Posts
        INNER JOIN (SELECT MAX(ViewCount) AS view_count FROM StackOverflowMini.dbo.Posts) AS most_viewed
            ON Posts.ViewCount = most_viewed.view_count

UNION ALL

SELECT
    'Posts per day'
    ,NULL
    ,COUNT(*)
    /
    DATEDIFF(DAY, MIN(Posts.CreationDate), MAX(Posts.CreationDate)) AS posts_per_day
    ,NULL
FROM
    StackOverflowMini.dbo.Posts

UNION ALL

SELECT
    'Average answer count'
    ,NULL
    ,NULL
    ,AVG(Posts.AnswerCount)
FROM
    StackOverflowMini.dbo.Posts
        INNER JOIN StackOverflowMini.dbo.PostTypes
            ON PostTypes.Id = Posts.PostTypeId
WHERE
    PostTypes.[Type] = 'Question'
```

Adding `NULL` for a missing column isn't a big deal on small, simple queries. However, adding `NULL` to every `UNION ALL` becomes cumbersome as the combined result sets and columns grow.

## Use a Temporary Table instead.

Instead of filling our code with `NULL`, we can take advantage of the default behavior of Temp Tables.

When inserting data into a Temp Table, we can provide a column list that maps table columns to the columns of the proceeding `SELECT` or `VALUES`. When a table column is not listed in the `INSERT`, by default SQL Server fills that column with `NULL`, eliminating the need to add extra `NULL`s to each `SELECT`.

### How to use

Recall the query from above that used the `UNION ALL` operator.

```sql
SELECT
    'Most viewed post' AS summary_name
    ,Posts.Title AS most_viewed_post
    ,NULL AS posts_per_day
    ,NULL AS avg_answer_count
FROM
    StackOverflowMini.dbo.Posts
        INNER JOIN (SELECT MAX(ViewCount) AS view_count FROM StackOverflowMini.dbo.Posts) AS most_viewed
            ON Posts.ViewCount = most_viewed.view_count

UNION ALL

SELECT
    'Posts per day'
    ,NULL
    ,COUNT(*)
    /
    DATEDIFF(DAY, MIN(Posts.CreationDate), MAX(Posts.CreationDate)) AS posts_per_day
    ,NULL
FROM
    StackOverflowMini.dbo.Posts

UNION ALL

SELECT
    'Average answer count'
    ,NULL
    ,NULL
    ,AVG(Posts.AnswerCount)
FROM
    StackOverflowMini.dbo.Posts
        INNER JOIN StackOverflowMini.dbo.PostTypes
            ON PostTypes.Id = Posts.PostTypeId
WHERE
    PostTypes.[Type] = 'Question'
```

Now let's rewrite to use a Temp Table. First, we define the Temp Table that will hold our combined result set.

```sql
DROP TABLE IF EXISTS #so_summary
CREATE TABLE #so_summary (
    summary_name VARCHAR(50)
    ,most_view_post VARCHAR(200)
    ,posts_per_day INT
    ,avg_answer_count INT
)
```

Then we replace each `UNION ALL` with the required `INSERT`.

```sql{1,10,19}
INSERT INTO #so_summary(summary_name, most_view_post)
SELECT
    'Most viewed post'
    ,Posts.Title
FROM
    StackOverflowMini.dbo.Posts
        INNER JOIN (SELECT MAX(ViewCount) AS view_count FROM StackOverflowMini.dbo.Posts) AS most_viewed
            ON Posts.ViewCount = most_viewed.view_count

INSERT INTO #so_summary(summary_name, posts_per_day)
SELECT
    'Posts per day'
    ,COUNT(*)
    /
    DATEDIFF(DAY, MIN(Posts.CreationDate), MAX(Posts.CreationDate)) AS posts_per_day
FROM
    StackOverflowMini.dbo.Posts

INSERT INTO #so_summary(summary_name, avg_answer_count)
SELECT
    'Average answer count'
    ,AVG(Posts.AnswerCount)
FROM
    StackOverflowMini.dbo.Posts
        INNER JOIN StackOverflowMini.dbo.PostTypes
            ON PostTypes.Id = Posts.PostTypeId
WHERE
    PostTypes.[Type] = 'Question'
```

Lastly, `SELECT` from the Temp Table.

```sql
SELECT * FROM #so_summary
```

If we want to add more result sets, we only need to extend the Temporary Table definition.

```sql{7,8,9,22}
DROP TABLE IF EXISTS #so_summary
CREATE TABLE #so_summary (
    summary_name VARCHAR(50)
    ,most_view_post VARCHAR(200)
    ,posts_per_day INT
    ,avg_answer_count INT
    ,tag VARCHAR(50)
    ,tag_count INT
    ,ranking INT
)


INSERT INTO #so_summary(summary_name, most_view_post)
SELECT ...

INSERT INTO #so_summary(summary_name, posts_per_day)
SELECT ...

INSERT INTO #so_summary(summary_name, avg_answer_count)
SELECT ...

INSERT INTO #so_summary(summary_name,tag ,tag_count ,ranking)
SELECT
    TOP 5
    'Top 5 tags'
    ,tag.[value]
    ,COUNT(*) AS tag_count
    ,DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) AS ranking
FROM
    StackOverflowMini.dbo.Posts
        CROSS APPLY string_split(REPLACE(REPLACE(Posts.Tags, '<' ,''), '>', ','), ',') as tag
WHERE
    Posts.Tags IS NOT NULL
    AND tag.[value] <> ''
GROUP BY
    tag.[value]
ORDER BY
    tag_count DESC
```

### Benefits

* The code becomes cleaner, more concise, and more readable
* We can modify a single result set, of our combined result set, without needing to adjust every other result set
* To change or add a result set, we only need to change our Temp Table, not every other `SELECT`
* If we need to, we can reference records from the temp table.

### Disadvantages

* We're storing rows in an intermediate structure which can have performance implications.
* If speed and performance are essential, then this approach is unlikely to be faster than a `UNION ALL`

## Conclusion

Here we've seen an alternative way to combine data that can make your SQL simpler, cleaner, and easier to maintain. Next time you're dealing with an unruly `UNION ALL`, give this alternative a go!

### Demo Data

* [Download the Current Stack Overflow Database for Free (2022-06)](https://www.brentozar.com/archive/2022/08/download-the-current-stack-overflow-database-for-free-2022-06/)
* [How to Install SQL Server and the Stack Overflow Database on a Mac](https://www.brentozar.com/archive/2023/01/how-to-install-sql-server-and-the-stack-overflow-database-on-a-mac/)
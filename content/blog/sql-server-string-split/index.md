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
STRING_SPLIT(string, seperator)
```

The function returns a table with a single column called value with a row per separated value.

Let's see a simple example.

```sql
DECLARE @big_five VARCHAR(MAX) = 'Apple,Amazon,Alphabet,Facebook,Microsoft'
SELECT * FROM STRING_SPLIT(@big_five, ',')
```

Because the function returns a table, we can use it as we would any other table. Here we'll split the values from our simple example and use them to filter a table.

```sql{19}
INSERT INTO #large_companies(company_name, market_cap)
SELECT
    company_name
    ,market_cap
FROM
(
VALUES
('Saudi Aramco',1684.8),('Microsoft',1359),('Apple', 1285.5)
,('Amazon', 1233.4),('Alphabet', 919.3),('Facebook', 583.7)
,('Alibaba', 545.4),('Tencent Holdings', 509.7),('Berkshire Hathaway', 455.4)
) as data(company_name, market_cap)

SELECT
    #large_companies.company_name
    ,#large_companies.market_cap
FROM
    #large_companies
WHERE
    #large_companies.company_name IN (SELECT [value] FROM STRING_SPLIT(@big_five, ','))
```

**A quick note about spaces:** the `STRING_SPLIT` function won't trim spaces before or after the delimiter. For example, a string "A, B, C" will include the space before B and C.

## Uses

`STRING_SPLIT` can be used in different ways. We'll set up some dummy data in a temp table as our data source to demonstrate these.

```sql
DROP TABLE IF EXISTS #world_cup_players
CREATE TABLE #world_cup_players (
    player VARCHAR(30)
    ,tournaments VARCHAR(MAX)
)

INSERT INTO #world_cup_players(player, tournaments)
SELECT
    data.player
    ,data.tournaments
FROM
(
VALUES
('Lionel Messi','2006,2010,2014,2018')
,('Thierry Henry','1998,2002,2006,2010')
,('Ronaldo','1998,2002,2006')
,('Paolo Maldini','1990,1994,1998,2002')
,('Oliver Kahn','2002,2006')
) as data(player,tournaments)
```

#### Use STRING_SPLIT with a table.

If the separated values are in a column in a table, we can use `CROSS APPLY` to *apply* the function per row. The result is a row per delimited value.

```sql{6}
SELECT 
    #world_cup_players.player
    ,tournament.[value]
FROM 
    #world_cup_players
        CROSS APPLY STRING_SPLIT(#world_cup_players.tournaments, ',') as tournament

```

#### As an aggregator

We can take the above technique further and use it to **aggregate** the values returned by `STRING_SPLIT`.

```sql
SELECT 
    #world_cup_players.player
    ,COUNT(tournament.[value]) as num_played
FROM 
    #world_cup_players
        CROSS APPLY STRING_SPLIT(#world_cup_players.tournaments, ',') as tournament
GROUP BY
    #world_cup_players.player
```

#### Filter value in a separated list

We can use the function to filter records that have a specific value inside the delimited column.

Below, we filter for all players who played at the 1998 World Cup tournament.

```sql
SELECT 
    #world_cup_players.player
FROM 
    #world_cup_players
WHERE
    '1998' IN (SELECT value FROM STRING_SPLIT(#world_cup_players.tournaments, ','))
```

#### Combine with ROW_NUMBER

Using `ROW_NUMBER`, we can give each value a row number to act as an index. This is useful for finding the Nth value in the delimited string.

```sql{8}
SELECT
    base_data.player
    ,base_data.[value] as second_tournament
FROM
(
SELECT 
    #world_cup_players.player
    ,ROW_NUMBER() OVER (PARTITION BY #world_cup_players.player ORDER BY tournament.[value]) as tournament_num
    ,tournament.[value]
FROM 
    #world_cup_players
        CROSS APPLY STRING_SPLIT(#world_cup_players.tournaments, ',') as tournament
) as base_data
WHERE
    base_data.tournament_num = 2
```

## Conclusion

And there we have it! A brief look at `STRING_SPLIT`, a simple but useful function.

## See also:
* [STRING_SPLIT](https://docs.microsoft.com/en-us/sql/t-sql/functions/string-split-transact-sql?view=sqlallproducts-allversions)
* [Split strings the right way – or the next best way](https://sqlperformance.com/2012/07/t-sql-queries/split-strings)
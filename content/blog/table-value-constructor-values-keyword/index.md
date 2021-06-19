---
title: "The Table Value Constructor (aka the VALUES keyword)"
date: "2021-06-19"
tags:
    - SQL Server
---

In this post, we'll look at a helpful but lesser-known feature of [T-SQL](https://docs.microsoft.com/en-us/sql/t-sql/language-reference?view=sql-server-ver15), the **Table Value Constructor**.

You've probably seen it used as part of an `INSERT` Statement, where it is easily identifiable as the `VALUES` keyword.

However, the `VALUES` keyword isn't exclusive to an `INSERT` Statement and can be used in other ways that we'll explore below.

## What is the Table Value Constructor?

The TVC is an expression that allows you to define a table **row by row** (known as row expressions) using the keyword `VALUES`

The Table Value Constructor has the following layout:

```
VALUES
(value_1, value_2, value_3, etc)
,(value_1, value_2, value_3, etc)
,(value_1, value_2, value_3, etc)
...etc
```

The TVC starts with the keyword `VALUES`, followed by a list of rows that form the returned table. 

Each row and its column values go inside parentheses `()`, with a comma separating the column values. Each additional row follows with a comma and parentheses.

## Using the Table Value Constructor

So how do we use the Table Value Constructor? In a couple of ways.

### Multi-row Insert Statement

Here is where you'll commonly see the Table Value Constructor. In a [Multi-row Insert](https://docs.microsoft.com/en-us/sql/t-sql/statements/insert-transact-sql?view=sql-server-ver15#b-inserting-multiple-rows-of-data), the Table Value Constructor defines a table that gets **inserted as a whole** rather than row by row.

```sql{11-16}
DROP TABLE IF EXISTS #hundred_meter_records

CREATE TABLE #hundred_meter_records (
    duration FLOAT
    ,set_by VARCHAR(30)
    ,set_on DATE
    ,place VARCHAR(50)
)

INSERT INTO #hundred_meter_records (duration, set_by, set_on, place)
VALUES
(9.58, 'Usain Bolt', '2009-08-16', 'Berlin, Germany')
,(9.69, 'Tyson Gay', '2009-09-09', 'Shanghai, China')
,(9.69, 'Yohan Blake', '2012-08-23', 'Lausanne, Switzerland')
,(9.72, 'Asafa Powell', '2008-10-02', 'Lausanne, Switzerland')
,(9.74, 'Justin Gatlin', '2015-05-15', 'Doha, Qatar')

SELECT * FROM #hundred_meter_records
```

### Using as a derived table

An interesting feature of the TVC is that it also functions as a [derived table](https://www.mssqltips.com/sqlservertip/6038/sql-server-derived-table-example/).

To do this, we wrap the TVC in parenthesis `()` and include it in the `FROM` clause of a query. As you'd expect, it is then available to use in the `SELECT` statement.

```sql
SELECT
    olympiad
    ,host_city
FROM
    (
        VALUES
        (2012, 'London')
        ,(2016, 'Rio de Janeiro')
        ,(2020, 'Tokyo')
        ,(2024, 'Paris')
        ,(2028, 'Los Angeles')
    ) as olympics(olympiad, host_city)
```

One thing to point out with the TVC, it's **not** possible to name columns as part of the TVC call. So instead, we **alias the returned table** and assign column names inside the parentheses which follow.

```sql{2}
...
    ) as olympics(olympiad, host_city)
...
```

As you might have guessed, this also works in a **join**.

```sql{15-21}
SELECT
    olympics.olympiad
    ,olympics.host_city
    ,host_country.country_name
FROM
    (
        VALUES
        (2012, 'London')
        ,(2016, 'Rio de Janeiro')
        ,(2020, 'Tokyo')
        ,(2024, 'Paris')
        ,(2028, 'Los Angeles')
    ) as olympics(olympiad, host_city)

    INNER JOIN (
        VALUES
        ('London', 'England')
        ,('Rio de Janeiro', 'Brazil')
        ,('Tokyo', 'Japan')
    ) as host_country(host_city, country_name)
        ON host_country.host_city = olympics.host_city
```

Because the TVC acts as a derived table, we can do some novel things we'll explore below.

#### Replace hardcoded tables

A nice use of the Table Value Constructor is as an alternative to code like this.

```sql
SELECT
    'USA' as country
    ,59939 as gdp_per_capita
    ,24.08 as percent_world_gdp
UNION ALL
SELECT
    'China'
    ,8612
    ,15.12
UNION ALL
SELECT
    'Japan'
    ,38214
    ,6.02
```

The goal of this code is to generate a table or result set. We can [refactor](https://en.wikipedia.org/wiki/Code_refactoring) this code with the Table Value Constructor and get the same result.

```sql
SELECT
    *
FROM
    (
        VALUES
        ('USA',59939,24.08)
        ,('China' ,8612 ,15.12)
        ,('Japan' ,38214 ,6.02)
    ) as gdp(country,gdp_per_capita,percent_world_gdp)
```

Notice how it becomes more precise and less repetitive.

#### Alternative IN and LIKE operators

Interestingly, it's also possible to use the TVC as an alternative to the `IN` and `LIKE` operators because of this derived table functionality.

Here's an example using the regular `IN` operator.

```sql
-- Setup data
DROP TABLE IF EXISTS #high_cities
CREATE TABLE #high_cities (
    city VARCHAR(50)
    ,country VARCHAR(20)
    ,meters_above_sea_level INT
)
INSERT INTO #high_cities(city,country,meters_above_sea_level)
VALUES
('La Paz', 'Bolivia', 3869)
,('Cochabama', 'Bolivia', 2621)
,('Bogata', 'Colombia', 2601)
,('Addis Ababa', 'Ethiopia', 2361)
,('Mexico City', 'Mexico', 2316)
,('Xining', 'China', 2299)

-- Regular IN operator
SELECT 
    *
FROM
    #high_cities
WHERE
    country IN ('Bolivia', 'Colombia')
```

And here's the same with the TVC. Each item of the `IN` becomes a row inside a derived table created by the TVC. Then, filtering occurs by joining the derived table onto the target table.

```sql
SELECT 
    #high_cities.*
FROM
    #high_cities
        INNER JOIN (
            VALUES
            ('Bolivia')
            ,('Colombia')
        ) as country_filter(country)
            ON country_filter.country = #high_cities.country
```

Keep in mind that the `IN` operator is a syntax shortcut for multiple `OR` conditions in the `WHERE` clause. Depending on your data, this approach *may* turn out to be faster than using the `IN` operator.

Likewise, the TVC can be used to replace multiple `LIKE` operators.

```sql
SELECT
    *
FROM
    #high_cities
WHERE
       city LIKE '%a_a%'
    OR city LIKE 'M%'
```

As we saw before, we've turned each `LIKE` condition into a row in a table and let the join do the filtering.

```sql
SELECT
    *
FROM
    #high_cities
        INNER JOIN (
            VALUES
            ('%a_a%')
            ,('M%')
        ) as city_search(search_string)
            ON #high_cities.city LIKE city_search.search_string
```

#### Transpose Columns into Rows

Lastly, there's a cool feature of the TVC that lets us reference an external column inside the TVC itself. This feature lends itself to succinctly turning [columns into rows](https://docs.microsoft.com/en-us/sql/t-sql/queries/from-using-pivot-and-unpivot?view=sql-server-ver15#unpivot-example).

Hat tip to [Dwain Camps on sqlservercentral.com](https://www.sqlservercentral.com/articles/an-alternative-better-method-to-unpivot-sql-spackle) for the great explainer on this technique.

In short, we `CROSS APPLY` a Table Value Constructor where **each column is a row** in the TVC. The effect of this is we end up with a derived table of column values applied to each associated row.

```sql{23-26}
-- Setup some data
DROP TABLE IF EXISTS #avengers
CREATE TABLE #avengers (
    hero_name VARCHAR(20)
    ,intelligence INT
    ,strength INT
    ,speed INT
)
INSERT INTO #avengers(hero_name,intelligence,strength,speed)
VALUES
('Captain America', 85, 25, 30)
,('Iron Man', 90, 75, 50)
,('Black Panther', 85, 25, 25)

-- Transpose columns into rows
SELECT 
    hero_name
    ,cols_to_rows.measure
    ,cols_to_rows.measure_value
FROM
    #avengers
        CROSS APPLY (
            VALUES
            ('intelligence', intelligence)
            ,('strength', strength)
            ,('speed', speed)
        ) as cols_to_rows(measure, measure_value)
```

Notice that the columns you're transposing will need to be the **same or compatible data types** for this to work.

## Conclusion

As we've seen, the Table Value Constructor has some handy uses outside of the Multi-row Insert. Some of these can make your queries cleaner and faster. This expression is one of my favorite hidden gems in T-SQL.

### Further Reading

* [Table Value Constructor (T-SQL)]([https://docs.microsoft.com/en-us/sql/t-sql/queries/table-value-constructor-transact-sql?view=sql-server-ver15)
* [Table Value Constructors in SQL Server 2008](https://www.red-gate.com/simple-talk/sql/t-sql-programming/table-value-constructors-in-sql-server-2008/)
* [An Alternative (Better?) Method to UNPIVOT](https://www.sqlservercentral.com/articles/an-alternative-better-method-to-unpivot-sql-spackle)
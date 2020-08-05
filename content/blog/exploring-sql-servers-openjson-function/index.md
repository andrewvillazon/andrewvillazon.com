---
title: "Exploring SQL Server's OPENJSON function"
date: "2020-08-05"
tags:
    - SQL Server
---

Thanks to the rise of JavaScript, Rest APIs, and No-SQL databases, [JSON](https://www.json.org/json-en.html) has become *the* data exchange format. However, JSON is a different way of representing data to a traditional relational database where data is stored as tables with rows, and often it can seem like the two paradigms aren't compatible.

In this post, I'll look at how to work with JSON in SQL Server by exploring the `OPENJSON` function and demonstrating how you can use SQL Server to make use of JSON-based data.

To get the most out of this post, I'm going to assume that you're familiar with JSON and writing SQL queries.

## JSON in SQL Server

Before we begin there are a couple of things worth noting when working with JSON in SQL Server.

First of all Microsoft [suggest](https://docs.microsoft.com/en-us/sql/relational-databases/json/store-json-documents-in-sql-tables?view=sql-server-ver15) that JSON is stored as the `NVARCHAR(MAX)` data type. It's possible to encounter issues with JSON text being truncated when using the `VARCHAR(MAX)` data type while `NVARCHAR(MAX)` supports up to 2GB of storage per value.

Secondly the `OPENJSON` function is only available under compatibility level 130.

Lets look at the function in more detail.

## What is the OPENJSON function?

`OPENJSON` parses JSON text and returns JSON objects and properties as rows and columns. In other words, making JSON queryable.

`OPENJSON` has 1 required argument and 2 optional arguments:

* **jsonExpression**: required (Unicode) text containing the JSON to parse
* **path**: an optional JSON Path Expression which lets you target specific objects within a JSON text
* **with_clause**: an optional `WITH` clause which defines the outputted result set. The `WITH` clause effectively maps JSON values to columns in a result set.

The function is set out like this:

```sql
OPENJSON( jsonExpression [ , path ] )  [ <with_clause> ]
```

As you'll see in a moment, the way the `OPENJSON` is written in a SQL query varies with the query's goal. Each goal changes how we use `OPENJSON` and the arguments provided to it.

Let's look at the different ways to use `OPENJSON`.

## Inspecting JSON text

To start, let's use the function to inspect some JSON text. We'll pass in the only required argument, a string of JSON text. This triggers the function's default behavior.

To call the function, we include it in the `FROM` clause of the query.

```sql
DECLARE @json_text NVARCHAR(MAX)
SET @json_text = N'
    {
        "name": "Spider-Man",
        "vitals": {
            "species": "Human",
            "height": {
                "measure": 178,
                "unit": "cm"
            }
        },
        "current_team": null,
        "aliases": ["Bag-Man","Black Marvel","Peter Palmer"],
        "is_good": true,
        "created": 1962
    }
'

SELECT
    *
FROM
    OPENJSON(@json_text)
ORDER BY
    [type]
```

Results:

key              | value                                     | type
:--------------- | :---------------------------------------- | :---
current_team|	NULL|	0
name|	Spider-Man|	1
created|	1962|	2
is_good|	true|	3
aliases|	["Bag-Man","Black Marvel","Peter Palmer"]|	4
vitals|	{"species": "Human","height": {"measure": 178,"unit": "cm"}}|	5

The function's default action is to loop through each key at the top level (root) of the JSON text and return a row, which includes the **key** name, its **value**, and an integer indicating its JSON data **type**.

Notice that the function only loops through the top level of the JSON text.

## Targeting an object with a JSON Path Expression

Before we move onto the next use of `OPENJSON`, let's look at the optional **path** argument. 

The **path** argument allows us to target a specific object in the JSON text by defining a **JSON Path Expression** pointing to the object. The use of the path argument becomes essential as we deal with more complex JSON.

The **JSON Path Expression** has the following syntax:

```sql
OPENJSON(@json, 'path_mode $.path.to.an.object')
```

Paths always begin with the `$` (dollar sign), which indicates the top level of the current JSON text. 

To step further into an object, we can use the `.` (dot operator) to access keys inside nested objects. In this way, the path expression acts as a set of steps towards a given object in the JSON text.

It is possible to include a path mode before the path, which sets out how `OPENJSON` will respond if it cannot find the key given. There are two modes:
* **lax** - (default) will return `NULL` and not raise an error
* **strict** - will raise an error

Now that we know about the JSON Path Expression let's see an example of its use.

### Using the JSON Path Expression

To target a specific object, we include the JSON Path Expression after the jsonText argument.

```sql{5-10,22-22}
DECLARE @json_text NVARCHAR(MAX)
SET @json_text = N'
    {
        "name": "Spider-Man",
        "vitals": {
            "species": "Human",
            "height": {
                "measure": 178,
                "unit": "cm"
            }
        },
        "current_team": null,
        "aliases": ["Bag-Man","Black Marvel","Peter Palmer"],
        "is_good": true,
        "created": 1962
    }
'

SELECT
    *
FROM
    OPENJSON(@json_text, '$.vitals.height')
ORDER BY
    [type]
```

Result:

key              | value                                     | type
:--------------- | :---------------------------------------- | :---
unit |	cm |	1
measure |	178 |	2

Notice how the **path** argument has allowed us to target a specific object, but the function has still returned the same 3 columns from earlier.

### Keys with a "$" character

When dealing with real-world JSON text, it's possible to encounter key names that break the JSON Path Expression.

The most common examples I've encountered have been key names that include a `$` (dollar sign) or spaces. These will cause the `OPENJSON` function to error.

The fix to this is surprisingly straightforward. Simply encase the key name in double-quotes.

```sql
DECLARE @json_text NVARCHAR(MAX)
SET @json_text = N'
    {
        "$title": "Alice in Wonderland",
        "written by": "Lewis Carroll"
    }
'

SELECT
    *
FROM
    OPENJSON(@json_text)
        WITH (
            -- title VARCHAR(50) '$.$title' -- will cause error
            -- ,author VARCHAR(50) '$.written by' -- will cause error

            -- properly handled with double quotes
            title VARCHAR(50) '$."$title"'
            ,author VARCHAR(50) '$."written by"'
        )
```

In the next example, we'll see how to build a more useful result set from the JSON text.

## Creating a result set from JSON text

So far, we've seen `OPENJSON` return information about a JSON text. However, the function's real utility comes from its ability to overlay a result set over a JSON text.

To define a result set, we use the other optional argument, the **with_clause**. The **WITH** clause comes after the call to `OPENJSON` and has the following syntax:

```sql
OPENJSON(jsonText)
    WITH (
        column_name DATATYPE jsonPathExpression
    )
```

Lets see an example of this:

```sql{19-24}
DECLARE @json_text NVARCHAR(MAX) = N'
[{
    "name": "Spider-Man",
    "first_appearance": {"title":"Amazing Fantasy", "issue": 15}
},
{
    "name": "Iron Man",
    "first_appearance": {"title":"Tales of Suspence", "issue": 39}
},
{
    "name": "Captain America",
    "first_appearance": {"title":"Captain America Comics", "issue": 1}
}]
'

SELECT
    *
FROM
    OPENJSON(@json_text)
        WITH (
            [name] varchar(200) '$.name',
            first_appeared varchar(200) '$.first_appearance.title',
            issue_number int '$.first_appearance.issue'
        )
```

Results:

name             | first_appearance                          | issue_number
:--------------- | :---------------------------------------- | :-----------
Spider-Man |	Amazing Fantasy |	15
Iron Man | Tales of Suspence | 39
Captain America | Captain America Comics | 1

The result set we define in the `WITH` clause will behave just like a regular table and can be joined, filtered, or modified in the `SELECT` clause.

### Automatically convert Data Types

A helpful feature of the `WITH` clause is that it supports sensible Data Type conversions within the schema definition.

The automatic conversion reduces the need to use `CAST` or `CONVERT` explicitly in the `SELECT` statement.

```sql
DECLARE @json_text NVARCHAR(MAX)
SET @json_text = N'
{
    "moon_landing": "1969-07-20T02:56:00+00:00",
    "seconds_in_a_day": "86400",
    "console_is_better_than_pc": true,
    "hundred_meter_world_record": "9.58"
}
'

SELECT
    random_facts.moon_landing
    ,random_facts.seconds_in_a_day / 3600 as hours_in_a_day
    ,random_facts.console_is_better_than_pc
    ,(100 / random_facts.hundred_meter_world_record) * 3.6 as hmwr_kph
FROM
    OPENJSON(@json_text)
        WITH (
            moon_landing DATETIME2
            ,seconds_in_a_day INT
            ,console_is_better_than_pc BIT
            ,hundred_meter_world_record FLOAT 
        ) as random_facts
```

Results:

| moon\_landing | hours\_in\_a\_day | console\_is\_better\_than\_pc | hmwr\_kph |
:-----------| :------------- | :------------------------| :-------|
|1969-07-20 02:56:00.0000000 |	24 | 1|	37.5782881002088 |

## Query JSON text from a table

All the examples up to this point have used `OPENJSON` with a variable that stores the JSON text. In reality, JSON text will be stored in a table, so how do we query this?

Lets assume we're using a database called **nobel** which has a table of nobel laureates aptly named **laureates** and contains rows of JSON text. To query JSON text in the table, we use the `CROSS APPLY` operand to *apply* `OPENJSON` per row and pass in the column name containing the JSON text.

```sql
SELECT
    js.surname
    ,js.first_name
    ,TRY_CAST(js.dob AS DATE) as dob
    ,js.gender
    ,js.birth_country
FROM 
    nobel.dbo.laureate
        CROSS APPLY OPENJSON(laureate.json_text)
            WITH (
                surname VARCHAR(255) '$.surname'
                ,first_name VARCHAR(100) '$.firstname'
                ,dob VARCHAR(20) '$.born'
                ,gender VARCHAR(10) '$.gender'
                ,birth_country VARCHAR(100) '$.bornCountry'
            ) as js
ORDER BY
    js.surname
```

Results:

| surname | first_name | dob | gender | birth\_country |
:---------| :--------- | :---| :------| :------------- |
| Curie | Marie | 1867-11-07 | female | Russian Empire (now Poland) |

Once applied, `OPENJSON` can be used in the same way as the examples above, the only difference being it will be called per row.

## Working with Arrays

The last use of `OPENJSON` we'll explore is working with Arrays (or list of items).

Often when working with JSON, the data we need to query is in an Array. It can be useful to have this data returned as a result set with a row per Array item.

Let's look at how we can do the same with `OPENJSON`.

To do this, we target the Array with a **JSON Path Expression** and return it in a result set using the `WITH` clause. We also add the `AS JSON` keyword, which designates the column as a **JSON fragment**, enabling it to be used with a subsequent call to `OPENJSON`.

To access the Array items we then use an `OUTER APPLY` and another `OPENJSON` call passing in the previously defined **JSON fragment**. The Array items can be mapped to columns using another `WITH` clause.

```sql{22-22,25-29}
DECLARE @spider_man NVARCHAR(MAX)
SET @spider_man = N'
{
    "name": "Spider-Man",
    "aliases": ["Bag-Man","Black Marvel","Peter Palmer"],
    "power_stats": [
        {"power": "Intelligence", "value": 95},
        {"power": "Strength","value": 55},
        {"power": "Speed", "value": 65},
        {"power": "Durability", "value": 75},
        {"power": "Power", "value": 75},
        {"power": "Combat", "value": 95}
    ]
}'

SELECT
    power_stat.power
    ,power_stat.value
FROM
    OPENJSON(@spider_man)
        WITH (
            power_stats NVARCHAR(MAX) '$.power_stats' AS JSON
        ) as root_js
    
    OUTER APPLY OPENJSON(root_js.power_stats)
        WITH (
            power VARCHAR(20) '$.power'
            ,value INT '$.value'
        ) as power_stat
```

Results:

| surname | first_name |
:---------| :--------- |
| Intelligence	| 95 |
| Strength	| 55 |
| Speed |	65 |
| *etc*	|  |

Notice that when using the JSON Path Expression, the path is defined relative to the JSON fragment and not original JSON text.

Where the Array *does <u>not</u>* contain objects, we can simply reference the items with the `$` dollar sign.

```sql{13}
...

SELECT
    alias.name
FROM
    OPENJSON(@spider_man)
        WITH (
            aliases NVARCHAR(MAX) '$.aliases' AS JSON
        ) as root_js
    
    OUTER APPLY OPENJSON(root_js.aliases)
        WITH (
            name VARCHAR(50) '$'
        ) as alias
```

### Array index support

The JSON path expression also supports Array Indexing when a path refers to an Array. This is useful in situations where you always want to query the same item in an Array, e.g., the first item in an Array.

To use Array Indexing, use the square bracket notation with the number of the Index you wish to target. As is familiar with programming languages, Arrays are zero-based (start at zero).

```sql
DECLARE @meteor_landings NVARCHAR(MAX)
SET @meteor_landings = N'
    [
        {"name": "Aachen","coordinates": [6.08333,50.775]},
        {"name": "Aarhus","coordinates": [10.23333,56.18333]},
        {"name": "Abee","coordinates": [-113,54.21667]}
    ]
'

SELECT
    *
FROM
    OPENJSON(@meteor_landings)
        WITH(
            name VARCHAR(10) '$.name',
            latitude FLOAT '$.coordinates[0]',
            longitude FLOAT '$.coordinates[1]'
        )
```

Results:

| name | latitude | longitude |
:----- | :------- | :-------- |
| Aachen | 6.08333	| 50.775 |
| Aarhus | 10.23333	| 56.18333 |
| Abee | -113	| 54.21667 |

### Array aggregations

At times it's useful to know the length of an Array, i.e., how many items the Array holds. 

If you're familiar with programming, this is as simple as a function call or accessing a length property on the Array. We can achieve a similar result in SQL Server by sub-querying the `OPENJSON` function.

```sql{25-27}
DECLARE @world_cup_winners NVARCHAR(MAX)
SET @world_cup_winners = N'
    [
        {"country": "Brazil","tournaments_won": [1958,1962,1970,1994,2002]},
        {"country": "Germany","tournaments_won": [1954,1974,1990,2014]},
        {"country": "Italy","tournaments_won": [1934,1938,1982,2006]},
        {"country": "Argentina","tournaments_won": [1978,1986]},
        {"country": "France","tournaments_won": [1998,2018]},        
        {"country": "England","tournaments_won": [1966]},
        {"country": "Spain","tournaments_won": [2010]},
        {"country": "Uruguay","tournaments_won": [1930,1950]}
    ]
'

SELECT
    countries.country
    ,tournaments_summary.number_won
FROM
    OPENJSON(@world_cup_winners)
        WITH(
            country VARCHAR(20) '$.country',
            tournaments_won NVARCHAR(MAX) '$.tournaments_won' AS JSON
        ) as countries
    
    OUTER APPLY (
        SELECT COUNT(*) as number_won FROM OPENJSON(countries.tournaments_won)
    ) as tournaments_summary
```

We can also apply a similar technique (in this situation where the Array items are integers) to return aggregations from an Array.

```sql{16-16,18-21}
...

SELECT
    countries.country
    ,tournaments_summary.*
FROM
    OPENJSON(@world_cup_winners)
        WITH(
            country VARCHAR(20) '$.country',
            tournaments_won NVARCHAR(MAX) '$.tournaments_won' AS JSON
        ) as countries
    
    OUTER APPLY (
        SELECT 
            COUNT(*) as number_won
            ,MAX(tournament_years.year_of_tournament) as last_win
        FROM 
            OPENJSON(countries.tournaments_won)
                WITH (
                    year_of_tournament INT '$'
                ) as tournament_years
    ) as tournaments_summary
```

Results:

| country | number_won |
:----- | :------- |
| Brazil |	5 |
| Germany |	4 |
| Italy |	4 |
| *etc* | |

Notice that in the sub-query we call `OPENJSON` and include the `WITH` clause so that aggregations can be performed on the named result set.

## Conclusion

I hope this exploration of `OPENJSON` has been useful. 

What makes SQL Server's JSON support effective is it allows you to leverage JSON data sources without leaving SQL. This has been helpful when dealing with large volumes of JSON data where data can be injested and then explored *through* SQL without resorting to a (generally) more complicated general purpose programming language.

### Further Reading

* [OPENJSON (Transact-SQL)](https://docs.microsoft.com/en-us/sql/t-sql/functions/openjson-transact-sql?view=sql-server-ver15)
* [JSON data in SQL Server](https://docs.microsoft.com/en-us/sql/relational-databases/json/json-data-sql-server?view=sql-server-ver15)
* [ jdorfman / awesome-json-datasets ](https://github.com/jdorfman/awesome-json-datasets)
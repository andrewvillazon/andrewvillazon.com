---
title: "Placeholder text in T-SQL"
date: "2021-01-23"
tags:
    - SQL Server
---
If you've ever written SQL that uses a lot of string concatenation, you might have wondered if there's a different way to combine strings and data. There is—something I call Placeholder text, and in this post, we'll look at three methods for utilizing Placeholder text in T-SQL (SQL Server).

What do I mean by 'Placeholder text'? In programming, it's sometimes referred to as String Interpolation, templating, or format strings. String Interpolation is a fancy term for a process that takes a string containing placeholders and replaces those with values.

One of the useful applications of placeholder text is Dynamic SQL (SQL constructed at execution time). Dynamic SQL often involves creating queries by combining strings of SQL code with data from the database.

Before we start, I'm going to assume that you're comfortable writing SQL queries, working with variables and functions.

If you're interested, the database referred to in the code samples is the Wide World Importers demo.

## xp_sprintf

The first method we'll look at is the System Stored Procedure `xp_sprintf`. 

Like a stored procedure, `xp_sprintf` works with the `EXECUTE` statement and has the following layout (formatted for readability).

```sql
EXEC xp_sprintf @output_variable OUTPUT, 
                'placeholder text',
                val_1, 
                val_2,
                etc...
```

Let's look at how to use it.

```sql{4}
DECLARE @stmt VARCHAR(200)

EXEC xp_sprintf @stmt OUTPUT, 
                N'USE %s; SELECT * FROM %s.%s;',
                'WideWorldImporters',
                'Warehouse',
                'PackageTypes'

SELECT @stmt

EXEC (@stmt);
```

We call the procedure with the `EXEC` statement and pass it a variable of `VARCHAR` type. Including the `OUTPUT` keyword *outputs* the result of the stored procedure to the variable `@stmt`. We follow this with the values that correspond to our placeholders. `xp_sprintf` places the values in the order they're provided.

We can also achieve the same result using variables. Putting our placeholder text in a variable lets us reuse it with different values and cuts down on repeated code.

```sql
DECLARE @stmt_with_placeholders VARCHAR(200)
DECLARE @stmt VARCHAR(200)

DECLARE @db VARCHAR(50)
DECLARE @schema VARCHAR(50)
DECLARE @table VARCHAR(50)

SET @stmt_with_placeholders = N'USE %s; SELECT * FROM %s.%s;'
SET @db = N'WideWorldImporters'
SET @schema = N'Warehouse'
SET @table = N'PackageTypes'

EXEC xp_sprintf @stmt OUTPUT,
                @stmt_with_placeholders,
                @db,
                @schema,
                @table

SELECT 
    @stmt

EXEC (@stmt);

-- Reuse the placeholder text with different values
SET @schema = 'Sales'
SET @table = 'Customers'

EXEC xp_sprintf @stmt OUTPUT,
                @stmt_with_placeholders,
                @db,
                @schema,
                @table

SELECT 
    @stmt

EXEC (@stmt)
```

`xp_sprintf` has some limitations:
* `xp_sprintf` will truncate its output at 255 characters, making it unsuitable for longer queries.
* It only supports the `%s` placeholder meaning you can't name placeholders.
* It does not support variables where the type is `VARCHAR(MAX)`.
* The number of placeholders is limited to 50.
* It's error messages are somewhat cryptic and unhelpful.

With these limitations in mind, let's look at another option.
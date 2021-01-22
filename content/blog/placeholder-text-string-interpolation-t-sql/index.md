---
title: "Placeholder Text (String Interpolation) in T-SQL"
date: "2021-01-23"
tags:
    - SQL Server
---
If you've ever written SQL that uses a lot of [string concatenation](https://docs.microsoft.com/en-us/sql/t-sql/functions/concat-transact-sql?view=sql-server-2016), you might have wondered if there's a different way to combine strings and data. There is—something I call **Placeholder Text**, and in this post, we'll look at three methods for utilizing Placeholder Text in T-SQL (SQL Server).

What do I mean by Placeholder Text? In programming, it's sometimes referred to as [String Interpolation](https://en.wikipedia.org/wiki/String_interpolation), **Templating**, or **Format Strings**. String Interpolation is a fancy term for a process that takes a string containing placeholders and replaces the placeholders with values.

One of the useful applications of Placeholder Text is [Dynamic SQL](https://docs.microsoft.com/en-us/sql/odbc/reference/dynamic-sql?view=sql-server-ver15) (SQL constructed at execution time). Dynamic SQL often involves creating queries by combining strings of SQL code with data from the database.

Before we start, I'm going to assume that you're comfortable writing SQL queries, working with [variables](https://docs.microsoft.com/en-us/sql/t-sql/language-elements/variables-transact-sql?view=sql-server-ver15) and [functions](https://docs.microsoft.com/en-us/sql/t-sql/functions/functions?view=sql-server-ver15).

If you're interested, the database referred to in the code samples is the [Wide World Importers](https://github.com/microsoft/sql-server-samples/tree/master/samples/databases/wide-world-importers) sample database.

## xp_sprintf

The first method we'll look at is the [System Stored Procedure](https://docs.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/system-stored-procedures-transact-sql?view=sql-server-ver15) `xp_sprintf`. 

Like a stored procedure, `xp_sprintf` works with the `EXECUTE` [statement](https://docs.microsoft.com/en-us/sql/t-sql/language-elements/execute-transact-sql?view=sql-server-ver15) and has the following layout (formatted for readability).

```
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
```

We call the procedure with the `EXEC` statement and pass it a variable of `VARCHAR` type. Including the `OUTPUT` keyword *outputs* the result of the stored procedure to the variable `@stmt`. 

After this, we provide a string that contains placeholders. We identify placeholders with `%s` and follow with the values corresponding to our placeholders. `xp_sprintf` **places the values in the order provided**.

The result is a string where the provided values replace the placeholders.

```
USE WideWorldImporters; SELECT * FROM Warehouse.PackageTypes;
```

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
* `xp_sprintf` will **truncate** its output at **255 characters**, making it unsuitable for longer queries.
* Only supports the `%s` placeholder.
* Does not support variables where the type is `VARCHAR(MAX)`.
* The number of placeholders is limited to **50**.
* Error messages are somewhat cryptic and unhelpful.

With these limitations in mind, let's look at another option.

## FORMATMESSAGE

`FORMATMESSAGE` comes from the family of [system functions](https://docs.microsoft.com/en-us/sql/relational-databases/system-functions/system-functions-category-transact-sql?view=sql-server-ver15). It's intended purpose is to combine system messages with data. However, it can also take a `msg_string` argument that includes placeholders.

The syntax of `FORMATMESSAGE` is like this:

```
FORMATMESSAGE('text with placeholders', val_1, val_2, etc...)
```

To use `FORMATMESSAGE`, call it like a regular function.

```sql
SELECT
    FORMATMESSAGE(N'USE %s; SELECT TOP %i * FROM %s.%s;',
                'WideWorldImporters',
                3,
                'Warehouse',
                'PackageTypes')
```

```
USE WideWorldImporters; SELECT TOP 3 * FROM Warehouse.PackageTypes;
```

`FORMATMESSAGE` works with variables.

```sql
DECLARE @text_with_placeholders VARCHAR(MAX) = N'SELECT * FROM %s.%s.%s'
DECLARE @text_filled VARCHAR(MAX)

DECLARE @db VARCHAR(50) = 'WideWorldImporters'
DECLARE @schema VARCHAR(50) = 'Warehouse'
DECLARE @table VARCHAR(50) = 'PackageTypes'

SET @text_filled = FORMATMESSAGE(@text_with_placeholders,
                                @db,
                                @schema,
                                @table)

EXEC(@text_filled)

```

`FORMATMESSAGE` also supports **formatting** based (generally) on the C programming language's `printf` [function](https://en.wikipedia.org/wiki/Printf_format_string). As a result, [formatting rules](https://alvinalexander.com/programming/printf-format-cheat-sheet/) can be included with a placeholder.

```sql
SELECT FORMATMESSAGE('Integer with leading zeros: %05i', 2)
SELECT FORMATMESSAGE('10 characters of white space padding: %10s!', 'Foo')
```

```
Integer with leading zeros: 00002
10 characters of white space padding:        Foo!
```

A more comprehensive list of the formatting rules is available in the `FORMATMESSAGE` [documentation](https://docs.microsoft.com/en-us/sql/t-sql/functions/formatmessage-transact-sql?view=sql-server-ver15).

#### Side note: What is FORMATMESSAGE?

As mentioned earlier, `FORMATMESSAGE` combines [system messages](https://docs.microsoft.com/en-us/sql/relational-databases/system-catalog-views/messages-for-errors-catalog-views-sys-messages?view=sql-server-ver15) with data. These messages exist in the `sys.messages` [System catalog view](https://docs.microsoft.com/en-us/sql/relational-databases/system-catalog-views/catalog-views-transact-sql?view=sql-server-ver15).

You can view the messages via the following query.

```sql
SELECT * FROM sys.messages
```

Note how the `text` column contains a text message and placeholders. Looking closer at this result set, you're likely to see error messages you regularly encounter in SQL Server.

You can populate the message with values by calling `FORMATMESSAGE` with a `message_id` from `sys.messages`. You'll only be able to call messages with an id **above 13000**, a limitation of `FORMATMESSAGE`—a `message_id` 13000 or less results in `NULL`.

```sql
SELECT FORMATMESSAGE(21821, 'Something', 'Some other thing');
```

```
Specify one and only one of the parameters - Something or Some other thing.
```

## Using the Replace function

This final method comes from [Stefan Hoffmann](https://social.msdn.microsoft.com/profile/stefan%20hoffmann/) via the [MSDN forum](https://social.msdn.microsoft.com/Forums/sqlserver/en-US/e7fdecd7-a322-4cc1-b939-5dd13fa15a38/how-to-replace-placeholders-in-a-string-from-a-table-or-list?forum=transactsql) and replicates String Interpolation functionality found in programming languages. It cleverly combines variable assignment with the `REPLACE` function.

Let's see how it works.

```sql
DECLARE @stmt_with_placeholders NVARCHAR(MAX) = 'USE {database}; SELECT * FROM {schema}.{table};'
DECLARE @stmt_processed NVARCHAR(MAX) = @stmt_with_placeholders

DECLARE @placeholders TABLE (
    placeholder NVARCHAR(20)
    ,replacement_text NVARCHAR(200)
)

INSERT INTO @placeholders
VALUES
('{database}', 'WideWorldImporters'),
('{schema}', 'Warehouse'),
('{table}', 'PackageTypes')

SELECT
    @stmt_processed = REPLACE(@stmt_processed, 
                            placeholders.placeholder,
                            placeholders.replacement_text)
FROM
    @placeholders as placeholders

SELECT @stmt_processed

EXEC (@stmt_processed)
```

First, we create a string with placeholders. Because this method uses the `REPLACE` function, we can define the placeholders however we like. In this example, I've reproduced the string [formatting syntax from Python](https://docs.python.org/3/tutorial/inputoutput.html#the-string-format-method), i.e., using **curly braces**.

For this to work correctly requires another variable (`@stmt_processed`), which is assigned the value of `@stmt_with_placeholders`.

```sql{2}
DECLARE @stmt_with_placeholders NVARCHAR(MAX) = 'USE {database}; SELECT * FROM {schema}.{table};'
DECLARE @stmt_processed NVARCHAR(MAX) = @stmt_with_placeholders
```

Then we create a table variable that stores the placeholders and their replacement values.

```sql
DECLARE @placeholders TABLE (
    placeholder NVARCHAR(20)
    ,replacement_text NVARCHAR(200)
)

INSERT INTO @placeholders
VALUES
('{database}', 'WideWorldImporters'),
('{schema}', 'Warehouse'),
('{table}', 'PackageTypes')
```

All that's needed then is to process the placeholders. 

We do this by querying the placeholder table. As the SQL engine moves through each record, the corresponding placeholder is searched and replaced using the `REPLACE` function. 

```sql
SELECT
    @stmt_processed = REPLACE(@stmt_processed, 
                            placeholders.placeholder,
                            placeholders.replacement_text)
FROM
    @placeholders as placeholders

SELECT @stmt_processed

EXEC (@stmt_processed)
```

The final result is a string populated with our values. Pretty neat, right?

```
USE WideWorldImporters; SELECT * FROM Warehouse.PackageTypes;
```

## Conclusion

While SQL isn't exactly known for its string processing abilities, here we've explored three different ways to achieve String Interpolation. These approaches can make complicated string construction cleaner, reusable, and easier to maintain.

Next time you've got a complex string to build, give them a try.

### Further reading
* [xp_sprintf](https://docs.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/xp-sprintf-transact-sql?view=sql-server-ver15)
* [FORMATMESSAGE](https://docs.microsoft.com/en-us/sql/t-sql/functions/formatmessage-transact-sql?view=sql-server-ver15)
* [How to replace placeholders in a string from a table or list](https://social.msdn.microsoft.com/Forums/sqlserver/en-US/e7fdecd7-a322-4cc1-b939-5dd13fa15a38/how-to-replace-placeholders-in-a-string-from-a-table-or-list?forum=transactsql)
* [String Interpolation](https://en.wikipedia.org/wiki/String_interpolation)
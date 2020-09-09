---
title: "Useful SQL Server functions: TRY_CAST & TRY_CONVERT"
date: "2020-09-09"
tags:
    - SQL Server
---
You've probably used the `CAST` and `CONVERT` functions to switch between data types, but did you know there's a couple of handy counterparts to these? The `TRY_CAST` and `TRY_CONVERT` functions.

This post will look at these two functions, how to use them, and what makes them useful.

## TRY\_CAST & TRY\_CONVERT

`TRY_CAST` & `TRY_CONVERT` follow the same syntax as `CAST` and `CONVERT` but with **one key difference**: `TRY_CAST` and `TRY_CONVERT` return `NULL` if the conversion fails.

The functions are laid out like this:

##### TRY_CAST

```SQL
TRY_CAST (column_or_value AS data_type)
```

##### TRY_CONVERT

```SQL
TRY_CONVERT (data_type, column_or_value, optional_style)
```

Let's look at a couple of simple examples.

```SQL
SELECT
    TRY_CAST('42' AS INTEGER) as result
    ,TRY_CAST('42' AS INTEGER) * TRY_CAST('42' AS INTEGER) as result_sq
```

```SQL
SELECT
    TRY_CAST('To be, or not to be' AS DATE) as result
```

Notice when the conversion failed, the column has a `NULL` value, and the query successfully ran.

**There is one catch to be aware of, however**. `TRY_CAST` and `TRY_CONVERT` will still error if the conversion is not permitted. 

This example returns an error because an `INTEGER` to `DATE` conversion is not allowed.

```SQL
SELECT
    TRY_CAST(42 AS DATE) as result
```

For more details on permitted conversions, see the table here.

## Why is this useful?

Firstly because it won't break a query if conversion fails (some exceptions, see above), the returned value will be `NULL` instead of an error.

Secondly, `TRY_CAST` and `TRY_CONVERT` are useful because they allow you to try alternatives if conversion fails. 

When used in a `CASE` statement, this lets you test if a conversion is possible and respond if not. You can keep trying other conversions until you've exhausted all options and return `NULL`.

## An example

Let's pretend for a moment that the data in this example represents a table of imported Microsoft Excel data. We need to convert the `messy_date` column, a `VARCHAR`, to a `DATE`, but (typically) it's full of mixed formats.

We can use `TRY_CONVERT` and `TRY_CAST` here to test three different conversions and then return `NULL`.

```SQL
-- Setup example data
DROP TABLE IF EXISTS #excel_data
CREATE TABLE #excel_data (
    messy_date VARCHAR(100)
)
INSERT INTO #excel_data(messy_date)
VALUES
    ('30/08/2020')
    ,('02/25/2020')
    ,('44081')
    ,(NULL)
    ,('#N/A')


DECLARE @excel_serial_start DATE = '1900-01-01'

SELECT
    CASE
        WHEN TRY_CONVERT(DATE, #excel_data.messy_date, 103) IS NOT NULL THEN
            CONVERT(DATE, #excel_data.messy_date, 103)
        WHEN TRY_CONVERT(DATE, #excel_data.messy_date, 101) IS NOT NULL THEN
            CONVERT(DATE, #excel_data.messy_date, 101)
        WHEN TRY_CAST(#excel_data.messy_date AS INT) IS NOT NULL THEN
            DATEADD(DAY, CAST(#excel_data.messy_date AS INT), @excel_serial_start)
        ELSE
            NULL
    END as result
FROM
    #excel_data
```

First, we test for the British date format (103). If that fails, we try the US format (101). 

Our example data includes dates represented as the Excel serial number. To handle this, we test if we can convert it to an `INTEGER` and if we can use the `DATEADD` function to return the date. If all of these are unsuccessful, then we return `NULL`.

Pretty handy, right? We've managed to convert three different date formats without using convoluted string manipulation.

## Conclusion

In this article, we've taken a look at two useful SQL Server conversion functions, `TRY_CAST` and `TRY_CONVERT`. 

Next time you've got any messy Data Type conversions, give `TRY_CAST` or `TRY_CONVERT` a try (pun intended).

### Further reading
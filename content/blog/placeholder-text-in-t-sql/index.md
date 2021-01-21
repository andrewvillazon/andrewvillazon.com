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
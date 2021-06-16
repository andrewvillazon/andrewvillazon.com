---
title: "The Table Value Constructor (aka the VALUES keyword)"
date: "2021-06-17"
tags:
    - SQL Server
---

In this post, we'll look at a helpful but lesser-known feature of T-SQL, the Table Value Constructor.

You've probably seen it used as part of an Insert Statement, where it is easily identifiable as the `VALUES` keyword. However, it comes in handy in other ways that we'll explore below.

## What is the Table Value Constructor?

The TVC is an expression that allows you to define a table row by row (known as row expressions) using the keyword `VALUES`

The Table Value Constructor has the following layout:

```
VALUES
(value_1, value_2, value_3, etc)
,(value_1, value_2, value_3, etc)
,(value_1, value_2, value_3, etc)
...etc
```

The TVC starts with the keyword `VALUES`, followed by a list of rows that form the returned table. 

Each row and its column values go inside parentheses, with a comma separating the column values. Each additional row follows with a comma and parentheses.
---
title: "Understanding file paths in Databricks"
date: "2023-10-06"
tags:
    - Databricks
---

When first getting started with Databricks, one of the confusing aspects can be figuring out how to specify file paths to read or write files. This can lead to frustrating `FileNotFound` errors or wandering the file system searching for that file you're pretty sure you just serialized... somewhere.  

In this post, we'll dig into the mechanics of file paths in Databricks, discuss how to work with them, and hopefully get a better understanding of their nuances.

## The File Systems

Before discussing file paths, it's helpful to know that there are two file systems in Databricks: the Local File System on the Driver Node and the Databricks File System (DBFS).

### Local File System on the Driver Node

The Driver Node is the node on the cluster responsible for executing your code. The Driver node coordinates and manages the work across the other nodes in the cluster.

The Driver Node has its own file system, known as the Local File System. Files stored in the Local File System exist in volume storage attached to the cluster, which differs from object storage.

### The Databricks File System (DBFS)

DBFS is the file system abstraction that sits over object storage (e.g., S3 or Blob). DBFS lets users interact with their object storage like a regular file system rather than using object URLs.

DBFS is also what we see when we click the Browse DBFS button in the Catalog area of the Databricks UI.

## Specifying File Paths

In Databricks, the code being executed, e.g., Python, Spark SQL, is associated with a default location on either the Local File System of the Driver Node or DBFS. Because of this feature, how we specify a file path **depends on the code we're running and the file system we're accessing**.

If we're accessing a location on a file system that is different from the default for our code, then we modify the target file path to reflect the non-default file system.

The following table, adapted from the Databricks documentation, shows the defaults for the different code types.

| Command/Code              | Default Location  | Prefix to access DBFS | Prefix to access Local File System |
|---------------------------|-------------------|-----------------------|------------------------------------|
| `%fs`                     | DBFS Root         |                       | `file:/`                           |
| `dbutils.fs`              | DBFS Root         |                       | `file:/`                           |
| `spark.read/write`        | DBFS Root         |                       | `file:/`                           |
| Spark SQL                 | DBFS Root         |                       | `file:/`                           |
| Python code, e.g., pandas | Local File System | `/dbfs`               |                                    |
| `%sh`                     | Local File System | `/dbfs`               |                                    |

### Default location behavior

Let's look at a handful of commands to see how the default location behavior works.

The default file system location for the `fs` command is DFBS. When we run the `%fs ls` command, we get the contents of the DBFS Root.

```
%fs ls /
```

```
| #   | path            | name       | size | modificationTime |
|-----|-----------------|------------|------|------------------|
| 1   | dbfs:/FileStore | FileStore/ | 0    | 0                |
| 2   | dbfs:/mnt/      | mnt/       | 0    | 0                |
| 3   | dbfs:/tmp/      | tmp/       | 0    | 0                |
| ... | ...             | ...        | ...  | ...              |
```

If we want to list the contents of a directory on the Local File System, we need to include the `file:/` prefix on the file path.

```
%fs ls file:/
```

```
| #   | path       | name | size | modificationTime |
|-----|------------|------|------|------------------|
| 1   | file:/bin  | bin/ | 0    | 0                |
| 2   | file:/etc/ | etc/ | 0    | 0                |
| 3   | file:/lib/ | lib/ | 0    | 0                |
| ... | ...        | ...  | ...  | ...              |
```

We can also use regular Python Code to list the directory contents using the os module of the standard library. The default file system for Python Code is the Local File System of the Driver Node. As expected, we see different contents to what's in DBFS.

```python
import os

print(os.listdir("/"))
```

```
['bin', 'lib', 'databricks', 'var', 'tmp', 'etc', ... ]
```

If we want to list the directory contents of the DBFS Root, then we must add the `/dbfs` prefix to the file path.

```python
import os

print(os.listdir("/dbfs/"))
```

```
['FileStore', 'tmp', 'mnt', 'databricks-datasets', ...]
```

Here's another example where we specify both file systems simultaneously. We can use `dbutils` to copy a file from the Local File System to DBFS. The default for `dbutils` is DBFS, so we add `file:/` to indicate the Local File System.

```python
dbutils.fs.cp("file:/tmp/my_file.txt", "/FileStore/")
```

Now, the same operation using the `%sh` (shell) command, which defaults to the Local File System.

```
%sh cp /tmp/my_file.txt /dbfs/FileStore/
```

Spark SQL also defaults to DBFS.

```sql{4}
CREATE OR REPLACE TEMPORARY VIEW my_view
USING CSV
OPTIONS (
    path "/FileStore/my_csv.csv"
);
```

And because Spark SQL defaults to DBFS, the same rule applies; we add `file:/` to read files from the Local File System.

```sql{4}
CREATE OR REPLACE TEMPORARY VIEW my_view
USING CSV
OPTIONS (
    path "file:/tmp/my_csv.csv"
);
```

## What's the difference between `dbfs:/` and `/dbfs`?

Lastly, another point of confusion is the use of `dbfs:/` and `/dbfs` in a file path.

`dbfs:/` and `/dbfs` both denote DBFS, but where each can be used is context-specific.

`/dbfs` is used with code where the default file system location is the Local File System. In this context, if we add `dbfs:/` to a file path, Databricks will display a message suggesting we replace it with `/dbfs`.

`dbfs:/`, on the other hand, can be used for file paths in code where the default file system location is DBFS. Because DBFS is the default in this context, the prefix is optional. 

Some consider it good practice always to include `dbfs:/` as it is more explicit about which file system is accessed.

```python
dbutils.fs.cp("file:/tmp/my_file.txt", "dbfs:/FileStore/")
```

## Summing Up

The key idea to remember is that the file path depends on the code being executed and the default file system location for that code. Once you know the default, it's a case of adding the proper prefix to the file path.

## Further Reading

* [How to work with files on Databricks](https://docs.databricks.com/en/files/index.html)
* [How to specify the DBFS path](https://kb.databricks.com/dbfs/how-to-specify-dbfs-path)
* [Programmatically interact with workspace files ](https://docs.databricks.com/en/files/workspace-interact.html)
* [What is the Databricks File System (DBFS)?](https://docs.databricks.com/en/dbfs/index.html)
* [Where’s my data?](https://docs.databricks.com/en/storage/index.html)
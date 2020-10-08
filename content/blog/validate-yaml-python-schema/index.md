---
title: "Validate YAML in Python with Schema"
date: "2020-10-08"
tags:
    - Python
---
When working with YAML files, e.g., using a YAML file for configuration, it's useful to validate the file's contents to ensure data in the file is the right types, within valid ranges, etc.

In this post, I'll look at a useful Python library to validate YAML called Schema. 

In simple terms, Schema allows us to define an outline or structure for data (known as a "schema.") We can take this structure and use it to validate data, in this context, data coming from a YAML file, and feedback when it doesn't conform.

Let's look at what we can do with Schema.

## A simple example

Say we're working on an application that requires a token to interact with a Rest API. The end-user provides this token in a YAML configuration file.

Let's use Schema to define some simple rules for this configuration data.

We start by creating a new Schema Object passing in a dict that defines the structure we expect the data to have.

```python
from schema import Schema
import yaml


config_schema = Schema({
    "api": {
        "token": str
    }
})

```

There are a couple of things we've defined:
* Passing in a dict indicates that valid data will be a dict (remember that the yaml library returns parsed yaml as a dict type)
* We require a top-level key in the dict to be named api
* Beneath that, we require a key named token with a value that is the str type.

Let's add some YAML and load it with the yaml library. We can use the `validate()` method on our newly created Schema object and pass in our loaded YAML to validate our data.

We'll deliberately make this invalid to demonstrate what happens when we validate it. Run the code below and notice what happens.

```python
from schema import Schema
import yaml


config_schema = Schema({
    "api": {
        "token": str
    }
})

conf_yaml = """api:
    passkey: 625c2043c132485b
"""

configuration = yaml.safe_load(conf_yaml)

try:
    config_schema.validate(configuration)
    print("Configuration is valid.")
except Exception as ex:
    raise ex

```

Schema raised a `SchemaError` with a message indicating that our data is missing a required key. 

```shell
schema.SchemaError: Key 'api' error:
Missing key: 'token'
```

Let's fix the problem with the required key but change the value to an integer type and re-run the code.

```python
# ...

conf_yaml = """api:
    token: 12345
"""

# ...
```

We still get a SchemaError, but this time the message indicates the value should be a string type.

```shell
schema.SchemaError: Key 'api' error:
Key 'token' error:
12345 should be instance of 'str'
```

Before we move on, let's fix up the YAML and see what happens when it's valid. Re-run the code below.

```python
rom schema import Schema
import yaml


config_schema = Schema({
    "api": {
        "token": str
    }
})

conf_yaml = """api:
    token: 625c2043c132485b
"""

configuration = yaml.safe_load(conf_yaml)

try:
    config_schema.validate(configuration)
    print("Configuration is valid.")
except Exception as ex:
    raise ex

```

Notice that no errors are raised.

```shell
Configuration is valid.
```

Pretty neat, right? We've defined a structure, and Schema has validated our data against that structure.

Let's take a look at what else we can do with Schema.

## Use Schema with a callable

We can use a callable as part of our validation. When Schema encounters a callable, it will call it passing in the data being validated. If the callable evaluates to True Schema will move on to the next rule; otherwise, it will raise a SchemaError.

Here we use a lambda (anonymous) function to validate that the `workers` key is between 1 and 10 inclusive.

```python{7,12}
from schema import Schema
import yaml


config_schema = Schema({
    "concurrency": {
        "workers": lambda n: 1 <= n <= 10
    }
})

conf_as_yaml = """concurrency:
    workers: 20
"""

configuration = yaml.safe_load(conf_as_yaml)

try:
    config_schema.validate(configuration)
    print("Configuration is valid.")
except Exception as ex:
    raise ex

```

This raises a Schema error because the lambda function returns False.

```shell
schema.SchemaError: Key 'concurrency' error:
Key 'workers' error:
<lambda>(20) should evaluate to True
```

## Validate using Regex

Schema can validate data using regular expressions. To do this, Schema provides a Regex class that wraps around a regular expression.

Here we check for a valid email using a regular expression pattern.

```python{1,3,9,14}
import re

from schema import Schema, Regex
import yaml


config_schema = Schema({
    "email": {
        "support": Regex(r'^\S+@\S+$')
    }
})

conf_as_yaml = """email:
    support: support_team_at_domain.tld
"""

configuration = yaml.safe_load(conf_as_yaml)

try:
    config_schema.validate(configuration)
    print("Configuration is valid.")
except Exception as ex:
    raise ex
```

```shell
schema.SchemaError: Key 'email' error:
Key 'support' error:
Regex('^\\S+@\\S+$') does not match 'support_team_at_domain.tld'
```

## Validate with logic operations

Schema supports boolean logic operations for validation. It does this by providing two utility classes, `And` and `Or`. These classes enable the combining of multiple validation rules.

In this example, all the validation rules passed to the `And()` object must evaluate to True for validation to pass.

```python
from schema import Schema, And
import yaml


config_schema = Schema({
    "concurrency": {
        "workers": And(int, lambda n: 1 <= n <= 10)
    }
})

conf_as_yaml = """concurrency:
    workers: 5.0
"""

configuration = yaml.safe_load(conf_as_yaml)

try:
    config_schema.validate(configuration)
    print("Configuration is valid.")
except Exception as ex:
    raise ex
```

```shell
schema.SchemaError: Key 'concurrency' error:
Key 'workers' error:
5.0 should be instance of 'int'
```

While in this example, only one of the validation rules needs to evaluate to True for validation to pass.

```python
"""TODO: Or example"""
```

## Making a key optional

To make an optional key, Schema provides a class named Optional. To use, we define the key as an Optional object passing in a description. Validation rules on the proceeding value(s) are defined as any other validation rule.

```python
from schema import Optional, Schema
import yaml


config_schema = Schema(
    {
        "settings": {
            "temp_dir": str,
            Optional("proxy_server"): {
                "address": str,
                "port": int,
            },
        }
    }
)

conf_as_yaml = """settings:
    temp_dir: /tmp
    proxy_server: 
        address: proxy.mydomain.com
        port: 8080
"""

configuration = yaml.safe_load(conf_as_yaml)

try:
    config_schema.validate(configuration)
    print("Configuration is valid.")
except Exception as ex:
    raise ex

```

```shell
Configuration is valid.
```

Note that if we remove the optional key from the YAML, the data is still valid. However, if the optional data is invalid, this will raise a SchemaError.

```python
# ...

conf_as_yaml = """settings:
    temp_dir: /tmp
    proxy_server: 
        url: proxy.mydomain.com
        port: 8080
"""

# ...
```

```shell
schema.SchemaError: Key 'settings' error:
Key 'proxy_server' error:
Missing key: 'address'
```

## Ignoring keys

Sometimes it is useful to ignore parts of the dict or only validate some sections of it. We can do this by setting the `ignore_extra_keys` argument to True when defining the Schema.

```python
from schema import Schema
import yaml


config_schema = Schema({
    "application": {
        "logging": {
                "filename": lambda fp: fp.endswith(".log")
            }
    }
    
}, ignore_extra_keys=True)

conf_as_yaml = """application:
    database:
        connection_string: sqlite:///app.db
    logging:
        filename: logs.log
    concurrency:
        workers: 6
"""

configuration = yaml.safe_load(conf_as_yaml)

try:
    config_schema.validate(configuration)
    print("Configuration is valid.")
except Exception as ex:
    raise ex

```

```shell
Configuration is valid.
```

Notice how the logging key is validated, but the surrounding keys are not.

Another option for ignoring keys is to define a rule using the `object` type. Because every object in Python is an `object` type, these keys are always valid.

```python{5,9}
# ...

config_schema = Schema({
    "application": {
        object: object,
        "logging": {
                "filename": lambda fp: fp.endswith(".log")
            },
        object: object
    }
    
}, ignore_extra_keys=True)

conf_as_yaml = """application:
    database:
        connection_string: sqlite:///app.db
    logging:
        filename: logs.log
    concurrency:
        workers: 6
"""

# ...

```

```shell
Configuration is valid.
```

## Working with Lists

Schema can also work with Lists and validate list items. To do this, we set a list as a value and define validation rules that will apply to each item. Each item must evaluate to True for validation to pass.

```python{6-10}
from schema import Regex, Schema
import yaml


config_schema = Schema({
    "tracking_list":[
        {"name": str,
        "url": Regex(r'\b(([\w-]+://?|www[.])[^\s()<>]+(?:\([\w\d]+\)|([^[:punct:]\s]|/)))'),
        "check": str}
    ]
})

conf_as_yaml = """tracking_list:
    - name: Fluent Python
      url: https://www.amazon.com/Fluent-Python-Concise-Effective-Programming/dp/1491946008
      check: daily
    - name: Python Cookbook
      url: https://www.amazon.com/Python-Cookbook-Third-David-Beazley/dp/1449340377
      check: daily
"""

configuration = yaml.safe_load(conf_as_yaml)

try:
    config_schema.validate(configuration)
    print("Configuration is valid.")
except Exception as ex:
    raise ex

```

Notice that when Schema encounters the `tracking_list` key, it will check that the value is a list. It will then apply the validation rules defined in this list to each list item under validation.

## Custom error messages

One of the minor drawbacks of Schema is that it's error messaging can be a little unhelpful. The final piece of functionality we'll take a look at is custom error messages.

To customize error messages, we pass in an `error` argument with a message. This message will be available on any raised SchemaError.

```python{11,28-34}
from schema import Or, Schema
import yaml


config_schema = Schema(
    {
        "retry_parameters": {
            "strategy": Or(
                "fixed",
                "double",
                error="Unsupported retry strategy. Supported retry strategies are: 'fixed' or 'double'",
            )
        }
    }
)

conf_as_yaml = """retry_parameters:
    strategy: random
"""

configuration = yaml.safe_load(conf_as_yaml)

try:
    config_schema.validate(configuration)
    print("Configuration is valid.")
except Exception as ex:

    for error in ex.errors:
        if error:
            print(error)

    for error in ex.autos:
        if error:
            print(error)

```

Custom error messages are accessed from the `errors` property of the SchemaError. Schema specific error messages are also available from the `autos` property of the SchemaError.

```shell
Unsupported retry strategy. Supported retry strategies are: 'fixed' or 'double'
Unsupported retry strategy. Supported retry strategies are: 'fixed' or 'double'
Key 'retry_parameters' error:
Key 'strategy' error:
Or('fixed', 'double') did not validate 'random'
'double' does not match 'random'
```

## Conclusion

As you can see, Schema provides a range of useful functionality for validating YAML-based data.

Lastly, we didn't cover off everything Schema can do, just the features I've found most helpful while using the library. Other features worth mentioning are Hooks (functions executed on validation) and JSON validation.

For more detailed information, check out the [Schema Github repository](https://github.com/keleshev/schema).
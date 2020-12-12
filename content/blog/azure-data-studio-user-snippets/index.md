---
title: "Supercharge writing SQL with user snippets in Azure Data Studio"
date: "2020-12-16"
tags:
    - SQL Server
---

In a [previous post](/auzre-data-studio-tips-tricks/), we looked at various tips and tricks to help you be more productive in Azure Data Studio (ADS).

This post will take that productivity to the next level by exploring **user snippets** in ADS.

## What are user snippets?

User snippets are a feature of modern code editors that insert pre-defined code blocks with a trigger. User snippets let you write repetitive or routine code quicker and easier.

## User Snippets in Azure Data Studio

ADS comes with several default snippets out of the box. You've probably encountered these already while writing queries.

There are two ways to access the default snippets:

#### Access snippets from the text editor

To access the default snippets from the text editor, start typing **"sql"**

When you do this, you should see the list of snippets appear in the **Intellisense**. Pressing <kbd>Tab</kbd> or <kbd>Enter</kbd> will insert that snippet into the text editor. 

You can also press <kbd>ctrl + space</kbd> to see more detail about the snippet.

<p><img src="DefaultSnippets.gif" class="article-img" title="Default snippets in Azure Data Studio" alt="Default snippets in Azure Data Studio"></p>

#### From the Command Palette

Alternatively, you can insert snippets from the **Command Palette**.

Press <kbd>cmd + shift + p</kbd> (Windows: <kbd>ctrl + shift + p</kbd>) to open the Command Palette and then choose **"Insert snippet"** to see the default snippets list.

<p><img src="DefaultSnippetsCommandPalette.gif" class="article-img" title="Default snippets in Azure Data Studio" alt="Default snippets in Azure Data Studio"></p>

Let's take a look at creating our own snippets.

## Creating custom user snippets

ADS stores snippets in a **JSON file** for each language. To create a new (or edit existing) snippet file:
1. Press <kbd>ctrl + shift + p</kbd> to open the Command Palette and search for the command **"Preferences: Configure User Snippets"**.
2. Select (or type) **"sql"** from the list of languages and press <kbd>Enter</kbd>.
3. ADS creates a new `sql.json` document with an empty **object** `{}` (curly braces). This object will contain any custom user snippets we define.

<p><img src="NewSnippetsFile.gif" class="article-img" title="Default snippets in Azure Data Studio" alt="Default snippets in Azure Data Studio"></p>

<div class="call-out call-out-info">
    <h4>
    Snippet scope
    </h4>
    <p>
        Snippets are language-specific; for example, you won't see SQL snippets in the Intellisense if you work on a PowerShell script.
    </p>
</div>

### Create a new snippet

To create a new snippet, we add a new snippet property and object to the document with the following syntax.

```json
{
    "snippet name": {
        "prefix": "abc",
        "body": [
            "line1", "line2", "etc"
        ],
        "description": "lorem ipsum"
    }
}
```

Snippet objects have the following properties:
* `prefix` - a sequence of text that, when typed, will list the snippet in the Intellisense.
* `body` - a list of the lines of code inserted when the snippet is triggered. Each item in this list represents a new line of code.
* `description` - a short description of the snippet that appears in Intellisense.

To create additional snippets, add more properties and objects separated by a comma.

```json{8}
{
    "snippet one": {
        "prefix": "abc",
        "body": [
            "line1", "line2", "etc"
        ],
        "description": "snippet one description"
    },
    "snippet two": {
        "prefix": "xyz",
        "body": [
            "line1", "line2", "etc"
        ],
        "description": "snippet two description"
    }
}
```

Keep in mind that this is a JSON document, so JSON syntax and rules apply.

### But wait, there's more - Snippet features

User snippets have particular constructs that can enhance the usefulness of the snippet.

#### Tabstops

Tabstops are cursor locations that you can place inside the body of a snippet. Each Tabstop includes a number indicating the order in which the cursor will be moved when pressing <kbd>tab</kbd>.

The syntax for a Tabstop is: `$cursor_number`

e.g., `$1`, `$2`, etc., with `$0` indicating the cursor's final position.

Multiple occurrences of the same Tabstop number will be highlighted and updated together.

```json{5-7}
{
    "Declare and set": {
        "prefix": "dec",
        "body": [
            "DECLARE @$1 $2",
            "SET @$1 = $3",
            "$0"
        ],
        "description": "Declares and sets a variable."
        }
}
```

<p><img src="Tabstops.gif" class="article-img" title="Tabstops in a user snippet" alt="Tabstops in a user snippet"></p>

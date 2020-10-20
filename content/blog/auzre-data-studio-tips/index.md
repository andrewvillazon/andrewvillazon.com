---
title: "Azure Data Studio tips"
date: "2020-10-21"
tags:
    - SQL Server
---

Azure Data Studio (ADS) has a slew of features that can improve the speed and efficiency of writing SQL. Listed below are some of the tips and tricks I've picked up since making the switch from SQL Server Management Studio.

*Prerequisites:*

For this post, I'm going to assume that you're familiar with writing SQL queries and have used a code editor.

## First tip: Become familiar with the Command Palette

The Command Palette is the searchable prompt where Azure Data Studio's many commands are accessed. Commands do things such as modify your current code, connect to a data source, or change a setting.

To access the Command Palette in Azure Data Studio press:
  * **Windows**: <kbd>ctrl + shift + p</kbd>
  * **Mac**: <kbd>cmd + shift + p</kbd>

<p><img src="CommandPalette.gif" class="article-img" title="Command Palette" alt="Command Palette"></p>

The Command Palette is designed for performing actions from the keyboard. Familiarising yourself with this tool will help you get a lot more out of Azure Data Studio.

## Query editing tips

Let's look at some tips that will help you write and edit queries faster.

### Work on one query while referring to another

Try Side by Side editing:

* **Windows**: <kbd>ctrl + \\</kbd>
* **Mac**: <kbd>ctrl + \\</kbd>

[EXAMPLE]

Alternatively:
* From the Explorer sidebar, drag and drop either a file or Open Editor group onto the editing area
* Or clicking the Side by Side editing icon in the top right corner

[EXAMPLE]

Side by side editing also supports a Grid Style layout, a 2x2 grid. Arrange the 2x2 grid by grabbing the center of the grid and moving to suit.

[EXAMPLE]

##### Side by side editing of the same file

ADS also supports viewing the *same* file side-by-side, handy when working on a long query spanning greater than the screen height.

This functions just like Side by Side editing, but instead, you drag the same file or Open Editor group onto the editing pane.

[EXAMPLE]

### Quickly comment lines or blocks of code

Comment out the current line:
* **Windows**: <kbd>ctrl + /</kbd>
* **Mac**: <kbd>cmd + /</kbd>

[EXAMPLE]

Add a block comment:
* **Windows**:
* **Mac**:

[EXAMPLE]

### Turn a block of code into one line

Got a compact statement that could fit on one line? Use the **Join Lines** command. On Mac, the shortcut for this is <kbd>control + j</kbd>

[EXAMPLE]

On Windows, the Join Lines command is not bound to a keyboard shortcut but can be set in Keyboard Shortcuts.

### Hide a region of a query

Want to hide a region of a query, e.g., hide a sub-query while editing the outer query. Try Code Folding.

* **Windows**: <kbd>ctrl + shift + [</kbd>, to unfold <kbd>ctrl + shift + ]</kbd>
* **Mac**: <kbd>alt + cmd + [</kbd>, to unfold <kbd>alt + cmd + ]</kbd>

[EXAMPLE]

ADS determines a foldable region by evaluating the indentation of lines. A foldable region starts at a line whose next line has a greater indent and ends when the indent is the same as the starting line.

### Search and Replace more text with Regular Expressions

With a Regular Expression search and replace, we search for a *text pattern* instead of exact text, which lets you modify more text in one go.

To open:
* Open Search and Replace (Windows: <kbd>ctrl + f</kbd>, Mac: <kbd>cmd + f</kbd>)
* Set the search to use Regular Expressions
* Expand the Replace text area and enter the Regular Expression

[EXAMPLE]

The search and replace above will remove open and closing square brackets from a query in one action (if you, like me, find the square bracket syntax noisy and hard to read).

### Transform to Uppercase or Lowercase

To change:
* Highlight some text
* Bring up the Command Palette (Windows: <kbd>ctrl + shift + p</kbd>, Mac: <kbd>cmd + shift + p</kbd>) and type either 'upper' or 'lower'
* Press enter to transform.

[EXAMPLE]

Transforming the case is even more useful when you combine with multiple selections.

[CLAUSES EXAMPLE]

Further, the commands can be bound to a keyboard shortcut reducing the need to use the command palette.

### Change all occurrences of text.

Want to rename something, and in all the places it's used, e.g., rename a variable? Try Changing all occurrences.

* Windows: <kbd>ctrl + f2</kbd>
* Mac: <kbd>cmd + f2</kbd>

[EXAMPLE]

---
title: "Azure Data Studio tips"
date: "2020-10-21"
tags:
    - SQL Server
---

Azure Data Studio (ADS) has a slew of features that can improve the speed and efficiency of writing SQL. Listed below are some of the tips and tricks I've picked up since making the switch from SQL Server Management Studio.

*Prerequisites:*

For this post, I'm going to assume that you're familiar with writing SQL queries and have used a code editor.

## First tip: Become familiar with the Command Palette.

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

* Windows: <kbd>ctrl + \\</kbd>
* Mac: <kbd>ctrl + \\</kbd>

[EXAMPLE]

Alternatively:
* From the Explorer sidebar, drag and drop either a file or Open Editor group onto the editing area
* Or clicking the Side by Side editing icon in the top right corner

[EXAMPLE]

Side by side editing also supports a Grid Style layout, a 2x2 grid. Arrange the 2x2 grid by grabbing the center of the grid and moving to suit.

[EXAMPLE]

##### Side by side editing of the same file

ADS also supports viewing the *same* file side-by-side, handy for working on a long query that spans greater than the screen height.

This functions just like Side by Side editing, but instead, you drag the same file or Open Editor group onto the editing pane.

[EXAMPLE]
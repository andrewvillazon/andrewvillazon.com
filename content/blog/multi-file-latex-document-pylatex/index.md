---
title: "Multi-file LaTeX Documents with Pylatex"
date: "2021-09-19"
tags:
    - Python
    - Snippets
---

On a large or complex LaTeX document, it can be helpful to break the document into smaller files bringing them together under a main file. We can achieve Multi-file documents with the subfiles package outlined here at Overleaf.

Here's how we can do the same thing using Pylatex.

Directory layout:

```
.
├── main.pdf
├── main.tex
├── sections
│   └── sub_doc.tex
└── subfile.py
```

<div class="code-filename">subfile.py</div>

```python
from pylatex import Command, Document, Section, Subsection
from pylatex.package import Package
from pylatex.utils import NoEscape


def setup_main_doc(main_doc):
    main_doc.packages.append(Package("blindtext"))
    main_doc.packages.append(Package("subfiles"))

    main_doc.preamble.append(Command("title", "Pylatex Subfile Demo"))
    main_doc.append(NoEscape("\maketitle"))

    with main_doc.create(Section("This Section comes from the Main Document")):
        main_doc.append(
            "I'm Deckard. Blade Runner. B Two sixty-three fifty-four. I'm filed and monitored."
        )


def setup_sub_doc(sub_doc):
    sub_doc.packages.append(Package("subfiles"))

    with sub_doc.create(Section("This Section comes from the Sub Document")):
        sub_doc.append(
            "You know that Voight-Kampff test of yours? Did you ever take that test yourself?"
        )

        with sub_doc.create(Subsection("And here is a Subsection")):
            sub_doc.append(Command(command="blindtext"))


if __name__ == "__main__":
    # 1. Generate Main Document
    main_doc = Document("article")
    setup_main_doc(main_doc)

    # 2. Then the Sub Document
    sub_doc = Document(
        documentclass="subfiles", document_options=[NoEscape("../main.tex")]
    )
    setup_sub_doc(sub_doc)

    # 3. Serialize. Sub Doc .tex file should exist first.
    sub_doc.generate_tex("sections/sub_doc")

    # 4. Add into the Main Document
    main_doc.append(
        Command(command="subfile", arguments=NoEscape("sections/sub_doc.tex"))
    )

    # 5. Finally, serialize the Main Document.
    main_doc.generate_pdf("main")
    main_doc.generate_tex("main")

```

## Notes

* The packages required by the sub-document are imported into the main document. It is recommended that the subfiles package be imported last.

```python
def setup_main_doc(main_doc):
    main_doc.packages.append(Package("blindtext"))
    main_doc.packages.append(Package("subfiles"))
```
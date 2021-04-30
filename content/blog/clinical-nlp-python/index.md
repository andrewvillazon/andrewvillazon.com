---
title: "Clinical Natural Language Processing in Python"
date: "2021-04-17"
tags:
    - Python
---
When working with health data, some of the most valuable information is inside Clinical Documentation. Notes made by Clinicians document many details, including diseases present, treatments, medications, or procedures, providing insight into a patient's condition.

In this guide, we'll see how to use modern NLP tools in Python to extract meaningful information from Clinical Texts.

#### Prerequisites

This guide will make a few assumptions, namely:
* Familiarity with Python, including importing libraries, looping, and accessing attributes
* Comfortable using the terminal or command prompt to install packages
* A basic understanding of the goals and terminology of Natural Language Processing

## Overview

We're going to combine three libraries to perform Clinical NLP:
* spaCy: NLP library that provides text processing and orchestration.
* scispaCy: a library of clinical and biomedical specific components that integrate with spaCy.
* negspaCy: for detecting negation of terms.

The goal of this guide is not a detailed tutorial on each of these libraries. For that, I highly recommend starting with Advanced NLP with spaCy, a free online course from the spaCy team.

### Contents

```toc
exclude: ["Overview","Contents"]
```

## Processing text with spaCy

The first library we'll focus on is spaCy, an open-source library for Natural Language Processing in Python. spaCy acts as the base of the NLP and manages the end-to-end processing of text. Later we'll add clinical-specific spaCy components to handle Clinical Text.

Let's look at how spaCy works and explore some of its core concepts.

### Pipelines

Central to spaCy is the idea of a processing pipeline, the organized steps to extract information from a text. These steps consist of specific components chained together that act on a text to extract structured data.

The pipeline generates a Document or "Doc" object containing the structured data extracted from the text.

<p><img src="pipeline.svg" class="article-img" title="Default snippets in Azure Data Studio" alt="Default snippets in Azure Data Studio"></p>

A pipeline performs tasks such as:
* **Tokenization:** breaking a text into meaningful units known as tokens.
* **Part of Speech (POS) Tagging:** allocating word types (e.g., nouns, verbs) to tokens.
* **Dependency Parsing:** identifying how tokens relate to each other, e.g., in "the black cat," knowing that the adjective "black" relates to the cat.
* **Lemmatization:** identifying the root, or stem, of a word, e.g., runs, ran, running, all stem from the word "run."
* **Named Entity Recognition (NER):** labeling "entities" or things of interest. In a clinical context, this could be identifying the presence of a disease or part of the anatomy.

#### Creating a pipeline

In general, the first step in using spaCy is to create a pipeline object. In the code below, we create a (simple) pipeline from the English language class. The English language pipeline has the necessary components for handling English language text.

The convention in spaCy is to assign a pipeline object to a variable named `nlp`. To process a text with the pipeline, we call it passing in a text. Convention also recommends assigning the result to a variable named `doc`.

```python
from spacy.lang.en import English


nlp = English()

doc = nlp("Something is rotten in the state of Denmark and Hamlet is taking out the trash!")

```

### The Doc Object

Calling the `nlp` pipeline on text produces a `Doc` object.

The Doc object (short for Document) functions as a container for the data identified by the processing pipeline, such as tokens, parts of speech, sentences, lemmas, entities, etc.

The Doc behaves like a sequence. When used in a for loop, the Doc object returns each token in its token array.

```python
from spacy.lang.en import English


nlp = English()
doc = nlp("Iced that guy, cone a phrase.")

for token in doc:
    print(token)
```

```
Iced
that
guy
,
cone
a
phrase
.
```

### Tokens

A core task of the processing pipeline is to produce Tokens. 

In NLP, a token is a sequence of grouped characters that have some meaning. Standard tokens are things such as words, numbers, punctuation, etc.

spaCy gives us a large amount of information about a token, including:
* The text of the token
* If the token is an alphabet character, a digit, lower or upper case, currency, etc.
* If the token resembles an email, number, URL, etc.

Below examines a selection of attributes for the tokens in a Doc object.

```python
from spacy.lang.en import English


nlp = English()

doc = nlp("Two years from now, spam will be solved.")

fmt_str = "{:<8}| {:<10}| {:<10}| {:<10}"

print(fmt_str.format("token", "is_alpha","is_punct", "like_num"))

for token in doc:
    print(fmt_str.format(token.text, token.is_alpha, token.is_punct, token.like_num))

```

```
token   | is_alpha  | is_punct  | like_num  
Two     | 1         | 0         | 1         
years   | 1         | 0         | 0         
from    | 1         | 0         | 0         
now     | 1         | 0         | 0         
,       | 0         | 1         | 0         
spam    | 1         | 0         | 0         
will    | 1         | 0         | 0         
be      | 1         | 0         | 0         
solved  | 1         | 0         | 0         
.       | 0         | 1         | 0  
```

For a complete list of available attributes, see the spacy API documentation.

### Extracting information with trained pipelines

The English Language pipeline we saw earlier was quite simple. What we need is to extract *information* from the text. Here's where trained pipelines or models come in. 

Trained pipelines are a type of pipeline which uses statistical models to make predictions about tokens based on their context. Trained on labeled example texts, these models can detect parts-of-speech, dependency relationships between tokens, and named entities.

#### Installing models

Models don't come with spaCy and get installed separately. The spaCy docs recommend using spaCy's `download` command from the terminal.

```shell
python -m spacy download en_core_web_sm
```

Once installed, a model will appear as an installed package visible using the `pip list` terminal command.

For the complete list of English models from the spaCy team, see the docs.

#### Using trained pipelines

To use a trained pipeline, we first create it by calling spaCy's load function, passing in the name of an installed model. In this code, we're using `en_core_web_sm`, a small web-based model.

```python
import spacy

nlp = spacy.load("en_core_web_sm")

```

As we saw earlier, we call `nlp` on the text to process it and create a Doc object.

```python
import spacy

nlp = spacy.load("en_core_web_sm")

doc = nlp("Early one morning, Peter opened the gate and walked out into the big green meadow.")

fmt_str = "{:<8}| {:<6}| {:<8}| {:<8}"

print(fmt_str.format("token","pos", "label","parent"))

for token in doc:
    print(fmt_str.format(token.text, token.pos_, token.ent_type_, token.head.text))

```

```
token   | pos   | label   | parent  
Early   | ADV   | TIME    | morning 
one     | NUM   | TIME    | morning 
morning | NOUN  | TIME    | opened  
,       | PUNCT |         | opened  
Peter   | PROPN | PERSON  | opened  
opened  | VERB  |         | opened  
the     | DET   |         | gate    
gate    | NOUN  |         | opened  
and     | CCONJ |         | opened  
walked  | VERB  |         | opened  
out     | ADP   |         | walked  
into    | ADP   |         | walked  
the     | DET   |         | meadow  
big     | ADJ   |         | meadow  
green   | ADJ   |         | meadow  
meadow  | NOUN  |         | into    
.       | PUNCT |         | opened  
```

This time the trained pipeline has added some interesting information:
* The lemmatizer determined "opened" and "walked" stem from open and walk.
* The Part of Speech tagger has neatly tagged the tokens.
* The Named Entity Recognizer (NER) correctly labeled "Early," "one," and "morning" as TIME entities.
* The NER also recognized "Peter" as a person.

spaCy's trained pipelines and models are both powerful and straightforward to use. We gathered structured information by creating a pipeline object and calling it on a text.

Now that we've learned about using spaCy let's look at how to combine it with scispaCy for clinical-specific texts.

## Processing Clinical Text with scispaCy

Trained Pipelines work well; however, there's a catch. Their effectiveness depends on the training data and domain of the underlying model.

For example, pipelines trained for chat conversations are unlikely to be effective on Clinical Texts. For that, we need underlying models specifically trained for biomedical data.

#### What is scispaCy?

scispaCy is a python library containing spaCy pipelines, models, and components for processing biomedical, scientific, or clinical text. 

It has a couple of additional features that make it great for clinical text: An abbreviation detector and an entity linker that links tokens to an ontology.

### Installing scispaCy models

Similar to spaCy models, scispaCy models get installed separately. scispaCy models use pip to install and a model URL.

```
pip install <model_url>
```

The complete list of models and URLs is available on the [scispaCy GitHub page](https://github.com/allenai/scispacy#available-models).

<div class="call-out call-out-info">
    <h4>A note about scispaCy models</h4>
    <p>
        As of writing, scispaCy has two kinds of models, Entity Detectors and Named Entity Recognizers (NER).
    </p>
    <p>
        Entity Detection models, <code>en_core_sci_sm</code>, <code>en_core_sci_md</code>, <code>en_core_sci_lg</code>, and <code>en_core_sci_scibert</code>, detect entities but applies a general <code>ENTITY</code> label. These entities get used with additional pipeline components, such as the Abbreviation Detector, or linked to a knowledge base.
    </p>
    <p>
        The NER models are more specific and trained on an annotated corpus. These models identify an entity and give it a distinct label that is predefined.
    </p>
</div>

### Using scispaCy trained pipelines

scispaCy pipelines are created and used like other spaCy trained pipelines, i.e., calling spaCy's load method and passing in a model name. Once made, we call `nlp()` on a text to process it.

Below we create a scispaCy pipeline using an Entity Detection model. We then call it on a clinical text and inspect the token attributes.

```python
import scispacy
import spacy


nlp = spacy.load("en_core_sci_sm")

clinical_text = "An allograft was used to recreate the coracoacromial ligaments and then secured to decorticate with a bioabsorbable tenodesis screw and then to the clavicle."

doc = nlp(clinical_text)

fmt_str = "{:<15}| {:<6}| {:<7}| {:<8}"

print(fmt_str.format("token", "pos", "label", "parent"))

for token in doc:
    print(fmt_str.format(token.text, token.pos_, token.ent_type_, token.head.text))

```

```
token          | pos   | label  | parent  
An             | DET   |        | allograft
allograft      | NOUN  | ENTITY | used    
was            | VERB  |        | used    
used           | VERB  |        | used    
to             | PART  |        | recreate
recreate       | VERB  | ENTITY | used    
the            | DET   |        | ligaments
coracoacromial | ADJ   | ENTITY | ligaments
ligaments      | NOUN  | ENTITY | recreate
... etc
```

Notice how the pipeline has done part of speech tagging, identified syntactic dependencies, but it also applied an `ENTITY` label to some tokens.

Here we do the same but replace the Entity Detector with a NER model.

```python{5}
import scispacy
import spacy


nlp = spacy.load("en_ner_bionlp13cg_md")

clinical_text = "An allograft was used to recreate the coracoacromial ligaments and then secured to decorticate with a bioabsorbable tenodesis screw and then to the clavicle."

doc = nlp(clinical_text)

fmt_str = "{:<15}| {:<6}| {:<7}| {:<8}"

print(fmt_str.format("token", "pos", "label", "parent"))

for token in doc:
    print(fmt_str.format(token.text, token.pos_, token.ent_type_, token.head.text))

```

```{3,9,10}
token          | pos   | label  | parent  
An             | DET   |        | allograft
allograft      | NOUN  | ORGAN  | used    
was            | VERB  |        | used    
used           | VERB  |        | used    
to             | PART  |        | recreate
recreate       | VERB  |        | used    
the            | DET   |        | ligaments
coracoacromial | ADJ   | ORGAN  | ligaments
ligaments      | NOUN  | ORGAN  | recreate
... etc
```

The results are similar, but the Named Entity Recognizer has applied an `ORGAN` label to some of the tokens.

### Abbreviation detection

scispaCy comes with an `AbbreviationDetector` component to help with the decoding of Abbreviations. The `AbbreviationDetector` functions as a regular spacy pipeline component and gets added after a pipeline is loaded.

In spaCy 3.0, custom pipeline components must be **registered** with the pipeline. To add a pipeline component:
* Import the component using the `import` statement
* Load the trained pipeline
* Register the component on the trained pipeline with the `add_pipe()` method.

```python
import spacy
from scispacy.abbreviation import AbbreviationDetector

nlp = spacy.load("en_core_sci_sm")

# Add the abbreviation pipe to the spacy pipeline.
nlp.add_pipe("abbreviation_detector")

doc = nlp(
    "Chronic lymphocytic leukemia (CLL), autoimmune hemolytic anemia, and oral ulcer. The patient was diagnosed with chronic lymphocytic leukemia and was noted to have autoimmune hemolytic anemia at the time of his CLL diagnosis."
)

fmt_str = "{:<6}| {:<30}| {:<6}| {:<6}"

print(fmt_str.format("Short", "Long", "Starts", "Ends"))

for abrv in doc._.abbreviations:
    print(fmt_str.format(abrv.text, str(abrv._.long_form), abrv.start, abrv.end))

```

In spaCy, customizations to `Doc` or `Token` objects, such as those done by the `AbbreviationDetector`, become available through an `_` (underscore) attribute.

To access the Abbreviations loop through the `doc._.abbreviations` collection. Each token in this collection has a `long_form` attribute which expands the abbreviation.

```
Short | Long                          | Starts| Ends  
CLL   | Chronic lymphocytic leukemia  | 4     | 5     
CLL   | Chronic lymphocytic leukemia  | 36    | 37 
```

<div class="call-out call-out-inf">
    <h4>No abbreviations detected</h4>
    <p>You may notice the <code>AbbreviationDetector</code> fails to identify the abbreviation when the long-form is absent from the text. The Schwartz & Hearst algorithm implemented by the <code>AbbreviationDetector</code> requires at least one long-form, short-form pair in the text before identifying other short-form occurrences.</p>
    
    <p>For more detail on how the algorithm works, see the <a href="https://pubmed.ncbi.nlm.nih.gov/12603049/">original paper</a>.</p>
</div>

### Linking to UMLS and others with the EntityLinker

scispaCy's `EntityLinker` class is a spaCy pipeline component that links entities identified by the trained pipeline with various clinical ontologies. In spaCy, these ontologies are called Knowledge Bases.

As of writing, scispaCy supports the following: Unified Medical Language System, Medical Subject Headings, the RxNorm Ontology, the Gene Ontology, and the Human Phenotype Ontology.

The `EntityLinker` uses an approximate nearest neighbors search to compare each identified entity to entries in the knowledge base.

#### Setting up the EntityLinker

The `EntityLinker` functions as a regular spaCy component and gets added to an existing pipeline. 

To add to the pipeline:
* Import the component using the `import` statement
* Load the trained pipeline
* Register the component on the trained pipeline with the `add_pipe()` method, including an optional configuration dictionary.

```python
import spacy
import scispacy
from scispacy.linking import EntityLinker

nlp = spacy.load("en_core_sci_sm")
nlp.add_pipe("scispacy_linker", config={"linker_name": "umls"})

```


#### Configuring the EntityLinker

To configure the `EntityLinker`, we include an optional dictionary of configuration key-value pairs with the call to `add_pipe()`

The `EntityLinker` has the following configuration options:

*(reproduced from scispaCy GitHub page)*

| option | type | default | description |
|-|-|-|-|
| `linker_name` | str |  | Ontology to link to. Options: `umls`, `mesh`, `rxnorm`, `go`, `hpo` |
| `resolve_abbreviations` | bool | `False` | Resolve abbreviations before linking. The `AbbreviationDetector` (see above) must be in the pipeline for this to take effect. Default = `False` |
| `max_entities_per_mention` | int | 5 | The number of matching entries to return from the knowledge base. |
| `threshold` | float | 0.7 |  The threshold that a mention candidate must reach to be added to the mention in the Doc as a mention candidate. |
| `k` | int | 30 | The number of nearest neighbours to look up from the candidate generator per mention. |
| `no_definition_threshold` | float | 0.95 | The threshold that a entity candidate must reach to be added to the mention in the Doc as a mention candidate if the entity candidate does not have a definition. |
| `filter_for_definitions` | bool | `True` | Only include entities with definitions in the knowledge base. |

#### Using EntityLinker results

In spaCy, customizations to `Doc`, `Token`, or `Span` objects, such as those done by the `EntityLinker`, become available through an `_` (underscore) attribute.

The EntityLinker adds a `kb_ents` attribute to each entity successfully matched to a knowledge base entry. `kb_ents` is a list of match tuples containing the knowledge base concept identifier (CUI) and associated match score. The `max_entities_per_mention` sets the size of this list.

```python
import spacy
import scispacy
from scispacy.linking import EntityLinker

nlp = spacy.load("en_core_sci_sm")
nlp.add_pipe("scispacy_linker", config={"linker_name": "umls", "max_entities_per_mention": 6})

doc = nlp("Patient has prostate cancer with metastatic disease to his bladder.")

fmt_str = "{:<20}| {:<11}| {:<6}"
print(fmt_str.format("Entity", "Concept ID", "Score"))

entity = doc.ents[2]

for kb_entry in entity._.kb_ents:
    cui = kb_entry[0]
    match_score = kb_entry[1]

    print(fmt_str.format(entity.text, cui, match_score))

```

```
Entity              | Concept ID | Score 
metastatic disease  | C0027627   | 1.0   
metastatic disease  | C2939419   | 1.0   
metastatic disease  | C2939420   | 1.0   
metastatic disease  | C4330673   | 0.8193445801734924
metastatic disease  | C5205724   | 0.7593715190887451
metastatic disease  | C0238258   | 0.7438488602638245
```

#### Querying knowledge base entries

Lastly, we can query the knowledge base for more detail using the `EntityLinker` component and the CUI.

To query, we first retrieve the `EntityLinker` from the pipeline using the `get_pipe()` method. We then look up the CUI in the `linker.kb.cui_to_entity` dictionary using the CUI as the key.

```python{10,18}
import spacy
import scispacy
from scispacy.linking import EntityLinker

nlp = spacy.load("en_core_sci_sm")
nlp.add_pipe("scispacy_linker", config={"linker_name": "umls", "max_entities_per_mention": 3})

doc = nlp("Patient has prostate cancer with metastatic disease to his bladder.")

linker = nlp.get_pipe("scispacy_linker")

fmt_str = "{:<20}| {:<10}| {:<32}| {:<20}"

print(fmt_str.format("Entity", "1st CUI", "Canonical Name", "Definition"))

for entity in doc.ents:
    first_cuid = entity._.kb_ents[0][0]
    kb_entry = linker.kb.cui_to_entity[first_cuid]

    print(fmt_str.format(entity.text, first_cuid, kb_entry.canonical_name, kb_entry.definition[0:15] + "..."))

```

```
Entity              | 1st CUI   | Canonical Name                  | Definition          
Patient             | C0030705  | Patients                        | Individuals par...  
prostate cancer     | C0376358  | Malignant neoplasm of prostate  | A primary or me...  
metastatic disease  | C0027627  | Neoplasm Metastasis             | The transfer of...  
bladder             | C0005682  | Urinary Bladder                 | A musculomembra...
```

## Negation with negspaCy

The final aspect to consider in Clinical NLP is negation - the contradiction or denial of something. In a clinical context, the absence of something, e.g., a disease, can be valuable information.

For negation, we can use negspaCy, a spaCy pipeline component for negating concepts in a text. negspaCy implements the Negex algorithm.

negspaCy implements four negation patterns:
* **pseudo negations:** phrases appearing to indicate negation but identify double negatives, e.g., "not ruled out."
* **preceding negations:** negation phrases before an entity
* **following negations:** negation phrases after an entity
* **termination:** phrases that cut a sentence in parts, e.g., "however."

### Using negspaCy

As a spaCy component, we use negspaCy by adding it to an existing pipeline.

To add to the pipeline:
* Import the component using the `import` statement
* Load the trained pipeline
* Register the component on the trained pipeline with the `add_pipe()` method, including an optional configuration dictionary.

```python{6}
import scispacy
import spacy
from negspacy.negation import Negex

nlp = spacy.load("en_core_sci_sm")
nlp.add_pipe("negex")

```

In spaCy, customizations to `Doc`, `Token`, or `Span` objects, such as those done by negspaCy, become available through an `_` (underscore) attribute.

negspaCy will add a `negex` attribute to each entity in the `Doc` object. On negated entities, this attribute gets set to `True`.

```python{14}
import scispacy
import spacy
from negspacy.negation import Negex

nlp = spacy.load("en_core_sci_sm")
nlp.add_pipe("negex")

doc = nlp("Patient has history of elevated cholesterol, but does not have ASHD, hypertension and PVD.")

fmt_str = "{:<22}| {:<10}"
print(fmt_str.format("Entity", "Is negated"))

for entity in doc.ents:
    print(fmt_str.format(entity.text, entity._.negex))

```

```
Entity                | Is negated
Patient               | 0         
history               | 0         
elevated cholesterol  | 0         
ASHD                  | 1         
hypertension          | 1         
PVD                   | 1       
```

### Configuring negspaCy

To configure negspaCy, we provide an optional configuration dictionary when adding the component to a trained pipeline.

```python{6}
import scispacy
import spacy
from negspacy.negation import Negex

nlp = spacy.load("en_core_sci_sm")
nlp.add_pipe("negex", config={"chunk_prefix": ["no"]})

```

negspaCy has the following configuration options:

| option | type | default | description |
|-|-|-|-|
| `neg_termset` | dict | `"en_clinical"` | The negation termset to use (see below for how to configure). Includes: `"en"`, general English negation phrases; `"en_clinical"`, general English and clinical-specific negation phrases; `"en_clinical_sensitive"`, negation phrases for historical entities. |
| `ent_types` | list |  | A list of Named Entities to exclude from negation, e.g., `"PERSON"`, `"ORG"` |
| `chunk_prefix` | list |  | A list of preceding negations when negations are "chunked" together as a single entity (see below for more detail) |

#### Choosing different negation patterns

negspaCy defines the negation patterns and their associated phrases as a **termset**. A termset is viewable by importing the `termset` function, creating a new termset, and calling `termset.get_patterns()`.

```python{5}
from negspacy.termsets import termset

ts = termset("en_clinical")

print(ts.get_patterns())

```

To configure the termset negspaCy will use, we create a new termset with the `termset()` function passing in the name of the chosen termset. We then include the termset in the `config` dictionary when adding negex to the pipeline.

```python{9}
import scispacy
import spacy
from negspacy.negation import Negex
from negspacy.termsets import termset

ts = termset("en_clinical_sensitive")

nlp = spacy.load("en_core_sci_sm")
nlp.add_pipe("negex", config={"neg_termset": ts.get_patterns()})

```

#### Modifying negation patterns

To modify the termset negspaCy provides the `add_patterns()` and `remove_patterns()` functions. These functions accept a dictionary with keys corresponding to each negation pattern and a list of phrases to add or remove.

These modifications should occur before adding negspaCy to the trained pipeline. Once modified, include the new termset when adding the negspaCy to the pipeline.

```python
import scispacy
import spacy
from negspacy.negation import Negex
from negspacy.termsets import termset

ts = termset("en_clinical")
ts.add_patterns({"preceding_negations":["unable"], "following_negations": ["was negative"]})


nlp = spacy.load("en_core_sci_sm")
nlp.add_pipe("negex", config={"neg_termset": ts.get_patterns()})

doc = nlp("Patient unable to walk or stand upright. The most recent bone scan was negative.")

fmt_str = "{:<10}| {:<10}"
print(fmt_str.format("Entity", "Is negated"))

for entity in doc.ents:
    print(fmt_str.format(entity.text, entity._.negex))

```

```
Entity    | Is negated
Patient   | 0         
walk      | 1         
stand     | 1         
bone scan | 1         
negative  | 0         
```

#### Handling when negations and entities are combined

If you're using scispaCy, you may find that it combines negations and entities into a single entity, e.g., "no bleeding." This chunking causes negspaCy to miss the preceding negation.

To address this, we can include a `"chunk_prefix"` key in the `config` dictionary with a list of negations that could appear with an entity.

```python
import scispacy
import spacy
from negspacy.negation import Negex

nlp = spacy.load("en_core_sci_sm")
nlp.add_pipe("negex", config={"chunk_prefix":["no"]})

doc = nlp("No bleeding.")

fmt_str = "{:<12}| {:<10}"
print(fmt_str.format("Entity", "Is negated"))

for entity in doc.ents:
    print(fmt_str.format(entity.text, entity._.negex))

```

```
Entity      | Is negated
No bleeding | 1         
```

## Conclusion

Due to its specialized nature, replete with jargon and acronyms, Clinical Text has been difficult to utilize effectively. However, recent advancements in algorithms and better tools mean this is changing.

Hopefully, this guide has given you an understanding of how you can use Python to extract meaningful information from clinical text.

### Where to from here

Lastly, we covered a lot, but there's a lot more out there. Here is a list of additional resources for Clinical Natural Language Processing.

#### spaCy101

spaCy101 is the free online course provided by the spaCy team. It covers spaCy basics through to more advanced topics such as optimizing pipelines for speed and training custom models.

If you want to get started with Clinical NLP, I highly recommend starting with spaCy101.

#### spaCy Universe

The spaCy Universe is a curated list of projects developed with or for spaCy. The Scientific and Research categories feature additional projects for Clinical NLP.

#### med7

med7 is a Named Entity Recognition spaCy model for labeling drug information. Labels include DOSAGE, DRUG, DURATION, ROUTE, and more. As of writing, it is not compatible with spaCy 3.0

#### MTSAMPLES

mtsamples.com is a repository of nearly 5000 transcribed medical sample reports and examples. If you're unable to work with actual clinical text, MTSAMPLES is a good alternative.

#### ClarityNLP and size measurement

ClarityNLP is a python-based application for Clinical NLP from the Georgia Tech Research Institute. Of interest is Clarity's `size_measurement_finder` module, which aims to identify measurements in clinical text.

While not a spaCy pipeline component, importing the module into existing code and using it from there is possible.

#### sqlalchemy and storing results

sqlalchemy is Python's most popular Object-Relational-Mapper (ORM). ORMs let you define Python objects and map their data to a database. sqlalchemy is helpful for the downstream storage of structured information extracted from Clinical Text.

## Further reading
# Modular Markup Language Specification v0.1

## Status

Draft

## Version

0.1

## Abbreviation

MML

---

# 1. Introduction

Modular Markup Language (MML) is a semantic document language designed around a simple principle:

> Documents should describe meaning rather than formatting.

MML is intended to remain readable as plain text while providing enough structure for parsing, validation, compilation, and semantic analysis.

Unlike Markdown, MML does not rely on symbolic formatting conventions.

Unlike HTML, MML prioritizes semantic relationships and parent-child validation over presentation.

---

# 2. Design Goals

MML is designed to be:

* Human-readable
* Machine-parseable
* Semantically meaningful
* Validation-friendly
* Extensible
* Plain-text authorable

---

# 3. Core Principles

## 3.1 Meaning First

Elements should represent meaningful concepts rather than visual presentation.

Preferred:

```text
argument
claim
evidence
timeline
event
comparison
image
caption
```

Avoided:

```text
div
span
wrapper
container
```

---

## 3.2 Text Wins

If content is not valid markup, it is treated as text.

The parser should never aggressively reinterpret ordinary writing as structure.

---

## 3.3 Explicit Structure

All elements must be explicitly opened and closed.

---

## 3.4 Semantic Validation

MML validates semantic relationships, not merely syntax.

---

# 4. Syntax

## 4.1 Opening Tags

Opening tags consist of a valid element name.

Example:

```text
claim
```

Attributes may be included:

```text
section title="Background"
```

---

## 4.2 Closing Tags

Closing tags begin with a forward slash.

Example:

```text
/claim
```

```text
/argument
```

---

## 4.3 Element Names

All element names are singular.

Valid:

```text
claim
event
entity
image
```

Invalid:

```text
claims
events
entities
images
```

---

## 4.4 Attributes

Attributes may only appear on opening tag lines.

Example:

```text
section title="Introduction"
```

Attributes are parsed only when attached to a valid opening tag.

Example:

```text
section

title="Introduction"

/section
```

In this example:

```text
title="Introduction"
```

is plain text.

---

# 5. Text Handling

## 5.1 Automatic Text Nodes

Plain text is automatically wrapped in text elements.

Source:

```text
claim
Markdown introduces an unnecessary abstraction layer.
/claim
```

Internal Representation:

```html
<claim>
  <text>Markdown introduces an unnecessary abstraction layer.</text>
</claim>
```

Authors are not expected to manually create text elements in most situations.

---

## 5.2 Reserved Words

Reserved words only act as markup when they appear in tag position.

Example:

```text
claim
Arguments are not always unhealthy.
/claim
```

The word "Arguments" is text content.

---

# 6. Parsing Rules

## 6.1 Opening Tag Recognition

A line is interpreted as an opening tag when:

* It begins with a valid element name.
* Any supplied attributes are valid.

---

## 6.2 Closing Tag Recognition

A line is interpreted as a closing tag when:

```text
/element-name
```

matches a currently open element.

---

## 6.3 Closing Validation

Elements must close in stack order.

Valid:

```text
argument

claim
Text.
/claim

/argument
```

Invalid:

```text
argument

claim
Text.

/argument
```

Error:

```text
Cannot close argument while claim is still open.
Expected /claim.
```

---

# 7. Validation Rules

## 7.1 Parent Validation

Elements may define required parents.

Example:

```text
evidence
```

requires:

```text
claim
```

parent.

---

## 7.2 Missing Parent Errors

Example:

```text
evidence
Some evidence.
/evidence
```

Produces:

```text
Error:
evidence requires parent claim.
```

The parser should provide structured repair information whenever possible.

---

# 8. Element Definitions

## 8.1 Argument System

### argument

Purpose:

Represents a collection of claims.

Rules:

* Requires at least one claim.

Allowed Children:

```text
claim
```

---

### claim

Purpose:

Represents a semantic assertion.

Rules:

* May exist independently.
* May exist within argument.

Allowed Children:

```text
text
evidence
quote
source
note
```

---

### evidence

Purpose:

Supports a claim.

Rules:

* Requires parent claim.

Allowed Children:

```text
text
quote
source
note
```

---

# 9. Timeline System

### timeline

Purpose:

Represents a chronological range.

Required Children:

```text
year-start
year-end
```

Optional Children:

```text
event
```

A timeline containing only year-start and year-end is valid.

---

### year-start

Rules:

* Requires parent timeline.

---

### year-end

Rules:

* Requires parent timeline.

---

### event

Purpose:

Represents a time-bound occurrence.

Rules:

* Requires date.
* May exist independently.
* May exist within timeline.
* May exist within calendar.

Allowed Children:

```text
date
text
image
media
source
note
link
```

---

### date

Rules:

* Requires parent event.

---

# 10. Calendar System

### calendar

Purpose:

Represents a calendar period.

Required Children:

```text
year-month
```

Optional Children:

```text
event
```

A calendar containing only year-month is valid.

---

### year-month

Rules:

* Requires parent calendar.

---

# 11. Comparison System

MML supports multiple comparison schemas.

---

## 11.1 Before / After Schema

Required Children:

```text
before
after
```

Example:

```text
comparison

before
Old design.
/before

after
New design.
/after

/comparison
```

---

## 11.2 Entity Comparison Schema

Required:

```text
entity
entity
```

Optional:

```text
shared
```

---

### entity

Rules:

* Requires parent comparison.

Allowed Children:

```text
unique
text
```

---

### unique

Rules:

* Requires parent entity.

---

### shared

Rules:

* Requires parent comparison.

---

## 11.3 Scenario Comparison Schema

Required:

```text
scenario
scenario
```

Each scenario should contain:

```text
conditions
```

---

### scenario

Rules:

* Requires parent comparison.

Allowed Children:

```text
conditions
text
note
```

---

### conditions

Rules:

* Requires parent scenario.

---

# 12. Media System

### media

Purpose:

Groups related media assets.

Required Children:

At least one of:

```text
image
audio
video
```

Optional Children:

```text
caption
source
```

---

### image

Represents an image.

---

### audio

Represents audio content.

---

### video

Represents video content.

---

### caption

Purpose:

Describes associated media.

Preferred Parent:

```text
media
```

---

# 13. Structural Elements

### section

Purpose:

Represents a logical document section.

Attributes:

```text
title
```

Example:

```text
section title="Background"
```

The title attribute functions as the section heading.

---

### subhead

Purpose:

Represents a heading within a section.

---

# 14. Runtime Elements

```text
script
style
canvas
```

These elements provide runtime functionality and presentation support.

---

# 15. Reserved Elements v0.1

```text
document
section
subhead

text
quote
blockquote
note
source

link
a

argument
claim
evidence

timeline
calendar
event
date
year-start
year-end
year-month

comparison
before
after
entity
unique
shared
scenario
conditions

media
image
audio
video
caption

table
row
column
cell

form
field
input
select
option
button

nav
menu
header
footer

canvas
script
style
```

---

# 16. Future Considerations

Potential future areas include:

* Compiler targets
* Rich editor support
* Semantic repair actions
* Schema extensions
* Accessibility metadata
* Knowledge graph generation
* PDF and eBook compilation
* AI-native document representations

---

# 17. Guiding Principle

> A document should remain understandable as plain text while remaining unambiguously parseable as structured semantic data.

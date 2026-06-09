---
title: README
category: documentation
---
# Modular Markup (MML)

**A meaning-first markup language that remains readable as plain text.**

Modular Markup (MML) is an experimental semantic markup language designed around a simple idea:

> Documents should describe meaning, not formatting.

Unlike Markdown, which relies on symbolic shortcuts, or HTML, which mixes semantic and presentational concerns, MML focuses on explicit semantic structures that are understandable to both humans and machines.

The source document should remain readable as plain text while compiling into a fully structured document tree.

---
# Goals

* [ ] Human-readable source documents
* [ ] Explicit semantic structure
* [ ] Strong parent-child validation
* [ ] Meaning-first document modeling
* [ ] Plain text as the authoring format
* [ ] Automatic structure generation
* [ ] Compiler-friendly AST representation
* [ ] Extensible semantic schemas

---
## MML

```text
argument

claim
Markdown introduces an unnecessary abstraction layer.

evidence
The final rendered output is already HTML.
/evidence

/claim

/argument
```

## Compiled Output

```html
<argument>
  <claim>
    <text>Markdown introduces an unnecessary abstraction layer.</text>

    <evidence>
      <text>The final rendered output is already HTML.</text>
    </evidence>

  </claim>
</argument>
```

---

# Core Philosophy

MML is built around semantic objects rather than formatting instructions.

**For example:**

```text
argument
claim
evidence
timeline
event
comparison
entity
image
caption
```

represent meaningful concepts.

**By contrast, generic containers such as:**

```html
<div>
<span>
```

have no direct equivalent in MML.

Every element should represent something recognizable and meaningful.

---

# Syntax

## Opening Tags

Opening tags are written as plain keywords.

```text
claim
```

```text
section title="Background"
```

---

## Closing Tags

Closing tags use a slash prefix.

```text
/claim
```

```text
/section
```

---

## Text Content

Anything that is not recognized as valid markup is treated as text.

```text
claim

Arguments are not always unhealthy.

/claim
```

The word "Arguments" is content, not a tag.

---

# Validation

MML validates semantic structure, not just syntax.

**Example:**

```text
evidence
The final output is already HTML.
/evidence
```

**Produces:**

```text
Error:
evidence requires parent claim.
```

**Valid:**

```text
argument

claim

evidence
The final output is already HTML.
/evidence

/claim

/argument
```

---

# Automatic Text Nodes

Plain text is automatically wrapped in text nodes.

**Source:**

```text
claim
Markdown is unnecessary.
/claim
```

**Internal representation:**

```html
<claim>
  <text>Markdown is unnecessary.</text>
</claim>
```

Authors rarely need to write explicit text tags.

---

# Semantic Schemas

## Argument

```text
argument
└── claim
    └── evidence
```

**Rules:**

* [ ] argument requires at least one claim
* [ ] claim may exist standalone
* [ ] evidence requires parent claim

---

## Timeline

```text
timeline
├── year-start
├── event
└── year-end
```

**Rules:**

* [ ] timeline requires year-start
* [ ] timeline requires year-end
* [ ] event requires date

---

## Calendar

```text
calendar
├── year-month
└── event
```

**Rules:**

* [ ] calendar requires year-month
* [ ] event requires date

---

## Comparison

### Before / After

```text
comparison
├── before
└── after
```

### Entity Comparison

```text
comparison
├── entity
│   └── unique
├── entity
│   └── unique
└── shared
```

### Scenario Comparison

```text
comparison
├── scenario
│   └── conditions
└── scenario
    └── conditions
```

---

## Media

```text
media
├── image
├── video
├── audio
├── caption
└── source
```

**Rules:**

* [ ] media requires at least one image, audio, or video
* [ ] caption typically belongs to media

---

# Design Principles

## Text Wins

If something is not valid markup, it is text.

The parser should never aggressively reinterpret ordinary writing as structure.

---

## Singular Elements

Element names are singular.

**Valid:**

```text
claim
event
entity
image
```

**Invalid:**

```text
claims
events
entities
images
```

---

## Explicit Closure

Every opened element must be explicitly closed.

**Valid:**

```text
claim
Text.
/claim
```

**Invalid:**

```text
claim
Text.
```

---

## Semantic Necessity

A tag should only exist if it represents a meaningful concept that cannot already be expressed using existing tags.

---

# Project Status

Early specification and parser prototype.

The language is actively evolving and many schemas, validation rules, and compilation targets remain under discussion.

---
## CONTRIBUTE

Have an issue? **[GET IN TOUCH](https://github.com/monapdx/Modular-Markup-Language/issues/new/choose?utm_source=chatgpt.com)**.

Have an idea for a tag we should add? **[SUBMIT A TAG](https://github.com/monapdx/Modular-Markup-Language/issues/new?template=propose-tag.yml)** here.

Do you have a more advanced tag idea? **[SUBMIT A SCHEMA](https://github.com/monapdx/Modular-Markup-Language/issues/new?template=submit-schema.yml&utm_source=chatgpt.com)** instead!

## SUPPORT

Check out the **[README](DOCS/README)** if you're not sure where to start.

You can read the full **[SPEC](DOCS/SPEC)** here. 

Try the **[PARSER](FILES/index.html)**.

## TAGS

Here is the list of **[TAGS](DOCS/TAGS)**. 

Looking for the **[SHORTHAND](DOCS/SHORTHAND.md)** version?

Check out a list of **[PROPOSED TAGS](DOCS/PROPOSED)**.

Curious about how the tags can be used together? Find out here ---> **[DEPENDENCIES](DOCS/DEPENDENCIES.md)**.

Did you know that you can use the tag **[CHAPTER](#)** instead of **[SECTION](#)**, if you want? **[SYNONYMS](DOCS/SYNONYMS.md)** make it fine to replace one with the other!



#readme #markup #grammar #syntax #semantic #data-structure #schemas #official #tags 
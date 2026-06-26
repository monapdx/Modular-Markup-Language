---
title: README
category: documentation
---
# Modular Markup (MML)

**A meaning-first markup language that remains readable as plain text.**

Modular Markup (MML) is a semantic markup language designed around a simple idea:

> Documents should describe meaning, not formatting.

Unlike Markdown, which relies on symbolic shortcuts, or HTML, which mixes semantic and presentational concerns, MML focuses on explicit semantic structures that are understandable to both humans and machines.

Source documents stay readable as plain text while compiling into a structured document tree.

---

# Documentation in this folder

| File | Purpose |
| ---- | ------- |
| **[SPEC.md](SPEC.md)** | Full language specification (v0.1): syntax, principles, validation rules, and schema definitions. |
| **[TAGS.md](TAGS.md)** | Official tag registry with examples. Currently lists **48 official tags** (argument, calendar, claim, comparison, document, form, media, timeline, and others). |
| **[SHORTHAND.md](SHORTHAND.md)** | Shorthand alias rules and the official shorthand table (`arg`, `comp`, `grp`, `img`, `evi`, etc.). |
| **[DEPENDENCIES.md](DEPENDENCIES.md)** | Parent/child relationships, required children, and nesting rules — including **group** (shared trait values) and **comparison** schemas. |
| **[SYNONYMS.md](SYNONYMS.md)** | Conceptual synonym mappings (e.g. section ↔ chapter, claim ↔ statement). |
| **[PROPOSED.md](PROPOSED.md)** | Tags and schemas under consideration (node, cluster, identity, profile, education, and others). |
| **[TAG PROPOSAL EVALUATION.md](TAG%20PROPOSAL%20EVALUATION.md)** | Checklist for reviewing individual tag proposals. |
| **[SCHEMA PROPOSAL EVALUATION.md](SCHEMA%20PROPOSAL%20EVALUATION.md)** | Checklist for reviewing multi-tag schema proposals. |
| **[LINKS.md](LINKS.md)** | Quick links to the repo, issue templates, parser demo, and other docs. |
| **[SCRATCHPAD.md](SCRATCHPAD.md)** | Empty notes scratchpad (`category: notes`). A browser-based editor lives in `export-blank/DOCS/SCRATCHPAD.html`. |

---

# Goals

* Human-readable source documents
* Explicit semantic structure
* Strong parent-child validation
* Meaning-first document modeling
* Plain text as the authoring format
* Automatic structure generation (TOC, text nodes, implicit close)
* Compiler-friendly AST representation
* Extensible semantic schemas

---

# Quick example

**Source** (opening-tag-only authoring — closing tags are optional):

```text
argument
claim
Markdown introduces an unnecessary abstraction layer.
evidence
The final rendered output is already HTML.
```

**Compiled output:**

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

Try this in the **[parser demo](../index.html)** at the repo root.

---

# Syntax (current parser)

## Opening tags

One tag per line. Attributes use double-quoted values:

```text
section title="Background"
ebook output="html" mode="interactive"
```

## Closing tags

Closing tags (`/claim`) are **optional and never required**. The parser infers structure from the next tag or content line and the compiler emits closers in output.

## Inline quoted values

Some elements accept a value on the same line:

```text
title "Proof I Was Here"
heading level="1" "Chapter One"
image "cover.jpg"
```

## Text content

Anything that is not valid markup is treated as text. Blank lines inside content are ignored. Consecutive untagged lines merge into one text node.

See **[SPEC.md](SPEC.md)** for the full grammar.

---

# Validation

MML validates semantic structure, not just syntax.

**Invalid:**

```text
evidence
The final output is already HTML.
```

**Error:** `evidence requires parent claim or argument`

**Valid:**

```text
argument
claim
evidence
The final output is already HTML.
```

Parent/child requirements, required children, and schema rules are summarized in **[DEPENDENCIES.md](DEPENDENCIES.md)**.

---

# Semantic schemas

Schemas implemented in the parser and validator include:

## Argument

```text
argument
└── claim
    └── evidence
```

* `argument` requires at least one `claim`
* `claim` may exist standalone
* `evidence` requires parent `claim` or `argument`

## Timeline

```text
timeline
├── start-year
├── event
│   └── date
└── end-year
```

* `timeline` requires `start-year` and `end-year`
* Event dates must fall within the timeline year range
* Legacy aliases: `year-start`, `year-end`, spaced forms like `end year`

## Calendar

```text
calendar
├── year
├── month
└── event
    └── date
```

* Requires `year` and/or `month`
* Compiles to an HTML month table with highlighted event days
* Event day numbers are validated against the calendar month

## Comparison

Named schemas (see **[DEPENDENCIES.md](DEPENDENCIES.md)**):

* **Before / after** — `before` + `after`
* **Entity** — two or more `entity` children, each with `unique`, optionally `shared`
* **Scenario** — two or more `scenario` children, each with `condition`

## Group

```text
group
├── entity
│   └── trait
└── entity
    └── trait
```

* Requires at least two `entity` children
* At least two entities must share a common **trait value** (text inside `trait`)
* Differs from `comparison`, which uses named schemas instead of shared traits

## Media

```text
media
├── image | audio | video
└── caption
```

* `media` requires at least one of `image`, `audio`, or `video`
* `caption` belongs under `media` or `cover`

## Ebook

Format-independent book schema (implemented in `src/ebook-schema.js`):

```text
ebook
├── metadata (title, author, language, …)
├── cover (image, caption)
├── toc
├── content (heading, section, paragraph, …)
├── style
└── javascript
```

* `content` is required
* `toc` is a declaration tag — the compiler auto-generates a table of contents from `heading` tags inside `content`
* `style` and `javascript` are optional HTML/web exporter tags; plain-text export ignores them

---

# Design principles

## Text wins

If something is not valid markup, it is text. The parser does not reinterpret ordinary writing as structure.

## Singular elements

Element names are singular (`claim`, `event`, `entity` — not `claims`, `events`, `entities`).

## Semantic necessity

A tag should represent a meaningful concept that cannot already be expressed with existing tags.

## Shorthand and synonyms

Use **[SHORTHAND.md](SHORTHAND.md)** for accepted abbreviations and **[SYNONYMS.md](SYNONYMS.md)** for conceptual alternates. Only shorthand entries registered in the parser are recognized as tags.

---

# Project status

Working **parser**, **validator**, and **compiler** live in `src/`:

* `grammar.js` — tag registry, aliases, attribute parsing, inline-value matching
* `parser.js` — opening-tag-only parsing with implicit close
* `validator.js` — semantic validation for all registered schemas
* `compiler.js` — HTML compilation (calendar tables, ebook export, heading IDs, TOC)
* `ebook.js` / `ebook-schema.js` — ebook TOC generation and schema constants

Run tests from the repo root:

```bash
npm test
```

The language and documentation are still evolving. Official tags are listed in **[TAGS.md](TAGS.md)**; newer parser features (such as ebook tags) may land in code before the tag list is updated.

---

# Contribute

Have an issue? **[Get in touch](https://github.com/monapdx/Modular-Markup-Language/issues/new/choose)**.

Have an idea for a tag? **[Submit a tag](https://github.com/monapdx/Modular-Markup-Language/issues/new?template=propose-tag.yml)** — review against **[TAG PROPOSAL EVALUATION.md](TAG%20PROPOSAL%20EVALUATION.md)**.

Have a multi-tag schema idea? **[Submit a schema](https://github.com/monapdx/Modular-Markup-Language/issues/new?template=submit-schema.yml)** — review against **[SCHEMA PROPOSAL EVALUATION.md](SCHEMA%20PROPOSAL%20EVALUATION.md)**.

---

# Where to go next

* **[SPEC.md](SPEC.md)** — full specification
* **[TAGS.md](TAGS.md)** — official tag list
* **[SHORTHAND.md](SHORTHAND.md)** — shorthand aliases
* **[DEPENDENCIES.md](DEPENDENCIES.md)** — nesting and requirement rules
* **[PROPOSED.md](PROPOSED.md)** — proposed tags and schemas
* **[SYNONYMS.md](SYNONYMS.md)** — synonym mappings
* **[LINKS.md](LINKS.md)** — links and navigation
* **[Parser demo](../index.html)** — live parse, validate, and compile

#readme #markup #grammar #syntax #semantic #data-structure #schemas #official #tags #documentation

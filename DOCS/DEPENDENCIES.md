---
title: DEPENDENCIES
category: documentation
---

## PARENT TAGS


| TAG        | SELF-CONTAINED | CONTAINER |
| ---------- | -------------- | --------- |
| document   | no             | yes       |
| style      | yes            | no        |
| script     | yes            | no        |
| media      | no             | yes       |
| argument   | yes            | yes       |
| claim      | yes            | yes       |
| canvas     | yes            | no        |
| calendar   | no             | yes       |
| timeline   | no             | yes       |
| event      | no             | no        |
| comparison | no             | yes       |
| entity     | yes            | yes       |
| list       | no             | yes       |
| section    | no             | yes       |
| form       | no             | yes       |
| fieldset   | no             | yes       |
| dropdown   | no             | yes       |
| table      | no             | yes       |
| text       | yes            | yes       |

## CHILD TAGS


| TAG        | CHILD OF   |
| ---------- | ---------- |
| option     | dropdown   |
| select     | dropdown   |
| input      | form       |
| item       | list       |
| year-start | timeline   |
| year-end   | timeline   |
| month      | calendar   |
| year       | calendar   |
| date       | event      |
| image      | media      |
| audio      | media      |
| video      | media      |
| fieldset   | form       |
| legend     | fieldset   |
| evidence   | claim      |
| shared     | entity     |
| unique     | entity     |
| before     | comparison |
| after      | comparison |
| row        | table      |
| column     | table      |
| cell       | table      |
| scenario   | comparison |
| condition  | comparison |
| entity     | comparison |
| footnote   | text       |
| link       | text       |
| button     | form       |
| textarea   | form       |
| quote      | text       |
|            |            |

---
## REQUIRES

- claim <--- **REQUIRES** <--- evidence
- calendar ---> **REQUIRES** ---> month **AND** year
- event ---> **REQUIRES** ---> date
- unique ---> **REQUIRES** ---> entity
- shared ---> **REQUIRES** ---> entity
- timeline ---> **REQUIRES** ---> start-year **AND** end-year
- condition ---> **REQUIRES** ---> scenario
- option ---> **REQUIRES** ---> dropdown
- select ---> **REQUIRES** ---> dropdown
- list ---> **REQUIRES** ---> item

---
## GROUP

- group ---> **REQUIRES** ---> at least two **entity** children **SHARING A COMMON TRAIT VALUE**
- entity ---> **AS A CHILD OF** ---> group ---> contains one or more **trait** children
- trait ---> **REQUIRES** ---> entity parent; trait text is the trait value (e.g. human, male)
- comparison ---> **DOES NOT** use the group shared-trait rule; it uses named schemas instead (before/after, entity/unique, scenario/condition)

---
## AS A CHILD OF ---> IS ONLY VALID ---> WHEN MULTIPLES EXIST

- entity ---> **AS A CHILD OF** ---> comparison ---> **IS ONLY VALID** ---> **WHEN TWO OR MORE EXIST AS CHILDREN**
- scenario ---> **AS A CHILD OF** ---> comparison ---> **IS ONLY VALID** ---> **WHEN TWO OR MORE EXIST AS CHILDREN**

---
## PAIRS & SETS ---> CANNOT EXIST OUTSIDE OF

- after **AND** before ---> **CANNOT EXIST OUTSIDE OF** ---> comparison
- start-year **AND** end-year ---> **CANNOT EXIST OUTSIDE OF** timeline
- image, audio, **AND** video **CANNOT EXIST OUTSIDE OF** media

---
## CANNOT EXIST OUTSIDE OF

- row ---> **CANNOT EXIST OUTSIDE OF** ---> table
- column ---> **CANNOT EXIST OUTSIDE OF** ---> table
- cell ---> **CANNOT EXIST OUTSIDE OF** ---> row **OR** column
- input ---> **CANNOT EXIST OUTSIDE OF** ---> form
- legend ---> **CANNOT EXIST OUTSIDE OF** ---> fieldset
- dropdown ---> **CANNOT EXIST OUTSIDE OF** ---> form
- section ---> **CANNOT EXIST OUTSIDE OF** ---> document

---
## TAGS

Here is the list of **[TAGS](/DOCS/TAGS)**. 

Looking for the **[SHORTHAND](/DOCS/SHORTHAND.md)** version?

Check out a list of **[PROPOSED TAGS](/DOCS/PROPOSED.md)**.

Curious about how the tags can be used together? Find out here ---> **[DEPENDENCIES](/DOCS/DEPENDENCIES.md)**.

Did you know that you can use the tag **[CHAPTER](#)** instead of **[SECTION](#)**, if you want? **[SYNONYMS](/DOCS/SYNONYMS.md)** make it fine to replace one with the other!


#TAgs #parent #child #GRAMMAr #SEMANTIc #MARKUp #DATA-STRUCTURe #LISTs #rules #dependencies 
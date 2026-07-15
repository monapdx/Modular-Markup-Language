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
| group      | no             | yes       |
| glossary   | no             | yes       |

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
| trait      | entity     |
| word       | glossary   |
| definition | word       |
| synonym    | word       |
| antonym    | word       |
| origin     | word       |
| usage      | word       |
| metadata   | ebook      |
| cover      | ebook      |
| toc        | ebook      |
| content    | ebook      |
|            |            |

## CONTEXTUAL VALIDATION

- event ---> **AS A CHILD OF** ---> timeline ---> **MUST HAVE** date **BETWEEN** start-year AND end-year
- 

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
- group ---> **REQUIRES** ---> **TWO OR MORE ENTITIES**
- glossary ---> REQUIRES ---> word
- word ---> REQUIRES ---> definition
- synonym  ---> REQUIRES ---> word
- antonym ---> REQUIRES ---> word
- origin ---> REQUIRES ---> word
- usage ---> REQUIRES  ---> word
---
## AS A CHILD OF ---> IS ONLY VALID ---> WHEN MULTIPLES EXIST

- entity ---> **AS A CHILD OF** ---> comparison ---> **IS ONLY VALID** ---> **WHEN TWO OR MORE EXIST AS CHILDREN**
- scenario ---> **AS A CHILD OF** ---> comparison ---> **IS ONLY VALID** ---> **WHEN TWO OR MORE EXIST AS CHILDREN**
- entity ---> **AS A CHILD OF** ---> group ---> **IS ONLY VALID** ---> **WHEN AT LEAST TWO EXIST**
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
- trait ---> **CANNOT EXIST OUTSIDE OF** ---> entity
- synonym ---> CANNOT EXIST OUTSIDE OF ---> word
- antonym ---> CANNOT EXIST OUTSIDE OF ---> word
- word ---> CANNOT EXIST OUTSIDE OF ---> glossary
- definition ---> CANNOT EXIST OUTSIDE OF ---> word
- origin ---> CANNOT EXIST OUTSIDE OF ---> word
- usage ---> CANNOT EXIST OUTSIDE OF ---> word
---
## TAGS

Here is the list of **[TAGS](TAGS.md)**. 

Looking for the **[SHORTHAND](/DOCS/SHORTHAND.md)** version?

Check out a list of **[PROPOSED TAGS](PROPOSED.md)**.

Curious about how the tags can be used together? Find out here ---> **[DEPENDENCIES](/DOCS/DEPENDENCIES.md)**.

Did you know that you can use the tag **[CHAPTER](#)** instead of **[SECTION](#)**, if you want? **[SYNONYMS](/DOCS/SYNONYMS.md)** make it fine to replace one with the other!


#tags #parent #child #grammar #semantic #markup #data-structure #lists #rules #dependencies 
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
| ebook      | no             | yes       |
| survey     | no             | yes       |
| question   | no             | yes       |
| metadata   | no             | yes       |
| cover      | no             | yes       |
| content    | no             | yes       |

## CHILD TAGS


| TAG        | CHILD OF   |
| ---------- | ---------- |
| option     | dropdown or choice question |
| select     | dropdown   |
| input      | form       |
| item       | list       |
| year-start | timeline or series |
| year-end   | timeline or series |
| month      | calendar   |
| year       | calendar   |
| date       | event, metadata, or episode |
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
| question   | survey     |
| prompt     | question   |
| option     | question (choice types) |
| metadata   | ebook      |
| cover      | ebook      |
| toc        | ebook      |
| content    | ebook      |
| style      | ebook      |
| javascript | ebook      |
| script     | ebook      |
| title      | metadata or any creative-work record |
| subtitle   | metadata   |
| author     | metadata or book |
| language   | metadata   |
| description| metadata or any creative-work record |
| date       | metadata, event, or episode |
| publisher  | metadata, book, or game |
| rights     | metadata   |
| image      | cover, content, media, or section |
| caption    | cover or media |
| heading    | content or section |
| paragraph  | content or section |
|            |            |

## CREATIVE-WORK RECORDS

`film`, `song`, `album`, `book`, `series`, `episode`, `game`, and `podcast` require exactly one nonempty `title`. They have no required parent. Each record accepts optional `description`, `release-year`, and repeated `genre`, plus the following fields:

| Record | Additional children |
| --- | --- |
| film | director |
| song | artist, album (text field) |
| album | artist |
| book | author, publisher |
| series | creator, start-year, end-year |
| episode | season-number, episode-number, date |
| game | creator, publisher |
| podcast | creator |

Fields contain nonempty text only. Credits and genres may repeat; other fields may occur once. Years use four digits, series end-year cannot precede start-year, season-number is nonnegative, and episode-number is positive. Consecutive work records become siblings; close `/song` explicitly before a standalone album record. See [SPEC](SPEC.md#19-creative-work-records).

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
- word ---> REQUIRES ---> definition **when inside glossary**
- ebook ---> REQUIRES ---> content
- survey ---> REQUIRES ---> one or more questions
- question ---> REQUIRES ---> prompt; choice questions require two or more options
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
- start-year **AND** end-year ---> **CANNOT EXIST OUTSIDE OF** timeline or series
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
---
title: DEPENDENCIES
category: documentation
---

---
## REQUIRES

claim <--- **REQUIRES** <--- evidence
calendar ---> **REQUIRES** ---> month **AND** year
event ---> **REQUIRES** ---> date
unique ---> **REQUIRES** ---> entity
shared ---> **REQUIRES** ---> entity
timeline ---> **REQUIRES** ---> start-year **AND** end-year
condition ---> **REQUIRES** ---> scenario
option ---> **REQUIRES** ---> dropdown
select ---> **REQUIRES** ---> dropdown
list ---> **REQUIRES** ---> item

---
## AS A CHILD OF ... ONLY VALID IF ... MULTIPLES EXIST

entity ---> **AS A CHILD OF** ---> comparison ---> **IS ONLY VALID** ---> **WHEN TWO OR MORE EXIST AS CHILDREN**
scenario ---> **AS A CHILD OF** ---> comparison ---> **IS ONLY VALID** ---> **WHEN TWO OR MORE EXIST AS CHILDREN**

---
## PAIRS & SETS THATCANNOT EXIST OUTSIDE OF

after **AND** before ---> **CANNOT EXIST OUTSIDE OF** ---> comparison
start-year **AND** end-year ---> **CANNOT EXIST OUTSIDE OF** timeline
image, audio, **AND** video **CANNOT EXIST OUTSIDE OF** media

---
## CANNOT EXIST OUTSIDE OF

row ---> **CANNOT EXIST OUTSIDE OF** ---> table
column ---> **CANNOT EXIST OUTSIDE OF** ---> table
cell ---> **CANNOT EXIST OUTSIDE OF** ---> row **OR** column
input ---> **CANNOT EXIST OUTSIDE OF** ---> form
legend ---> **CANNOT EXIST OUTSIDE OF** ---> fieldset
dropdown ---> **CANNOT EXIST OUTSIDE OF** ---> form
section ---> **CANNOT EXIST OUTSIDE OF** ---> document

---
## TAGS

Here is the list of **[TAGS](DOCS/TAGS)**. 

Looking for the **[SHORTHAND](DOCS/SHORTHAND.md)** version?

Check out a list of **[PROPOSED TAGS](DOCS/PROPOSED)**.

Curious about how the tags can be used together? Find out here ---> **[DEPENDENCIES](DOCS/DEPENDENCIES.md)**.

Did you know that you can use the tag **[CHAPTER](#)** instead of **[SECTION](#)**, if you want? **[SYNONYMS](DOCS/SYNONYMS.md)** make it fine to replace one with the other!


#TAgs #parent #child #GRAMMAr #SEMANTIc #MARKUp #DATA-STRUCTURe #LISTs #rules #dependencies 
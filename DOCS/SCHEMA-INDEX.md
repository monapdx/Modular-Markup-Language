# Generated grammar index

Generated from grammar.js. Parent rules describe parser boundaries; consult SPEC.md and validator.js for complete validation and attributes.

## Schema implementations

- [crossword-schema.js](../export/src/crossword-schema.js) — exports: CROSSWORD_ROOT_CHILDREN, CROSSWORD_DIRECTION_CHILDREN, splitCrosswordList, readCrossword, crosswordEntries, validateCrossword
- [ebook-schema.js](../export/src/ebook-schema.js) — exports: EBOOK_ROOT_CHILDREN, EBOOK_REQUIRED_CHILDREN, METADATA_FIELDS, COVER_CHILDREN, CONTENT_CHILDREN, EBOOK_OUTPUT_FORMATS, EBOOK_MODES, EBOOK_ALLOWED_PARENTS, getEbookAllowedParents
- [survey-schema.js](../export/src/survey-schema.js) — exports: SURVEY_QUESTION_TYPES, surveyQuestions, validateSurvey
- [work-schema.js](../export/src/work-schema.js) — exports: WORK_FIELDS, WORK_TYPES, WORK_FIELD_PARENTS, validateWork

## Tags

| Tag | Required parent candidates | Aliases |
| --- | --- | --- |
| across | crossword-grid | — |
| across-clues | crossword-grid | — |
| after | No parent requirement | — |
| album | No parent requirement | — |
| antonym | word | ant |
| argument | No parent requirement | arg |
| artist | song, album | — |
| audio | No parent requirement | mp3, wav |
| author | metadata, book | — |
| before | No parent requirement | — |
| blockquote | No parent requirement | quote |
| book | No parent requirement | — |
| button | No parent requirement | — |
| calendar | No parent requirement | cal |
| canvas | No parent requirement | — |
| cell | No parent requirement | — |
| claim | No parent requirement | — |
| column | No parent requirement | col |
| comparison | No parent requirement | comp |
| condition | scenario | cond, conditions |
| content | ebook | — |
| cover | ebook | — |
| creator | series, game, podcast | — |
| crossword-grid | No parent requirement | — |
| date | event, metadata, episode | — |
| definition | word | def |
| description | metadata, film, song, album, book, series, episode, game, podcast | — |
| director | film | — |
| document | No parent requirement | doc |
| down | crossword-grid | — |
| down-clues | crossword-grid | — |
| dropdown | No parent requirement | drop |
| ebook | No parent requirement | — |
| end-year | timeline, series | year-end |
| entity | group, comparison | — |
| episode | No parent requirement | — |
| episode-number | episode | — |
| event | No parent requirement | — |
| evidence | claim, argument | evi |
| fieldset | No parent requirement | set |
| film | No parent requirement | — |
| first-letters | across, down | — |
| footnote | No parent requirement | foot, fnote |
| form | No parent requirement | — |
| game | No parent requirement | — |
| genre | film, song, album, book, series, episode, game, podcast | — |
| glossary | No parent requirement | glo |
| group | No parent requirement | grp |
| heading | content, section | h |
| image | cover, content, media, section | img, jpg, png, svg, gif |
| input | No parent requirement | — |
| item | No parent requirement | — |
| javascript | ebook | js |
| language | metadata | — |
| legend | No parent requirement | — |
| link | No parent requirement | — |
| list | No parent requirement | — |
| media | No parent requirement | — |
| metadata | ebook | — |
| month | calendar | year-month |
| option | question, dropdown | — |
| origin | word | ori |
| paragraph | content, section | p |
| podcast | No parent requirement | — |
| prompt | question | — |
| publisher | metadata, book, game | — |
| question | survey | — |
| release-year | film, song, album, book, series, episode, game, podcast | — |
| rights | metadata | — |
| row | No parent requirement | — |
| scenario | No parent requirement | scene |
| script | ebook | — |
| season-number | episode | — |
| section | No parent requirement | sect |
| selection | No parent requirement | — |
| series | No parent requirement | — |
| song | No parent requirement | — |
| start-year | timeline, series | year-start |
| style | ebook | — |
| subtitle | metadata | — |
| survey | No parent requirement | — |
| synonym | word | syn |
| table | No parent requirement | — |
| text | No parent requirement | — |
| textarea | No parent requirement | para |
| timeline | No parent requirement | — |
| title | metadata, film, song, album, book, series, episode, game, podcast | — |
| toc | ebook | — |
| trait | entity | — |
| unique | entity | — |
| usage | word | usag |
| video | No parent requirement | mp4 |
| word | glossary, across, down | — |
| word-lengths | across, down | — |
| year | calendar | — |

See [SPEC.md](SPEC.md) for authored schema examples and attributes.

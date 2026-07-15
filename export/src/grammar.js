/**
 * Modular Markup Language — Grammar (v0.1)
 *
 * Opening tag line:
 *   - A reserved element name alone on the line, e.g. `claim`
 *   - Or name + attributes, e.g. `section title="Background"`
 *
 * Authoring uses opening tags only — one tag per line. Structure is inferred
 * when the next tag or content appears; closing tags are optional, never required,
 * and are always generated at compile time in the output.
 *
 * A line is markup ONLY if the entire trimmed line matches opening tag grammar.
 * Otherwise it is plain text — even if it contains reserved words.
 *
 * Attributes (opening tags only):
 *   - Zero or more key="value" pairs separated by whitespace
 *   - Keys: [a-z][a-z0-9-]*
 *   - Values: double-quoted strings only
 *   - Malformed attribute syntax → whole line is treated as text ("text wins")
 *
 * Blank lines inside content are IGNORED (not emitted as text nodes).
 *
 * Canonical element names follow DOCS/TAGS.md. Shorthand aliases follow
 * DOCS/SHORTHAND.md. Legacy SPEC names are accepted and normalized.
 */

/** @readonly — canonical names from DOCS/TAGS.md */
export const CANONICAL_ELEMENTS = new Set([
  "argument",
  "calendar",
  "month",
  "year",
  "canvas",
  "claim",
  "evidence",
  "comparison",
  "group",
  "after",
  "before",
  "condition",
  "document",
  "blockquote",
  "footnote",
  "link",
  "list",
  "item",
  "section",
  "text",
  "entity",
  "trait",
  "unique",
  "event",
  "date",
  "form",
  "button",
  "dropdown",
  "option",
  "selection",
  "fieldset",
  "legend",
  "input",
  "textarea",
  "media",
  "audio",
  "image",
  "video",
  "scenario",
  "script",
  "style",
  "table",
  "cell",
  "column",
  "row",
  "timeline",
  "end-year",
  "start-year",
  "glossary",
  "word",
  "definition",
  "synonym",
  "antonym",
  "origin",
  "usage",
  "ebook",
  "metadata",
  "cover",
  "toc",
  "content",
  "heading",
  "paragraph",
  "title",
  "subtitle",
  "author",
  "language",
  "description",
  "publisher",
  "rights",
  "javascript",
]);

/**
 * Shorthand (SHORTHAND.md) and legacy (SPEC) aliases → canonical TAGS name.
 * @readonly
 */
export const ELEMENT_ALIASES = {
  // SHORTHAND.md
  arg: "argument",
  cal: "calendar",
  comp: "comparison",
  grp: "group",
  cond: "condition",
  doc: "document",
  quote: "blockquote",
  foot: "footnote",
  fnote: "footnote",
  sect: "section",
  drop: "dropdown",
  set: "fieldset",
  para: "textarea",
  mp3: "audio",
  wav: "audio",
  mp4: "video",
  img: "image",
  jpg: "image",
  png: "image",
  svg: "image",
  gif: "image",
  col: "column",
  scene: "scenario",
  evi: "evidence",
  glo: "glossary",
  def: "definition",
  syn: "synonym",
  ant: "antonym",
  ori: "origin",
  usag: "usage",
  // Legacy SPEC / prototype names
  "year-start": "start-year",
  "year-end": "end-year",
  "year-month": "month",
  conditions: "condition",
  js: "javascript",
  p: "paragraph",
  h: "heading",
};

/**
 * Multi-word lines that map to a single element (e.g. "end year" → end-year).
 * @readonly
 */
export const SPACED_ELEMENT_ALIASES = {
  "end year": "end-year",
  "start year": "start-year",
  "year end": "end-year",
  "year start": "start-year",
};

/**
 * Reserved names accepted in source but not renamed (SPEC/compiler support).
 * @readonly
 */
export const LEGACY_ELEMENTS = new Set([
  "subhead",
  "caption",
  "shared",
  "source",
  "note",
  "a",
  "select",
  "nav",
  "menu",
  "header",
  "footer",
]);

/** @readonly — every name that may appear as an opening or closing tag */
export const RESERVED_ELEMENTS = new Set([
  ...CANONICAL_ELEMENTS,
  ...Object.keys(ELEMENT_ALIASES),
  ...LEGACY_ELEMENTS,
]);

/**
 * Known parent requirements used when inferring implicit close boundaries.
 * @readonly
 * @type {Readonly<Record<string, readonly string[]>>}
 */
export const REQUIRED_PARENTS = {
  evidence: ["claim", "argument"],
  "start-year": ["timeline"],
  "end-year": ["timeline"],
  month: ["calendar"],
  year: ["calendar"],
  date: ["event", "metadata"],
  trait: ["entity"],
  unique: ["entity"],
  entity: ["group", "comparison"],
  shared: ["comparison"],
  condition: ["scenario"],
  caption: ["media", "cover"],
  image: ["cover", "content", "media", "section"],
  word: ["glossary"],
  definition: ["word"],
  synonym: ["word"],
  antonym: ["word"],
  origin: ["word"],
  usage: ["word"],
  metadata: ["ebook"],
  cover: ["ebook"],
  toc: ["ebook"],
  content: ["ebook"],
  style: ["ebook"],
  javascript: ["ebook"],
  script: ["ebook"],
  title: ["metadata"],
  subtitle: ["metadata"],
  author: ["metadata"],
  language: ["metadata"],
  description: ["metadata"],
  publisher: ["metadata"],
  rights: ["metadata"],
  heading: ["content", "section"],
  paragraph: ["content", "section"],
};

const ELEMENT_NAME_PATTERN = /^[a-z][a-z0-9-]*$/;
const ATTR_PAIR_PATTERN = /^[a-z][a-z0-9-]*="[^"]*"$/;

/**
 * Resolve shorthand or legacy alias to canonical element name when defined.
 * @param {string} name
 * @returns {string}
 */
export function normalizeElementName(name) {
  return ELEMENT_ALIASES[name] ?? name;
}

/**
 * @param {string} name
 * @returns {boolean}
 */
export function isReservedElement(name) {
  return RESERVED_ELEMENTS.has(name);
}

/**
 * @param {string} name Canonical element name
 * @returns {readonly string[] | undefined}
 */
export function getRequiredParents(name) {
  return REQUIRED_PARENTS[name];
}

/**
 * Parse key="value" attribute segment after the element name.
 * Returns null when syntax is malformed (caller treats line as text).
 * @param {string} attrSegment
 * @returns {Record<string, string> | null}
 */
export function parseAttributes(attrSegment) {
  const trimmed = attrSegment.trim();
  if (!trimmed) return {};

  const parts = trimmed.split(/\s+/);
  /** @type {Record<string, string>} */
  const attributes = {};

  for (const part of parts) {
    if (!ATTR_PAIR_PATTERN.test(part)) {
      return null;
    }
    const eq = part.indexOf("=");
    const key = part.slice(0, eq);
    const value = part.slice(eq + 2, -1);
    attributes[key] = value;
  }

  return attributes;
}

/**
 * @param {string} line Raw line (not trimmed for text preservation elsewhere)
 * @returns {{ kind: "open", name: string, attributes: Record<string, string> } | null}
 */
export function matchOpeningTag(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const spacedAlias = SPACED_ELEMENT_ALIASES[trimmed];
  if (spacedAlias) {
    return {
      kind: "open",
      name: spacedAlias,
      attributes: {},
    };
  }

  if (ELEMENT_NAME_PATTERN.test(trimmed)) {
    if (!isReservedElement(trimmed)) return null;
    return {
      kind: "open",
      name: normalizeElementName(trimmed),
      attributes: {},
    };
  }

  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return null;

  const rawName = trimmed.slice(0, spaceIndex);
  if (!ELEMENT_NAME_PATTERN.test(rawName) || !isReservedElement(rawName)) {
    return null;
  }

  const attributes = parseAttributes(trimmed.slice(spaceIndex + 1));
  if (attributes === null) return null;

  return {
    kind: "open",
    name: normalizeElementName(rawName),
    attributes,
  };
}

/**
 * @param {string} line
 * @returns {{ kind: "close", name: string } | null}
 */
export function matchClosingTag(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("/")) return null;

  const rawName = trimmed.slice(1);
  const spacedAlias = SPACED_ELEMENT_ALIASES[rawName];
  if (spacedAlias) {
    return { kind: "close", name: spacedAlias };
  }

  if (!ELEMENT_NAME_PATTERN.test(rawName) || !isReservedElement(rawName)) {
    return null;
  }

  return { kind: "close", name: normalizeElementName(rawName) };
}

/**
 * Opening tag with inline quoted value: `title "My Book"`, `heading level="1" "Chapter"`.
 * @param {string} line
 * @returns {{ kind: "inline", name: string, attributes: Record<string, string>, value: string } | null}
 */
export function matchInlineValueElement(line) {
  const trimmed = line.trim();
  const valueMatch = trimmed.match(/^(.+)\s+"([^"]*)"$/);
  if (!valueMatch) return null;

  const beforeValue = valueMatch[1].trim();
  const value = valueMatch[2];

  const spaceIndex = beforeValue.indexOf(" ");
  if (spaceIndex === -1) {
    if (!ELEMENT_NAME_PATTERN.test(beforeValue) || !isReservedElement(beforeValue)) {
      return null;
    }
    return {
      kind: "inline",
      name: normalizeElementName(beforeValue),
      attributes: {},
      value,
    };
  }

  const rawName = beforeValue.slice(0, spaceIndex);
  if (!ELEMENT_NAME_PATTERN.test(rawName) || !isReservedElement(rawName)) {
    return null;
  }

  const attributes = parseAttributes(beforeValue.slice(spaceIndex + 1));
  if (attributes === null) return null;

  return {
    kind: "inline",
    name: normalizeElementName(rawName),
    attributes,
    value,
  };
}

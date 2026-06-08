/**
 * Semantic Markup Language — Grammar (v0.1)
 *
 * Opening tag line:
 *   - A reserved element name alone on the line, e.g. `claim`
 *   - Or name + attributes, e.g. `section title="Background"`
 *
 * Closing tag line:
 *   - Slash-prefixed reserved name, e.g. `/claim`
 *
 * A line is markup ONLY if the entire trimmed line matches opening or closing
 * tag grammar. Otherwise it is plain text — even if it contains reserved words.
 *
 * Attributes (opening tags only):
 *   - Zero or more key="value" pairs separated by whitespace
 *   - Keys: [a-z][a-z0-9-]*
 *   - Values: double-quoted strings only
 *   - Malformed attribute syntax → whole line is treated as text ("text wins")
 *
 * Blank lines inside content are IGNORED (not emitted as text nodes).
 */

/** @readonly */
export const RESERVED_ELEMENTS = new Set([
  "document",
  "section",
  "subhead",
  "text",
  "quote",
  "blockquote",
  "note",
  "source",
  "link",
  "a",
  "media",
  "image",
  "video",
  "audio",
  "caption",
  "argument",
  "claim",
  "evidence",
  "timeline",
  "calendar",
  "event",
  "date",
  "year-start",
  "year-end",
  "year-month",
  "comparison",
  "before",
  "after",
  "entity",
  "unique",
  "shared",
  "scenario",
  "conditions",
  "table",
  "row",
  "column",
  "cell",
  "form",
  "field",
  "input",
  "select",
  "option",
  "button",
  "nav",
  "menu",
  "header",
  "footer",
  "canvas",
  "script",
  "style",
]);

const ELEMENT_NAME_PATTERN = /^[a-z][a-z0-9-]*$/;
const ATTR_PAIR_PATTERN = /^[a-z][a-z0-9-]*="[^"]*"$/;

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

  if (ELEMENT_NAME_PATTERN.test(trimmed)) {
    if (!RESERVED_ELEMENTS.has(trimmed)) return null;
    return { kind: "open", name: trimmed, attributes: {} };
  }

  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return null;

  const name = trimmed.slice(0, spaceIndex);
  if (!ELEMENT_NAME_PATTERN.test(name) || !RESERVED_ELEMENTS.has(name)) {
    return null;
  }

  const attributes = parseAttributes(trimmed.slice(spaceIndex + 1));
  if (attributes === null) return null;

  return { kind: "open", name, attributes };
}

/**
 * @param {string} line
 * @returns {{ kind: "close", name: string } | null}
 */
export function matchClosingTag(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("/")) return null;

  const name = trimmed.slice(1);
  if (!ELEMENT_NAME_PATTERN.test(name) || !RESERVED_ELEMENTS.has(name)) {
    return null;
  }

  return { kind: "close", name };
}

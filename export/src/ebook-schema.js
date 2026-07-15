/**
 * Format-independent ebook schema for MML.
 * @readonly
 */

/** @type {readonly string[]} */
export const EBOOK_ROOT_CHILDREN = [
  "metadata",
  "cover",
  "toc",
  "content",
  "style",
  "javascript",
  "script",
];

/** @type {readonly string[]} */
export const EBOOK_REQUIRED_CHILDREN = ["content"];

/** @type {readonly string[]} */
export const METADATA_FIELDS = [
  "title",
  "subtitle",
  "author",
  "language",
  "description",
  "date",
  "publisher",
  "rights",
];

/** @type {readonly string[]} */
export const COVER_CHILDREN = ["image", "caption"];

/** @type {readonly string[]} */
export const CONTENT_CHILDREN = [
  "heading",
  "section",
  "paragraph",
  "text",
  "image",
  "caption",
  "quote",
  "blockquote",
  "list",
  "item",
  "table",
  "row",
  "cell",
  "column",
  "media",
  "audio",
  "video",
  "link",
  "footnote",
];

/** @type {readonly string[]} */
export const EBOOK_OUTPUT_FORMATS = ["plain-text", "html", "pdf", "epub"];

/** @type {readonly string[]} */
export const EBOOK_MODES = ["static", "styled", "interactive"];

/** @type {Readonly<Record<string, readonly string[]>>} */
export const EBOOK_ALLOWED_PARENTS = {
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
  date: ["metadata", "event"],
  publisher: ["metadata"],
  rights: ["metadata"],
  image: ["cover", "content", "media", "section"],
  caption: ["cover", "media"],
  heading: ["content", "section"],
  paragraph: ["content", "section"],
};

/**
 * @param {string} name
 * @returns {readonly string[] | undefined}
 */
export function getEbookAllowedParents(name) {
  return EBOOK_ALLOWED_PARENTS[name];
}

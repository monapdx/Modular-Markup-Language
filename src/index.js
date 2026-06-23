export {
  CANONICAL_ELEMENTS,
  ELEMENT_ALIASES,
  RESERVED_ELEMENTS,
  REQUIRED_PARENTS,
  normalizeElementName,
  isReservedElement,
  getRequiredParents,
  parseAttributes,
  matchOpeningTag,
  matchClosingTag,
  matchInlineValueElement,
} from "./grammar.js";
export { parse, getDocumentChildren } from "./parser.js";
export { validate, validateAll } from "./validator.js";
export { compile, astToJson } from "./compiler.js";
export {
  generateEbookToc,
  prepareEbookHeadings,
  slugifyHeading,
  findEbookRoot,
  collectHeadings,
  assignHeadingIds,
  buildTocTree,
} from "./ebook.js";
export {
  EBOOK_ROOT_CHILDREN,
  EBOOK_REQUIRED_CHILDREN,
  METADATA_FIELDS,
  COVER_CHILDREN,
  CONTENT_CHILDREN,
  EBOOK_OUTPUT_FORMATS,
  EBOOK_MODES,
} from "./ebook-schema.js";

import { parse } from "./parser.js";
import { validateAll } from "./validator.js";
import { compile, astToJson } from "./compiler.js";

/**
 * Full pipeline: parse → validate → compile.
 * @param {string} source
 */
export function processSource(source) {
  const { ast, errors: parseErrors } = parse(source);
  const validation = validateAll(parseErrors, ast);

  return {
    ast,
    astJson: ast ? astToJson(ast) : null,
    parseErrors,
    validationErrors: validation.errors,
    valid: validation.valid,
    html: validation.valid ? compile(ast) : "",
  };
}

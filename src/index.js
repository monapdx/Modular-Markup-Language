export {
  CANONICAL_ELEMENTS,
  ELEMENT_ALIASES,
  RESERVED_ELEMENTS,
  normalizeElementName,
  isReservedElement,
  parseAttributes,
  matchOpeningTag,
  matchClosingTag,
} from "./grammar.js";
export { parse, getDocumentChildren } from "./parser.js";
export { validate, validateAll } from "./validator.js";
export { compile, astToJson } from "./compiler.js";

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

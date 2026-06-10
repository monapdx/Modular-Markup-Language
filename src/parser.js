import { matchOpeningTag, matchClosingTag, getRequiredParents } from "./grammar.js";

/**
 * @typedef {Object} TextNode
 * @property {"text"} type
 * @property {string} value
 * @property {number} line
 */

/**
 * @typedef {Object} ElementNode
 * @property {"element"} type
 * @property {string} name
 * @property {Record<string, string>} attributes
 * @property {Array<ElementNode | TextNode>} children
 * @property {number} line
 * @property {boolean} [implicit] - true for synthetic document root
 */

/**
 * @typedef {Object} ParseError
 * @property {string} code
 * @property {string} message
 * @property {number} line
 * @property {string} [expected]
 * @property {string} [found]
 * @property {string} [openElement]
 */

/**
 * @typedef {Object} ParseResult
 * @property {ElementNode | null} ast
 * @property {ParseError[]} errors
 */

/**
 * @param {string} name
 * @param {Record<string, string>} attributes
 * @param {number} line
 * @returns {ElementNode}
 */
function createElement(name, attributes, line) {
  return { type: "element", name, attributes, children: [], line };
}

/**
 * @param {string} value
 * @param {number} line
 * @returns {TextNode}
 */
function createText(value, line) {
  return { type: "text", value, line };
}

/**
 * Close open tags that are finished before a new opening tag.
 * Only the tag that most recently received content is auto-closed; containers
 * stay open for more children. Repeated same-name tags close additional ancestors.
 * @param {ElementNode[]} stack
 * @param {string} newTagName
 * @param {ElementNode | null} lastContentTarget
 */
function closeBeforeOpening(stack, newTagName, lastContentTarget) {
  if (stack.length <= 1) return;

  let top = stack[stack.length - 1];
  if (
    !top.implicit &&
    top.children.length > 0 &&
    top === lastContentTarget
  ) {
    stack.pop();
    top = stack[stack.length - 1];
  }

  while (stack.length > 1) {
    top = stack[stack.length - 1];
    if (top.implicit || top.children.length === 0 || top.name !== newTagName) {
      break;
    }
    stack.pop();
  }

  const requiredParents = getRequiredParents(newTagName);
  if (!requiredParents) return;

  while (stack.length > 1) {
    top = stack[stack.length - 1];
    if (top.implicit || requiredParents.includes(top.name)) {
      break;
    }
    stack.pop();
  }
}

/**
 * Flush accumulated text lines into a single text node on the parent.
 * @param {ElementNode} parent
 * @param {string[]} buffer
 * @param {number} startLine
 */
/**
 * @returns {ElementNode | null} The element that received text, if any.
 */
function flushTextBuffer(parent, buffer, startLine) {
  if (buffer.length === 0) return null;
  parent.children.push(createText(buffer.join("\n"), startLine));
  buffer.length = 0;
  return parent;
}

/**
 * Parse semantic markup source into an AST.
 *
 * Opening-tag-only authoring: one tag per line, no required closing tags.
 * When a new opening tag appears, any open tag that already has content
 * (text or child elements) is implicitly closed. Closing tags (/tag) are
 * optional and never required. Matchers emit closers only at compile time.
 *
 * Blank-line policy: blank lines are skipped and never become text nodes.
 * Consecutive non-blank untagged lines merge into one text node (joined by \n).
 *
 * @param {string} source
 * @returns {ParseResult}
 */
export function parse(source) {
  /** @type {ParseError[]} */
  const errors = [];
  const lines = source.split(/\r?\n/);

  const root = createElement("document", {}, 1);
  root.implicit = true;

  /** @type {ElementNode[]} */
  const stack = [root];
  /** @type {string[]} */
  const textBuffer = [];
  let textBufferStartLine = 0;
  /** @type {ElementNode | null} */
  let lastContentTarget = null;

  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      continue;
    }

    const closing = matchClosingTag(line);
    if (closing) {
      flushTextBuffer(stack[stack.length - 1], textBuffer, textBufferStartLine);
      lastContentTarget = null;

      if (stack.length <= 1) {
        errors.push({
          code: "UNEXPECTED_CLOSE",
          message: `Unexpected closing tag /${closing.name} with no matching open tag.`,
          line: lineNumber,
          found: closing.name,
        });
        continue;
      }

      const current = stack[stack.length - 1];
      if (current.name !== closing.name) {
        errors.push({
          code: "MISMATCHED_CLOSE",
          message: `Cannot close ${closing.name} while ${current.name} is still open. Expected /${current.name} but found /${closing.name}.`,
          line: lineNumber,
          expected: current.name,
          found: closing.name,
          openElement: current.name,
        });
        continue;
      }

      stack.pop();
      continue;
    }

    const opening = matchOpeningTag(line);
    if (opening) {
      const contentTarget = flushTextBuffer(
        stack[stack.length - 1],
        textBuffer,
        textBufferStartLine
      );

      closeBeforeOpening(stack, opening.name, contentTarget ?? lastContentTarget);

      const element = createElement(opening.name, opening.attributes, lineNumber);
      lastContentTarget = null;
      stack[stack.length - 1].children.push(element);
      stack.push(element);
      continue;
    }

    if (textBuffer.length === 0) {
      textBufferStartLine = lineNumber;
    }
    textBuffer.push(trimmed);
    lastContentTarget = stack[stack.length - 1];
  }

  flushTextBuffer(stack[stack.length - 1], textBuffer, textBufferStartLine);

  return {
    ast: root,
    errors,
  };
}

/**
 * Return only the document body children when the root is implicit.
 * @param {ElementNode} ast
 * @returns {Array<ElementNode | TextNode>}
 */
export function getDocumentChildren(ast) {
  if (ast.name === "document" && ast.implicit) {
    return ast.children;
  }
  return [ast];
}

import { matchOpeningTag, matchClosingTag } from "./grammar.js";

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
 * Flush accumulated text lines into a single text node on the parent.
 * @param {ElementNode} parent
 * @param {string[]} buffer
 * @param {number} startLine
 */
function flushTextBuffer(parent, buffer, startLine) {
  if (buffer.length === 0) return;
  parent.children.push(createText(buffer.join("\n"), startLine));
  buffer.length = 0;
}

/**
 * Parse semantic markup source into an AST.
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

  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const line = lines[i];
    const trimmed = line.trim();

    // Blank lines are ignored (see grammar.js).
    if (trimmed === "") {
      continue;
    }

    const closing = matchClosingTag(line);
    if (closing) {
      flushTextBuffer(stack[stack.length - 1], textBuffer, textBufferStartLine);

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
      flushTextBuffer(stack[stack.length - 1], textBuffer, textBufferStartLine);

      const element = createElement(opening.name, opening.attributes, lineNumber);
      stack[stack.length - 1].children.push(element);
      stack.push(element);
      continue;
    }

    // Plain text line.
    if (textBuffer.length === 0) {
      textBufferStartLine = lineNumber;
    }
    textBuffer.push(line);
  }

  flushTextBuffer(stack[stack.length - 1], textBuffer, textBufferStartLine);

  if (stack.length > 1) {
    for (let i = stack.length - 1; i >= 1; i--) {
      const open = stack[i];
      errors.push({
        code: "UNCLOSED_TAG",
        message: `Unclosed tag "${open.name}" opened on line ${open.line}. Expected /${open.name}.`,
        line: open.line,
        openElement: open.name,
        expected: open.name,
      });
    }
  }

  return {
    ast: errors.length === 0 ? root : root,
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

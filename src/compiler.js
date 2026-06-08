/**
 * Compile semantic AST to HTML-like markup (custom element names preserved).
 */

/**
 * @typedef {import("./parser.js").ElementNode} ElementNode
 * @typedef {import("./parser.js").TextNode} TextNode
 */

/**
 * @param {string} value
 * @returns {string}
 */
function escapeText(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeAttr(value) {
  return escapeText(value).replace(/"/g, "&quot;");
}

/**
 * @param {Record<string, string>} attributes
 * @returns {string}
 */
function formatAttributes(attributes) {
  const entries = Object.entries(attributes);
  if (entries.length === 0) return "";
  return (
    " " +
    entries.map(([key, value]) => `${key}="${escapeAttr(value)}"`).join(" ")
  );
}

/**
 * @param {ElementNode | TextNode} node
 * @param {number} depth
 * @returns {string}
 */
function compileNode(node, depth) {
  const indent = "  ".repeat(depth);

  if (node.type === "text") {
    return `${indent}<text>${escapeText(node.value)}</text>`;
  }

  if (node.name === "document" && node.implicit) {
    return node.children.map((child) => compileNode(child, depth)).join("\n");
  }

  /** @type {string[]} */
  const lines = [];

  // section title attribute becomes a visible heading in compiled output
  if (node.name === "section" && node.attributes.title) {
    const attrStr = formatAttributes(node.attributes);
    lines.push(`${indent}<section${attrStr}>`);
    lines.push(`${indent}  <subhead>${escapeText(node.attributes.title)}</subhead>`);
    for (const child of node.children) {
      lines.push(compileNode(child, depth + 2));
    }
    lines.push(`${indent}</section>`);
    return lines.join("\n");
  }

  const attrStr = formatAttributes(node.attributes);
  lines.push(`${indent}<${node.name}${attrStr}>`);

  for (const child of node.children) {
    lines.push(compileNode(child, depth + 1));
  }

  lines.push(`${indent}</${node.name}>`);
  return lines.join("\n");
}

/**
 * @param {ElementNode | null} ast
 * @returns {string}
 */
export function compile(ast) {
  if (!ast) return "";
  return compileNode(ast, 0);
}

/**
 * Pretty-print AST as JSON (for demo/debug).
 * @param {ElementNode | TextNode} node
 * @returns {object}
 */
export function astToJson(node) {
  if (node.type === "text") {
    return { type: "text", value: node.value, line: node.line };
  }

  const json = {
    type: "element",
    name: node.name,
    attributes: node.attributes,
    line: node.line,
    children: node.children.map(astToJson),
  };

  if (node.implicit) {
    json.implicit = true;
  }

  return json;
}

/**
 * Ebook TOC generation and export helpers.
 */

/**
 * @typedef {import("./parser.js").ElementNode} ElementNode
 * @typedef {import("./parser.js").TextNode} TextNode
 */

/**
 * @typedef {Object} HeadingEntry
 * @property {ElementNode} node
 * @property {string} text
 * @property {number} level
 * @property {string} id
 */

/**
 * @typedef {Object} TocNode
 * @property {string} id
 * @property {string} label
 * @property {number} level
 * @property {TocNode[]} children
 */

/**
 * @param {string} text
 * @returns {string}
 */
export function slugifyHeading(text) {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "heading";
}

/**
 * @param {ElementNode | TextNode | null | undefined} node
 * @returns {node is ElementNode}
 */
function isElement(node) {
  return node != null && node.type === "element";
}

/**
 * @param {ElementNode} node
 * @returns {string}
 */
export function elementTextContent(node) {
  return node.children
    .filter((child) => child.type === "text")
    .map((child) => child.value.trim())
    .join("\n");
}

/**
 * @param {ElementNode} root
 * @param {string} name
 * @returns {ElementNode | undefined}
 */
export function findFirstElement(root, name) {
  if (!isElement(root)) return undefined;
  if (root.name === name) return root;
  for (const child of root.children) {
    if (!isElement(child)) continue;
    const found = findFirstElement(child, name);
    if (found) return found;
  }
  return undefined;
}

/**
 * @param {ElementNode} node
 * @param {string} name
 * @returns {ElementNode | undefined}
 */
export function childElement(node, name) {
  return node.children.find(
    (child) => child.type === "element" && child.name === name
  );
}

/**
 * Collect headings under content in document order.
 * @param {ElementNode} contentNode
 * @returns {HeadingEntry[]}
 */
export function collectHeadings(contentNode) {
  /** @type {HeadingEntry[]} */
  const headings = [];

  /** @param {ElementNode | TextNode} node */
  function walk(node) {
    if (!isElement(node)) return;
    if (node.name === "heading") {
      const level = parseInt(node.attributes.level ?? "1", 10);
      headings.push({
        node,
        text: elementTextContent(node),
        level: Number.isFinite(level) && level > 0 ? level : 1,
        id: node.attributes.id ?? "",
      });
    }
    for (const child of node.children) {
      walk(child);
    }
  }

  walk(contentNode);
  return headings;
}

/**
 * Assign stable slug IDs to headings missing id attribute.
 * @param {HeadingEntry[]} headings
 */
export function assignHeadingIds(headings) {
  /** @type {Map<string, number>} */
  const used = new Map();

  for (const entry of headings) {
    if (entry.node.attributes.id) {
      entry.id = entry.node.attributes.id;
      continue;
    }

    const base = slugifyHeading(entry.text);
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count + 1}`;
    entry.node.attributes.id = id;
    entry.id = id;
  }
}

/**
 * @param {HeadingEntry[]} headings
 * @param {number} [minDepth=1]
 * @param {number} [maxDepth=6]
 * @returns {TocNode[]}
 */
export function buildTocTree(headings, minDepth = 1, maxDepth = 6) {
  const filtered = headings.filter(
    (h) => h.level >= minDepth && h.level <= maxDepth
  );

  /** @type {TocNode[]} */
  const root = [];
  /** @type {TocNode[]} */
  const stack = [];

  for (const heading of filtered) {
    const item = {
      id: heading.id,
      label: heading.text,
      level: heading.level,
      children: [],
    };

    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(item);
    } else {
      stack[stack.length - 1].children.push(item);
    }

    stack.push(item);
  }

  return root;
}

/**
 * @param {TocNode[]} nodes
 * @param {number} depth
 * @returns {string}
 */
export function renderTocHtml(nodes, depth = 0) {
  if (nodes.length === 0) return "";
  const indent = "  ".repeat(depth);
  const lines = [`${indent}<nav class="mml-toc"><ol>`];

  for (const node of nodes) {
    lines.push(`${indent}  <li>`);
    lines.push(
      `${indent}    <a href="#${node.id}">${escapeHtml(node.label)}</a>`
    );
    if (node.children.length > 0) {
      lines.push(renderTocHtml(node.children, depth + 2).trimEnd());
    }
    lines.push(`${indent}  </li>`);
  }

  lines.push(`${indent}</ol></nav>`);
  return lines.join("\n");
}

/**
 * @param {TocNode[]} nodes
 * @param {number} depth
 * @returns {string}
 */
export function renderTocPlainText(nodes, depth = 0) {
  /** @type {string[]} */
  const lines = [];
  const prefix = "  ".repeat(depth);

  for (const node of nodes) {
    lines.push(`${prefix}- ${node.label}`);
    if (node.children.length > 0) {
      lines.push(renderTocPlainText(node.children, depth + 1));
    }
  }

  return lines.join("\n");
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * @param {ElementNode} ebookNode
 * @returns {{ minDepth: number, maxDepth: number }}
 */
export function getTocDepthLimits(ebookNode) {
  const tocNode = ebookNode.children.find(
    (child) => isElement(child) && child.name === "toc"
  );
  const minDepth = tocNode
    ? parseInt(tocNode.attributes["min-depth"] ?? "1", 10)
    : 1;
  const maxDepth = tocNode
    ? parseInt(tocNode.attributes["max-depth"] ?? "6", 10)
    : 6;
  return {
    minDepth: Number.isFinite(minDepth) && minDepth > 0 ? minDepth : 1,
    maxDepth: Number.isFinite(maxDepth) && maxDepth > 0 ? maxDepth : 6,
  };
}

/**
 * @param {ElementNode} ebookNode
 * @returns {HeadingEntry[]}
 */
export function prepareEbookHeadings(ebookNode) {
  const contentNode = childElement(ebookNode, "content");
  if (!contentNode) return [];
  const headings = collectHeadings(contentNode);
  assignHeadingIds(headings);
  return headings;
}

/**
 * @param {ElementNode} ebookNode
 * @returns {TocNode[]}
 */
export function generateEbookToc(ebookNode) {
  const hasToc = ebookNode.children.some(
    (child) => isElement(child) && child.name === "toc"
  );
  if (!hasToc) return [];

  const { minDepth, maxDepth } = getTocDepthLimits(ebookNode);
  const headings = prepareEbookHeadings(ebookNode);
  return buildTocTree(headings, minDepth, maxDepth);
}

/**
 * @param {ElementNode | null | undefined} ast
 * @returns {ElementNode | undefined}
 */
export function findEbookRoot(ast) {
  if (!ast || !isElement(ast)) return undefined;
  if (ast.name === "ebook") return ast;
  if (ast.name === "document" && ast.implicit) {
    return ast.children.find(
      (child) => isElement(child) && child.name === "ebook"
    );
  }
  return undefined;
}

/**
 * Compile semantic AST to HTML-like markup (custom element names preserved).
 */

import {
  findEbookRoot,
  elementTextContent,
  generateEbookToc,
  prepareEbookHeadings,
  renderTocHtml,
  renderTocPlainText,
} from "./ebook.js";

/**
 * @typedef {import("./parser.js").ElementNode} ElementNode
 * @typedef {import("./parser.js").TextNode} TextNode
 */

/**
 * @typedef {Object} CompileOptions
 * @property {"html" | "plain-text"} [format]
 * @property {boolean} [includeCover]
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

const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * @param {ElementNode} node
 * @returns {string}
 */
function textContent(node) {
  return node.children
    .filter((child) => child.type === "text")
    .map((child) => child.value.trim())
    .join("\n");
}

/**
 * @param {ElementNode} node
 * @param {string} name
 * @returns {ElementNode | undefined}
 */
function childElement(node, name) {
  return node.children.find(
    (child) => child.type === "element" && child.name === name
  );
}

/**
 * @param {ElementNode} node
 * @param {string} name
 * @returns {ElementNode[]}
 */
function childrenElements(node, name) {
  return node.children.filter(
    (child) => child.type === "element" && child.name === name
  );
}

/**
 * @param {string} text
 * @returns {number | null}
 */
function parsePositiveInt(text) {
  const value = parseInt(text.trim(), 10);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * @param {number} year
 * @param {number} month
 * @returns {number}
 */
function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * @param {number} year
 * @param {number} month
 * @param {Set<number>} eventDays
 * @param {number} cellIndent
 * @returns {string}
 */
function buildMonthTable(year, month, eventDays, cellIndent) {
  const totalDays = daysInMonth(year, month);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const pad = " ".repeat(cellIndent);

  /** @type {string[]} */
  const lines = [];
  lines.push(
    `${pad}<table class="mml-calendar">`
  );
  lines.push(
    `${pad}  <caption>${MONTH_NAMES[month]} ${year}</caption>`
  );
  lines.push(`${pad}  <thead>`);
  lines.push(
    `${pad}    <tr>${WEEKDAY_HEADERS.map((day) => `<th>${day}</th>`).join("")}</tr>`
  );
  lines.push(`${pad}  </thead>`);
  lines.push(`${pad}  <tbody>`);

  let day = 1;
  while (day <= totalDays) {
    lines.push(`${pad}    <tr>`);
    for (let column = 0; column < 7; column++) {
      if (day === 1 && column < firstDay) {
        lines.push(`${pad}      <td></td>`);
        continue;
      }
      if (day > totalDays) {
        lines.push(`${pad}      <td></td>`);
        continue;
      }

      const classes = eventDays.has(day) ? ' class="mml-event-day"' : "";
      lines.push(`${pad}      <td${classes}>${day}</td>`);
      day++;
    }
    lines.push(`${pad}    </tr>`);
  }

  lines.push(`${pad}  </tbody>`);
  lines.push(`${pad}</table>`);
  return lines.join("\n");
}

/**
 * @param {ElementNode} node
 * @param {number} depth
 * @returns {string | null}
 */
function compileCalendar(node, depth) {
  const yearNode = childElement(node, "year");
  const monthNode = childElement(node, "month");
  const year = yearNode ? parsePositiveInt(textContent(yearNode)) : null;
  const month = monthNode ? parsePositiveInt(textContent(monthNode)) : null;

  if (!year || !month || month < 1 || month > 12) {
    return null;
  }

  /** @type {Set<number>} */
  const eventDays = new Set();
  for (const event of childrenElements(node, "event")) {
    const dateNode = childElement(event, "date");
    if (!dateNode) continue;
    const day = parsePositiveInt(textContent(dateNode));
    if (day) eventDays.add(day);
  }

  const indent = "  ".repeat(depth);
  const table = buildMonthTable(year, month, eventDays, depth + 2);
  return `${indent}<calendar>\n${table}\n${indent}</calendar>`;
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
 * @param {CompileOptions} [options]
 * @returns {string}
 */
function compileNode(node, depth, options = {}) {
  const indent = "  ".repeat(depth);

  if (node.type === "text") {
    return `${indent}<text>${escapeText(node.value)}</text>`;
  }

  if (node.name === "document" && node.implicit) {
    return node.children.map((child) => compileNode(child, depth, options)).join("\n");
  }

  /** @type {string[]} */
  const lines = [];

  if (node.name === "calendar") {
    const calendarTable = compileCalendar(node, depth);
    if (calendarTable) return calendarTable;
  }

  if (node.name === "heading") {
    const level = parsePositiveInt(node.attributes.level ?? "1") ?? 1;
    const tag = `h${Math.min(Math.max(level, 1), 6)}`;
    const id = node.attributes.id;
    const idAttr = id ? ` id="${escapeAttr(id)}"` : "";
    const text = elementTextContent(node);
    lines.push(`${indent}<${tag}${idAttr}>${escapeText(text)}</${tag}>`);
    return lines.join("\n");
  }

  if (node.name === "paragraph") {
    const text = elementTextContent(node);
    lines.push(`${indent}<p>${escapeText(text)}</p>`);
    return lines.join("\n");
  }

  // section title attribute becomes a visible heading in compiled output
  if (node.name === "section" && node.attributes.title) {
    const attrStr = formatAttributes(node.attributes);
    lines.push(`${indent}<section${attrStr}>`);
    lines.push(`${indent}  <subhead>${escapeText(node.attributes.title)}</subhead>`);
    for (const child of node.children) {
      lines.push(compileNode(child, depth + 2, options));
    }
    lines.push(`${indent}</section>`);
    return lines.join("\n");
  }

  const attrStr = formatAttributes(node.attributes);
  lines.push(`${indent}<${node.name}${attrStr}>`);

  for (const child of node.children) {
    lines.push(compileNode(child, depth + 1, options));
  }

  lines.push(`${indent}</${node.name}>`);
  return lines.join("\n");
}

/**
 * @param {ElementNode} metadataNode
 * @param {number} depth
 * @param {"html" | "plain-text"} format
 * @returns {string}
 */
function compileMetadata(metadataNode, depth, format) {
  const indent = "  ".repeat(depth);
  /** @type {string[]} */
  const lines = [];

  if (format === "plain-text") {
    lines.push(`${indent}--- Metadata ---`);
    for (const child of metadataNode.children) {
      if (child.type !== "element") continue;
      lines.push(`${indent}${child.name}: ${elementTextContent(child)}`);
    }
    return lines.join("\n");
  }

  lines.push(`${indent}<metadata>`);
  for (const child of metadataNode.children) {
    if (child.type !== "element") continue;
    lines.push(
      `${indent}  <${child.name}>${escapeText(elementTextContent(child))}</${child.name}>`
    );
  }
  lines.push(`${indent}</metadata>`);
  return lines.join("\n");
}

/**
 * @param {ElementNode} coverNode
 * @param {number} depth
 * @returns {string}
 */
function compileCover(coverNode, depth) {
  const indent = "  ".repeat(depth);
  /** @type {string[]} */
  const lines = [`${indent}<cover>`];

  for (const child of coverNode.children) {
    if (child.type !== "element") continue;
    if (child.name === "image") {
      const src = elementTextContent(child);
      lines.push(`${indent}  <img src="${escapeAttr(src)}" alt="cover" />`);
    } else {
      lines.push(compileNode(child, depth + 1));
    }
  }

  lines.push(`${indent}</cover>`);
  return lines.join("\n");
}

/**
 * @param {ElementNode} contentNode
 * @param {number} depth
 * @param {CompileOptions} options
 * @returns {string}
 */
function compileContent(contentNode, depth, options) {
  const indent = "  ".repeat(depth);
  /** @type {string[]} */
  const lines = [`${indent}<content>`];

  for (const child of contentNode.children) {
    lines.push(compileNode(child, depth + 1, options));
  }

  lines.push(`${indent}</content>`);
  return lines.join("\n");
}

/**
 * @param {ElementNode} styleNode
 * @param {number} depth
 * @returns {string}
 */
function compileStyleBlock(styleNode, depth) {
  const indent = "  ".repeat(depth);
  const css = styleNode.children
    .filter((child) => child.type === "text")
    .map((child) => child.value)
    .join("\n");
  return `${indent}<style>\n${css}\n${indent}</style>`;
}

/**
 * @param {ElementNode} scriptNode
 * @param {number} depth
 * @returns {string}
 */
function compileScriptBlock(scriptNode, depth) {
  const indent = "  ".repeat(depth);
  const js = scriptNode.children
    .filter((child) => child.type === "text")
    .map((child) => child.value)
    .join("\n");
  return `${indent}<script>\n${js}\n${indent}</script>`;
}

/**
 * @param {ElementNode} ebookNode
 * @param {CompileOptions} options
 * @returns {string}
 */
function compileEbook(ebookNode, options = {}) {
  const format =
    options.format ??
    (ebookNode.attributes.output === "plain-text" ? "plain-text" : "html");
  const includeCover = options.includeCover ?? format !== "plain-text";
  const mode = ebookNode.attributes.mode ?? "static";
  const includeStyle =
    format === "html" && (mode === "styled" || mode === "interactive");
  const includeJavascript = format === "html" && mode === "interactive";

  prepareEbookHeadings(ebookNode);
  const tocTree = generateEbookToc(ebookNode);

  /** @type {string[]} */
  const parts = [];

  if (format === "plain-text") {
    parts.push("<ebook>");
  } else {
    const attrStr = formatAttributes(ebookNode.attributes);
    parts.push(`<ebook${attrStr}>`);
  }

  const metadataNode = childElement(ebookNode, "metadata");
  if (metadataNode) {
    parts.push(compileMetadata(metadataNode, 1, format));
  }

  if (includeCover) {
    const coverNode = childElement(ebookNode, "cover");
    if (coverNode && format === "html") {
      parts.push(compileCover(coverNode, 1));
    }
  }

  if (tocTree.length > 0) {
    if (format === "plain-text") {
      parts.push("  --- Table of Contents ---");
      parts.push(renderTocPlainText(tocTree, 1));
    } else {
      parts.push(renderTocHtml(tocTree, 1));
    }
  }

  const contentNode = childElement(ebookNode, "content");
  if (contentNode) {
    parts.push(compileContent(contentNode, 1, { ...options, format }));
  }

  if (includeStyle) {
    const styleNode = childElement(ebookNode, "style");
    if (styleNode) {
      parts.push(compileStyleBlock(styleNode, 1));
    }
  }

  if (includeJavascript) {
    const scriptNode =
      childElement(ebookNode, "javascript") ?? childElement(ebookNode, "script");
    if (scriptNode) {
      parts.push(compileScriptBlock(scriptNode, 1));
    }
  }

  parts.push(format === "plain-text" ? "</ebook>" : "</ebook>");
  return parts.filter((part) => part.length > 0).join("\n");
}

/**
 * @param {ElementNode | null} ast
 * @param {CompileOptions} [options]
 * @returns {string}
 */
export function compile(ast, options = {}) {
  if (!ast) return "";

  const ebook = findEbookRoot(ast);
  if (ebook) {
    return compileEbook(ebook, options);
  }

  return compileNode(ast, 0, options);
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

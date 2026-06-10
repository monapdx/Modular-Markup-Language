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

      const classes = eventDays.has(day)
        ? ' class="mml-event-day"'
        : "";
      const style = eventDays.has(day)
        ? ' style="background:#c6ff00;font-weight:bold"'
        : "";
      lines.push(`${pad}      <td${classes}${style}>${day}</td>`);
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

  if (node.name === "calendar") {
    const calendarTable = compileCalendar(node, depth);
    if (calendarTable) return calendarTable;
  }

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

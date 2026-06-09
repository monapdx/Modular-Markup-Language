/**
 * Semantic validation for parsed AST nodes.
 *
 * Validation runs after parsing and assumes syntactic structure (matching tags)
 * is already correct. It checks parent/child requirements and comparison schemas.
 */

/**
 * @typedef {import("./parser.js").ElementNode} ElementNode
 * @typedef {import("./parser.js").TextNode} TextNode
 */

/**
 * @typedef {Object} ValidationError
 * @property {string} code
 * @property {string} message
 * @property {number} line
 * @property {string} [element]
 * @property {string} [requiredParent]
 * @property {string[]} [suggestedParentChain]
 * @property {string} [requiredChild]
 * @property {string[]} [missingChildren]
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {ValidationError[]} errors
 */

/**
 * @param {ElementNode | TextNode | null | undefined} node
 * @returns {node is ElementNode}
 */
function isElement(node) {
  return node != null && node.type === "element";
}

/**
 * @param {ElementNode} node
 * @returns {ElementNode[]}
 */
function childElements(node) {
  return node.children.filter(isElement);
}

/**
 * @param {ElementNode} node
 * @param {string} name
 * @returns {boolean}
 */
function hasChildNamed(node, name) {
  return childElements(node).some((child) => child.name === name);
}

/**
 * @param {ElementNode} node
 * @param {string} name
 * @returns {ElementNode[]}
 */
function childrenNamed(node, name) {
  return childElements(node).filter((child) => child.name === name);
}

/**
 * @param {ElementNode | TextNode} node
 * @param {ElementNode | null} parent
 * @param {ValidationError[]} errors
 */
function walkNode(node, parent, errors) {
  if (node.type === "text") return;

  validateElement(node, parent, errors);

  for (const child of node.children) {
    walkNode(child, node, errors);
  }
}

/**
 * @param {ElementNode} node
 * @param {ElementNode | null} parent
 * @param {ValidationError[]} errors
 */
function validateElement(node, parent, errors) {
  const parentName = parent?.name ?? null;

  switch (node.name) {
    case "evidence":
      if (parentName !== "claim") {
        errors.push({
          code: "MISSING_REQUIRED_PARENT",
          element: "evidence",
          requiredParent: "claim",
          suggestedParentChain: ["claim"],
          line: node.line,
          message: "evidence requires parent claim",
        });
      }
      break;

    case "start-year":
    case "end-year":
      if (parentName !== "timeline") {
        errors.push({
          code: "MISSING_REQUIRED_PARENT",
          element: node.name,
          requiredParent: "timeline",
          suggestedParentChain: ["timeline"],
          line: node.line,
          message: `${node.name} requires parent timeline`,
        });
      }
      break;

    case "month":
    case "year":
      if (parentName !== "calendar") {
        errors.push({
          code: "MISSING_REQUIRED_PARENT",
          element: node.name,
          requiredParent: "calendar",
          suggestedParentChain: ["calendar"],
          line: node.line,
          message: `${node.name} requires parent calendar`,
        });
      }
      break;

    case "date":
      if (parentName !== "event") {
        errors.push({
          code: "MISSING_REQUIRED_PARENT",
          element: "date",
          requiredParent: "event",
          suggestedParentChain: ["event"],
          line: node.line,
          message: "date requires parent event",
        });
      }
      break;

    case "unique":
      if (parentName !== "entity") {
        errors.push({
          code: "MISSING_REQUIRED_PARENT",
          element: "unique",
          requiredParent: "entity",
          suggestedParentChain: ["comparison", "entity"],
          line: node.line,
          message: "unique requires parent entity",
        });
      }
      break;

    case "shared":
      if (parentName !== "comparison") {
        errors.push({
          code: "MISSING_REQUIRED_PARENT",
          element: "shared",
          requiredParent: "comparison",
          suggestedParentChain: ["comparison"],
          line: node.line,
          message: "shared requires parent comparison",
        });
      }
      break;

    case "condition":
      if (parentName !== "scenario") {
        errors.push({
          code: "MISSING_REQUIRED_PARENT",
          element: "condition",
          requiredParent: "scenario",
          suggestedParentChain: ["comparison", "scenario"],
          line: node.line,
          message: "condition requires parent scenario",
        });
      }
      break;

    case "caption":
      if (parentName !== "media") {
        errors.push({
          code: "MISSING_REQUIRED_PARENT",
          element: "caption",
          requiredParent: "media",
          suggestedParentChain: ["media"],
          line: node.line,
          message: "caption requires parent media",
        });
      }
      break;

    case "argument":
      if (!hasChildNamed(node, "claim")) {
        errors.push({
          code: "MISSING_REQUIRED_CHILD",
          element: "argument",
          requiredChild: "claim",
          line: node.line,
          message: "argument requires at least one child claim",
        });
      }
      break;

    case "timeline": {
      const missing = [];
      if (!hasChildNamed(node, "start-year")) missing.push("start-year");
      if (!hasChildNamed(node, "end-year")) missing.push("end-year");
      if (missing.length > 0) {
        errors.push({
          code: "MISSING_REQUIRED_CHILD",
          element: "timeline",
          missingChildren: missing,
          line: node.line,
          message: `timeline requires ${missing.join(" and ")}`,
        });
      }
      break;
    }

    case "calendar":
      if (!hasChildNamed(node, "month") && !hasChildNamed(node, "year")) {
        errors.push({
          code: "MISSING_REQUIRED_CHILD",
          element: "calendar",
          missingChildren: ["month", "year"],
          line: node.line,
          message: "calendar requires month or year",
        });
      }
      break;

    case "event":
      if (!hasChildNamed(node, "date")) {
        errors.push({
          code: "MISSING_REQUIRED_CHILD",
          element: "event",
          requiredChild: "date",
          line: node.line,
          message: "event requires date",
        });
      }
      break;

    case "media": {
      const hasMediaChild =
        hasChildNamed(node, "image") ||
        hasChildNamed(node, "audio") ||
        hasChildNamed(node, "video");
      if (!hasMediaChild) {
        errors.push({
          code: "MISSING_REQUIRED_CHILD",
          element: "media",
          missingChildren: ["image", "audio", "video"],
          line: node.line,
          message: "media requires at least one of image, audio, or video",
        });
      }
      break;
    }

    case "comparison":
      validateComparison(node, errors);
      break;

    case "scenario":
      if (!hasChildNamed(node, "condition")) {
        errors.push({
          code: "MISSING_REQUIRED_CHILD",
          element: "scenario",
          requiredChild: "condition",
          line: node.line,
          message: "scenario should contain condition",
        });
      }
      break;

    default:
      break;
  }
}

/**
 * comparison supports three schemas; at least one must match.
 * @param {ElementNode} node
 * @param {ValidationError[]} errors
 */
function validateComparison(node, errors) {
  const childNames = new Set(childElements(node).map((c) => c.name));

  const schemaBeforeAfter =
    childNames.has("before") && childNames.has("after");

  const entities = childrenNamed(node, "entity");
  const schemaEntity =
    entities.length >= 2 &&
    entities.every((entity) => hasChildNamed(entity, "unique")) &&
    (!childNames.has("shared") || hasChildNamed(node, "shared"));

  const scenarios = childrenNamed(node, "scenario");
  const schemaScenario =
    scenarios.length >= 2 &&
    scenarios.every((scenario) => hasChildNamed(scenario, "condition"));

  if (schemaBeforeAfter || schemaEntity || schemaScenario) {
    return;
  }

  /** @type {string[]} */
  const hints = [];
  if (childNames.has("before") || childNames.has("after")) {
    hints.push("before/after schema requires both before and after");
  }
  if (entities.length > 0) {
    hints.push("entity schema requires at least two entity children each containing unique");
  }
  if (scenarios.length > 0) {
    hints.push("scenario schema requires at least two scenario children each containing condition");
  }

  errors.push({
    code: "INVALID_COMPARISON_SCHEMA",
    element: "comparison",
    line: node.line,
    message:
      hints.length > 0
        ? `comparison does not match a valid schema: ${hints.join("; ")}`
        : "comparison requires before/after, entity/shared/unique, or scenario/condition schema",
  });
}

/**
 * @param {ElementNode | null} ast
 * @returns {ValidationResult}
 */
export function validate(ast) {
  /** @type {ValidationError[]} */
  const errors = [];

  if (!ast) {
    return { valid: false, errors: [{ code: "NO_AST", message: "No AST to validate", line: 0 }] };
  }

  walkNode(ast, null, errors);

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Run parse errors + semantic validation together.
 * @param {import("./parser.js").ParseError[]} parseErrors
 * @param {ElementNode | null} ast
 * @returns {{ valid: boolean, errors: Array<import("./parser.js").ParseError | ValidationError> }}
 */
export function validateAll(parseErrors, ast) {
  if (parseErrors.length > 0) {
    return { valid: false, errors: parseErrors };
  }
  const result = validate(ast);
  return { valid: result.valid, errors: result.errors };
}

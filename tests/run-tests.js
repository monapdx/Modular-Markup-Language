import { parse } from "../src/parser.js";
import { validate, validateAll } from "../src/validator.js";
import { compile } from "../src/compiler.js";
import { processSource } from "../src/index.js";

/** @typedef {{ name: string, fn: () => void }} TestCase */

/** @type {TestCase[]} */
const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function assertEqual(actual, expected, message = "") {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${message}\nExpected: ${e}\nActual:   ${a}`);
  }
}

function assertTrue(value, message = "") {
  if (!value) throw new Error(message || "Expected true");
}

function assertFalse(value, message = "") {
  if (value) throw new Error(message || "Expected false");
}

function assertIncludes(haystack, needle, message = "") {
  if (!haystack.includes(needle)) {
    throw new Error(`${message}\nExpected to include: ${needle}\nIn: ${haystack}`);
  }
}

function assertMatch(value, pattern, message = "") {
  if (!pattern.test(value)) {
    throw new Error(`${message}\nExpected ${value} to match ${pattern}`);
  }
}

function findElement(ast, name) {
  if (!ast) return null;
  if (ast.type === "element" && ast.name === name) return ast;
  if (ast.type !== "element") return null;
  for (const child of ast.children) {
    const found = findElement(child, name);
    if (found) return found;
  }
  return null;
}

// --- Test cases ---

test("valid argument / claim / evidence", () => {
  const source = `argument
claim
Markdown introduces an unnecessary abstraction layer.
evidence
The final rendered output is already HTML.
/evidence
/claim
/argument`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  const validation = validate(ast);
  assertTrue(validation.valid);

  const html = compile(ast);
  assertIncludes(html, "<argument>");
  assertIncludes(html, "<claim>");
  assertIncludes(html, "<text>Markdown introduces an unnecessary abstraction layer.</text>");
  assertIncludes(html, "<evidence>");
  assertIncludes(html, "<text>The final rendered output is already HTML.</text>");
});

test("evidence without claim", () => {
  const source = `evidence
The final output is HTML.
/evidence`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  const validation = validate(ast);
  assertFalse(validation.valid);
  assertEqual(validation.errors[0].code, "MISSING_REQUIRED_PARENT");
  assertEqual(validation.errors[0].element, "evidence");
  assertEqual(validation.errors[0].requiredParent, "claim");
  assertEqual(validation.errors[0].suggestedParentChain, ["claim"]);
});

test("mismatched closing tag", () => {
  const source = `argument
claim
Text.
/argument`;

  const { errors } = parse(source);
  const mismatch = errors.find((e) => e.code === "MISMATCHED_CLOSE");
  assertTrue(mismatch != null, "Expected MISMATCHED_CLOSE error");
  assertIncludes(
    mismatch.message,
    "Cannot close argument while claim is still open. Expected /claim but found /argument."
  );
});

test("standalone claim", () => {
  const source = `claim
Markdown is unnecessary.
/claim`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);

  const claim = findElement(ast, "claim");
  assertTrue(claim != null);
  assertEqual(claim.children[0], {
    type: "text",
    value: "Markdown is unnecessary.",
    line: 2,
  });
});

test("timeline with year-start and year-end only", () => {
  const source = `timeline
year-start
2020
/year-start
year-end
2024
/year-end
/timeline`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
});

test("timeline with events", () => {
  const source = `timeline
year-start
2020
/year-start
event
date
2021-06-01
/date
Launch day.
/event
year-end
2024
/year-end
/timeline`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
});

test("calendar with year-month", () => {
  const source = `calendar
year-month
2024-03
/year-month
/calendar`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
});

test("comparison before/after schema", () => {
  const source = `comparison
before
Old approach.
/before
after
New approach.
/after
/comparison`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
});

test("comparison entity / shared / unique schema", () => {
  const source = `comparison
entity
unique
Alpha only.
/unique
/entity
entity
unique
Beta only.
/unique
/entity
shared
Common ground.
/shared
/comparison`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
});

test("comparison scenario / condition schema", () => {
  const source = `comparison
scenario
condition
If A happens.
/condition
/scenario
scenario
condition
If B happens.
/condition
/scenario
/comparison`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
});

test("media with image and caption", () => {
  const source = `media
image
/photo.png
/image
caption
A sample photo.
/caption
/media`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
});

test("reserved words used as normal text", () => {
  const source = `claim
Arguments aren't always unhealthy.
/claim`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  const claim = findElement(ast, "claim");
  assertIncludes(claim.children[0].value, "Arguments aren't always unhealthy.");
});

test("section title attribute", () => {
  const source = `section title="Background"
Some content.
/section`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);

  const section = findElement(ast, "section");
  assertEqual(section.attributes.title, "Background");

  const html = compile(ast);
  assertIncludes(html, '<section title="Background">');
  assertIncludes(html, "<subhead>Background</subhead>");
});

test("title attribute line is plain text inside section", () => {
  const source = `section
title="Background"
/section`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  const section = findElement(ast, "section");
  assertEqual(Object.keys(section.attributes).length, 0);
  assertEqual(section.children[0].value, 'title="Background"');
});

test("malformed attribute line is text not tag", () => {
  const source = `section
section title=Background
/section`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  const section = findElement(ast, "section");
  assertEqual(section.children[0].value, "section title=Background");
});

test("non-reserved word line is text", () => {
  const source = `claim
hello
/claim`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  const claim = findElement(ast, "claim");
  assertEqual(claim.children[0].value, "hello");
});

test("processSource returns empty html when invalid", () => {
  const result = processSource(`evidence
x
/evidence`);
  assertFalse(result.valid);
  assertEqual(result.html, "");
  assertMatch(result.validationErrors[0].message, /requires parent claim/);
});

test("legacy year-start alias normalizes to start-year", () => {
  const source = `timeline
year-start
2020
/year-start
year-end
2024
/year-end
/timeline`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
  assertTrue(findElement(ast, "start-year") != null);
  assertTrue(findElement(ast, "end-year") != null);
});

test("legacy year-month alias normalizes to month", () => {
  const source = `calendar
year-month
2024-03
/year-month
/calendar`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
  assertTrue(findElement(ast, "month") != null);
});

test("shorthand tags from SHORTHAND.md", () => {
  const source = `arg
claim
evi
Supported.
/evi
/claim
/arg`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(findElement(ast, "argument") != null);
  assertTrue(findElement(ast, "claim") != null);
  assertTrue(findElement(ast, "evidence") != null);
});

test("form elements from TAGS.md", () => {
  const source = `form action="POST"
fieldset
legend
Name
/legend
input type="text"
/input
/fieldset
dropdown
option
A
/option
selection
A
/selection
/dropdown
button type="submit"
Submit
/button
para
Notes here.
/para
/form`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(findElement(ast, "form") != null);
  assertTrue(findElement(ast, "fieldset") != null);
  assertTrue(findElement(ast, "dropdown") != null);
  assertTrue(findElement(ast, "textarea") != null);
});

test("document structure elements from TAGS.md", () => {
  const source = `document
section title="Intro"
text
Hello.
/text
/section
list
item
One
/item
/list
footnote
See also.
/footnote
/document`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(findElement(ast, "list") != null);
  assertTrue(findElement(ast, "item") != null);
  assertTrue(findElement(ast, "footnote") != null);
});

test("table elements from TAGS.md", () => {
  const source = `table
row
cell
A1
/cell
column
B
/column
/row
/table`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(findElement(ast, "table") != null);
  assertTrue(findElement(ast, "row") != null);
  assertTrue(findElement(ast, "cell") != null);
  assertTrue(findElement(ast, "column") != null);
});

test("media shorthand image alias", () => {
  const source = `media
img
/photo.png
/image
/media`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
  assertTrue(findElement(ast, "image") != null);
});

// --- Runner ---

let passed = 0;
let failed = 0;

for (const { name, fn } of tests) {
  try {
    fn();
    passed++;
    console.log(`✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`✗ ${name}`);
    console.error(`  ${err.message}`);
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

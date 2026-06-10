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

test("opening-tag-only argument / claim / evidence (user example)", () => {
  const source = `argument
claim
Dogs are better companions.
evidence
Loki.`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  const validation = validate(ast);
  assertTrue(validation.valid);

  const html = compile(ast);
  assertIncludes(html, "<argument>");
  assertIncludes(html, "<claim>");
  assertIncludes(html, "<text>Dogs are better companions.</text>");
  assertIncludes(html, "<evidence>");
  assertIncludes(html, "<text>Loki.</text>");
  assertIncludes(html, "</argument>");
  assertIncludes(html, "</claim>");
  assertIncludes(html, "</evidence>");
});

test("valid argument / claim / evidence", () => {
  const source = `argument
claim
Markdown introduces an unnecessary abstraction layer.
evidence
The final rendered output is already HTML.`;

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
The final output is HTML.`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  const validation = validate(ast);
  assertFalse(validation.valid);
  assertEqual(validation.errors[0].code, "MISSING_REQUIRED_PARENT");
  assertEqual(validation.errors[0].element, "evidence");
  assertEqual(validation.errors[0].requiredParent, "claim");
  assertEqual(validation.errors[0].suggestedParentChain, ["argument", "claim"]);
});

test("closing tags are optional not required", () => {
  const withoutClosers = `argument
claim
Dogs are better companions.
evidence
Loki.`;

  const withClosers = `argument
claim
Dogs are better companions.
/claim
evidence
Loki.`;

  const withoutResult = parse(withoutClosers);
  const withResult = parse(withClosers);
  assertEqual(withoutResult.errors, []);
  assertEqual(withResult.errors, []);
  assertTrue(validate(withoutResult.ast).valid);
  assertTrue(validate(withResult.ast).valid);
});

test("mismatched optional closing tag", () => {
  const source = `argument
claim
Text.
/argument`;

  const { errors } = parse(source);
  const mismatch = errors.find((e) => e.code === "MISMATCHED_CLOSE");
  assertTrue(mismatch != null, "Expected MISMATCHED_CLOSE error");
});

test("standalone claim", () => {
  const source = `claim
Markdown is unnecessary.`;

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
year-end
2024`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
});

test("timeline with events", () => {
  const source = `timeline
year-start
2020
event
date
2021-06-01
Launch day.
year-end
2024`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
});

test("timeline with spaced end year alias", () => {
  const source = `timeline
start-year
2000
event
date
09-14-2001
end year
2015`;

  const result = processSource(source);
  assertTrue(result.valid);
  assertIncludes(result.html, "<end-year>");
  assertIncludes(result.html, "<text>2015</text>");
});

test("timeline event date outside range", () => {
  const source = `timeline
year-start
2000
event
date
09-14-1945
year-end
2015`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  const validation = validate(ast);
  assertFalse(validation.valid);
  assertEqual(validation.errors[0].code, "TIMELINE_EVENT_OUT_OF_RANGE");
  assertIncludes(validation.errors[0].message, "1945");
  assertIncludes(validation.errors[0].message, "2000");
  assertIncludes(validation.errors[0].message, "2015");
});

test("calendar with year-month", () => {
  const source = `calendar
  year-month
    2024-03`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
});

test("comparison before/after schema", () => {
  const source = `comparison
  before
    Old approach.
  after
    New approach.`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
});

test("comparison entity / shared / unique schema", () => {
  const source = `comparison
entity
unique
Alpha only.
entity
unique
Beta only.
shared
Common ground.`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
});

test("comparison scenario / condition schema", () => {
  const source = `comparison
  scenario
    condition
      If A happens.
  scenario
    condition
      If B happens.`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
});

test("valid group entity trait example from GIF", () => {
  const source = `group
entity
trait
human
trait
male
entity
trait
human
trait
female`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);

  const html = compile(ast);
  assertIncludes(html, "<group>");
  assertIncludes(html, "<entity>");
  assertIncludes(html, "<trait>");
  assertIncludes(html, "<text>human</text>");
  assertIncludes(html, "<text>male</text>");
  assertIncludes(html, "<text>female</text>");
  assertIncludes(html, "</group>");
});

test("invalid group with only one entity", () => {
  const source = `group
entity
trait
human
trait
male`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  const validation = validate(ast);
  assertFalse(validation.valid);
  assertEqual(validation.errors[0].code, "INVALID_GROUP_SCHEMA");
  assertIncludes(validation.errors[0].message, "at least two entity children");
});

test("invalid group without shared trait value", () => {
  const source = `group
entity
trait
human
trait
male
entity
trait
canine
trait
female`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  const validation = validate(ast);
  assertFalse(validation.valid);
  assertEqual(validation.errors[0].code, "INVALID_GROUP_SCHEMA");
  assertIncludes(validation.errors[0].message, "sharing a common trait value");
});

test("trait without entity parent", () => {
  const source = `trait
human`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  const validation = validate(ast);
  assertFalse(validation.valid);
  assertEqual(validation.errors[0].code, "MISSING_REQUIRED_PARENT");
  assertEqual(validation.errors[0].element, "trait");
});

test("group shorthand alias grp", () => {
  const source = `grp
entity
trait
human
entity
trait
human`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
  assertTrue(findElement(ast, "group") != null);
});

test("media with image and caption", () => {
  const source = `media
  image
    /photo.png
  caption
    A sample photo.`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
});

test("reserved words used as normal text", () => {
  const source = `claim
Arguments aren't always unhealthy.`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  const claim = findElement(ast, "claim");
  assertIncludes(claim.children[0].value, "Arguments aren't always unhealthy.");
});

test("section title attribute", () => {
  const source = `section title="Background"
Some content.`;

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
title="Background"`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  const section = findElement(ast, "section");
  assertEqual(Object.keys(section.attributes).length, 0);
  assertEqual(section.children[0].value, 'title="Background"');
});

test("malformed attribute line is text not tag", () => {
  const source = `section
section title=Background`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  const section = findElement(ast, "section");
  assertEqual(section.children[0].value, "section title=Background");
});

test("non-reserved word line is text", () => {
  const source = `claim
hello`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  const claim = findElement(ast, "claim");
  assertEqual(claim.children[0].value, "hello");
});

test("processSource returns empty html when invalid", () => {
  const result = processSource(`evidence
x`);
  assertFalse(result.valid);
  assertEqual(result.html, "");
  assertMatch(result.validationErrors[0].message, /requires parent claim/);
});

test("legacy year-start alias normalizes to start-year", () => {
  const source = `timeline
  year-start
    2020
  year-end
    2024`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
  assertTrue(findElement(ast, "start-year") != null);
  assertTrue(findElement(ast, "end-year") != null);
});

test("legacy year-month alias normalizes to month", () => {
  const source = `calendar
  year-month
    2024-03`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
  assertTrue(findElement(ast, "month") != null);
});

test("shorthand tags from SHORTHAND.md", () => {
  const source = `arg
  claim
    evi
      Supported.`;

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
    input type="text"
  dropdown
    option
      A
    selection
      A
  button type="submit"
    Submit
  para
    Notes here.`;

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
  list
    item
      One
  footnote
    See also.`;

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
    column
      B`;

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
    /photo.png`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  assertTrue(validate(ast).valid);
  assertTrue(findElement(ast, "image") != null);
});

test("implicit close at EOF leaves no unclosed errors", () => {
  const source = `argument
  claim
    Nested content.`;

  const { errors } = parse(source);
  assertEqual(errors, []);
  assertFalse(errors.some((e) => e.code === "UNCLOSED_TAG"));
});

test("sibling tags share parent when prior tag has content", () => {
  const source = `argument
claim
First claim.
claim
Second claim.`;

  const { ast, errors } = parse(source);
  assertEqual(errors, []);
  const argument = findElement(ast, "argument");
  const claims = argument.children.filter((c) => c.type === "element" && c.name === "claim");
  assertEqual(claims.length, 2);
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

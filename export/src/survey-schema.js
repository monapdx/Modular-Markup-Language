/** Semantic survey schema and validation helpers. */

export const SURVEY_QUESTION_TYPES = [
  "single-choice", "multiple-choice", "rating", "text", "long-text",
];

const elements = (node, name) => node.children.filter(child => child.type === "element" && child.name === name);
const text = node => node.children.filter(child => child.type === "text").map(child => child.value.trim()).join("\n");

export function surveyQuestions(node) {
  return elements(node, "question").map((question, index) => ({
    node: question,
    id: question.attributes.id ?? `question-${index + 1}`,
    type: question.attributes.type ?? "",
    required: question.attributes.required === "true",
    min: Number(question.attributes.min),
    max: Number(question.attributes.max),
    prompt: elements(question, "prompt").map(text)[0] ?? "",
    options: elements(question, "option").map(text),
  }));
}

export function validateSurvey(node) {
  const errors = [];
  const add = (code, message, line = node.line, element = "survey") => errors.push({ code, message, line, element });
  for (const child of node.children) if (child.type === "element" && child.name !== "question")
    add("INVALID_SURVEY_CHILD", `${child.name} is not allowed inside survey`, child.line, child.name);
  const questions = surveyQuestions(node);
  if (!questions.length) add("MISSING_REQUIRED_CHILD", "survey requires at least one question");
  const ids = new Set();
  for (const q of questions) {
    const line = q.node.line;
    if (!SURVEY_QUESTION_TYPES.includes(q.type))
      add("INVALID_SURVEY_TYPE", `question type must be one of: ${SURVEY_QUESTION_TYPES.join(", ")}`, line, "question");
    if (!q.prompt.trim() || elements(q.node, "prompt").length !== 1)
      add("INVALID_SURVEY_PROMPT", "question requires exactly one nonempty prompt", line, "question");
    if (q.node.attributes.required != null && !["true", "false"].includes(q.node.attributes.required))
      add("INVALID_SURVEY_REQUIRED", 'question required must be "true" or "false"', line, "question");
    if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(q.id) || ids.has(q.id))
      add("INVALID_SURVEY_ID", `question id ${q.id} must be unique and start with a letter`, line, "question");
    ids.add(q.id);
    for (const child of q.node.children) if (child.type === "element" && !["prompt", "option"].includes(child.name))
      add("INVALID_SURVEY_CHILD", `${child.name} is not allowed inside question`, child.line, child.name);
    const choice = q.type === "single-choice" || q.type === "multiple-choice";
    if (choice && (q.options.length < 2 || q.options.some(option => !option) || new Set(q.options).size !== q.options.length))
      add("INVALID_SURVEY_OPTIONS", "choice question requires at least two distinct nonempty options", line, "question");
    if (!choice && q.options.length) add("INVALID_SURVEY_OPTIONS", `${q.type} question cannot have options`, line, "question");
    if (q.type === "rating") {
      if (!Number.isInteger(q.min) || !Number.isInteger(q.max) || q.min < 0 || q.max > 10 || q.max <= q.min)
        add("INVALID_SURVEY_RANGE", "rating question needs integer min and max from 0 to 10, with max greater than min", line, "question");
    } else if (q.node.attributes.min != null || q.node.attributes.max != null) {
      add("INVALID_SURVEY_RANGE", "min and max are only valid for rating questions", line, "question");
    }
  }
  return errors;
}

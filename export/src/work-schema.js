/** Descriptive records for creative works, separate from ebook content/export. */
const COMMON_FIELDS = ["title", "description", "release-year", "genre"];

export const WORK_FIELDS = {
  film: [...COMMON_FIELDS, "director"],
  song: [...COMMON_FIELDS, "artist", "album"],
  album: [...COMMON_FIELDS, "artist"],
  book: [...COMMON_FIELDS, "author", "publisher"],
  series: [...COMMON_FIELDS, "creator", "start-year", "end-year"],
  episode: [...COMMON_FIELDS, "season-number", "episode-number", "date"],
  game: [...COMMON_FIELDS, "creator", "publisher"],
  podcast: [...COMMON_FIELDS, "creator"],
};

export const WORK_TYPES = Object.keys(WORK_FIELDS);

/** Used by parser boundaries as well as validation to keep field rules in sync. */
export const WORK_FIELD_PARENTS = {};
for (const [type, fields] of Object.entries(WORK_FIELDS)) {
  for (const field of fields) (WORK_FIELD_PARENTS[field] ??= []).push(type);
}

const SINGLE_FIELDS = new Set([
  "title", "description", "release-year", "start-year", "end-year",
  "season-number", "episode-number", "date", "album",
]);

export function validateWork(node) {
  const errors = [];
  const add = (code, message, target = node) => errors.push({
    code, message, element: target.name, line: target.line,
  });
  const elements = node.children.filter(child => child.type === "element");
  const values = {};
  for (const child of node.children) {
    if (child.type === "text") {
      add("INVALID_WORK_CHILD", `${node.name} uses named fields; put its name inside title`);
      continue;
    }
    if (!WORK_FIELDS[node.name].includes(child.name)) {
      add("INVALID_WORK_CHILD", `${child.name} is not allowed inside ${node.name}`, child);
      continue;
    }
    const value = child.children.filter(item => item.type === "text").map(item => item.value.trim()).join("\n");
    if (!value || child.children.some(item => item.type === "element")) {
      add("INVALID_WORK_FIELD", `${child.name} requires a nonempty text value, without child elements`, child);
    }
    (values[child.name] ??= []).push(value);
    if (["release-year", "start-year", "end-year"].includes(child.name) && !/^\d{4}$/.test(value)) {
      add("INVALID_WORK_YEAR", `${child.name} must be a four-digit year`, child);
    }
    if (["season-number", "episode-number"].includes(child.name) &&
        (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) ||
         Number(value) < (child.name === "season-number" ? 0 : 1))) {
      add("INVALID_WORK_NUMBER", `${child.name} must be ${child.name === "season-number" ? "a nonnegative" : "a positive"} integer`, child);
    }
  }
  if (!elements.some(child => child.name === "title")) {
    add("MISSING_REQUIRED_CHILD", `${node.name} requires title`);
  }
  for (const [name, entries] of Object.entries(values)) {
    if (SINGLE_FIELDS.has(name) && entries.length > 1) {
      add("DUPLICATE_WORK_FIELD", `${node.name} allows only one ${name}`);
    }
  }
  const start = values["start-year"]?.[0], end = values["end-year"]?.[0];
  if (/^\d{4}$/.test(start ?? "") && /^\d{4}$/.test(end ?? "") && Number(start) > Number(end)) {
    add("INVALID_WORK_RANGE", "series start-year must not be after end-year");
  }
  return errors;
}

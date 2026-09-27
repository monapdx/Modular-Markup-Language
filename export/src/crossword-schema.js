/** Crossword schema helpers shared by validation and HTML compilation. */

export const CROSSWORD_ROOT_CHILDREN = ["across", "down", "across-clues", "down-clues"];
export const CROSSWORD_DIRECTION_CHILDREN = ["word", "first-letters", "word-lengths"];

const children = (node, name) => node.children.filter(child => child.type === "element" && child.name === name);
const content = node => node?.children.filter(child => child.type === "text").map(child => child.value.trim()).join("\n") ?? "";

/** Split comma-separated values, preserving commas inside coordinates and quoted clues. */
export function splitCrosswordList(value) {
  if (!value.trim()) return [];
  const fields = [];
  let field = "", depth = 0, quoted = false;
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char === '"') {
      if (quoted && value[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && char === '(') { depth++; field += char; }
    else if (!quoted && char === ')') { depth--; field += char; }
    else if (!quoted && depth === 0 && char === ',') { fields.push(field.trim()); field = ""; }
    else field += char;
  }
  fields.push(field.trim());
  return fields;
}

/** Coordinates are one-based (row,column); dimensions are columns x rows. */
export function readCrossword(node) {
  const dimensions = content(node).match(/^(\d+)\s*x\s*(\d+)$/i);
  const width = dimensions ? Number(dimensions[1]) : 0;
  const height = dimensions ? Number(dimensions[2]) : 0;
  const directions = {};
  for (const direction of ["across", "down"]) {
    const section = children(node, direction)[0];
    const values = name => splitCrosswordList(content(children(section ?? {children: []}, name)[0]));
    directions[direction] = {
      section,
      words: values("word"),
      starts: values("first-letters"),
      lengths: values("word-lengths"),
      clues: splitCrosswordList(content(children(node, `${direction}-clues`)[0])),
    };
  }
  return { width, height, directions };
}

export function crosswordEntries(model) {
  return ["across", "down"].flatMap(direction => {
    const group = model.directions[direction];
    return group.words.map((answer, i) => {
      const match = group.starts[i]?.match(/^\(\s*(\d+)\s*,\s*(\d+)\s*\)$/);
      return {
        direction, answer: answer.toUpperCase(), clue: group.clues[i] ?? "",
        length: Number(group.lengths[i]), row: match ? Number(match[1]) : 0,
        col: match ? Number(match[2]) : 0,
      };
    });
  });
}

export function validateCrossword(node) {
  const errors = [];
  const add = (code, message, line = node.line) => errors.push({ code, element: "crossword-grid", line, message });
  const model = readCrossword(node);
  if (!model.width || !model.height || model.width > 50 || model.height > 50)
    add("INVALID_CROSSWORD_DIMENSIONS", "crossword-grid needs positive dimensions up to 50 x 50 (columns x rows)");
  for (const child of node.children.filter(child => child.type === "element")) {
    if (!CROSSWORD_ROOT_CHILDREN.includes(child.name)) add("INVALID_CROSSWORD_CHILD", `${child.name} is not allowed inside crossword-grid`, child.line);
  }
  const occupied = new Map();
  const starts = new Set();
  let total = 0;
  for (const direction of ["across", "down"]) {
    const group = model.directions[direction];
    if (!group.section || children(node, direction).length !== 1) add("INVALID_CROSSWORD_STRUCTURE", `crossword-grid requires exactly one ${direction} section`);
    if (children(node, `${direction}-clues`).length !== 1) add("INVALID_CROSSWORD_STRUCTURE", `crossword-grid requires exactly one ${direction}-clues tag`);
    if (group.section) {
      for (const name of CROSSWORD_DIRECTION_CHILDREN) if (children(group.section, name).length !== 1)
        add("INVALID_CROSSWORD_STRUCTURE", `${direction} requires exactly one ${name} tag`, group.section.line);
      for (const child of group.section.children.filter(child => child.type === "element"))
        if (!CROSSWORD_DIRECTION_CHILDREN.includes(child.name)) add("INVALID_CROSSWORD_CHILD", `${child.name} is not allowed inside ${direction}`, child.line);
    }
    const n = group.words.length;
    total += n;
    if (group.starts.length !== n || group.lengths.length !== n || group.clues.length !== n)
      add("CROSSWORD_LIST_MISMATCH", `${direction} word, first-letters, word-lengths, and ${direction}-clues lists must have the same number of items`, group.section?.line);
    for (let i = 0; i < n; i++) {
      const answer = group.words[i].toUpperCase(), rawLength = group.lengths[i], coordinate = group.starts[i];
      const match = coordinate?.match(/^\(\s*(\d+)\s*,\s*(\d+)\s*\)$/);
      if (!/^[A-Z]+$/.test(answer)) add("INVALID_CROSSWORD_WORD", `${direction} word ${i + 1} must contain A–Z letters`, group.section?.line);
      if (!/^[1-9]\d*$/.test(rawLength ?? "") || Number(rawLength) !== answer.length)
        add("INVALID_CROSSWORD_LENGTH", `${direction} word ${i + 1} length must equal its answer length`, group.section?.line);
      if (!match) { add("INVALID_CROSSWORD_COORDINATE", `${direction} word ${i + 1} needs a (row,column) starting square`, group.section?.line); continue; }
      const row = Number(match[1]), col = Number(match[2]);
      if (row < 1 || col < 1 || row + (direction === "down" ? answer.length - 1 : 0) > model.height || col + (direction === "across" ? answer.length - 1 : 0) > model.width) {
        add("CROSSWORD_OUT_OF_BOUNDS", `${direction} word ${i + 1} extends outside the grid`, group.section?.line); continue;
      }
      const startKey = `${direction}:${row},${col}`;
      if (starts.has(startKey)) add("DUPLICATE_CROSSWORD_START", `${direction} has two words starting at (${row},${col})`, group.section?.line);
      starts.add(startKey);
      for (let j = 0; j < answer.length; j++) {
        const square = `${row + (direction === "down" ? j : 0)},${col + (direction === "across" ? j : 0)}`;
        const previous = occupied.get(square);
        if (previous && previous.letter !== answer[j]) add("CROSSWORD_CROSSING_CONFLICT", `crossing at (${square}) contains both ${previous.letter} and ${answer[j]}`, group.section?.line);
        else if (previous?.directions.has(direction)) add("CROSSWORD_OVERLAP", `${direction} words overlap at (${square})`, group.section?.line);
        else if (previous) previous.directions.add(direction);
        else occupied.set(square, {letter: answer[j], directions: new Set([direction])});
      }
    }
  }
  if (!total) add("EMPTY_CROSSWORD", "crossword-grid requires at least one word");
  return errors;
}

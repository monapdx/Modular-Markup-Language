import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exportRoot = path.join(__dirname, "..", "export");
const blankRoot = path.join(__dirname, "..", "export-blank");

/**
 * Remove element text content while preserving tags (with attributes) and
 * whitespace-only runs between tags.
 * @param {string} html
 * @returns {string}
 */
export function stripHtmlContent(html) {
  /** @type {string[]} */
  const parts = [];
  let i = 0;

  while (i < html.length) {
    if (html[i] === "<") {
      let j = i + 1;
      let inQuote = null;

      while (j < html.length) {
        const c = html[j];
        if (inQuote) {
          if (c === inQuote) inQuote = null;
        } else if (c === '"' || c === "'") {
          inQuote = c;
        } else if (c === ">") {
          j++;
          break;
        }
        j++;
      }

      parts.push(html.slice(i, j));
      i = j;
      continue;
    }

    let j = i;
    while (j < html.length && html[j] !== "<") {
      j++;
    }

    const segment = html.slice(i, j);
    if (/^\s*$/.test(segment)) {
      parts.push(segment);
    }

    i = j;
  }

  return parts.join("");
}

/**
 * @param {string} dir
 * @returns {string[]}
 */
function walkHtmlFiles(dir) {
  /** @type {string[]} */
  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      files.push(fullPath);
    }
  }

  return files;
}

const htmlFiles = walkHtmlFiles(exportRoot);

for (const sourcePath of htmlFiles) {
  const relativePath = path.relative(exportRoot, sourcePath);
  const targetPath = path.join(blankRoot, relativePath);
  const source = fs.readFileSync(sourcePath, "utf8");
  const blank = stripHtmlContent(source);

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, blank, "utf8");
  console.log(`blank: ${relativePath}`);
}

console.log(`\nCreated ${htmlFiles.length} blank HTML file(s) in export-blank/`);

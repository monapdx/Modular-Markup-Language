import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.join(__dirname, "..", "export-blank", "DOCS");
const notesJsonPath = path.join(docsDir, "notes.json");
const notesHtmlPath = path.join(docsDir, "NOTES.html");

/**
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * @param {string} iso
 * @returns {string}
 */
function formatNoteDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * @param {string} text
 * @param {number} max
 * @returns {string}
 */
function previewText(text, max = 160) {
  const trimmed = String(text).trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

/**
 * @param {object[]} notes
 * @returns {string}
 */
function renderNotesListHtml(notes) {
  if (notes.length === 0) {
    return `<div class="notes-empty" id="notes-empty">
        <p>No notes yet.</p>
        <p><a class="nav-link" href="SCRATCHPAD.html">Write your first note</a></p>
      </div>`;
  }

  const items = notes
    .map((note) => {
      const tagsHtml =
        note.tags && note.tags.length > 0
          ? `<div class="note-tags">${note.tags
              .map((tag) => `<span class="note-tag">#${escapeHtml(tag)}</span>`)
              .join("")}</div>`
          : "";

      return `<li class="note-card" data-note-id="${escapeHtml(note.id)}">
          <h2>${escapeHtml(note.title)}</h2>
          <div class="date">Created ${escapeHtml(formatNoteDate(note.createdAt))}</div>
          ${tagsHtml}
          <p class="preview">${escapeHtml(previewText(note.content))}</p>
          <div class="note-actions">
            <a class="btn btn-primary" href="SCRATCHPAD.html?id=${encodeURIComponent(note.id)}">Edit</a>
            <button type="button" class="btn btn-danger" data-delete="${escapeHtml(note.id)}">Delete</button>
          </div>
        </li>`;
    })
    .join("\n        ");

  return `<ul class="notes-list" id="notes-list">\n        ${items}\n      </ul>`;
}

/**
 * @param {object[]} notes
 * @returns {string}
 */
export function buildNotesHtml(notes) {
  const countText =
    notes.length === 0
      ? "No notes saved yet."
      : `${notes.length} note${notes.length === 1 ? "" : "s"} saved.`;

  const embeddedJson = JSON.stringify(notes, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NOTES</title>
  <link rel="stylesheet" href="../style.css">
  <link rel="stylesheet" href="notes-ui.css">
</head>
<body class="theme-light">
  <main class="markdown-preview-view markdown-rendered">
    <div class="metadata-container">
      <div class="metadata-property">
        <span class="metadata-property-key">title</span>
        <span class="metadata-property-value">NOTES</span>
      </div>
      <div class="metadata-property">
        <span class="metadata-property-key">category</span>
        <span class="metadata-property-value">notes</span>
      </div>
    </div>

    <section class="notes-page">
      <div class="page-header">
        <h1 class="page-title">Saved Notes</h1>
        <a class="nav-link" href="SCRATCHPAD.html">New note</a>
      </div>

      <p class="count" id="notes-count">${escapeHtml(countText)}</p>
      <div id="notes-container">
      ${renderNotesListHtml(notes)}
      </div>
    </section>
  </main>

  <!-- Notes embedded in this document (updated when you save via the notes server) -->
  <script type="application/json" id="mml-notes-data">${embeddedJson}</script>
  <script src="notes-storage.js"></script>
  <script src="notes-page.js"></script>
</body>
</html>
`;
}

/**
 * @returns {object[]}
 */
export function readNotesJson() {
  if (!fs.existsSync(notesJsonPath)) {
    return [];
  }
  const raw = fs.readFileSync(notesJsonPath, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

/**
 * @param {object[]} notes
 */
export function writeNotesJson(notes) {
  fs.writeFileSync(notesJsonPath, JSON.stringify(notes, null, 2) + "\n", "utf8");
}

/**
 * @param {object[]} notes
 */
export function writeNotesHtml(notes) {
  fs.writeFileSync(notesHtmlPath, buildNotesHtml(notes), "utf8");
}

/**
 * @param {object[]} notes
 */
export function syncNotesFiles(notes) {
  writeNotesJson(notes);
  writeNotesHtml(notes);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const notes = readNotesJson();
  writeNotesHtml(notes);
  console.log(`Built NOTES.html with ${notes.length} note(s).`);
}

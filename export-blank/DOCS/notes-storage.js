/**
 * MML Notes — download-only: each save downloads notes/{id}.html;
 * index lives in localStorage and NOTES.html links to those files.
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "mml-scratchpad-notes";
  var NOTES_DIR = "notes";
  var notesCache = [];

  function storageAvailable() {
    try {
      var test = "__mml_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (err) {
      return false;
    }
  }

  function readLocalNotes() {
    if (!storageAvailable()) return [];
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function writeLocalNotes(notes) {
    if (!storageAvailable()) {
      throw new Error("Storage is not available in this browser context.");
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    notesCache = notes;
  }

  function init() {
    notesCache = readLocalNotes();
    return Promise.resolve();
  }

  var readyPromise = init();

  function newId() {
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return global.crypto.randomUUID();
    }
    return "note-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
  }

  function noteFilename(id) {
    return id + ".html";
  }

  function noteHref(id) {
    return NOTES_DIR + "/" + noteFilename(id);
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatNoteDate(iso) {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function parseTags(text) {
    var matches = text.match(/#[\w-]+/g);
    if (!matches) return [];
    var tags = matches.map(function (tag) {
      return tag.slice(1).toLowerCase();
    });
    return tags.filter(function (tag, index) {
      return tags.indexOf(tag) === index;
    });
  }

  /**
   * @param {object} note
   * @returns {string}
   */
  function buildNoteFileHtml(note) {
    var tagsHtml =
      note.tags.length > 0
        ? note.tags
            .map(function (tag) {
              return '<span class="note-tag">#' + escapeHtml(tag) + "</span>";
            })
            .join("")
        : "";

    return (
      "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n" +
      "  <meta charset=\"UTF-8\">\n" +
      "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
      "  <title>" +
      escapeHtml(note.title) +
      "</title>\n" +
      '  <link rel="stylesheet" href="../style.css">\n' +
      '  <link rel="stylesheet" href="../notes-ui.css">\n' +
      '  <link rel="stylesheet" href="../doc-editor.css">\n' +
      "</head>\n<body class=\"theme-light\" data-doc-editor-target=\"note-content\">\n" +
      '  <main class="markdown-preview-view markdown-rendered">\n' +
      '    <section class="notes-page">\n' +
      '      <div class="page-header">\n' +
      "        <h1 class=\"page-title\">" +
      escapeHtml(note.title) +
      "</h1>\n" +
      '        <a class="nav-link" href="../NOTES.html">All notes</a>\n' +
      "      </div>\n" +
      '      <div class="date">Created ' +
      escapeHtml(formatNoteDate(note.createdAt)) +
      "</div>\n" +
      (tagsHtml ? '      <div class="note-tags">' + tagsHtml + "</div>\n" : "") +
      '      <div class="note-card note-content markdown-rendered" id="note-content">\n' +
      note.content +
      "\n      </div>\n" +
      "      </div>\n" +
      '      <p class="tag-hint"><a href="../SCRATCHPAD.html?id=' +
      encodeURIComponent(note.id) +
      '">Edit in scratchpad</a></p>\n' +
      "    </section>\n" +
      "  </main>\n" +
      '  <script src="../doc-editor.js"></script>\n' +
      "</body>\n</html>\n"
    );
  }

  /**
   * @param {object[]} notes
   * @returns {string}
   */
  function buildIndexFileHtml(notes) {
    var countText =
      notes.length === 0
        ? "No notes saved yet."
        : notes.length + " note" + (notes.length === 1 ? "" : "s") + " saved.";

    var listHtml;
    if (notes.length === 0) {
      listHtml =
        '<div class="notes-empty"><p>No notes yet.</p><p><a class="nav-link" href="SCRATCHPAD.html">Write your first note</a></p></div>';
    } else {
      listHtml =
        '<ul class="notes-list">\n' +
        notes
          .map(function (note) {
            var tagsHtml =
              note.tags.length > 0
                ? '<div class="note-tags">' +
                  note.tags
                    .map(function (tag) {
                      return '<span class="note-tag">#' + escapeHtml(tag) + "</span>";
                    })
                    .join("") +
                  "</div>"
                : "";
            var plain = note.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
            var preview =
              plain.length > 160
                ? escapeHtml(plain.slice(0, 160)) + "…"
                : escapeHtml(plain);
            return (
              '  <li class="note-card">\n' +
              '    <h2><a href="' +
              escapeHtml(noteHref(note.id)) +
              '">' +
              escapeHtml(note.title) +
              "</a></h2>\n" +
              '    <div class="date">Created ' +
              escapeHtml(formatNoteDate(note.createdAt)) +
              "</div>\n" +
              tagsHtml +
              '    <p class="preview">' +
              preview +
              "</p>\n" +
              '    <div class="note-actions">\n' +
              '      <a class="btn btn-primary" href="' +
              escapeHtml(noteHref(note.id)) +
              '">Open</a>\n' +
              '      <a class="btn" href="SCRATCHPAD.html?id=' +
              encodeURIComponent(note.id) +
              '">Edit</a>\n' +
              "    </div>\n" +
              "  </li>"
            );
          })
          .join("\n") +
        "\n</ul>";
    }

    return (
      "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n" +
      "  <meta charset=\"UTF-8\">\n" +
      "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
      "  <title>NOTES</title>\n" +
      '  <link rel="stylesheet" href="../style.css">\n' +
      '  <link rel="stylesheet" href="notes-ui.css">\n' +
      "</head>\n<body class=\"theme-light\">\n" +
      '  <main class="markdown-preview-view markdown-rendered">\n' +
      '    <section class="notes-page">\n' +
      '      <div class="page-header">\n' +
      '        <h1 class="page-title">Saved Notes</h1>\n' +
      '        <a class="nav-link" href="SCRATCHPAD.html">New note</a>\n' +
      "      </div>\n" +
      '      <p class="count">' +
      escapeHtml(countText) +
      "</p>\n" +
      '      <div id="notes-container">\n' +
      listHtml +
      "\n      </div>\n" +
      "    </section>\n" +
      "  </main>\n</body>\n</html>\n"
    );
  }

  function downloadTextFile(filename, content, mime) {
    var blob = new Blob([content], { type: mime || "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function downloadNoteFile(note) {
    downloadTextFile(noteFilename(note.id), buildNoteFileHtml(note));
  }

  function downloadIndexFile() {
    downloadTextFile("NOTES.html", buildIndexFileHtml(notesCache));
  }

  function getNotes() {
    return notesCache.slice();
  }

  function getNoteById(id) {
    for (var i = 0; i < notesCache.length; i++) {
      if (notesCache[i].id === id) return notesCache[i];
    }
    return undefined;
  }

  function saveNote(data) {
    return readyPromise.then(function () {
      var notes = notesCache.slice();
      var now = new Date().toISOString();
      var title = (data.title || "").trim() || "Untitled";
      var result;

      if (data.id) {
        var index = -1;
        for (var i = 0; i < notes.length; i++) {
          if (notes[i].id === data.id) index = i;
        }
        if (index === -1) {
          throw new Error("Note not found");
        }
        result = {
          id: notes[index].id,
          title: title,
          content: data.content || "",
          tags: data.tags || [],
          createdAt: notes[index].createdAt,
          updatedAt: now,
          filename: noteFilename(notes[index].id),
        };
        notes[index] = result;
      } else {
        var id = newId();
        result = {
          id: id,
          title: title,
          content: data.content || "",
          tags: data.tags || [],
          createdAt: now,
          updatedAt: now,
          filename: noteFilename(id),
        };
        notes.unshift(result);
      }

      writeLocalNotes(notes);
      downloadNoteFile(result);
      return result;
    });
  }

  function deleteNote(id) {
    return readyPromise.then(function () {
      var notes = notesCache.filter(function (note) {
        return note.id !== id;
      });
      if (notes.length === notesCache.length) return false;
      writeLocalNotes(notes);
      return true;
    });
  }

  global.MMLNotes = {
    ready: readyPromise,
    storageAvailable: storageAvailable,
    getNotes: getNotes,
    getNoteById: getNoteById,
    parseTags: parseTags,
    saveNote: saveNote,
    deleteNote: deleteNote,
    formatNoteDate: formatNoteDate,
    noteHref: noteHref,
    downloadIndexFile: downloadIndexFile,
    downloadNoteFile: downloadNoteFile,
  };
})(window);

/**
 * NOTES.html — live index from localStorage + links to notes/*.html files.
 */
(function () {
  "use strict";

  var notesApi = window.MMLNotes;
  var container = document.getElementById("notes-container");
  var countEl = document.getElementById("notes-count");

  if (!notesApi || !container) return;

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function previewText(text, max) {
    var trimmed = String(text)
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (trimmed.length <= max) return trimmed;
    return trimmed.slice(0, max) + "…";
  }

  function renderNotes() {
    var saved = notesApi.getNotes();
    countEl.textContent =
      saved.length === 0
        ? "No notes saved yet."
        : saved.length + " note" + (saved.length === 1 ? "" : "s") + " saved.";

    if (saved.length === 0) {
      container.innerHTML =
        '<div class="notes-empty"><p>No notes yet.</p><p><a class="nav-link" href="SCRATCHPAD.html">Write your first note</a></p></div>';
      return;
    }

    var list = document.createElement("ul");
    list.className = "notes-list";

    saved.forEach(function (note) {
      var li = document.createElement("li");
      li.className = "note-card";
      var href = notesApi.noteHref(note.id);

      var tagsHtml = "";
      if (note.tags.length > 0) {
        tagsHtml =
          '<div class="note-tags">' +
          note.tags
            .map(function (tag) {
              return '<span class="note-tag">#' + escapeHtml(tag) + "</span>";
            })
            .join("") +
          "</div>";
      }

      li.innerHTML =
        "<h2><a href=\"" +
        escapeHtml(href) +
        '">' +
        escapeHtml(note.title) +
        "</a></h2>" +
        '<div class="date">Created ' +
        escapeHtml(notesApi.formatNoteDate(note.createdAt)) +
        "</div>" +
        tagsHtml +
        '<p class="preview">' +
        escapeHtml(previewText(note.content, 160)) +
        "</p>" +
        '<div class="note-actions">' +
        '<a class="btn btn-primary" href="' +
        escapeHtml(href) +
        '">Open</a>' +
        '<a class="btn" href="SCRATCHPAD.html?id=' +
        encodeURIComponent(note.id) +
        '">Edit</a>' +
        '<button type="button" class="btn btn-danger" data-delete="' +
        escapeHtml(note.id) +
        '">Remove from list</button>' +
        "</div>";

      list.appendChild(li);
    });

    container.innerHTML = "";
    container.appendChild(list);

    container.querySelectorAll("[data-delete]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-delete");
        var match = saved.filter(function (n) {
          return n.id === id;
        })[0];
        var label = match ? match.title : "this note";
        if (
          !confirm(
            'Remove "' +
              label +
              '" from the index? (The downloaded .html file on disk is not deleted.)'
          )
        ) {
          return;
        }
        notesApi.deleteNote(id).then(function () {
          renderNotes();
        });
      });
    });
  }

  var downloadIndexBtn = document.getElementById("download-index-btn");
  if (downloadIndexBtn) {
    downloadIndexBtn.addEventListener("click", function () {
      notesApi.downloadIndexFile();
    });
  }

  notesApi.ready.then(renderNotes);
})();

/**
 * doc-editor.js — toolbar for adding styled document elements to DOCS pages.
 */
(function () {
  "use strict";

  if (document.body && document.body.hasAttribute("data-no-doc-editor")) return;

  var targetId = document.body && document.body.getAttribute("data-doc-editor-target");
  var pageMain = document.querySelector("main.markdown-preview-view, main.markdown-rendered, main");
  var container = targetId ? document.getElementById(targetId) : pageMain;

  if (!container) return;

  document.body.classList.add("doc-editor-active");

  var modalOverlay = null;
  var modalTitle = null;
  var modalBody = null;
  var modalActions = null;
  var onModalConfirm = null;
  var contentRoot = null;

  function createEl(tag, className, attrs) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === "text") {
          el.textContent = attrs[key];
        } else if (key === "html") {
          el.innerHTML = attrs[key];
        } else {
          el.setAttribute(key, attrs[key]);
        }
      });
    }
    return el;
  }

  function ensureContentRoot() {
    if (contentRoot) return contentRoot;
    if (targetId) {
      contentRoot = container;
      return contentRoot;
    }

    var existing = pageMain && pageMain.querySelector("#doc-content");
    if (existing) {
      contentRoot = existing;
      return contentRoot;
    }

    var root = createEl("div");
    root.id = "doc-content";
    var toMove = [];

    Array.prototype.forEach.call(pageMain.childNodes, function (node) {
      if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains("metadata-container")) {
        return;
      }
      if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) {
        return;
      }
      toMove.push(node);
    });

    toMove.forEach(function (node) {
      root.appendChild(node);
    });
    pageMain.appendChild(root);
    contentRoot = root;
    return contentRoot;
  }

  function appendToContent(node) {
    ensureContentRoot().appendChild(node);
    return node;
  }

  function scrollToNode(node) {
    if (!node || !node.scrollIntoView) return;
    node.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function makeEditable(el) {
    el.classList.add("doc-inserted");
    el.setAttribute("contenteditable", "true");
    el.setAttribute("spellcheck", "true");
    return el;
  }

  function getMetadataContainer() {
    var host = pageMain || container;
    var meta = host.querySelector(".metadata-container");
    if (meta) return meta;
    meta = createEl("div", "metadata-container");
    host.insertBefore(meta, host.firstChild);
    return meta;
  }

  function ensureTaskList() {
    var root = ensureContentRoot();
    var list = root.querySelector("ul.contains-task-list");
    if (list) return list;
    list = createEl("ul", "contains-task-list");
    appendToContent(list);
    return list;
  }

  function findTagsParagraph() {
    var root = ensureContentRoot();
    var paragraphs = root.querySelectorAll("p");
    for (var i = paragraphs.length - 1; i >= 0; i--) {
      if (paragraphs[i].querySelector("span.tag")) {
        return paragraphs[i];
      }
    }
    return null;
  }

  function openModal(title, bodyNodes, confirmLabel, onConfirm) {
    if (!modalOverlay) {
      modalOverlay = createEl("div", "modal-overlay", {
        role: "dialog",
        "aria-modal": "true",
      });
      var modal = createEl("div", "modal");
      modalTitle = createEl("h2");
      modalBody = createEl("div");
      modalActions = createEl("div", "modal-actions");
      modal.appendChild(modalTitle);
      modal.appendChild(modalBody);
      modal.appendChild(modalActions);
      modalOverlay.appendChild(modal);

      modalOverlay.addEventListener("click", function (e) {
        if (e.target === modalOverlay) closeModal();
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && modalOverlay.classList.contains("open")) {
          closeModal();
        }
      });

      document.body.appendChild(modalOverlay);
    }

    modalTitle.textContent = title;
    modalBody.innerHTML = "";
    bodyNodes.forEach(function (node) {
      modalBody.appendChild(node);
    });
    modalActions.innerHTML = "";

    var cancelBtn = createEl("button", "btn", { type: "button", text: "Cancel" });
    cancelBtn.addEventListener("click", closeModal);
    modalActions.appendChild(cancelBtn);

    var confirmBtn = createEl("button", "btn btn-primary", {
      type: "button",
      text: confirmLabel || "Add",
    });
    confirmBtn.addEventListener("click", function () {
      if (!onModalConfirm) return;
      var keepOpen = onModalConfirm() === false;
      if (!keepOpen) closeModal();
    });
    modalActions.appendChild(confirmBtn);

    onModalConfirm = onConfirm;
    modalOverlay.classList.add("open");

    var focusable = modalBody.querySelector("textarea, input");
    if (focusable) focusable.focus();
  }

  function closeModal() {
    if (modalOverlay) modalOverlay.classList.remove("open");
    onModalConfirm = null;
  }

  function textModal(title, placeholder, onSave) {
    var textarea = createEl("textarea", "doc-textarea", {
      placeholder: placeholder || "",
    });
    openModal(title, [textarea], "Save", function () {
      if (!onSave(textarea.value)) return false;
    });
  }

  function fieldInput(labelText, placeholder, type) {
    var wrap = createEl("div", "doc-modal-field");
    var label = createEl("label", null, { text: labelText });
    var input = createEl("input", null, {
      type: type || "text",
      placeholder: placeholder || "",
    });
    wrap.appendChild(label);
    wrap.appendChild(input);
    return { wrap: wrap, input: input };
  }

  function parseTagList(raw) {
    return String(raw)
      .split(/[,\s]+/)
      .map(function (part) {
        return part.replace(/^#/, "").trim();
      })
      .filter(Boolean);
  }

  function addHeading(level) {
    textModal("Heading " + level, "Enter heading text…", function (text) {
      if (!text.trim()) return false;
      var h = makeEditable(createEl("h" + level));
      h.textContent = text.trim();
      appendToContent(h);
      scrollToNode(h);
    });
  }

  function addParagraph() {
    textModal("Paragraph", "Enter paragraph text…", function (text) {
      if (!text.trim()) return false;
      var p = makeEditable(createEl("p"));
      p.textContent = text.trim();
      appendToContent(p);
      scrollToNode(p);
    });
  }

  function addLink() {
    var labelField = fieldInput("Link text", "Display text");
    var urlField = fieldInput("URL", "https://… or ./page.html");
    var internalWrap = createEl("div", "doc-modal-field");
    var internalLabel = createEl("label");
    var internalCheck = createEl("input", null, { type: "checkbox" });
    internalLabel.appendChild(internalCheck);
    internalLabel.appendChild(document.createTextNode(" Internal link style"));
    internalWrap.appendChild(internalLabel);

    openModal(
      "Add link",
      [labelField.wrap, urlField.wrap, internalWrap],
      "Add link",
      function () {
        var label = labelField.input.value.trim();
        var href = urlField.input.value.trim();
        if (!label && !href) return false;
        var a = createEl("a", internalCheck.checked ? "internal-link" : null, {
          href: href || "#",
        });
        a.textContent = label || href;
        var p = createEl("p");
        p.appendChild(a);
        appendToContent(p);
        scrollToNode(p);
      }
    );
  }

  function addTags() {
    var tagsField = fieldInput("Tags", "#ideas, #draft, #mml");
    var hint = createEl("p", "doc-modal-hint", {
      text: "Separate tags with commas or spaces. A leading # is optional.",
    });
    openModal("Add tags", [tagsField.wrap, hint], "Add tags", function () {
      var tags = parseTagList(tagsField.input.value);
      if (tags.length === 0) return false;

      var row = findTagsParagraph();
      if (!row) {
        row = createEl("p");
        appendToContent(row);
      }

      tags.forEach(function (tag) {
        if (row.childNodes.length > 0) {
          row.appendChild(document.createTextNode(" "));
        }
        row.appendChild(createEl("span", "tag", { text: "#" + tag }));
      });

      scrollToNode(row);
    });
  }

  function addFrontMatterProperty() {
    var keyField = fieldInput("Property name", "title");
    var valueField = fieldInput("Property value", "value");
    openModal(
      "Add front matter property",
      [keyField.wrap, valueField.wrap],
      "Add property",
      function () {
        var key = keyField.input.value.trim();
        var value = valueField.input.value.trim();
        if (!key && !value) return false;
        var meta = getMetadataContainer();
        var row = createEl("div", "metadata-property");
        var keyEl = makeEditable(createEl("span", "metadata-property-key"));
        keyEl.textContent = key;
        var valueEl = makeEditable(createEl("span", "metadata-property-value"));
        valueEl.textContent = value;
        row.appendChild(keyEl);
        row.appendChild(valueEl);
        meta.appendChild(row);
      }
    );
  }

  function wireChecklistCheckbox(checkbox, li) {
    function syncChecked() {
      li.classList.toggle("is-checked", checkbox.checked);
    }
    checkbox.addEventListener("change", syncChecked);
    syncChecked();
  }

  function addChecklistItem() {
    var list = ensureTaskList();
    var li = createEl("li", "task-list-item");
    var checkbox = createEl("input", "task-list-item-checkbox", { type: "checkbox" });
    var text = makeEditable(createEl("span", "doc-editor-checklist-text"));
    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(" "));
    li.appendChild(text);
    wireChecklistCheckbox(checkbox, li);
    list.appendChild(li);
    text.focus();
  }

  function addListItem(ordered) {
    var root = ensureContentRoot();
    var selector = ordered ? "ol.doc-editor-list" : "ul.doc-editor-list";
    var list = root.querySelector(selector);
    if (!list) {
      list = createEl(ordered ? "ol" : "ul", "doc-editor-list");
      appendToContent(list);
    }
    var li = makeEditable(createEl("li"));
    li.textContent = "List item";
    list.appendChild(li);
    li.focus();
  }

  function addBlockquote() {
    textModal("Blockquote", "Enter quote text…", function (text) {
      if (!text.trim()) return false;
      var bq = createEl("blockquote");
      var p = makeEditable(createEl("p"));
      p.textContent = text.trim();
      bq.appendChild(p);
      appendToContent(bq);
      scrollToNode(bq);
    });
  }

  function addCodeBlock() {
    textModal("Code block", "Enter code…", function (text) {
      var pre = createEl("pre");
      var code = createEl("code");
      code.textContent = text;
      pre.appendChild(code);
      appendToContent(pre);
      scrollToNode(pre);
    });
  }

  function addCallout() {
    var typeField = fieldInput("Callout type", "note, tip, warning, or danger");
    typeField.input.value = "note";
    var bodyField = fieldInput("Title", "Callout title");
    openModal(
      "Add callout",
      [typeField.wrap, bodyField.wrap],
      "Add callout",
      function () {
        var type = (typeField.input.value.trim() || "note").toLowerCase();
        var title = bodyField.input.value.trim() || "Note";
        var callout = createEl("div", "callout", { "data-callout": type });
        var titleEl = createEl("div", "callout-title", { text: title });
        var content = makeEditable(createEl("div", "callout-content"));
        callout.appendChild(titleEl);
        callout.appendChild(content);
        appendToContent(callout);
        content.focus();
      }
    );
  }

  function addTable() {
    var rowsField = fieldInput("Rows", "3", "number");
    rowsField.input.value = "3";
    var colsField = fieldInput("Columns", "3", "number");
    colsField.input.value = "3";
    var headerCheck = createEl("input", null, { type: "checkbox", checked: "checked" });
    var headerWrap = createEl("div", "doc-modal-field");
    var headerLabel = createEl("label");
    headerLabel.appendChild(headerCheck);
    headerLabel.appendChild(document.createTextNode(" First row is header"));
    headerWrap.appendChild(headerLabel);

    openModal(
      "Insert table",
      [rowsField.wrap, colsField.wrap, headerWrap],
      "Insert table",
      function () {
        var rows = Math.max(1, parseInt(rowsField.input.value, 10) || 1);
        var cols = Math.max(1, parseInt(colsField.input.value, 10) || 1);
        var withHeader = headerCheck.checked;
        var table = createEl("table", "doc-editor-table");
        var tbody = createEl("tbody");

        for (var r = 0; r < rows; r++) {
          var tr = createEl("tr");
          for (var c = 0; c < cols; c++) {
            var isHeader = withHeader && r === 0;
            var cell = createEl(isHeader ? "th" : "td", null, {
              contenteditable: "true",
              spellcheck: "true",
            });
            cell.textContent = isHeader ? "Header " + (c + 1) : "";
            tr.appendChild(cell);
          }
          tbody.appendChild(tr);
        }

        table.appendChild(tbody);
        appendToContent(table);

        var firstCell = table.querySelector("td, th");
        if (firstCell) firstCell.focus();
      }
    );
  }

  function addHorizontalRule() {
    var hr = createEl("hr");
    appendToContent(hr);
    scrollToNode(hr);
  }

  function addImage() {
    var altField = fieldInput("Alt text", "Description");
    var srcField = fieldInput("Image URL", "https://…");
    openModal("Add image", [altField.wrap, srcField.wrap], "Add image", function () {
      var src = srcField.input.value.trim();
      if (!src) return false;
      var img = createEl("img", null, {
        src: src,
        alt: altField.input.value.trim(),
      });
      appendToContent(img);
      scrollToNode(img);
    });
  }

  function makeButton(label, handler) {
    var btn = createEl("button", "btn", { type: "button", text: label });
    btn.addEventListener("click", handler);
    return btn;
  }

  function makeGroup(buttons) {
    var group = createEl("div", "btn-group");
    buttons.forEach(function (b) {
      group.appendChild(b);
    });
    return group;
  }

  ensureContentRoot();

  var toolbar = createEl("div", "doc-editor-toolbar");
  toolbar.setAttribute("role", "toolbar");
  toolbar.setAttribute("aria-label", "Add document elements");

  var inner = createEl("div", "doc-editor-toolbar-inner");
  inner.appendChild(createEl("span", "doc-editor-toolbar-label", { text: "Insert" }));

  inner.appendChild(
    makeGroup([
      makeButton("H1", function () {
        addHeading(1);
      }),
      makeButton("H2", function () {
        addHeading(2);
      }),
      makeButton("H3", function () {
        addHeading(3);
      }),
      makeButton("Paragraph", addParagraph),
    ])
  );

  inner.appendChild(
    makeGroup([
      makeButton("Link", addLink),
      makeButton("Tags", addTags),
      makeButton("Property", addFrontMatterProperty),
    ])
  );

  inner.appendChild(
    makeGroup([
      makeButton("Checklist", addChecklistItem),
      makeButton("Bullet", function () {
        addListItem(false);
      }),
      makeButton("Numbered", function () {
        addListItem(true);
      }),
    ])
  );

  inner.appendChild(
    makeGroup([
      makeButton("Quote", addBlockquote),
      makeButton("Code", addCodeBlock),
      makeButton("Callout", addCallout),
    ])
  );

  inner.appendChild(
    makeGroup([
      makeButton("Table", addTable),
      makeButton("HR", addHorizontalRule),
      makeButton("Image", addImage),
    ])
  );

  toolbar.appendChild(inner);
  document.body.appendChild(toolbar);

  var editableHost = pageMain || container;
  editableHost.querySelectorAll(".metadata-property-key, .metadata-property-value").forEach(function (el) {
    if (!el.getAttribute("contenteditable")) {
      makeEditable(el);
    }
  });

  ensureContentRoot().querySelectorAll("li.task-list-item").forEach(function (li) {
    var checkbox = li.querySelector(".task-list-item-checkbox");
    if (checkbox) wireChecklistCheckbox(checkbox, li);
    if (li.querySelector(".doc-editor-checklist-text")) return;
    if (!checkbox) return;
    var hasText = false;
    Array.prototype.forEach.call(li.childNodes, function (node) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) hasText = true;
      if (node.nodeType === Node.ELEMENT_NODE && node !== checkbox) hasText = true;
    });
    if (!hasText) {
      var text = makeEditable(createEl("span", "doc-editor-checklist-text"));
      li.appendChild(document.createTextNode(" "));
      li.appendChild(text);
    }
  });
})();

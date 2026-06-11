import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  readNotesJson,
  syncNotesFiles,
} from "./build-notes-html.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exportRoot = path.join(__dirname, "..", "export-blank");
const port = Number(process.env.NOTES_PORT) || 3333;

/**
 * @param {import("http").IncomingMessage} req
 * @returns {Promise<string>}
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    /** @type {Buffer[]} */
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/**
 * @param {string} filePath
 * @param {string} contentType
 * @param {import("http").ServerResponse} res
 */
function sendFile(filePath, contentType, res) {
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }
  res.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(filePath).pipe(res);
}

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${port}`);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (url.pathname === "/api/notes/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, mode: "server" }));
    return;
  }

  if (url.pathname === "/api/notes" && req.method === "GET") {
    const notes = readNotesJson();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ notes }));
    return;
  }

  if (url.pathname === "/api/notes" && req.method === "PUT") {
    try {
      const body = await readBody(req);
      const parsed = JSON.parse(body);
      if (!parsed || !Array.isArray(parsed.notes)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Expected { notes: [] }" }));
        return;
      }
      syncNotesFiles(parsed.notes);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, count: parsed.notes.length }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: String(err.message || err) }));
    }
    return;
  }

  let filePath = path.join(exportRoot, decodeURIComponent(url.pathname));
  if (url.pathname.endsWith("/")) {
    filePath = path.join(filePath, "index.html");
  }

  if (!filePath.startsWith(exportRoot)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Forbidden");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  sendFile(filePath, contentTypes[ext] || "application/octet-stream", res);
});

server.listen(port, () => {
  console.log(`Notes server running at http://localhost:${port}/DOCS/SCRATCHPAD.html`);
  console.log("Saving a note updates notes.json and rebuilds DOCS/NOTES.html on disk.");
});

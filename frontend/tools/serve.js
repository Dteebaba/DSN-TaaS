#!/usr/bin/env node
/* Tiny static server for local development and tests. No dependencies.
   Usage: node tools/serve.js [port]   (default 5173) */
const http = require("http");
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const port = Number(process.argv[2] || process.env.PORT || 5173);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  let file = path.join(root, url === "/" ? "index.html" : url);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) file = path.join(root, "index.html");
    fs.readFile(file, (e, data) => {
      if (e) { res.writeHead(404); return res.end("Not found"); }
      res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
      res.end(data);
    });
  });
}).listen(port, () => console.log(`DSN Talent Platform running at http://localhost:${port}`));

#!/usr/bin/env node
/* Fails if any app script has a syntax error. Loads scripts in the same order as index.html. */
const fs = require("fs"), path = require("path");
const dir = path.resolve(__dirname, "../assets/js");
const order = fs.readFileSync(path.resolve(__dirname, "../.js-order"), "utf8").split(/\s+/).filter(Boolean);
let ok = true;
for (const f of order) {
  try { new Function(fs.readFileSync(path.join(dir, f), "utf8")); }
  catch (e) { ok = false; console.error(`✗ ${f}: ${e.message}`); }
}
try { new Function(order.map(f => fs.readFileSync(path.join(dir, f), "utf8")).join("\n")); }
catch (e) { ok = false; console.error(`✗ combined bundle: ${e.message}`); }
if (!ok) process.exit(1);
console.log(`✓ ${order.length} scripts parse cleanly`);

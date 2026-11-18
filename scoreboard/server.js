// Stdlib-only (node:http, node:fs) HTTP server for the tic-tac-toe
// scoreboard. Exports createServer(); the caller decides whether and where
// to listen. Run directly (node scoreboard/server.js) to actually bind a
// port — createServer() itself never does, so it's safe to require() from
// tests without side effects.
"use strict";

var http = require("http");
var fs = require("fs");
var path = require("path");

var INDEX_HTML_PATH = path.join(__dirname, "public", "index.html");

// In-memory store of {name, score} entries. Mutated synchronously; no
// persistence, no concurrency concerns (Node is single-threaded per request).
function createServer() {
  var scores = [];

  function sendJson(res, statusCode, body) {
    var payload = JSON.stringify(body);
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    });
    res.end(payload);
  }

  function handleGetIndex(res) {
    fs.readFile(INDEX_HTML_PATH, function (err, data) {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  }

  function handleGetScores(res) {
    var sorted = scores.slice().sort(function (a, b) {
      return b.score - a.score;
    });
    sendJson(res, 200, sorted);
  }

  // name must be a non-empty string once trimmed; score must satisfy
  // Number.isInteger (so numeric strings like "7" and floats like 7.5 are
  // both rejected).
  function validateEntry(body) {
    if (!body || typeof body !== "object") return null;
    if (typeof body.name !== "string") return null;
    var name = body.name.trim();
    if (name.length === 0) return null;
    if (!Number.isInteger(body.score)) return null;
    return { name: name, score: body.score };
  }

  function handlePostScores(req, res) {
    var chunks = [];
    req.on("data", function (chunk) {
      chunks.push(chunk);
    });
    req.on("end", function () {
      var raw = Buffer.concat(chunks).toString("utf8");
      var parsed;
      try {
        parsed = raw.length ? JSON.parse(raw) : null;
      } catch (err) {
        sendJson(res, 400, { error: "Malformed JSON body" });
        return;
      }

      var entry = validateEntry(parsed);
      if (!entry) {
        sendJson(res, 400, { error: "Invalid name or score" });
        return;
      }

      scores.push(entry);
      sendJson(res, 201, entry);
    });
  }

  return http.createServer(function (req, res) {
    var url = req.url.split("?")[0];

    if (req.method === "GET" && url === "/") {
      handleGetIndex(res);
      return;
    }

    if (req.method === "GET" && url === "/scores") {
      handleGetScores(res);
      return;
    }

    if (req.method === "POST" && url === "/scores") {
      handlePostScores(req, res);
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  });
}

if (require.main === module) {
  var port = process.env.PORT || 3100;
  createServer().listen(port);
}

module.exports = { createServer: createServer };

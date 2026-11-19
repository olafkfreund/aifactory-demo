// Run from the repo root with: npx jest scoreboard
"use strict";

const http = require("http");
const { createServer } = require("./server.js");

// Starts a fresh server instance bound to an ephemeral port so state never
// leaks between tests. Returns { baseUrl, close }.
function startServer() {
  const server = createServer();
  return new Promise((resolve) => {
    server.listen(0, () => {
      const { port } = server.address();
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise((r) => server.close(r)),
      });
    });
  });
}

// Minimal HTTP client built on node:http so we don't need a fetch polyfill.
// `body`, if given, is sent as the raw request payload (already a string),
// letting callers send malformed JSON on purpose.
function request(baseUrl, method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const req = http.request(
      {
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers: body !== undefined
          ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
          : {},
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          let json;
          try {
            json = raw.length ? JSON.parse(raw) : undefined;
          } catch (e) {
            json = undefined;
          }
          resolve({ status: res.statusCode, body: json, raw });
        });
      }
    );
    req.on("error", reject);
    if (body !== undefined) req.write(body);
    req.end();
  });
}

function getScores(baseUrl) {
  return request(baseUrl, "GET", "/scores");
}

function postScore(baseUrl, payload) {
  const body = typeof payload === "string" ? payload : JSON.stringify(payload);
  return request(baseUrl, "POST", "/scores", body);
}

let server;

beforeEach(async () => {
  server = await startServer();
});

afterEach(async () => {
  await server.close();
});

test("GET /scores returns 200 with an empty array initially", async () => {
  const res = await getScores(server.baseUrl);
  expect(res.status).toBe(200);
  expect(res.body).toEqual([]);
});

test("POST a valid score returns 201 with the stored entry, and GET includes it", async () => {
  const res = await postScore(server.baseUrl, { name: "Ada", score: 7 });
  expect(res.status).toBe(201);
  expect(res.body).toEqual({ name: "Ada", score: 7 });

  const after = await getScores(server.baseUrl);
  expect(after.status).toBe(200);
  expect(after.body).toEqual([{ name: "Ada", score: 7 }]);
});

test("POSTing two different scores returns them sorted score-descending", async () => {
  await postScore(server.baseUrl, { name: "Ada", score: 7 });
  await postScore(server.baseUrl, { name: "Grace", score: 15 });

  const res = await getScores(server.baseUrl);
  expect(res.status).toBe(200);
  expect(res.body).toEqual([
    { name: "Grace", score: 15 },
    { name: "Ada", score: 7 },
  ]);
});

test("POST with a missing name returns 400 and does not store the entry", async () => {
  const res = await postScore(server.baseUrl, { score: 7 });
  expect(res.status).toBe(400);

  const after = await getScores(server.baseUrl);
  expect(after.body).toEqual([]);
});

test("POST with an empty name returns 400 and does not store the entry", async () => {
  const res = await postScore(server.baseUrl, { name: "   ", score: 7 });
  expect(res.status).toBe(400);

  const after = await getScores(server.baseUrl);
  expect(after.body).toEqual([]);
});

test("POST with a non-integer score (numeric string) returns 400 and does not store", async () => {
  const res = await postScore(server.baseUrl, { name: "Ada", score: "7" });
  expect(res.status).toBe(400);

  const after = await getScores(server.baseUrl);
  expect(after.body).toEqual([]);
});

test("POST with a non-integer score (float) returns 400 and does not store", async () => {
  const res = await postScore(server.baseUrl, { name: "Ada", score: 7.5 });
  expect(res.status).toBe(400);

  const after = await getScores(server.baseUrl);
  expect(after.body).toEqual([]);
});

test("POST with a malformed JSON body returns 400 without crashing the server", async () => {
  const res = await postScore(server.baseUrl, "{not valid json");
  expect(res.status).toBe(400);

  // The server survives: a follow-up valid request still works.
  const after = await getScores(server.baseUrl);
  expect(after.status).toBe(200);
  expect(after.body).toEqual([]);
});

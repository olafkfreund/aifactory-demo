// AC#2: invalid bodies return 400 (missing name or non-integer score).
// POST /scores must return 400 for a missing/empty name, a non-integer
// score, and malformed JSON.
"use strict";

const http = require("http");
const { createServer } = require("../../scoreboard/server.js");

/**
 * Send a raw request body to POST /scores and resolve with the status code
 * and raw response body.
 */
function postScores(baseUrl, rawBody) {
  const url = new URL("/scores", baseUrl);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(rawBody),
        },
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({ status: res.statusCode, body: data });
        });
      },
    );
    req.on("error", reject);
    req.write(rawBody);
    req.end();
  });
}

describe("POST /scores with invalid bodies returns 400", () => {
  let server;
  let baseUrl;

  beforeEach(async () => {
    server = createServer();
    await new Promise((resolve) => server.listen(0, resolve));
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it("returns 400 when the name is missing", async () => {
    const res = await postScores(baseUrl, JSON.stringify({ score: 7 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when the name is an empty string", async () => {
    const res = await postScores(
      baseUrl,
      JSON.stringify({ name: "", score: 7 }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when the score is a non-integer number", async () => {
    const res = await postScores(
      baseUrl,
      JSON.stringify({ name: "Ada", score: 7.5 }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when the score is not a number", async () => {
    const res = await postScores(
      baseUrl,
      JSON.stringify({ name: "Ada", score: "seven" }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when the score is missing", async () => {
    const res = await postScores(baseUrl, JSON.stringify({ name: "Ada" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await postScores(baseUrl, "{ not valid json ");
    expect(res.status).toBe(400);
  });
});

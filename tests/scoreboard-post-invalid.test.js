// Acceptance criterion (AC#2): invalid bodies return 400 (missing name or
// non-integer score). POST /scores with a missing name or a non-integer
// score must return HTTP status 400.

const http = require('node:http');
const { createServer } = require('../scoreboard/server');

/**
 * Start the scoreboard server on an ephemeral port and return its base URL.
 */
function startServer() {
  const server = createServer();
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

function closeServer(server) {
  return new Promise((resolve) => server.close(() => resolve()));
}

/**
 * Perform a POST /scores request with the given JSON body (sent verbatim as a
 * string so we can submit malformed/invalid payloads).
 */
function postScores(baseUrl, bodyString) {
  return new Promise((resolve, reject) => {
    const url = new URL('/scores', baseUrl);
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyString),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body: data });
        });
      },
    );
    req.on('error', reject);
    req.write(bodyString);
    req.end();
  });
}

describe('POST /scores with invalid bodies returns 400', () => {
  let server;
  let baseUrl;

  beforeEach(async () => {
    ({ server, baseUrl } = await startServer());
  });

  afterEach(async () => {
    await closeServer(server);
    jest.restoreAllMocks();
  });

  it('returns 400 when the name is missing', async () => {
    const res = await postScores(baseUrl, JSON.stringify({ score: 7 }));

    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when the name is an empty string', async () => {
    const res = await postScores(
      baseUrl,
      JSON.stringify({ name: '', score: 7 }),
    );

    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when the score is a non-integer number', async () => {
    const res = await postScores(
      baseUrl,
      JSON.stringify({ name: 'Ada', score: 1.5 }),
    );

    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when the score is a non-numeric string', async () => {
    const res = await postScores(
      baseUrl,
      JSON.stringify({ name: 'Ada', score: 'seven' }),
    );

    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when the score is missing', async () => {
    const res = await postScores(baseUrl, JSON.stringify({ name: 'Ada' }));

    expect(res.statusCode).toBe(400);
  });
});

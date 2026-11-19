// AC#2: POST /scores with {"name":"Ada","score":7} returns 201 and a
// following GET /scores lists it.

const http = require('node:http');

// Import root is `app`; createServer() is exported from scoreboard/server.js
// and takes no arguments (the caller decides whether/where to listen).
const { createServer } = require('../../scoreboard/server');

/**
 * Perform an HTTP request against the given server address and resolve with
 * { statusCode, body } where body is the parsed JSON response.
 */
function request(baseUrl, { method, path, body }) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const payload = body === undefined ? undefined : JSON.stringify(body);
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method,
        headers:
          payload === undefined
            ? {}
            : {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
              },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let parsed;
          try {
            parsed = data.length ? JSON.parse(data) : undefined;
          } catch (err) {
            parsed = data;
          }
          resolve({ statusCode: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', reject);
    if (payload !== undefined) {
      req.write(payload);
    }
    req.end();
  });
}

describe('POST /scores creates and lists an entry', () => {
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

  it('returns 201 when posting {name:"Ada",score:7}', async () => {
    const res = await request(baseUrl, {
      method: 'POST',
      path: '/scores',
      body: { name: 'Ada', score: 7 },
    });

    expect(res.statusCode).toBe(201);
  });

  it('returns the stored entry in the POST response', async () => {
    const res = await request(baseUrl, {
      method: 'POST',
      path: '/scores',
      body: { name: 'Ada', score: 7 },
    });

    expect(res.body).toMatchObject({ name: 'Ada', score: 7 });
  });

  it('lists the posted entry on a subsequent GET /scores', async () => {
    await request(baseUrl, {
      method: 'POST',
      path: '/scores',
      body: { name: 'Ada', score: 7 },
    });

    const res = await request(baseUrl, { method: 'GET', path: '/scores' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Ada', score: 7 }),
      ])
    );
  });
});

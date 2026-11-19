// AC#1: `node scoreboard/server.js` starts and `curl localhost:3100/` returns
// the HTML page; `GET /scores` returns `[]` initially.

const http = require('node:http');
const { createServer } = require('../scoreboard/server');

/**
 * Perform an HTTP request against the running server and resolve with the
 * status code, raw body text, and response headers.
 */
function request(baseUrl, path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(`${baseUrl}${path}`, options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, body, headers: res.headers });
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

describe('scoreboard server: index page and empty scores', () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    server = createServer();
    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  });

  it('GET / returns 200', async () => {
    const res = await request(baseUrl, '/');
    expect(res.status).toBe(200);
  });

  it('GET / returns the HTML page', async () => {
    const res = await request(baseUrl, '/');
    expect(res.body.toLowerCase()).toContain('<html');
  });

  it('GET /scores returns 200', async () => {
    const res = await request(baseUrl, '/scores');
    expect(res.status).toBe(200);
  });

  it('GET /scores returns an empty JSON array before any scores are posted', async () => {
    const res = await request(baseUrl, '/scores');
    expect(JSON.parse(res.body)).toEqual([]);
  });
});

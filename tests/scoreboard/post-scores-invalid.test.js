// AC#2: invalid bodies return 400 (missing name or non-integer score).
// POST /scores must respond with HTTP 400 when the body has a missing/empty
// name or a non-integer score.

const http = require('node:http');
const { createServer } = require('../../scoreboard/server.js');

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve(server.address().port);
    });
  });
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
}

function post(port, body) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        method: 'POST',
        path: '/scores',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

describe('POST /scores rejects invalid bodies with 400', () => {
  let server;
  let port;

  beforeEach(async () => {
    server = createServer();
    port = await listen(server);
  });

  afterEach(async () => {
    await close(server);
    jest.restoreAllMocks();
  });

  it('returns 400 when the name is missing', async () => {
    const res = await post(port, { score: 7 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when the name is an empty string', async () => {
    const res = await post(port, { name: '', score: 7 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when the score is a non-integer number', async () => {
    const res = await post(port, { name: 'Ada', score: 7.5 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when the score is a non-numeric string', async () => {
    const res = await post(port, { name: 'Ada', score: 'seven' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when the score is missing', async () => {
    const res = await post(port, { name: 'Ada' });
    expect(res.status).toBe(400);
  });
});

// AC#2 / spec: GET /scores returns a JSON array of {name, score} sorted by
// score descending. After multiple POSTs, the entries come back ordered from
// highest score to lowest.

const http = require('node:http');
const { createServer } = require('../../scoreboard/server');

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve(server.address().port);
    });
  });
}

function request(port, method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? undefined : JSON.stringify(body);
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        method,
        path,
        headers: payload
          ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
          : {},
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let json;
          try {
            json = data ? JSON.parse(data) : undefined;
          } catch (err) {
            json = undefined;
          }
          resolve({ statusCode: res.statusCode, body: json, raw: data });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

describe('GET /scores sorted by score descending', () => {
  let server;
  let port;

  beforeEach(async () => {
    server = createServer();
    port = await listen(server);
  });

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('returns entries sorted by score descending after multiple POSTs', async () => {
    await request(port, 'POST', '/scores', { name: 'Ada', score: 7 });
    await request(port, 'POST', '/scores', { name: 'Bob', score: 12 });
    await request(port, 'POST', '/scores', { name: 'Cho', score: 3 });

    const res = await request(port, 'GET', '/scores');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      { name: 'Bob', score: 12 },
      { name: 'Ada', score: 7 },
      { name: 'Cho', score: 3 },
    ]);
  });

  it('orders the scores from highest to lowest', async () => {
    await request(port, 'POST', '/scores', { name: 'Ada', score: 7 });
    await request(port, 'POST', '/scores', { name: 'Bob', score: 12 });
    await request(port, 'POST', '/scores', { name: 'Cho', score: 3 });

    const res = await request(port, 'GET', '/scores');
    const scores = res.body.map((entry) => entry.score);

    expect(scores).toEqual([12, 7, 3]);
  });
});

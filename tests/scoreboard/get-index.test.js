// AC#1: `node scoreboard/server.js` starts and `curl localhost:3100/` returns
// the HTML page; GET /scores returns [] initially.
//
// This file verifies: GET / on a createServer() instance returns 200 with the
// index HTML page body.

const http = require('http');
const { createServer } = require('../../scoreboard/server.js');

function request(server, path) {
  return new Promise((resolve, reject) => {
    server.listen(0, () => {
      const { port } = server.address();
      const req = http.get({ host: '127.0.0.1', port, path }, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, headers: res.headers, body });
        });
      });
      req.on('error', reject);
    });
  });
}

describe('GET /', () => {
  let server;

  beforeEach(() => {
    server = createServer();
  });

  afterEach((done) => {
    if (server && server.listening) {
      server.close(done);
    } else {
      done();
    }
  });

  it('returns status code 200', async () => {
    const res = await request(server, '/');
    expect(res.statusCode).toBe(200);
  });

  it('returns the index HTML page body', async () => {
    const res = await request(server, '/');
    expect(res.body).toContain('<html');
  });
});

// AC#1: GET /scores on a fresh createServer() instance returns 200 with an
// empty JSON array ([]) before any scores have been posted.

const http = require('node:http');
const { createServer } = require('../../scoreboard/server');

/**
 * Perform an HTTP request against the given server and resolve with the
 * status code and parsed/raw body.
 */
function request(server, method, path) {
  return new Promise((resolve, reject) => {
    const { port } = server.address();
    const req = http.request(
      { host: '127.0.0.1', port, method, path },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body: data });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

describe('GET /scores (empty initially)', () => {
  let server;

  beforeEach((done) => {
    server = createServer();
    server.listen(0, '127.0.0.1', done);
  });

  afterEach((done) => {
    server.close(done);
  });

  it('responds with status 200', async () => {
    const res = await request(server, 'GET', '/scores');
    expect(res.statusCode).toBe(200);
  });

  it('responds with an empty JSON array', async () => {
    const res = await request(server, 'GET', '/scores');
    expect(JSON.parse(res.body)).toEqual([]);
  });
});

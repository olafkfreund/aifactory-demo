// AC#2: POST /scores with {"name":"Ada","score":7} returns 201 and a
// following GET /scores lists it.

const { createServer } = require('../../scoreboard/server');

describe('POST /scores', () => {
  let server;
  let baseUrl;

  beforeEach(async () => {
    server = createServer();
    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  });

  it('returns 201 when a score is posted', async () => {
    const res = await fetch(`${baseUrl}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Ada', score: 7 }),
    });

    expect(res.status).toBe(201);
  });

  it('returns the stored entry in the response body', async () => {
    const res = await fetch(`${baseUrl}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Ada', score: 7 }),
    });
    const body = await res.json();

    expect(body).toEqual(
      expect.objectContaining({ name: 'Ada', score: 7 })
    );
  });

  it('lists the posted score on a following GET /scores', async () => {
    await fetch(`${baseUrl}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Ada', score: 7 }),
    });

    const res = await fetch(`${baseUrl}/scores`);
    expect(res.status).toBe(200);

    const scores = await res.json();
    expect(scores).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Ada', score: 7 }),
      ])
    );
  });
});

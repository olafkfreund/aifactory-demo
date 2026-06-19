# Scenario — LinkLite: a 3-tier URL shortener on AWS EKS (web + Postgres + Redis)

A small but real **3-tier web application** in **Node / TypeScript**, built into
`scenarios/aws-3tier/` on branch `bench/aws-3tier`. Web tier (HTTP API) backed by
**PostgreSQL** (durable store) and **Redis** (read-through cache), packaged for
**AWS EKS** with Terraform infrastructure.

## Goal

`LinkLite` — a URL-shortener service. Create short codes for URLs, redirect on
lookup, and use Redis as a read-through cache in front of PostgreSQL so hot
lookups never hit the database. Deployable to AWS EKS with managed Postgres
(RDS) and managed Redis (ElastiCache).

## Stack

- **Web:** Node 20 + TypeScript, **Fastify** (or Express), exposing a REST API.
- **DB:** PostgreSQL — a `links` table `(code TEXT PRIMARY KEY, url TEXT NOT NULL,
  hits BIGINT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`.
- **Cache:** Redis — caches `code -> url` (read-through) with a TTL; the DB is the
  source of truth.
- **Tests:** **jest** (+ supertest for HTTP). Config via env: `DATABASE_URL`,
  `REDIS_URL`, `PORT` (default 3000), `CACHE_TTL_SECONDS` (default 3600).

## Application scope (web tier)

- `POST /shorten` — body `{ "url": "https://..." }` → **201** `{ "code", "shortUrl" }`.
  An invalid/missing URL → **400**. Codes are short, URL-safe, and stable per URL.
- `GET /r/:code` — **302** redirect to the original URL (Location header). Unknown
  code → **404**. Each successful lookup increments `hits`.
- `GET /stats/:code` — **200** `{ "code", "url", "hits" }`; unknown code → 404.
- `GET /healthz` — **200** `{ "status": "ok" }` only when BOTH Postgres and Redis
  are reachable; otherwise **503**.

## Caching behaviour (the point of the 3rd tier)

- `GET /r/:code` reads Redis first. On a **cache hit** it does NOT query Postgres
  for the URL. On a **cache miss** it reads Postgres, then populates Redis with the
  `code -> url` mapping (TTL `CACHE_TTL_SECONDS`).
- Writing a new short code (`POST /shorten`) does not need to pre-warm the cache.

## Acceptance Criteria

- AC#1: `POST /shorten {"url":"https://example.com"}` returns 201 with a `code` and
  a `shortUrl` ending in that code.
- AC#2: `POST /shorten` with a missing or non-http(s) `url` returns 400.
- AC#3: `GET /r/:code` for a known code returns 302 with the original URL in
  `Location`; an unknown code returns 404.
- AC#4: A second `GET /r/:code` is served from the Redis cache — with Postgres
  unavailable after the first lookup, the redirect still succeeds (cache hit path
  is covered by a test that asserts the DB is not queried on hit).
- AC#5: `GET /stats/:code` returns the correct `hits` count after N successful
  lookups (N reflected exactly).
- AC#6: `GET /healthz` returns 200 when DB+Redis are up and 503 when either is down.
- AC#7: `jest` passes; the cache hit/miss behaviour (AC#4) and the 404/400 paths
  are covered by tests. Integration tests run against ephemeral Postgres + Redis.

## AWS deployment (infrastructure as code)

- **Terraform** under `infra/` provisioning, in **eu-west-1**, **single-AZ**, the
  **smallest/cheapest** tiers (cost + clean teardown are first-class requirements):
  - An **EKS** cluster with a single managed node group of **1× `t3.small`** node.
  - **RDS PostgreSQL** `db.t4g.micro`, 20 GB gp3, single-AZ, `deletion_protection = false`,
    `skip_final_snapshot = true`.
  - **ElastiCache Redis** `cache.t4g.micro`, single node, no cluster mode.
  - A minimal VPC (or reuse default), security groups so the EKS pods reach RDS:5432
    and ElastiCache:6379.
- **Kubernetes manifests** (`k8s/`): a Deployment for the web tier (image from a
  registry), a Service, and an Ingress or LoadBalancer Service; `DATABASE_URL` and
  `REDIS_URL` wired from the Terraform outputs via a Secret/ConfigMap.
- **CI/CD** (`.github/workflows/`): lint → test → docker build → (gated) deploy.
- Every cloud resource MUST be Terraform-managed with no deletion protection so a
  single `terraform destroy` removes the entire stack.

## Out of scope

- Auth, custom domains/TLS, multi-AZ HA, autoscaling, analytics dashboards.

## Notes for the pipeline

- Language is **TypeScript** (jest), NOT the repo's other languages — build a
  self-contained project under `scenarios/aws-3tier/`.
- Verify lane(s): `unit`, `api`, `integration`. AC#4 (cache-hit does not hit the
  DB) is intentionally precise — a first build that always queries Postgres should
  trigger a TFactory → AIFactory handback.
- Keep all AWS resources minimal and destroyable; the demo provisions then tears
  down.

# Agent Database API

This site is currently a Cloudflare Pages static site. This change adds a Cloudflare Functions + D1 write path so independent agents can submit skill records through an HTTP API instead of only creating GitHub PRs.

## Endpoints

### `POST /api/agent/skills`

Authenticated agent write endpoint. Submissions are stored as `draft` rows for review.

Headers:

```text
Authorization: Bearer <AGENT_WRITE_TOKEN>
Content-Type: application/json
```

Body:

```json
{
  "sourceAgent": "skillhubdata",
  "skill": {
    "name": "example-skill",
    "desc": "Short verified description.",
    "url": "https://github.com/example/example-skill",
    "repo": "example/example-skill",
    "category": "dev-tools",
    "supportedAgents": ["claude-code", "codex"]
  }
}
```

Response:

```json
{
  "ok": true,
  "id": "skill_<hash>",
  "status": "draft",
  "sourceAgent": "skillhubdata",
  "payloadHash": "..."
}
```

### `GET /api/agent/skills?status=draft`

Lists draft submissions. This endpoint intentionally has no public write capability; review tooling can use it to inspect pending records.

### `GET /api/skills`

Lists approved D1-backed skill records. The existing static site still reads `categories/index.json`; switching the frontend to merge D1-approved records should be a follow-up change after D1 is provisioned and review policy is agreed.

## Cloudflare Setup

Create a D1 database:

```bash
npx wrangler d1 create skillhub-db
```

Update `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "SKILLHUB_DB",
    "database_name": "skillhub-db",
    "database_id": "<real database id>"
  }
]
```

Apply schema:

```bash
npx wrangler d1 execute skillhub-db --file schema.sql
```

Set write secret:

```bash
npx wrangler secret put AGENT_WRITE_TOKEN
```

## Security Notes

- Agent writes require `Authorization: Bearer <AGENT_WRITE_TOKEN>`.
- Writes land as `draft`, not immediately published.
- Duplicate payloads are deduped by SHA-256 payload hash.
- Existing static catalog remains unchanged until a review/publish path promotes rows to `approved` or merges them with static data.

## Current Deployment Blocker

This environment does not currently expose `CLOUDFLARE_API_TOKEN`, so the agent could not create the D1 database or apply schema automatically. Cloudflare admin setup is required before deployment.

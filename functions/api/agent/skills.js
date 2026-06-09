const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

const REQUIRED_FIELDS = ['name', 'desc', 'url', 'repo', 'category'];

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: JSON_HEADERS,
  });
}

function getBearerToken(request) {
  const header = request.headers.get('Authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

function timingSafeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

async function sha256Hex(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function validateSkillPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return ['payload must be a JSON object'];
  }

  const missing = REQUIRED_FIELDS.filter((field) => {
    const value = payload[field];
    return typeof value !== 'string' || value.trim() === '';
  });

  const errors = missing.map((field) => `${field} is required`);

  if (payload.supportedAgents !== undefined && !Array.isArray(payload.supportedAgents)) {
    errors.push('supportedAgents must be an array when provided');
  }

  if (payload.url && !/^https:\/\//.test(payload.url)) {
    errors.push('url must start with https://');
  }

  if (payload.repo && !/^[^\s/]+\/[^\s/]+$/.test(payload.repo)) {
    errors.push('repo must look like owner/name');
  }

  return errors;
}

export async function onRequestPost({ request, env }) {
  if (!env.SKILLHUB_DB) {
    return jsonResponse({ error: 'D1 binding SKILLHUB_DB is not configured' }, 500);
  }

  const expectedToken = env.AGENT_WRITE_TOKEN || '';
  if (!expectedToken) {
    return jsonResponse({ error: 'AGENT_WRITE_TOKEN is not configured' }, 500);
  }

  const actualToken = getBearerToken(request);
  if (!timingSafeEqual(actualToken, expectedToken)) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'invalid JSON body' }, 400);
  }

  const payload = body.skill || body.payload || body;
  const errors = validateSkillPayload(payload);
  if (errors.length > 0) {
    return jsonResponse({ error: 'invalid skill payload', details: errors }, 400);
  }

  const sourceAgent = String(body.sourceAgent || body.source_agent || 'unknown-agent').slice(0, 80);
  const canonicalPayload = JSON.stringify(canonicalize(payload));
  const payloadHash = await sha256Hex(canonicalPayload);
  const id = body.id || `skill_${payloadHash.slice(0, 24)}`;
  const now = new Date().toISOString();

  try {
    await env.SKILLHUB_DB.prepare(`
      INSERT INTO agent_skill_submissions
        (id, status, source_agent, payload, payload_hash, created_at, updated_at)
      VALUES (?, 'draft', ?, ?, ?, ?, ?)
      ON CONFLICT(payload_hash) DO UPDATE SET
        source_agent = excluded.source_agent,
        payload = excluded.payload,
        updated_at = excluded.updated_at
    `).bind(id, sourceAgent, canonicalPayload, payloadHash, now, now).run();
  } catch (error) {
    return jsonResponse({ error: 'database write failed', detail: error.message }, 500);
  }

  return jsonResponse({
    ok: true,
    id,
    status: 'draft',
    sourceAgent,
    payloadHash,
  }, 201);
}

export async function onRequestGet({ request, env }) {
  if (!env.SKILLHUB_DB) {
    return jsonResponse({ error: 'D1 binding SKILLHUB_DB is not configured' }, 500);
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'draft';
  const limit = Math.min(Number(url.searchParams.get('limit') || 50), 200);

  const rows = await env.SKILLHUB_DB.prepare(`
    SELECT id, status, source_agent, payload, payload_hash, created_at, updated_at, reviewed_at, review_note
    FROM agent_skill_submissions
    WHERE status = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).bind(status, limit).all();

  return jsonResponse({
    ok: true,
    status,
    count: rows.results.length,
    submissions: rows.results.map((row) => ({
      ...row,
      payload: JSON.parse(row.payload),
    })),
  });
}

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'public, max-age=60',
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: JSON_HEADERS,
  });
}

export async function onRequestGet({ env }) {
  if (!env.SKILLHUB_DB) {
    return jsonResponse({ error: 'D1 binding SKILLHUB_DB is not configured' }, 500);
  }

  const rows = await env.SKILLHUB_DB.prepare(`
    SELECT id, source_agent, payload, created_at, updated_at
    FROM agent_skill_submissions
    WHERE status = 'approved'
    ORDER BY created_at DESC
  `).all();

  return jsonResponse({
    ok: true,
    source: 'd1',
    count: rows.results.length,
    skills: rows.results.map((row) => ({
      id: row.id,
      sourceAgent: row.source_agent,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      ...JSON.parse(row.payload),
    })),
  });
}

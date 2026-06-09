-- Skill Hub D1 schema for agent-submitted skill records.
-- This table stores agent writes separately from the static catalog until reviewed/approved.

CREATE TABLE IF NOT EXISTS agent_skill_submissions (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected')),
  source_agent TEXT NOT NULL,
  payload TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  reviewed_at TEXT,
  review_note TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_skill_submissions_payload_hash
  ON agent_skill_submissions(payload_hash);

CREATE INDEX IF NOT EXISTS idx_agent_skill_submissions_status_created
  ON agent_skill_submissions(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_skill_submissions_source_agent
  ON agent_skill_submissions(source_agent);

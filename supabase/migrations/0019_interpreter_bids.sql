-- Assignment type for interpretation jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS assignment_type text;

-- Tracks per-interpreter availability responses for interpretation job inquiries
CREATE TABLE IF NOT EXISTS interpreter_bids (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id        uuid        NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  translator_id uuid        NOT NULL REFERENCES translators(id),
  token         text        NOT NULL UNIQUE,
  rate          numeric(10,2),
  rate_notes    text,
  status        text        NOT NULL DEFAULT 'pending', -- pending | interested | declined | assigned
  responded_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS interpreter_bids_job_id_idx ON interpreter_bids(job_id);
CREATE INDEX IF NOT EXISTS interpreter_bids_token_idx  ON interpreter_bids(token);

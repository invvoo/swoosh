-- Internal reviewer assignment (separate from external translator vendor)
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS reviewer_id  uuid REFERENCES employees(id),
  ADD COLUMN IF NOT EXISTS reviewed_at  timestamptz;

CREATE INDEX IF NOT EXISTS idx_jobs_reviewer ON jobs(reviewer_id);

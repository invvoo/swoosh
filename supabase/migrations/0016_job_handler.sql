-- Track which admin employee is responsible for handling each job.
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS handled_by uuid REFERENCES employees(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_handled_by ON jobs(handled_by);

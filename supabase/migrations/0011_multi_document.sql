-- Store multiple uploaded documents per translation job.
-- document_paths: [{path, name, wordCount}]
-- The existing document_path / document_name columns remain for backward compat
-- (they mirror the first entry in document_paths).

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS document_paths jsonb;

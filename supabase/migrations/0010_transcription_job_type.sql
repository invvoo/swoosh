-- Add 'transcription' as a valid job_type.
-- Must drop and recreate the CHECK constraint (Postgres doesn't support ALTER CONSTRAINT).

ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_job_type_check;

ALTER TABLE jobs ADD CONSTRAINT jobs_job_type_check
  CHECK (job_type IN ('translation', 'interpretation', 'equipment_rental', 'notary', 'transcription'));

-- Transcription-specific columns
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS media_path              text,         -- Storage path of uploaded audio/video
  ADD COLUMN IF NOT EXISTS media_name              text,         -- Original filename
  ADD COLUMN IF NOT EXISTS media_duration_seconds  integer,      -- Admin fills in after review
  ADD COLUMN IF NOT EXISTS transcription_service_type text
    CHECK (transcription_service_type IS NULL OR transcription_service_type IN ('transcription', 'subtitles', 'both'));

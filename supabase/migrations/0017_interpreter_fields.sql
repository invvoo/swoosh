-- Add interpreter qualification fields to translators
ALTER TABLE translators
  ADD COLUMN IF NOT EXISTS court_certified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS medical_certified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS does_consecutive boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS does_simultaneous boolean NOT NULL DEFAULT false;

-- Add interpretation mode / requirements to jobs
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS interpretation_mode text,           -- 'consecutive' | 'simultaneous'
  ADD COLUMN IF NOT EXISTS interpretation_cert_required text,  -- 'none' | 'court' | 'medical'
  ADD COLUMN IF NOT EXISTS num_interpreters integer,
  ADD COLUMN IF NOT EXISTS simultaneous_surcharge numeric(10,2),
  ADD COLUMN IF NOT EXISTS equipment_rental_needed text,       -- 'yes' | 'no' | 'unsure'
  ADD COLUMN IF NOT EXISTS equipment_details jsonb,
  ADD COLUMN IF NOT EXISTS po_number text UNIQUE;

-- pickup is now a valid mailing option (handled at app level, no constraint to change)
COMMENT ON COLUMN jobs.mailing_option IS 'none | standard | hard_copy | pickup';

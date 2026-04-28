-- Phase 1: auto-quote, language detection, certification types, interpretation quotes

-- ── Jobs: new columns ────────────────────────────────────────────────────────

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS detected_source_lang       text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS detected_source_lang_confidence numeric(4,3);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS certification_type         text
  CHECK (certification_type IN ('none', 'general', 'court'));
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS missing_pricing_warning    text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS quote_interpretation_rate  numeric(10,2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS quote_billed_minutes       integer;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS quote_is_pivot             boolean NOT NULL DEFAULT false;

-- ── New specialty: Court Certified ───────────────────────────────────────────

INSERT INTO specialty_multipliers (name, multiplier, is_active)
SELECT 'Court Certified', 1.5000, true
WHERE NOT EXISTS (SELECT 1 FROM specialty_multipliers WHERE name = 'Court Certified');

-- ── New system settings ──────────────────────────────────────────────────────

INSERT INTO system_settings (key, value, description) VALUES
  ('translation_minimum_court',  '350',  'Minimum charge for court-certified translations'),
  ('ai_translation_rules',       '',     'Critical output rules for AI-translated documents (experimental — future feature)')
ON CONFLICT (key) DO NOTHING;

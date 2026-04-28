-- Run this against an already-seeded database to update to new rates.
-- Safe to run multiple times (uses ON CONFLICT for inserts).

-- ── Translation: language pair per-word rates ─────────────────────────────
UPDATE language_pairs
  SET per_word_rate = 0.18
  WHERE source_lang NOT IN ('Japanese', 'Hebrew')
    AND target_lang NOT IN ('Japanese', 'Hebrew');

UPDATE language_pairs
  SET per_word_rate = 0.24
  WHERE source_lang IN ('Japanese', 'Hebrew')
    OR  target_lang IN ('Japanese', 'Hebrew');

-- ── Specialty multipliers ────────────────────────────────────────────────
-- "Certified (USCIS)" @ 1.3333 → $0.18 × 1.3333 ≈ $0.24 for standard langs
--   Japanese/Hebrew certified: $0.24 × 1.3333 ≈ $0.32 (admin adjusts to $0.35 if needed)
UPDATE specialty_multipliers SET multiplier = 1.3333 WHERE name = 'Certified (USCIS)';

-- Bump other specialties slightly
UPDATE specialty_multipliers SET multiplier = 1.20 WHERE name = 'Legal';
UPDATE specialty_multipliers SET multiplier = 1.20 WHERE name = 'Medical';
UPDATE specialty_multipliers SET multiplier = 1.30 WHERE name = 'Technical / Patent';
UPDATE specialty_multipliers SET multiplier = 1.25 WHERE name = 'Financial / Real Estate';
UPDATE specialty_multipliers SET multiplier = 1.15 WHERE name = 'Academic';
UPDATE specialty_multipliers SET multiplier = 1.20 WHERE name = 'Transcription / Subtitling';
UPDATE specialty_multipliers SET multiplier = 1.10 WHERE name = 'Website / Software Localization';

-- ── System settings: minimums, interpretation, notary ───────────────────
INSERT INTO system_settings (key, value, description) VALUES
  ('translation_minimum_standard',        '95.00',  'Minimum charge for any standard translation'),
  ('translation_minimum_certified',       '250.00', 'Minimum charge for Certified (USCIS) translations'),
  ('interpretation_rate_standard',        '450.00', 'Standard interpreter rate per 3-hour block'),
  ('interpretation_rate_court',           '550.00', 'Court-certified interpreter rate per 3-hour block'),
  ('interpretation_phone_rate_per_minute','4.00',   'Phone interpretation rate per minute'),
  ('interpretation_phone_minimum_minutes','30',     'Minimum minutes billed for phone interpretation'),
  ('notary_fee',                          '15.00',  'Per-document notarization fee'),
  ('apostille_fee',                       '95.00',  'Apostille certification fee per document')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;

-- Update apostille fee that was already in seed
UPDATE system_settings SET value = '95.00'  WHERE key = 'apostille_fee_first';
UPDATE system_settings SET value = '50.00'  WHERE key = 'apostille_fee_additional';

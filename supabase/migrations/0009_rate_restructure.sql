-- Rate restructure per business directive:
--
-- Standard languages ↔ English:
--   Non-certified (General):          $0.10 / word   (base 0.10 × multiplier 1.0)
--   Company certified (Certified):    $0.18 / word   (base 0.10 × multiplier 1.8)
--   Court certified:                  $0.30 / word   (base 0.10 × multiplier 3.0)
--
-- Non-English pairs (neither side is English): double the above
--   Non-certified:   $0.20 / word   (base 0.20 × multiplier 1.0)
--   Certified:       $0.36 / word   (base 0.20 × multiplier 1.8)
--   Court:           $0.60 / word   (base 0.20 × multiplier 3.0)
--
-- Exception: Japanese and Hebrew ↔ English — rates left unchanged.

-- ── 1. Update specialty multipliers ──────────────────────────────────────────

UPDATE specialty_multipliers SET multiplier = 1.0000 WHERE name = 'General';
UPDATE specialty_multipliers SET multiplier = 1.8000 WHERE name = 'Certified (USCIS)';
UPDATE specialty_multipliers SET multiplier = 3.0000 WHERE name = 'Court Certified';

-- ── 2. Update all X ↔ English pairs to $0.10, except Japanese and Hebrew ────

UPDATE language_pairs
SET per_word_rate = 0.1000
WHERE
  is_active = true
  AND (
    (source_lang = 'English' AND target_lang NOT IN ('Japanese', 'Hebrew'))
    OR
    (target_lang = 'English' AND source_lang NOT IN ('Japanese', 'Hebrew'))
  );

-- ── 3. Update all non-English pairs to $0.20 ────────────────────────────────

UPDATE language_pairs
SET per_word_rate = 0.2000
WHERE
  is_active = true
  AND source_lang != 'English'
  AND target_lang != 'English';

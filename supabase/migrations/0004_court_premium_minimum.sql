-- Court certification has two minimums: standard ($550) and premium for Japanese/Hebrew ($750)

UPDATE system_settings SET value = '550', description = 'Court certification minimum — most languages'
WHERE key = 'translation_minimum_court';

INSERT INTO system_settings (key, value, description) VALUES
  ('translation_minimum_court_premium', '750',           'Court certification minimum — premium languages (Japanese, Hebrew)'),
  ('translation_court_premium_langs',   'Japanese,Hebrew', 'Comma-separated languages that use the premium court minimum')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;

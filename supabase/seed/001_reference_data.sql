-- ============================================================
-- SYSTEM SETTINGS
-- ============================================================
INSERT INTO system_settings (key, value, description) VALUES
  ('invoice_prefix',                      'INV',    'Prefix for auto-generated invoice numbers'),
  ('payment_terms_days',                  '30',     'Net payment terms for translator invoices'),
  ('quote_expiry_days',                   '7',      'Days before a sent quote expires'),
  -- Translation minimums
  ('translation_minimum_standard',        '95.00',  'Minimum charge for any standard translation'),
  ('translation_minimum_certified',       '250.00', 'Minimum charge for Certified (USCIS) translations'),
  -- Interpretation rates
  ('interpretation_rate_standard',        '450.00', 'Standard interpreter rate per 3-hour block'),
  ('interpretation_rate_court',           '550.00', 'Court-certified interpreter rate per 3-hour block'),
  ('interpretation_phone_rate_per_minute','4.00',   'Phone interpretation rate per minute'),
  ('interpretation_phone_minimum_minutes','30',     'Minimum minutes billed for phone interpretation'),
  -- Notary / apostille
  ('notary_fee',                          '15.00',  'Per-document notarization fee'),
  ('apostille_fee_first',                 '95.00',  'Apostille fee for first document'),
  ('apostille_fee_additional',            '50.00',  'Apostille fee for each additional document (same submission)'),
  ('death_cert_norwalk_fee',              '199.95', 'Death certificate Norwalk State Registrar fee');

-- ============================================================
-- SPECIALTY MULTIPLIERS
-- ============================================================
INSERT INTO specialty_multipliers (name, multiplier) VALUES
  ('General',                        1.00),
  ('Legal',                          1.20),
  ('Medical',                        1.20),
  ('Technical / Patent',             1.30),
  ('Financial / Real Estate',        1.25),
  ('Academic',                       1.15),
  -- 1.3333 × $0.18 = $0.24 for standard langs; 1.3333 × $0.24 ≈ $0.32 for Japanese/Hebrew
  -- (Japanese/Hebrew certified $0.35 is handled by admin quote adjustment)
  ('Certified (USCIS)',              1.3333),
  ('Transcription / Subtitling',     1.20),
  ('Website / Software Localization',1.10);

-- ============================================================
-- EQUIPMENT ITEMS
-- ============================================================
INSERT INTO equipment_items (name, description, quantity_total, quantity_available, rate_per_day, deposit_amount) VALUES
  ('PPA T35 Base-Station Transmitter',    '87-channel transmitter, operates up to 1000ft. Ideal for auditoriums, stadiums, theaters, and large venues.',                                            3, 3,  50.00, 200.00),
  ('PPA T36 Body Pack Transmitter',       'Portable transmitter for meetings under 50 people. Ideal for classrooms, tour groups, employee trainings, and small events.',                            5, 5,  50.00, 150.00),
  ('PPA R35N Receiver',                   'Single-channel impact-resistant receiver with belt clip. 100 hours battery life. Volume control, LED power indicator.',                                 50,50,   7.00,  25.00),
  ('Interpreter Console IC-1',            'Allows interpreter to hear speaker through headset. Features microphone mute, floor relay, dual mic and headphone connections.',                         4, 4,  50.00, 150.00),
  ('Soundproof Desktop Booth',            'Keeps interpreter''s voice from disturbing participants. Accommodates up to 2 simultaneous interpreters. Standard for most meetings.',                  2, 2, 180.00, 500.00),
  ('Full Size Booth (Audipack Silent 9500)','ISO-4043 standard booth. Standard for 2 interpreters, expandable to 3–4. 13 wall panels, 2 roof elements, 2 floor elements, and table.',             1, 1, 400.00,1000.00),
  ('Whisper Cube',                        'Multi-Caisses whisper cube available in multiple sizes. Shipped in ATA-style containers for complete mobility.',                                        1, 1, 800.00,1500.00),
  ('Technician (Setup & Standby)',        'LATI technician will set up the system and stand by to respond to any technical issues during your event.',                                             2, 2, 350.00,   0.00);

-- ============================================================
-- LANGUAGE PAIRS
-- Standard languages: $0.18/word
-- Japanese and Hebrew: $0.24/word
-- ============================================================
INSERT INTO language_pairs (source_lang, target_lang, per_word_rate) VALUES
  -- Standard rate pairs ($0.18)
  ('English',            'Spanish',            0.18),
  ('Spanish',            'English',            0.18),
  ('English',            'Chinese Simplified', 0.18),
  ('Chinese Simplified', 'English',            0.18),
  ('English',            'Chinese Traditional',0.18),
  ('Chinese Traditional','English',            0.18),
  ('English',            'French',             0.18),
  ('French',             'English',            0.18),
  ('English',            'German',             0.18),
  ('German',             'English',            0.18),
  ('English',            'Korean',             0.18),
  ('Korean',             'English',            0.18),
  ('English',            'Arabic',             0.18),
  ('Arabic',             'English',            0.18),
  ('English',            'Portuguese',         0.18),
  ('Portuguese',         'English',            0.18),
  ('English',            'Russian',            0.18),
  ('Russian',            'English',            0.18),
  ('English',            'Vietnamese',         0.18),
  ('Vietnamese',         'English',            0.18),
  ('English',            'Tagalog',            0.18),
  ('Tagalog',            'English',            0.18),
  ('English',            'Italian',            0.18),
  ('Italian',            'English',            0.18),
  ('English',            'Hindi',              0.18),
  ('Hindi',              'English',            0.18),
  ('English',            'Farsi',              0.18),
  ('Farsi',              'English',            0.18),
  ('English',            'Armenian',           0.18),
  ('Armenian',           'English',            0.18),
  -- Premium rate pairs ($0.24)
  ('English',            'Japanese',           0.24),
  ('Japanese',           'English',            0.24),
  ('English',            'Hebrew',             0.24),
  ('Hebrew',             'English',            0.24);

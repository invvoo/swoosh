-- ============================================================
-- SYSTEM SETTINGS
-- ============================================================
INSERT INTO system_settings (key, value, description) VALUES
  ('invoice_prefix', 'INV', 'Prefix for auto-generated invoice numbers'),
  ('payment_terms_days', '30', 'Net payment terms for translator invoices'),
  ('apostille_fee_first', '150.00', 'Apostille service fee for first document'),
  ('apostille_fee_additional', '50.00', 'Apostille fee for each additional document (same submission)'),
  ('death_cert_norwalk_fee', '199.95', 'Death certificate Norwalk State Registrar fee'),
  ('quote_expiry_days', '7', 'Days before a sent quote expires');

-- ============================================================
-- SPECIALTY MULTIPLIERS
-- ============================================================
INSERT INTO specialty_multipliers (name, multiplier) VALUES
  ('General', 1.00),
  ('Legal', 1.50),
  ('Medical', 1.50),
  ('Technical / Patent', 1.75),
  ('Financial / Real Estate', 1.40),
  ('Academic', 1.25),
  ('Certified (USCIS)', 1.60),
  ('Transcription / Subtitling', 1.30),
  ('Website / Software Localization', 1.20);

-- ============================================================
-- EQUIPMENT ITEMS (from existing pricing page)
-- ============================================================
INSERT INTO equipment_items (name, description, quantity_total, quantity_available, rate_per_day, deposit_amount) VALUES
  ('PPA T35 Base-Station Transmitter', '87-channel transmitter, operates up to 1000ft. Ideal for auditoriums, stadiums, theaters, and large venues.', 3, 3, 50.00, 200.00),
  ('PPA T36 Body Pack Transmitter', 'Portable transmitter for meetings under 50 people. Ideal for classrooms, tour groups, employee trainings, and small events.', 5, 5, 50.00, 150.00),
  ('PPA R35N Receiver', 'Single-channel impact-resistant receiver with belt clip. 100 hours battery life. Volume control, LED power indicator.', 50, 50, 7.00, 25.00),
  ('Interpreter Console IC-1', 'Allows interpreter to hear speaker through headset. Features microphone mute, floor relay, dual mic and headphone connections.', 4, 4, 50.00, 150.00),
  ('Soundproof Desktop Booth', 'Keeps interpreter''s voice from disturbing participants. Accommodates up to 2 simultaneous interpreters. Standard for most meetings.', 2, 2, 180.00, 500.00),
  ('Full Size Booth (Audipack Silent 9500)', 'ISO-4043 standard booth. Standard for 2 interpreters, expandable to 3-4. 13 wall panels, 2 roof elements, 2 floor elements, and table.', 1, 1, 400.00, 1000.00),
  ('Whisper Cube', 'Multi-Caisses whisper cube available in multiple sizes. Shipped in ATA-style containers for complete mobility.', 1, 1, 800.00, 1500.00),
  ('Technician (Setup & Standby)', 'LATI technician will set up the system and stand by to respond to any technical issues during your event.', 2, 2, 350.00, 0.00);

-- ============================================================
-- DEFAULT LANGUAGE PAIRS (common pairs; admin can add more)
-- ============================================================
INSERT INTO language_pairs (source_lang, target_lang, per_word_rate) VALUES
  ('English', 'Spanish', 0.12),
  ('Spanish', 'English', 0.12),
  ('English', 'Chinese Simplified', 0.15),
  ('Chinese Simplified', 'English', 0.15),
  ('English', 'Chinese Traditional', 0.15),
  ('Chinese Traditional', 'English', 0.15),
  ('English', 'French', 0.13),
  ('French', 'English', 0.13),
  ('English', 'German', 0.13),
  ('German', 'English', 0.13),
  ('English', 'Japanese', 0.16),
  ('Japanese', 'English', 0.16),
  ('English', 'Korean', 0.15),
  ('Korean', 'English', 0.15),
  ('English', 'Arabic', 0.15),
  ('Arabic', 'English', 0.15),
  ('English', 'Portuguese', 0.13),
  ('Portuguese', 'English', 0.13),
  ('English', 'Russian', 0.14),
  ('Russian', 'English', 0.14),
  ('English', 'Vietnamese', 0.14),
  ('Vietnamese', 'English', 0.14),
  ('English', 'Tagalog', 0.14),
  ('Tagalog', 'English', 0.14),
  ('English', 'Italian', 0.13),
  ('Italian', 'English', 0.13),
  ('English', 'Hindi', 0.14),
  ('Hindi', 'English', 0.14),
  ('English', 'Farsi', 0.15),
  ('Farsi', 'English', 0.15),
  ('English', 'Hebrew', 0.15),
  ('Hebrew', 'English', 0.15),
  ('English', 'Armenian', 0.15),
  ('Armenian', 'English', 0.15);

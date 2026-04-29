-- Store the vendor's requested rates at application time.
-- per_word_rate: for translators (per source word)
-- hourly_rate: for interpreters, notaries, and other hourly vendors

ALTER TABLE translators
  ADD COLUMN IF NOT EXISTS per_word_rate numeric(10,4),
  ADD COLUMN IF NOT EXISTS hourly_rate   numeric(10,2);

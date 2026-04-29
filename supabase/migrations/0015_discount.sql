-- Add discount fields to jobs table.
-- discount_amount: dollar amount to subtract from the quote
-- discount_label: description shown to client (e.g. "Returning client discount", "Promo code: WELCOME10")

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS discount_label  text;

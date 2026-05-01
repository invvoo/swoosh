-- Confirmed vendor rate agreed before work begins
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS vendor_confirmed_rate    numeric(10,2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS vendor_accepted_at       timestamptz;

-- Token used to send translator to the rate-confirmation page
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS translator_acceptance_token text UNIQUE;

-- Interpreter overtime request (invoiced amount may exceed confirmed rate)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS vendor_overtime_requested boolean DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS vendor_overtime_notes     text;

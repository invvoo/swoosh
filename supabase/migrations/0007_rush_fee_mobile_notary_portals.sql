-- Rush fee fields on jobs
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS quote_rush_days integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quote_rush_fee_percent numeric(6,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quote_rush_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS estimated_turnaround_days integer,
  ADD COLUMN IF NOT EXISTS requested_delivery_date date;

-- Mobile notary: add value to delivery_method enum
-- (Postgres requires ADD VALUE outside transactions)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel = 'mobile_notary'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'delivery_method_enum')
  ) THEN
    ALTER TYPE delivery_method_enum ADD VALUE 'mobile_notary';
  END IF;
EXCEPTION WHEN undefined_object THEN
  -- delivery_method is a plain text column, not an enum — no action needed
  NULL;
END $$;

-- Mobile notary address + signature count
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS notary_address text,
  ADD COLUMN IF NOT EXISTS notary_signature_count integer DEFAULT 1;

-- System settings for mobile notary pricing
INSERT INTO system_settings (key, value, description)
VALUES
  ('notary_mobile_base_rate', '80', 'Mobile notary base rate (within LA, low mileage)'),
  ('notary_mobile_max_rate', '150', 'Mobile notary max rate (outer LA, high mileage)'),
  ('notary_per_signature', '15', 'Per notary signature/stamp fee')
ON CONFLICT (key) DO NOTHING;

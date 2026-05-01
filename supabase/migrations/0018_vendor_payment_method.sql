-- Add payment preference fields to translators
ALTER TABLE translators
  ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'check',   -- 'stripe' | 'paypal' | 'zelle' | 'venmo' | 'check' | 'other'
  ADD COLUMN IF NOT EXISTS payment_details text;                  -- PayPal email, Zelle phone, mailing address, etc.

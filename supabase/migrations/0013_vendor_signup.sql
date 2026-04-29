-- Add vendor_type and applied_at to support self-service vendor applications.
-- vendor_type distinguishes translators, interpreters, and other service providers.
-- applied_at is set when a vendor submits their own application (is_active = false until admin approves).

ALTER TABLE translators
  ADD COLUMN IF NOT EXISTS vendor_type text DEFAULT 'translator'
    CHECK (vendor_type IN ('translator', 'interpreter', 'both', 'notary', 'other')),
  ADD COLUMN IF NOT EXISTS applied_at timestamptz;

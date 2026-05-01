-- Vendor profile: certifications, address, and geocoordinates for distance-based interpreter matching.
ALTER TABLE translators
  ADD COLUMN IF NOT EXISTS certifications text[]    DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS address        text,
  ADD COLUMN IF NOT EXISTS city           text,
  ADD COLUMN IF NOT EXISTS state          text,
  ADD COLUMN IF NOT EXISTS zip            text,
  ADD COLUMN IF NOT EXISTS lat            numeric(9,6),
  ADD COLUMN IF NOT EXISTS lng            numeric(9,6);

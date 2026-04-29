-- Add mailing/delivery option fields to translation jobs.
-- mailing_option: null / 'none' / 'standard' / 'hard_copy'
-- mailing_fedex_overnight: whether FedEx overnight was requested (+$69)
-- mailing_amount: total mailing cost added to the job quote

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS mailing_option text,
  ADD COLUMN IF NOT EXISTS mailing_fedex_overnight boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mailing_amount numeric(10,2);

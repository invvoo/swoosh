-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================================
-- REFERENCE / CONFIG TABLES
-- ============================================================

CREATE TABLE language_pairs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_lang     text NOT NULL,
  target_lang     text NOT NULL,
  per_word_rate   numeric(10,4) NOT NULL DEFAULT 0.12,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_lang, target_lang)
);

CREATE TABLE specialty_multipliers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  multiplier  numeric(6,4) NOT NULL DEFAULT 1.0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE equipment_items (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  description         text,
  quantity_total      integer NOT NULL DEFAULT 1,
  quantity_available  integer NOT NULL DEFAULT 1,
  rate_per_day        numeric(10,2) NOT NULL,
  deposit_amount      numeric(10,2) NOT NULL DEFAULT 0,
  is_active           boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE system_settings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text NOT NULL UNIQUE,
  value       text NOT NULL,
  description text,
  updated_by  uuid,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- CORE ENTITIES
-- ============================================================

CREATE TABLE clients (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name       text NOT NULL,
  email              text NOT NULL UNIQUE,
  phone              text,
  company_name       text,
  stripe_customer_id text,
  notes              text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE employees (
  id         uuid PRIMARY KEY,  -- same as auth.users.id
  full_name  text NOT NULL,
  role       text NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE translators (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name             text NOT NULL,
  email                 text NOT NULL UNIQUE,
  phone                 text,
  language_pairs        text[] NOT NULL DEFAULT '{}',
  specialties           text[] NOT NULL DEFAULT '{}',
  stripe_connect_id     text,
  stripe_connect_status text DEFAULT 'pending' CHECK (stripe_connect_status IN ('pending', 'active', 'restricted')),
  is_active             boolean NOT NULL DEFAULT true,
  notes                 text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- JOBS (single table, discriminated by job_type)
-- ============================================================

CREATE TABLE jobs (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type  text NOT NULL CHECK (job_type IN ('translation', 'interpretation', 'equipment_rental', 'notary')),
  status    text NOT NULL DEFAULT 'draft',
  client_id uuid NOT NULL REFERENCES clients(id),

  -- Language (used for translation + interpretation)
  source_lang   text,
  target_lang   text,
  specialty_id  uuid REFERENCES specialty_multipliers(id),

  -- Translation-specific
  word_count              integer,
  document_path           text,   -- original upload in Supabase Storage
  ai_draft_path           text,   -- AI-generated draft
  translated_doc_path     text,   -- human-reviewed final
  document_name           text,
  ai_translation_started_at   timestamptz,
  ai_translation_completed_at timestamptz,

  -- Interpretation-specific
  scheduled_at      timestamptz,
  duration_minutes  integer,
  location_type     text CHECK (location_type IN ('in_person', 'phone', 'video')),
  location_details  text,
  interpreter_notes text,

  -- Equipment rental-specific
  rental_start_date  date,
  rental_end_date    date,
  rental_items       jsonb,   -- [{itemId, name, qty, ratePerDay}]
  deposit_amount     numeric(12,2),
  deposit_refunded_at timestamptz,
  dispatch_at        timestamptz,
  return_at          timestamptz,

  -- Notary/apostille-specific
  notary_service_type text CHECK (notary_service_type IN ('notary', 'apostille', 'both')),
  delivery_method     text CHECK (delivery_method IN ('in_person', 'mail')),
  appointment_at      timestamptz,

  -- Quote / pricing
  quote_per_word_rate     numeric(10,4),
  quote_multiplier        numeric(6,4),
  quote_amount            numeric(12,2),
  quote_adjusted_amount   numeric(12,2),
  quote_finalized_at      timestamptz,
  quote_token             text UNIQUE,
  quote_token_expires_at  timestamptz,
  quote_accepted_at       timestamptz,

  -- Payment
  stripe_payment_intent_id    text,
  stripe_checkout_session_id  text UNIQUE,
  invoice_number              text UNIQUE,
  invoice_issued_at           timestamptz,
  payment_collected_at        timestamptz,

  -- Assignment
  assigned_translator_id  uuid REFERENCES translators(id),
  assigned_at             timestamptz,
  deadline_at             timestamptz,

  -- Delivery
  delivered_at              timestamptz,
  delivery_token            text UNIQUE,
  delivery_email_sent_at    timestamptz,

  -- Internal
  employee_notes  text,
  created_by      uuid REFERENCES employees(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_client ON jobs(client_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_type ON jobs(job_type);
CREATE INDEX idx_jobs_assigned_translator ON jobs(assigned_translator_id);
CREATE INDEX idx_jobs_quote_token ON jobs(quote_token);
CREATE INDEX idx_jobs_delivery_token ON jobs(delivery_token);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

-- ============================================================
-- SUPPORTING TABLES
-- ============================================================

CREATE TABLE job_status_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  old_status  text,
  new_status  text NOT NULL,
  changed_by  uuid REFERENCES employees(id),
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_status_history_job ON job_status_history(job_id);

CREATE TABLE translator_invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          uuid NOT NULL REFERENCES jobs(id),
  translator_id   uuid NOT NULL REFERENCES translators(id),
  amount          numeric(12,2) NOT NULL,
  currency        text NOT NULL DEFAULT 'usd',
  status          text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'queued', 'paid', 'failed')),
  invoice_number  text,
  submitted_at    timestamptz NOT NULL DEFAULT now(),
  approved_at     timestamptz,
  approved_by     uuid REFERENCES employees(id),
  payout_due_at   timestamptz,
  stripe_transfer_id text,
  paid_at         timestamptz,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_translator_invoices_status ON translator_invoices(status);
CREATE INDEX idx_translator_invoices_due ON translator_invoices(payout_due_at);

CREATE TABLE email_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id        uuid REFERENCES jobs(id),
  email_type    text NOT NULL,
  recipient     text NOT NULL,
  subject       text NOT NULL,
  sent_at       timestamptz NOT NULL DEFAULT now(),
  resend_id     text,
  status        text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
  error_message text
);

CREATE INDEX idx_email_log_job ON email_log(job_id);

-- ============================================================
-- INVOICE SEQUENCE + FUNCTION
-- ============================================================

CREATE SEQUENCE invoice_seq START 1;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  prefix text;
  seq_val bigint;
BEGIN
  SELECT value INTO prefix FROM system_settings WHERE key = 'invoice_prefix';
  IF prefix IS NULL THEN prefix := 'INV'; END IF;
  seq_val := nextval('invoice_seq');
  RETURN prefix || '-' || to_char(now(), 'YYYY') || '-' || lpad(seq_val::text, 4, '0');
END;
$$;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_language_pairs_updated BEFORE UPDATE ON language_pairs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_specialty_multipliers_updated BEFORE UPDATE ON specialty_multipliers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_equipment_items_updated BEFORE UPDATE ON equipment_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_translators_updated BEFORE UPDATE ON translators FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_jobs_updated BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_translator_invoices_updated BEFORE UPDATE ON translator_invoices FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE language_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialty_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE translators ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE translator_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- Helper: check if the calling user is an active employee
CREATE OR REPLACE FUNCTION is_employee()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM employees
    WHERE id = auth.uid() AND is_active = true
  );
$$;

-- Employees can do everything on all tables
CREATE POLICY "employees_all" ON language_pairs TO authenticated USING (is_employee()) WITH CHECK (is_employee());
CREATE POLICY "employees_all" ON specialty_multipliers TO authenticated USING (is_employee()) WITH CHECK (is_employee());
CREATE POLICY "employees_all" ON equipment_items TO authenticated USING (is_employee()) WITH CHECK (is_employee());
CREATE POLICY "employees_all" ON system_settings TO authenticated USING (is_employee()) WITH CHECK (is_employee());
CREATE POLICY "employees_all" ON clients TO authenticated USING (is_employee()) WITH CHECK (is_employee());
CREATE POLICY "employees_all" ON employees TO authenticated USING (is_employee()) WITH CHECK (is_employee());
CREATE POLICY "employees_all" ON translators TO authenticated USING (is_employee()) WITH CHECK (is_employee());
CREATE POLICY "employees_all" ON jobs TO authenticated USING (is_employee()) WITH CHECK (is_employee());
CREATE POLICY "employees_all" ON job_status_history TO authenticated USING (is_employee()) WITH CHECK (is_employee());
CREATE POLICY "employees_all" ON translator_invoices TO authenticated USING (is_employee()) WITH CHECK (is_employee());
CREATE POLICY "employees_all" ON email_log TO authenticated USING (is_employee()) WITH CHECK (is_employee());

-- Public read access for reference data (language pairs + specialties for forms)
CREATE POLICY "public_read" ON language_pairs FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "public_read" ON specialty_multipliers FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "public_read" ON equipment_items FOR SELECT TO anon USING (is_active = true);

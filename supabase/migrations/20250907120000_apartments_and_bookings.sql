-- Apartments and Bookings (Guests) schema and policies
-- Safe-guards for idempotency

-- Apartments table
CREATE TABLE IF NOT EXISTS public.apartments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    number TEXT NOT NULL,
    description TEXT,
    address TEXT,
    wifi_password TEXT,
    entrance_code TEXT,
    lock_code TEXT,
    hero_title TEXT,
    hero_subtitle TEXT,
    contact_info JSONB,
    map_coordinates JSONB,
    loyalty_info TEXT,
    faq_data JSONB
);

-- Guests (bookings) table
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    check_in_date TEXT NOT NULL,
    check_out_date TEXT NOT NULL,
    guide_link TEXT,
    lock_code TEXT
);

-- Add missing columns if tables already exist
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'guests' AND column_name = 'lock_code'
    ) THEN
        ALTER TABLE public.guests ADD COLUMN lock_code TEXT;
    END IF;
END $$;

-- Timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_apartments_updated_at ON public.apartments;
CREATE TRIGGER update_apartments_updated_at
BEFORE UPDATE ON public.apartments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_guests_updated_at ON public.guests;
CREATE TRIGGER update_guests_updated_at
BEFORE UPDATE ON public.guests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Simple open policies (adjust for your auth model as needed)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='apartments' AND policyname='Apartments are publicly readable'
  ) THEN
    CREATE POLICY "Apartments are publicly readable" ON public.apartments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='apartments' AND policyname='Anyone can insert apartments'
  ) THEN
    CREATE POLICY "Anyone can insert apartments" ON public.apartments FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='apartments' AND policyname='Anyone can update apartments'
  ) THEN
    CREATE POLICY "Anyone can update apartments" ON public.apartments FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='apartments' AND policyname='Anyone can delete apartments'
  ) THEN
    CREATE POLICY "Anyone can delete apartments" ON public.apartments FOR DELETE USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='guests' AND policyname='Guests are publicly readable'
  ) THEN
    CREATE POLICY "Guests are publicly readable" ON public.guests FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='guests' AND policyname='Anyone can insert guests'
  ) THEN
    CREATE POLICY "Anyone can insert guests" ON public.guests FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='guests' AND policyname='Anyone can update guests'
  ) THEN
    CREATE POLICY "Anyone can update guests" ON public.guests FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='guests' AND policyname='Anyone can delete guests'
  ) THEN
    CREATE POLICY "Anyone can delete guests" ON public.guests FOR DELETE USING (true);
  END IF;
END $$;

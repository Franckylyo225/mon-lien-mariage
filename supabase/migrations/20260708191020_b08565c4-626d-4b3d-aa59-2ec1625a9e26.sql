
-- Profiles table (mirrors auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles owner select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles owner update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles owner insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Weddings (one per user for now, unique owner)
CREATE TABLE public.weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  bride_name TEXT NOT NULL DEFAULT '',
  groom_name TEXT NOT NULL DEFAULT '',
  wedding_date DATE,
  city TEXT DEFAULT 'Abidjan',
  intro_message TEXT DEFAULT '',
  couple_story TEXT,
  hero_image_url TEXT,
  template_id TEXT NOT NULL DEFAULT 'terracotta',
  theme TEXT NOT NULL DEFAULT 'rose-elegance',
  accent TEXT,
  hashtag TEXT,
  slug TEXT UNIQUE,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  has_envelope_animation BOOLEAN NOT NULL DEFAULT false,
  onboarding_step SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weddings TO authenticated;
GRANT ALL ON public.weddings TO service_role;
GRANT SELECT ON public.weddings TO anon;
ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "weddings owner all" ON public.weddings FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
-- Public read only for published weddings (no PII beyond names, exposed slugs)
CREATE POLICY "weddings public read published" ON public.weddings FOR SELECT TO anon USING (is_published = true);
CREATE POLICY "weddings authed read published" ON public.weddings FOR SELECT TO authenticated USING (is_published = true OR auth.uid() = owner_id);

-- Ceremonies
CREATE TABLE public.ceremonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  name TEXT NOT NULL,
  date DATE,
  time_start TEXT,
  time_end TEXT,
  venue TEXT,
  maps_url TEXT,
  dress_code TEXT,
  color TEXT,
  capacity INT,
  notes TEXT,
  program JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'brouillon',
  public_slug TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ceremonies_wedding_idx ON public.ceremonies(wedding_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ceremonies TO authenticated;
GRANT ALL ON public.ceremonies TO service_role;
GRANT SELECT ON public.ceremonies TO anon;
ALTER TABLE public.ceremonies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ceremonies owner all" ON public.ceremonies FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.owner_id = auth.uid()));
CREATE POLICY "ceremonies public read" ON public.ceremonies FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.is_published = true));
CREATE POLICY "ceremonies authed read published" ON public.ceremonies FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.is_published = true));

-- Guests (private, never anon)
CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  group_name TEXT DEFAULT '',
  guest_type TEXT NOT NULL DEFAULT 'autre',
  allowed_plus_ones INT NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'manuel',
  ceremony_ids UUID[] NOT NULL DEFAULT '{}',
  rsvps JSONB NOT NULL DEFAULT '[]'::jsonb,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX guests_wedding_idx ON public.guests(wedding_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guests TO authenticated;
GRANT ALL ON public.guests TO service_role;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guests owner all" ON public.guests FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.owner_id = auth.uid()));

-- Public RSVPs from the /e/:slug page (any visitor can insert, only owner can read)
CREATE TABLE public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  ceremony_id UUID REFERENCES public.ceremonies(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_phone TEXT,
  guest_email TEXT,
  attending BOOLEAN NOT NULL,
  companions INT NOT NULL DEFAULT 0,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX rsvps_wedding_idx ON public.rsvps(wedding_id);
GRANT SELECT, DELETE ON public.rsvps TO authenticated;
GRANT INSERT ON public.rsvps TO anon, authenticated;
GRANT ALL ON public.rsvps TO service_role;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rsvps public insert on published" ON public.rsvps FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.is_published = true));
CREATE POLICY "rsvps owner read" ON public.rsvps FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.owner_id = auth.uid()));
CREATE POLICY "rsvps owner delete" ON public.rsvps FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.owner_id = auth.uid()));

-- updated_at trigger for weddings
CREATE OR REPLACE FUNCTION public.tg_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER weddings_touch_updated BEFORE UPDATE ON public.weddings
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

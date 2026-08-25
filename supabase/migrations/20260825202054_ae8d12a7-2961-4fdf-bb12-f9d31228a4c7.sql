CREATE TABLE IF NOT EXISTS public.wedding_story_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  year text,
  title text NOT NULL DEFAULT '',
  text text,
  photo_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wedding_story_steps_wedding_idx ON public.wedding_story_steps(wedding_id, sort_order);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wedding_story_steps TO authenticated;
GRANT SELECT ON public.wedding_story_steps TO anon;
GRANT ALL ON public.wedding_story_steps TO service_role;

ALTER TABLE public.wedding_story_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner manages story steps" ON public.wedding_story_steps;
CREATE POLICY "Owner manages story steps" ON public.wedding_story_steps
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Public reads published story steps" ON public.wedding_story_steps;
CREATE POLICY "Public reads published story steps" ON public.wedding_story_steps
FOR SELECT TO anon
USING (EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = wedding_id AND w.is_published = true));

DROP TRIGGER IF EXISTS trg_story_steps_touch ON public.wedding_story_steps;
CREATE TRIGGER trg_story_steps_touch BEFORE UPDATE ON public.wedding_story_steps
FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  referrer text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX page_views_wedding_id_idx ON public.page_views (wedding_id, created_at DESC);

GRANT INSERT ON public.page_views TO anon;
GRANT SELECT, INSERT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a page view"
ON public.page_views FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Owners can read their page views"
ON public.page_views FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.weddings w
  WHERE w.id = page_views.wedding_id AND w.owner_id = auth.uid()
));
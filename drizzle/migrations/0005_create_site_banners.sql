-- ===========================================================================
-- MonInvit — bandeau d'information configurable (table site_banners)
-- À exécuter une fois sur la base de production.
-- Rejouable sans risque : relancer ce script ne détruit ni ne duplique rien.
-- ===========================================================================

-- 1. La table ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  link_label text,
  link_href text,
  variant text NOT NULL DEFAULT 'promo' CHECK (variant IN ('promo', 'info', 'alerte')),
  audience text NOT NULL DEFAULT 'tous' CHECK (audience IN ('tous', 'visiteurs', 'connectes')),
  is_dismissible boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT false,
  starts_at timestamptz,
  ends_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_banners_message_not_blank CHECK (btrim(message) <> ''),
  -- Un libellé sans cible, ou l'inverse, donnerait un lien mort.
  CONSTRAINT site_banners_link_pair CHECK (
    (link_label IS NULL AND link_href IS NULL)
    OR (btrim(coalesce(link_label, '')) <> '' AND btrim(coalesce(link_href, '')) <> '')
  ),
  -- Chemin interne ou https : rien d'autre n'a à être injecté dans un href
  -- rendu sur toutes les pages du site.
  CONSTRAINT site_banners_link_href_shape CHECK (
    link_href IS NULL OR link_href ~ '^(/|https://)'
  ),
  CONSTRAINT site_banners_window CHECK (
    starts_at IS NULL OR ends_at IS NULL OR ends_at > starts_at
  )
);

-- 2. Droits --------------------------------------------------------------
GRANT SELECT ON public.site_banners TO anon;
GRANT SELECT ON public.site_banners TO authenticated;
GRANT ALL ON public.site_banners TO service_role;

ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY;

-- 3. Politiques ----------------------------------------------------------
-- La fenêtre de diffusion est appliquée ici, pas seulement côté application :
-- un bandeau programmé ne doit pas être lisible avant son heure.
DROP POLICY IF EXISTS "Active banners are readable by everyone" ON public.site_banners;
CREATE POLICY "Active banners are readable by everyone"
ON public.site_banners FOR SELECT
USING (
  is_active = true
  AND (starts_at IS NULL OR starts_at <= now())
  AND (ends_at IS NULL OR ends_at > now())
);

DROP POLICY IF EXISTS "Admins can manage site banners" ON public.site_banners;
CREATE POLICY "Admins can manage site banners"
ON public.site_banners FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

-- 4. Index et déclencheur ------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_site_banners_active
  ON public.site_banners(is_active, updated_at DESC);

-- public.tg_touch_updated_at() existe déjà (weddings, blog_posts l'utilisent) ;
-- ce script ne la redéfinit pas, pour ne pas écraser son search_path durci.
DROP TRIGGER IF EXISTS site_banners_touch_updated_at ON public.site_banners;
CREATE TRIGGER site_banners_touch_updated_at
BEFORE UPDATE ON public.site_banners
FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
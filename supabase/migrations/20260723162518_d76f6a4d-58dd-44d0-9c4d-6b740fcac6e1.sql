
-- Livre d'or : colonnes sur weddings
ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS has_guestbook boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS guestbook_title text,
  ADD COLUMN IF NOT EXISTS guestbook_subtitle text;

-- Table des messages du livre d'or
CREATE TABLE IF NOT EXISTS public.guestbook_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_relation text,
  message text NOT NULL,
  color_index integer NOT NULL DEFAULT 0,
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guestbook_wedding
  ON public.guestbook_messages(wedding_id, created_at DESC);

GRANT SELECT, INSERT ON public.guestbook_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guestbook_messages TO authenticated;
GRANT ALL ON public.guestbook_messages TO service_role;

ALTER TABLE public.guestbook_messages ENABLE ROW LEVEL SECURITY;

-- Toute personne peut lire les messages approuvés d'un événement publié avec livre d'or activé
CREATE POLICY "Public can read approved guestbook messages"
  ON public.guestbook_messages
  FOR SELECT
  USING (
    is_approved = true
    AND EXISTS (
      SELECT 1 FROM public.weddings w
      WHERE w.id = wedding_id
        AND w.has_guestbook = true
        AND w.is_published = true
    )
  );

-- Le propriétaire peut tout lire (y compris non approuvés)
CREATE POLICY "Owner can read all guestbook messages"
  ON public.guestbook_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.weddings w
      WHERE w.id = wedding_id AND w.owner_id = auth.uid()
    )
  );

-- Toute personne peut poster un message si le livre d'or est activé et l'événement publié
CREATE POLICY "Public can insert guestbook messages"
  ON public.guestbook_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.weddings w
      WHERE w.id = wedding_id
        AND w.has_guestbook = true
        AND w.is_published = true
    )
  );

-- Le propriétaire peut supprimer / modérer
CREATE POLICY "Owner can delete guestbook messages"
  ON public.guestbook_messages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.weddings w
      WHERE w.id = wedding_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owner can update guestbook messages"
  ON public.guestbook_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.weddings w
      WHERE w.id = wedding_id AND w.owner_id = auth.uid()
    )
  );

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.guestbook_messages;

-- Notification in-app quand un nouveau message est posté
CREATE OR REPLACE FUNCTION public.on_guestbook_message_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_owner uuid;
BEGIN
  SELECT owner_id INTO v_owner FROM public.weddings WHERE id = NEW.wedding_id;
  IF v_owner IS NULL THEN RETURN NEW; END IF;

  INSERT INTO public.notifications (user_id, wedding_id, type, title, body, data)
  VALUES (
    v_owner, NEW.wedding_id, 'guestbook_message',
    'Nouveau message dans votre livre d''or',
    COALESCE(NEW.author_name, 'Un invité') || ' vous a laissé un message.',
    jsonb_build_object('guestbook_id', NEW.id, 'author_name', NEW.author_name)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'on_guestbook_message_created failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_guestbook_message_created ON public.guestbook_messages;
CREATE TRIGGER trg_on_guestbook_message_created
  AFTER INSERT ON public.guestbook_messages
  FOR EACH ROW EXECUTE FUNCTION public.on_guestbook_message_created();

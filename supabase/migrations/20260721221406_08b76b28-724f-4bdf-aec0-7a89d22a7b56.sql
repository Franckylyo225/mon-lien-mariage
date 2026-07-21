
-- 1. notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wedding_id uuid REFERENCES public.weddings(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id) WHERE read_at IS NULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 2. milestone tracking table
CREATE TABLE public.rsvp_milestones_sent (
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  milestone int NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (wedding_id, milestone)
);
GRANT ALL ON public.rsvp_milestones_sent TO service_role;
ALTER TABLE public.rsvp_milestones_sent ENABLE ROW LEVEL SECURITY;
-- no authenticated policies: server-side only via SECURITY DEFINER trigger

-- 3. trigger function
CREATE OR REPLACE FUNCTION public.on_rsvp_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_owner uuid;
  v_bride text;
  v_groom text;
  v_slug text;
  v_count int;
  v_milestone int;
  v_milestones int[] := ARRAY[1,5,10,25,50,100,200,500,1000,2000];
  v_owner_email text;
  v_service_key text;
BEGIN
  IF NEW.attending IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  SELECT owner_id, bride_name, groom_name, slug
    INTO v_owner, v_bride, v_groom, v_slug
  FROM public.weddings WHERE id = NEW.wedding_id;

  IF v_owner IS NULL THEN
    RETURN NEW;
  END IF;

  -- in-app notification for the RSVP itself
  INSERT INTO public.notifications (user_id, wedding_id, type, title, body, data)
  VALUES (
    v_owner, NEW.wedding_id, 'rsvp_confirmed',
    'Nouvelle confirmation',
    COALESCE(NEW.guest_name, 'Un invité') || ' a confirmé sa présence.',
    jsonb_build_object('guest_name', NEW.guest_name, 'rsvp_id', NEW.id)
  );

  -- count total confirmed RSVPs for this wedding
  SELECT COUNT(*) INTO v_count
    FROM public.rsvps
   WHERE wedding_id = NEW.wedding_id AND attending IS TRUE;

  -- find milestone (only trigger the exact hit, not every count above)
  SELECT m INTO v_milestone
    FROM unnest(v_milestones) AS m
   WHERE m = v_count
   LIMIT 1;

  IF v_milestone IS NULL THEN
    RETURN NEW;
  END IF;

  -- Record the milestone; ON CONFLICT DO NOTHING makes it idempotent.
  BEGIN
    INSERT INTO public.rsvp_milestones_sent (wedding_id, milestone)
    VALUES (NEW.wedding_id, v_milestone);
  EXCEPTION WHEN unique_violation THEN
    RETURN NEW;
  END;

  -- Milestone in-app notification
  INSERT INTO public.notifications (user_id, wedding_id, type, title, body, data)
  VALUES (
    v_owner, NEW.wedding_id, 'rsvp_milestone',
    'Félicitations ! ' || v_milestone || ' confirmation' || CASE WHEN v_milestone > 1 THEN 's' ELSE '' END,
    'Vous avez atteint ' || v_milestone || ' confirmation' || CASE WHEN v_milestone > 1 THEN 's' ELSE '' END || ' de présence.',
    jsonb_build_object('milestone', v_milestone, 'total', v_count)
  );

  -- Trigger the milestone email via internal HTTP endpoint (best-effort)
  BEGIN
    SELECT email INTO v_owner_email FROM auth.users WHERE id = v_owner;
    SELECT decrypted_secret INTO v_service_key
      FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key';

    IF v_owner_email IS NOT NULL AND v_service_key IS NOT NULL THEN
      PERFORM net.http_post(
        url := 'https://project--e93d96ce-2e56-46da-9063-996fb84fe947.lovable.app/api/public/hooks/rsvp-milestone',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body := jsonb_build_object(
          'wedding_id', NEW.wedding_id,
          'milestone', v_milestone,
          'owner_email', v_owner_email,
          'bride_name', v_bride,
          'groom_name', v_groom,
          'slug', v_slug
        )
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'on_rsvp_confirmed: milestone email dispatch failed: %', SQLERRM;
  END;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'on_rsvp_confirmed failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_rsvp_confirmed ON public.rsvps;
CREATE TRIGGER trg_on_rsvp_confirmed
  AFTER INSERT ON public.rsvps
  FOR EACH ROW EXECUTE FUNCTION public.on_rsvp_confirmed();

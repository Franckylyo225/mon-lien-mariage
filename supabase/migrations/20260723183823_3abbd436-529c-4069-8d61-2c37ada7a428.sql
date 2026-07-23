
CREATE OR REPLACE FUNCTION public.on_support_admin_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user uuid;
  v_subject text;
BEGIN
  IF NEW.author_role <> 'admin' THEN
    RETURN NEW;
  END IF;

  SELECT user_id, subject INTO v_user, v_subject
  FROM public.support_tickets WHERE id = NEW.ticket_id;

  IF v_user IS NULL OR v_user = NEW.author_id THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    v_user,
    'support_reply',
    'Nouvelle réponse du support',
    COALESCE('Ticket : ' || v_subject, 'Le support a répondu à votre ticket.'),
    jsonb_build_object('ticket_id', NEW.ticket_id, 'message_id', NEW.id)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'on_support_admin_reply failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_support_admin_reply ON public.support_messages;
CREATE TRIGGER trg_support_admin_reply
AFTER INSERT ON public.support_messages
FOR EACH ROW EXECUTE FUNCTION public.on_support_admin_reply();


-- Fix function search_path and revoke public EXECUTE on SECURITY DEFINER functions
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = '';
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = '';
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = '';
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.tg_touch_updated_at() SET search_path = '';

-- Revoke EXECUTE from anon/authenticated on privileged SECURITY DEFINER helpers.
-- These functions wrap pgmq (queue) operations and must only be callable by
-- server-side code using the service role, cron jobs, or triggers.
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Ensure service_role retains access
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_dispatch() TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_wake() TO service_role;

-- Restrict wedding-photos public read to files that belong to a published wedding.
-- File paths follow "<wedding_id>/..." so we join the first folder segment to weddings.
DROP POLICY IF EXISTS "wedding_photos_public_read" ON storage.objects;
CREATE POLICY "wedding_photos_public_read"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'wedding-photos'
    AND EXISTS (
      SELECT 1 FROM public.weddings w
      WHERE (w.id)::text = (storage.foldername(objects.name))[1]
        AND w.is_published = true
    )
  );

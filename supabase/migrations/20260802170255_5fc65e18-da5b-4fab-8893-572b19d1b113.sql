GRANT SELECT, INSERT ON public.guestbook_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guestbook_messages TO authenticated;
GRANT ALL ON public.guestbook_messages TO service_role;
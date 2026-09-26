-- Couple-side "heart" on guestbook messages. Only the wedding owner can change it
-- (existing "Owner can update guestbook messages" policy).
ALTER TABLE public.guestbook_messages
  ADD COLUMN IF NOT EXISTS is_favorite boolean NOT NULL DEFAULT false;

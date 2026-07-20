CREATE POLICY "wedding_photos_owner_read"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'wedding-photos'
    AND EXISTS (
      SELECT 1 FROM public.weddings w
      WHERE (w.id)::text = (storage.foldername(objects.name))[1]
        AND w.owner_id = auth.uid()
    )
  );
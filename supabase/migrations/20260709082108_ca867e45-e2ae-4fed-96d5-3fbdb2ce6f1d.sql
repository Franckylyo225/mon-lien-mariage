-- Public read on wedding-photos objects (bucket is private, RLS-gated)
CREATE POLICY "wedding_photos_public_read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'wedding-photos');

-- Owner-scoped insert: path must start with wedding_id owned by auth.uid()
CREATE POLICY "wedding_photos_owner_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'wedding-photos'
  AND EXISTS (
    SELECT 1 FROM public.weddings w
    WHERE w.id::text = (storage.foldername(name))[1]
      AND w.owner_id = auth.uid()
  )
);

CREATE POLICY "wedding_photos_owner_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'wedding-photos'
  AND EXISTS (
    SELECT 1 FROM public.weddings w
    WHERE w.id::text = (storage.foldername(name))[1]
      AND w.owner_id = auth.uid()
  )
);

CREATE POLICY "wedding_photos_owner_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'wedding-photos'
  AND EXISTS (
    SELECT 1 FROM public.weddings w
    WHERE w.id::text = (storage.foldername(name))[1]
      AND w.owner_id = auth.uid()
  )
);
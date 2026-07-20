DROP POLICY IF EXISTS wedding_photos_public_read ON storage.objects;
CREATE POLICY wedding_photos_public_read ON storage.objects
  FOR SELECT
  USING (bucket_id = 'wedding-photos');
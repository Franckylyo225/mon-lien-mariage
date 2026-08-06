CREATE POLICY "Admins manage blog images" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'blog-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner')))
WITH CHECK (bucket_id = 'blog-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner')));
ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS theme_block_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS theme_block_title text,
  ADD COLUMN IF NOT EXISTS theme_block_body text,
  ADD COLUMN IF NOT EXISTS theme_block_images text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS theme_block_style jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.weddings
   SET theme_block_enabled = true,
       theme_block_title = COALESCE(NULLIF(theme_block_title, ''), NULLIF(story_title, ''), 'Thème du mariage'),
       theme_block_body = COALESCE(NULLIF(theme_block_body, ''), story_body),
       theme_block_images = CASE WHEN COALESCE(array_length(theme_block_images, 1), 0) = 0
                                 THEN COALESCE(story_images, '{}'::text[])
                                 ELSE theme_block_images END,
       theme_block_style = CASE WHEN theme_block_style = '{}'::jsonb
                                THEN COALESCE(story_style, '{}'::jsonb)
                                ELSE theme_block_style END
 WHERE COALESCE(NULLIF(story_body, ''), NULL) IS NOT NULL
    OR COALESCE(array_length(story_images, 1), 0) > 0;
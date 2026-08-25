-- Ajouter seulement si ces colonnes n'existent pas déjà
ALTER TABLE weddings
  ADD COLUMN IF NOT EXISTS story_layout text DEFAULT 'left'
    CHECK (story_layout IN ('left', 'center', 'cards')),
  ADD COLUMN IF NOT EXISTS story_photo_shape text DEFAULT 'rounded'
    CHECK (story_photo_shape IN ('rounded', 'circle', 'square'));

-- story_enabled existe déjà ; story_section_title n'existe pas encore
ALTER TABLE weddings
  ADD COLUMN IF NOT EXISTS story_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS story_section_title text DEFAULT 'Notre Histoire';
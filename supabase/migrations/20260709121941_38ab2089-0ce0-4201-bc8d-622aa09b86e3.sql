ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS accent_color text;
ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS background_base text;
ALTER TABLE public.weddings ADD CONSTRAINT weddings_background_base_check CHECK (background_base IS NULL OR background_base IN ('ivoire','creme','blanc','gris'));
ALTER TABLE public.weddings ADD CONSTRAINT weddings_accent_color_check CHECK (accent_color IS NULL OR accent_color ~ '^#[0-9A-Fa-f]{6}$');
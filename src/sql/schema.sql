-- =========================================================================
-- KCYM ST. MARY'S CHURCH, NELLAYI - CHRISTMAS PRIZE COUPON DATABASE SCHEMA
-- Target Backend: Supabase / PostgreSQL 15+
-- =========================================================================

-- 1. Create Draw Settings Table
CREATE TABLE IF NOT EXISTS public.draw_settings (
    id INT PRIMARY KEY DEFAULT 1,
    draw_date_ist TIMESTAMPTZ NOT NULL DEFAULT '2026-12-24 23:00:00+05:30',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    published_by TEXT,
    draw_venue TEXT NOT NULL DEFAULT 'St. Mary''s Forane Church Parish Hall, Nellayi',
    draw_venue_ml TEXT DEFAULT 'സെന്റ് മേരീസ് പള്ളി  നെല്ലായി, തൃശൂർ',
    hero_headline TEXT NOT NULL DEFAULT 'Christmas Joy. Exciting Gifts. Lucky Winners!',
    hero_headline_ml TEXT DEFAULT 'ക്രിസ്മസ് സന്തോഷം. ആകർഷകമായ സമ്മാനങ്ങൾ. ഭാഗ്യശാലികൾ!',
    hero_subtitle TEXT NOT NULL DEFAULT 'Welcome to the official KCYM St. Mary''s Church, Nellayi Prize Coupon Results portal.',
    hero_subtitle_ml TEXT DEFAULT 'നെല്ലായി സെന്റ് മേരീസ് പള്ളി കെ.സി.വൈ.എം. ക്രിസ്മസ് ഭാഗ്യക്കുറി ഔദ്യോഗിക ഫലങ്ങളിലേക്ക് സ്വാഗതം.',
    announcement_text TEXT DEFAULT 'Grand Draw on December 24, 2026 at 11:00 PM IST.',
    announcement_text_ml TEXT DEFAULT '2026 ഡിസംബർ 24-ന് രാത്രി 11:00 മണിക്ക് നറുക്കെടുപ്പ് നടക്കും.',
    contact_phone TEXT DEFAULT '+91 94470 12345 / 0480 2751234',
    contact_email TEXT DEFAULT 'kcymnellayi@gmail.com',
    church_address TEXT DEFAULT 'St. Mary''s Church, Nellayi P.O., Thrissur - 680305, Kerala',
    coupon_price TEXT DEFAULT '₹50',
    prizes JSONB NOT NULL DEFAULT '[]'::jsonb,
    CONSTRAINT single_row_check CHECK (id = 1)
);
ALTER TABLE public.draw_settings
    ADD COLUMN IF NOT EXISTS prizes JSONB NOT NULL DEFAULT '[]'::jsonb;

INSERT INTO public.draw_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Migrate existing winner rows once when the legacy tables are present.
DO $$
BEGIN
    IF to_regclass('public.prizes') IS NOT NULL THEN
        EXECUTE $prizes_migration$
            UPDATE public.draw_settings AS settings
            SET prizes = (
                SELECT COALESCE(jsonb_agg(jsonb_build_object(
                    'id', 'prize-' || prize.rank,
                    'rank', prize.rank,
                    'title', prize.title,
                    'title_ml', prize.title_ml,
                    'category', prize.category,
                    'categoryLabel', prize.category_label,
                    'categoryLabel_ml', prize.category_label_ml,
                    'imageUrl', prize.image_url,
                    'description', prize.description,
                    'description_ml', prize.description_ml,
                    'sponsor', prize.sponsor,
                    'sponsor_ml', prize.sponsor_ml,
                    'orderIndex', prize.order_index,
                    'badge', prize.badge,
                    'badge_ml', prize.badge_ml
                ) ORDER BY prize.order_index), '[]'::jsonb)
                FROM public.prizes AS prize
            )
            WHERE settings.id = 1 AND settings.prizes = '[]'::jsonb
        $prizes_migration$;
    END IF;
    IF to_regclass('public.winners') IS NOT NULL AND to_regclass('public.prizes') IS NOT NULL THEN
        EXECUTE $migration$
            UPDATE public.draw_settings AS settings
            SET prizes = (
                SELECT COALESCE(jsonb_agg(
                    CASE WHEN winner.id IS NULL THEN prize_row.value
                    ELSE jsonb_set(prize_row.value, '{winner}', jsonb_build_object(
                        'id', winner.id::text,
                        'prizeId', 'prize-' || prize.rank,
                        'winningCouponNumber', winner.winning_coupon_number,
                        'winnerName', winner.winner_name,
                        'winnerLocation', winner.winner_location,
                        'verifiedAt', winner.verified_at,
                        'createdAt', winner.created_at
                    ), true) END
                    ORDER BY prize_row.ordinality
                ), '[]'::jsonb)
                FROM jsonb_array_elements(settings.prizes) WITH ORDINALITY AS prize_row(value, ordinality)
                LEFT JOIN (
                    SELECT winner.*, prize.rank, 'prize-' || prize.rank AS prize_id
                    FROM public.winners AS winner
                    JOIN public.prizes AS prize ON prize.id = winner.prize_id
                ) AS winner ON prize_row.value ->> 'id' = winner.prize_id
            )
            WHERE settings.id = 1
        $migration$;
    END IF;
END
$$;

-- 4. Create Administrator Audit Logs Table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT now(),
    action TEXT NOT NULL,
    details TEXT,
    admin_email TEXT NOT NULL
);

-- Username-to-email lookup is available only to the username-login Edge Function.
CREATE TABLE IF NOT EXISTS public.admin_usernames (
    username TEXT PRIMARY KEY CHECK (username = lower(username)),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_usernames ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.admin_usernames FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.admin_usernames TO service_role;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Security: Unauthenticated public can NEVER see unpublished results!
-- =========================================================================

ALTER TABLE public.draw_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Draw Settings Policies:
-- Anyone can view settings (needed for countdown & publication flag)
DROP POLICY IF EXISTS "Public can view draw settings" ON public.draw_settings;
DROP POLICY IF EXISTS "Admins can update draw settings" ON public.draw_settings;
CREATE POLICY "Public can view draw settings"
    ON public.draw_settings FOR SELECT
    TO anon, authenticated
    USING (true);

-- Admin roles must be assigned through trusted Supabase app_metadata.
CREATE POLICY "Admins can update draw settings"
    ON public.draw_settings FOR ALL
    TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('superadmin', 'organizer'))
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('superadmin', 'organizer'));

-- Public roles can read settings but not the private prize assignments.
REVOKE SELECT ON TABLE public.draw_settings FROM PUBLIC, anon;
GRANT SELECT (
    id, draw_date_ist, timezone, is_published, published_at, published_by,
    draw_venue, draw_venue_ml, hero_headline, hero_headline_ml,
    hero_subtitle, hero_subtitle_ml, announcement_text, announcement_text_ml,
    contact_phone, contact_email, church_address,
    coupon_price
) ON TABLE public.draw_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.draw_settings TO authenticated;

CREATE TABLE IF NOT EXISTS public.draw_settings_publication (
    id INT PRIMARY KEY,
    is_published BOOLEAN NOT NULL DEFAULT false,
    prizes JSONB NOT NULL DEFAULT '[]'::jsonb,
    winners JSONB NOT NULL DEFAULT '[]'::jsonb
);
ALTER TABLE public.draw_settings_publication
    ADD COLUMN IF NOT EXISTS prizes JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.draw_settings_publication ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published draw state" ON public.draw_settings_publication;
CREATE POLICY "Public can view published draw state"
    ON public.draw_settings_publication FOR SELECT TO anon, authenticated
    USING (true);
REVOKE ALL ON TABLE public.draw_settings_publication FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.draw_settings_publication TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.sync_public_draw_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    public_prizes JSONB;
    public_winners JSONB;
BEGIN
    SELECT COALESCE(jsonb_agg(prize.value - 'winner' ORDER BY prize.ordinality), '[]'::jsonb),
           COALESCE(jsonb_agg(prize.value -> 'winner' ORDER BY prize.ordinality)
               FILTER (WHERE jsonb_typeof(prize.value -> 'winner') = 'object'), '[]'::jsonb)
    INTO public_prizes, public_winners
    FROM jsonb_array_elements(NEW.prizes) WITH ORDINALITY AS prize(value, ordinality);

    INSERT INTO public.draw_settings_publication (id, is_published, prizes, winners)
    VALUES (NEW.id, NEW.is_published, public_prizes,
        CASE WHEN NEW.is_published THEN public_winners ELSE '[]'::jsonb END)
    ON CONFLICT (id) DO UPDATE SET
        is_published = EXCLUDED.is_published,
        prizes = EXCLUDED.prizes,
        winners = EXCLUDED.winners;
    RETURN NEW;
END
$$;
REVOKE ALL ON FUNCTION public.sync_public_draw_settings() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS sync_public_draw_settings ON public.draw_settings;
CREATE TRIGGER sync_public_draw_settings
    AFTER INSERT OR UPDATE ON public.draw_settings
    FOR EACH ROW EXECUTE FUNCTION public.sync_public_draw_settings();

INSERT INTO public.draw_settings_publication (id, is_published, prizes, winners)
SELECT settings.id,
       settings.is_published,
       COALESCE((
           SELECT jsonb_agg(prize.value - 'winner' ORDER BY prize.ordinality)
           FROM jsonb_array_elements(settings.prizes) WITH ORDINALITY AS prize(value, ordinality)
       ), '[]'::jsonb),
       CASE WHEN settings.is_published THEN COALESCE((
           SELECT jsonb_agg(prize.value -> 'winner' ORDER BY prize.ordinality)
               FILTER (WHERE jsonb_typeof(prize.value -> 'winner') = 'object')
           FROM jsonb_array_elements(settings.prizes) WITH ORDINALITY AS prize(value, ordinality)
       ), '[]'::jsonb) ELSE '[]'::jsonb END
FROM public.draw_settings AS settings
WHERE settings.id = 1
ON CONFLICT (id) DO UPDATE SET
    is_published = EXCLUDED.is_published,
    prizes = EXCLUDED.prizes,
    winners = EXCLUDED.winners;

CREATE OR REPLACE VIEW public.published_draw_settings AS
SELECT id, is_published, winners, prizes
FROM public.draw_settings_publication
WHERE id = 1;
GRANT SELECT ON public.published_draw_settings TO anon, authenticated;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'draw_settings'
    ) THEN
        ALTER PUBLICATION supabase_realtime DROP TABLE public.draw_settings;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
          AND tablename = 'draw_settings_publication'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.draw_settings_publication;
    END IF;
END
$$;

-- Audit Log Policies:
-- Only authenticated administrators can view or append audit logs
DROP POLICY IF EXISTS "Admins can view and create audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view and create audit logs"
    ON public.admin_audit_logs FOR ALL
    TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('superadmin', 'organizer'))
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('superadmin', 'organizer'));

-- =========================================================================
-- STORAGE BUCKET CREATION FOR PRIZE IMAGES
-- =========================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('prize-images', 'prize-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view prize photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload prize photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete prize photos" ON storage.objects;
CREATE POLICY "Public can view prize photos"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'prize-images');

CREATE POLICY "Admins can upload prize photos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'prize-images'
        AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('superadmin', 'organizer')
    );

CREATE POLICY "Admins can delete prize photos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'prize-images'
        AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('superadmin', 'organizer')
    );

NOTIFY pgrst, 'reload schema';

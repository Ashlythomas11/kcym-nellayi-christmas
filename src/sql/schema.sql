-- =========================================================================
-- KCYM ST. MARY'S CHURCH, NELLAYI - CHRISTMAS PRIZE COUPON DATABASE SCHEMA
-- Target Backend: Supabase / PostgreSQL 15+
-- =========================================================================

-- 1. Create Draw Settings Table
CREATE TABLE IF NOT EXISTS public.draw_settings (
    id INT PRIMARY KEY DEFAULT 1,
    draw_date_ist TIMESTAMPTZ NOT NULL DEFAULT '2026-12-25 00:00:00+05:30',
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
    announcement_text TEXT DEFAULT 'Grand Draw on Christmas Day, Dec 25, 2026 at 12:00 AM IST.',
    announcement_text_ml TEXT DEFAULT '2026 ഡിസംബർ 25-ന് അർദ്ധരാത്രി 12:00 മണിക്ക് നറുക്കെടുപ്പ് നടക്കും.',
    contact_phone TEXT DEFAULT '+91 94470 12345 / 0480 2751234',
    contact_email TEXT DEFAULT 'kcymnellayi@gmail.com',
    church_address TEXT DEFAULT 'St. Mary''s Church, Nellayi P.O., Thrissur - 680305, Kerala',
    coupon_price TEXT DEFAULT '₹50',
    CONSTRAINT single_row_check CHECK (id = 1)
);

-- 2. Create Prizes Table
CREATE TABLE IF NOT EXISTS public.prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rank INT NOT NULL,
    title TEXT NOT NULL,
    title_ml TEXT,
    category TEXT NOT NULL CHECK (category IN ('bumper', 'major', 'appliance', 'consolation')),
    category_label TEXT NOT NULL,
    category_label_ml TEXT,
    image_url TEXT NOT NULL,
    description TEXT,
    description_ml TEXT,
    sponsor TEXT,
    sponsor_ml TEXT,
    order_index INT NOT NULL DEFAULT 0,
    badge TEXT,
    badge_ml TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Winners Table (Prize-to-Winner Association)
CREATE TABLE IF NOT EXISTS public.winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prize_id UUID NOT NULL REFERENCES public.prizes(id) ON DELETE CASCADE,
    winning_coupon_number TEXT NOT NULL UNIQUE,
    winner_name TEXT NOT NULL,
    winner_location TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

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
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
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

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'draw_settings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.draw_settings;
    END IF;
END
$$;

-- Prizes Policies:
-- Anyone can view the gift gallery
DROP POLICY IF EXISTS "Public can view prizes" ON public.prizes;
DROP POLICY IF EXISTS "Admins can manage prizes" ON public.prizes;
CREATE POLICY "Public can view prizes"
    ON public.prizes FOR SELECT
    TO anon, authenticated
    USING (true);

-- Only admins can manage prizes
CREATE POLICY "Admins can manage prizes"
    ON public.prizes FOR ALL
    TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('superadmin', 'organizer'))
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('superadmin', 'organizer'));

-- Winners Policies:
-- Public can ONLY view winners if the draw has been officially published!
DROP POLICY IF EXISTS "Public can only view published winners" ON public.winners;
DROP POLICY IF EXISTS "Admins have full access to winners" ON public.winners;
CREATE POLICY "Public can only view published winners"
    ON public.winners FOR SELECT
    TO anon
    USING (
        EXISTS (
            SELECT 1 FROM public.draw_settings
            WHERE id = 1 AND is_published = true
        )
    );

-- Admins can view and manage winners at all times (including draft preview)
CREATE POLICY "Admins have full access to winners"
    ON public.winners FOR ALL
    TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('superadmin', 'organizer'))
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('superadmin', 'organizer'));

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

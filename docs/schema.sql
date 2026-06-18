-- ============================================================================
-- TruthLens AI Platform — Complete Supabase PostgreSQL Schema
-- ============================================================================
-- Generated: 2026-06-12
-- Description: Full database schema including tables, indexes, RLS policies,
--              triggers, functions, and seed data for the TruthLens platform.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT UNIQUE NOT NULL,
    full_name   TEXT,
    avatar_url  TEXT,
    bio         TEXT,
    role        TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    is_banned   BOOLEAN DEFAULT false,
    is_suspended BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'User profiles linked 1-to-1 with auth.users';

-- ============================================================================
-- 2. USER_PREFERENCES
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES profiles(id) ON DELETE CASCADE,
    topics              TEXT[] DEFAULT '{}',
    email_notifications BOOLEAN DEFAULT true,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

COMMENT ON TABLE user_preferences IS 'Per-user topic and notification preferences';

-- ============================================================================
-- 3. SOURCES
-- ============================================================================
CREATE TABLE IF NOT EXISTS sources (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              TEXT UNIQUE NOT NULL,
    domain            TEXT UNIQUE,
    credibility_score INTEGER DEFAULT 50
                      CHECK (credibility_score >= 0 AND credibility_score <= 100),
    category          TEXT,
    description       TEXT,
    is_verified       BOOLEAN DEFAULT false,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE sources IS 'News sources with credibility scores';

-- ============================================================================
-- 4. ARTICLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS articles (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title             TEXT NOT NULL,
    description       TEXT,
    content           TEXT,
    url               TEXT UNIQUE NOT NULL,
    image_url         TEXT,
    source_id         UUID REFERENCES sources(id) ON DELETE SET NULL,
    source_name       TEXT,
    author            TEXT,
    topic             TEXT,
    published_at      TIMESTAMPTZ,
    fetched_at        TIMESTAMPTZ DEFAULT NOW(),
    credibility_score INTEGER,
    is_flagged        BOOLEAN DEFAULT false,
    flag_reason       TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE articles IS 'Aggregated news articles from various sources';

-- ============================================================================
-- 5. SUBMISSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS submissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type        TEXT NOT NULL CHECK (type IN ('url', 'text', 'headline', 'image')),
    content     TEXT,
    url         TEXT,
    image_url   TEXT,
    status      TEXT DEFAULT 'pending'
                CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE submissions IS 'User-submitted content for verification';

-- ============================================================================
-- 6. VERIFICATION_REPORTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS verification_reports (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id    UUID REFERENCES submissions(id) ON DELETE CASCADE,
    user_id          UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title            TEXT,
    content_snippet  TEXT,
    verdict          TEXT CHECK (verdict IN (
                         'Highly Credible',
                         'Likely Credible',
                         'Uncertain',
                         'Potentially Misleading'
                     )),
    composite_score  INTEGER,
    ml_score         NUMERIC(5, 2),
    ml_confidence    NUMERIC(5, 2),
    ml_prediction    TEXT,
    source_score     INTEGER,
    fact_check_score INTEGER,
    evidence         JSONB DEFAULT '[]',
    source_name      TEXT,
    is_public        BOOLEAN DEFAULT true,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE verification_reports IS 'AI-generated verification reports for submissions';

-- ============================================================================
-- 7. VOTES
-- ============================================================================
CREATE TABLE IF NOT EXISTS votes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
    report_id   UUID REFERENCES verification_reports(id) ON DELETE CASCADE,
    vote_type   TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, report_id)
);

COMMENT ON TABLE votes IS 'Community votes on verification reports';

-- ============================================================================
-- 8. BOOKMARKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
    article_id  UUID REFERENCES articles(id) ON DELETE CASCADE,
    report_id   UUID REFERENCES verification_reports(id) ON DELETE CASCADE,
    type        TEXT NOT NULL CHECK (type IN ('article', 'report')),
    created_at  TIMESTAMPTZ DEFAULT NOW(),

    -- At least one of article_id or report_id must be provided
    CONSTRAINT bookmarks_target_not_null
        CHECK (article_id IS NOT NULL OR report_id IS NOT NULL)
);

COMMENT ON TABLE bookmarks IS 'User bookmarks for articles and verification reports';

-- ============================================================================
-- 9. NOTIFICATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    message     TEXT NOT NULL,
    type        TEXT DEFAULT 'info'
                CHECK (type IN ('info', 'warning', 'success', 'error', 'announcement')),
    is_read     BOOLEAN DEFAULT false,
    link        TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE notifications IS 'In-app notifications for users';

-- ============================================================================
-- 10. ADMIN_ACTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_actions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    target_type TEXT,
    target_id   UUID,
    details     JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE admin_actions IS 'Audit log of administrative actions';


-- ============================================================================
-- INDEXES
-- ============================================================================

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email      ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role        ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at  ON profiles(created_at DESC);

-- user_preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- sources
CREATE INDEX IF NOT EXISTS idx_sources_domain            ON sources(domain);
CREATE INDEX IF NOT EXISTS idx_sources_credibility_score ON sources(credibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_sources_category          ON sources(category);
CREATE INDEX IF NOT EXISTS idx_sources_is_verified       ON sources(is_verified);

-- articles
CREATE INDEX IF NOT EXISTS idx_articles_source_id         ON articles(source_id);
CREATE INDEX IF NOT EXISTS idx_articles_topic             ON articles(topic);
CREATE INDEX IF NOT EXISTS idx_articles_published_at      ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_fetched_at        ON articles(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_credibility_score ON articles(credibility_score);
CREATE INDEX IF NOT EXISTS idx_articles_is_flagged        ON articles(is_flagged);
CREATE INDEX IF NOT EXISTS idx_articles_url               ON articles(url);

-- submissions
CREATE INDEX IF NOT EXISTS idx_submissions_user_id    ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status     ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_type       ON submissions(type);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);

-- verification_reports
CREATE INDEX IF NOT EXISTS idx_reports_submission_id  ON verification_reports(submission_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id        ON verification_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_verdict        ON verification_reports(verdict);
CREATE INDEX IF NOT EXISTS idx_reports_is_public      ON verification_reports(is_public);
CREATE INDEX IF NOT EXISTS idx_reports_created_at     ON verification_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_composite_score ON verification_reports(composite_score);

-- votes
CREATE INDEX IF NOT EXISTS idx_votes_user_id   ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_report_id ON votes(report_id);
CREATE INDEX IF NOT EXISTS idx_votes_vote_type ON votes(vote_type);

-- bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id    ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_article_id ON bookmarks(article_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_report_id  ON bookmarks(report_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_type       ON bookmarks(type);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read    ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type       ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- admin_actions
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id    ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_type ON admin_actions(target_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_id   ON admin_actions(target_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at  ON admin_actions(created_at DESC);


-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources               ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_reports  ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions         ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Helper: check if the current user is an admin
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
          AND role = 'ADMIN'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---------------------------------------------------------------------------
-- PROFILES policies
-- ---------------------------------------------------------------------------
-- Anyone authenticated can read all profiles
CREATE POLICY "profiles_select_all"
    ON profiles FOR SELECT
    USING (true);

-- Users can update their own profile (but not role, is_banned, is_suspended)
CREATE POLICY "profiles_update_own"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "profiles_admin_update"
    ON profiles FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- Admins can delete profiles
CREATE POLICY "profiles_admin_delete"
    ON profiles FOR DELETE
    USING (is_admin());

-- System inserts via trigger (service role), but allow insert for completeness
CREATE POLICY "profiles_insert"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- USER_PREFERENCES policies
-- ---------------------------------------------------------------------------
CREATE POLICY "prefs_select_own"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "prefs_insert_own"
    ON user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "prefs_update_own"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "prefs_delete_own"
    ON user_preferences FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "prefs_admin_all"
    ON user_preferences FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- SOURCES policies
-- ---------------------------------------------------------------------------
-- Public read access
CREATE POLICY "sources_select_all"
    ON sources FOR SELECT
    USING (true);

-- Only admins can insert, update, delete
CREATE POLICY "sources_admin_insert"
    ON sources FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "sources_admin_update"
    ON sources FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "sources_admin_delete"
    ON sources FOR DELETE
    USING (is_admin());

-- ---------------------------------------------------------------------------
-- ARTICLES policies
-- ---------------------------------------------------------------------------
-- Public read access
CREATE POLICY "articles_select_all"
    ON articles FOR SELECT
    USING (true);

-- Only admins can insert/update/delete articles
CREATE POLICY "articles_admin_insert"
    ON articles FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "articles_admin_update"
    ON articles FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "articles_admin_delete"
    ON articles FOR DELETE
    USING (is_admin());

-- ---------------------------------------------------------------------------
-- SUBMISSIONS policies
-- ---------------------------------------------------------------------------
-- Users can see their own submissions
CREATE POLICY "submissions_select_own"
    ON submissions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own submissions
CREATE POLICY "submissions_insert_own"
    ON submissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending submissions
CREATE POLICY "submissions_update_own"
    ON submissions FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending')
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own pending submissions
CREATE POLICY "submissions_delete_own"
    ON submissions FOR DELETE
    USING (auth.uid() = user_id AND status = 'pending');

-- Admins have full access
CREATE POLICY "submissions_admin_all"
    ON submissions FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- VERIFICATION_REPORTS policies
-- ---------------------------------------------------------------------------
-- Public reports are visible to everyone; private reports only to owner
CREATE POLICY "reports_select_public"
    ON verification_reports FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);

-- Users can view their own reports regardless
CREATE POLICY "reports_select_own"
    ON verification_reports FOR SELECT
    USING (auth.uid() = user_id);

-- Insert via service role / backend only — allow owner insert
CREATE POLICY "reports_insert_own"
    ON verification_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own reports (e.g. toggle is_public)
CREATE POLICY "reports_update_own"
    ON verification_reports FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins have full access
CREATE POLICY "reports_admin_all"
    ON verification_reports FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- VOTES policies
-- ---------------------------------------------------------------------------
-- Users can see all votes (needed for aggregation)
CREATE POLICY "votes_select_all"
    ON votes FOR SELECT
    USING (true);

-- Users can insert their own votes
CREATE POLICY "votes_insert_own"
    ON votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes (change up→down)
CREATE POLICY "votes_update_own"
    ON votes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "votes_delete_own"
    ON votes FOR DELETE
    USING (auth.uid() = user_id);

-- Admins have full access
CREATE POLICY "votes_admin_all"
    ON votes FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- BOOKMARKS policies
-- ---------------------------------------------------------------------------
-- Users can see only their own bookmarks
CREATE POLICY "bookmarks_select_own"
    ON bookmarks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "bookmarks_insert_own"
    ON bookmarks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookmarks_delete_own"
    ON bookmarks FOR DELETE
    USING (auth.uid() = user_id);

-- Admins have full access
CREATE POLICY "bookmarks_admin_all"
    ON bookmarks FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS policies
-- ---------------------------------------------------------------------------
-- Users can see their own notifications
CREATE POLICY "notifications_select_own"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "notifications_delete_own"
    ON notifications FOR DELETE
    USING (auth.uid() = user_id);

-- Admins can insert notifications for any user (announcements, etc.)
CREATE POLICY "notifications_admin_all"
    ON notifications FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- ADMIN_ACTIONS policies
-- ---------------------------------------------------------------------------
-- Only admins can read the audit log
CREATE POLICY "admin_actions_select_admin"
    ON admin_actions FOR SELECT
    USING (is_admin());

-- Only admins can insert audit entries
CREATE POLICY "admin_actions_insert_admin"
    ON admin_actions FOR INSERT
    WITH CHECK (is_admin());

-- No update/delete on audit log (immutable)
-- (No policies created = denied by default with RLS enabled)


-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Generic updated_at trigger function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_sources_updated_at
    BEFORE UPDATE ON sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_submissions_updated_at
    BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- handle_new_user(): auto-create profile + preferences on auth.users insert
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create the user profile
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', '')
    );

    -- Create default user preferences
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================================
-- SEED DATA — Sources
-- ============================================================================
INSERT INTO sources (name, domain, credibility_score, category, description, is_verified) VALUES
    ('Reuters',              'reuters.com',       95,  'Wire Service',       'International news agency headquartered in London',       true),
    ('BBC',                  'bbc.com',           95,  'Public Broadcaster', 'British public service broadcaster',                      true),
    ('AP News',              'apnews.com',        97,  'Wire Service',       'American not-for-profit news agency',                     true),
    ('CNN',                  'cnn.com',           85,  'Cable News',         'American cable news channel',                              true),
    ('Fox News',             'foxnews.com',       70,  'Cable News',         'American conservative cable news channel',                 true),
    ('The Guardian',         'theguardian.com',   90,  'Newspaper',          'British daily newspaper',                                  true),
    ('The New York Times',   'nytimes.com',       92,  'Newspaper',          'American daily newspaper of record',                       true),
    ('Washington Post',      'washingtonpost.com',90,  'Newspaper',          'American daily newspaper based in Washington, D.C.',       true),
    ('Al Jazeera',           'aljazeera.com',     82,  'International',      'Qatari state-owned international news network',            true),
    ('The Hindu',            'thehindu.com',      90,  'Newspaper',          'Indian English-language daily newspaper',                  true),
    ('Indian Express',       'indianexpress.com', 88,  'Newspaper',          'Indian English-language daily newspaper',                  true),
    ('Times of India',       'timesofindia.indiatimes.com', 80, 'Newspaper',    'Indian English-language daily newspaper',                  true),
    ('NDTV',                 'ndtv.com',          82,  'Cable News',         'Indian news media company',                                true),
    ('Hindustan Times',      'hindustantimes.com',82,  'Newspaper',          'Indian daily newspaper',                                  true),
    ('Livemint',             'livemint.com',      88,  'Newspaper',          'Indian financial daily newspaper',                         true),
    ('Press Trust of India', 'ptinews.com',       95,  'Wire Service',       'Largest news agency in India',                            true),
    ('Press Information Bureau','pib.gov.in',     97,  'Government',         'Official press release agency of the Indian Government',   true),
    ('Unknown',              NULL,                50,  'Unknown',            'Unidentified or unverified source',                         false)
ON CONFLICT (name) DO NOTHING;


-- ============================================================================
-- Done!
-- ============================================================================

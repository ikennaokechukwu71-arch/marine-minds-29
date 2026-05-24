-- ============================================================
-- Marine Minds 29 — Supabase Database Schema
-- Run this entire file in the Supabase SQL Editor
-- Project: https://app.supabase.com → SQL Editor → New Query
-- ============================================================

-- ── EXTENSIONS ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── ENUMS ───────────────────────────────────────────────────
CREATE TYPE message_type AS ENUM (
  'confession', 'compliment', 'secret', 'funny', 'secret_admirer'
);
CREATE TYPE reaction_type AS ENUM ('like', 'laugh', 'fire');
CREATE TYPE gallery_category AS ENUM (
  'academic', 'fieldtrip', 'social', 'graduation', 'misc'
);
CREATE TYPE event_type AS ENUM (
  'academic', 'social', 'fieldtrip', 'exam', 'graduation'
);

-- ── TABLES ──────────────────────────────────────────────────

-- Students (linked to auth.users)
CREATE TABLE students (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name      TEXT NOT NULL,
  nickname       TEXT,
  bio            TEXT,
  favorite_quote TEXT,
  avatar_url     TEXT,
  instagram_url  TEXT,
  linkedin_url   TEXT,
  twitter_url    TEXT,
  birthday       DATE,
  is_admin       BOOLEAN NOT NULL DEFAULT FALSE,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  likes_count    INTEGER NOT NULL DEFAULT 0,
  mentions_count INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Anonymous Messages
CREATE TABLE anonymous_messages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content      TEXT NOT NULL CHECK (char_length(content) BETWEEN 10 AND 1000),
  message_type message_type NOT NULL DEFAULT 'confession',
  is_approved  BOOLEAN NOT NULL DEFAULT FALSE,
  is_flagged   BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
  likes_count  INTEGER NOT NULL DEFAULT 0,
  laughs_count INTEGER NOT NULL DEFAULT 0,
  fire_count   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reactions (per-user, per-message)
CREATE TABLE reactions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id    UUID NOT NULL REFERENCES anonymous_messages(id) ON DELETE CASCADE,
  reaction_type reaction_type NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, message_id, reaction_type)
);

-- Polls
CREATE TABLE polls (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question    TEXT NOT NULL,
  created_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  ends_at     TIMESTAMPTZ,
  total_votes INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Poll Options
CREATE TABLE poll_options (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id     UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  votes_count INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Poll Votes (prevent double voting)
CREATE TABLE poll_votes (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id   UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (poll_id, user_id)
);

-- Gallery Uploads
CREATE TABLE gallery_uploads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  caption     TEXT,
  image_url   TEXT NOT NULL,
  category    gallery_category NOT NULL DEFAULT 'misc',
  likes_count INTEGER NOT NULL DEFAULT 0,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Announcements
CREATE TABLE announcements (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  is_pinned  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  event_date  TIMESTAMPTZ NOT NULL,
  event_type  event_type NOT NULL DEFAULT 'academic',
  location    TEXT,
  created_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profile Likes
CREATE TABLE profile_likes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  liker_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  liked_student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (liker_id, liked_student_id)
);

-- ── INDEXES ─────────────────────────────────────────────────
CREATE INDEX idx_students_user_id         ON students(user_id);
CREATE INDEX idx_students_likes           ON students(likes_count DESC);
CREATE INDEX idx_messages_approved        ON anonymous_messages(is_approved, created_at DESC);
CREATE INDEX idx_messages_featured        ON anonymous_messages(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_reactions_user_message   ON reactions(user_id, message_id);
CREATE INDEX idx_poll_votes_user          ON poll_votes(user_id, poll_id);
CREATE INDEX idx_gallery_approved         ON gallery_uploads(is_approved, created_at DESC);
CREATE INDEX idx_events_date              ON events(event_date ASC);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE students           ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls               ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options        ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_uploads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_likes       ENABLE ROW LEVEL SECURITY;

-- ── RLS POLICIES ────────────────────────────────────────────

-- Students: anyone can read active profiles; only own row editable
CREATE POLICY "students_read_all"   ON students FOR SELECT USING (is_active = TRUE);
CREATE POLICY "students_insert_own" ON students FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "students_update_own" ON students FOR UPDATE USING (auth.uid() = user_id);

-- Anon Messages: anyone can read approved; anyone can insert (anonymous)
CREATE POLICY "messages_read_approved"  ON anonymous_messages FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "messages_insert_anyone"  ON anonymous_messages FOR INSERT WITH CHECK (TRUE);
-- Admins update/delete handled via service role key in admin panel

-- Reactions: authenticated users can manage own reactions
CREATE POLICY "reactions_read_all"    ON reactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "reactions_insert_own"  ON reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions_delete_own"  ON reactions FOR DELETE USING (auth.uid() = user_id);

-- Polls: all authenticated can read; admins create
CREATE POLICY "polls_read_all"   ON polls FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "polls_insert_auth" ON polls FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM students WHERE user_id = auth.uid() AND is_admin = TRUE)
);

-- Poll Options: all authenticated can read
CREATE POLICY "poll_options_read_all" ON poll_options FOR SELECT USING (auth.uid() IS NOT NULL);

-- Poll Votes: authenticated users can insert own vote
CREATE POLICY "poll_votes_read_own"   ON poll_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "poll_votes_insert_own" ON poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Gallery: read approved; insert own
CREATE POLICY "gallery_read_approved"  ON gallery_uploads FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "gallery_insert_own"     ON gallery_uploads FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Announcements: read all; admins insert
CREATE POLICY "announcements_read_all"    ON announcements FOR SELECT USING (TRUE);
CREATE POLICY "announcements_insert_admin" ON announcements FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM students WHERE user_id = auth.uid() AND is_admin = TRUE)
);

-- Events: read all; admins insert
CREATE POLICY "events_read_all"    ON events FOR SELECT USING (TRUE);
CREATE POLICY "events_insert_admin" ON events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM students WHERE user_id = auth.uid() AND is_admin = TRUE)
);

-- Profile Likes
CREATE POLICY "profile_likes_read_all"   ON profile_likes FOR SELECT USING (TRUE);
CREATE POLICY "profile_likes_insert_own" ON profile_likes FOR INSERT WITH CHECK (auth.uid() = liker_id);

-- ── FUNCTIONS & TRIGGERS ────────────────────────────────────

-- Auto-update updated_at on students
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Increment poll vote counts atomically
CREATE OR REPLACE FUNCTION increment_poll_vote(option_id UUID, poll_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE poll_options SET votes_count = votes_count + 1 WHERE id = option_id;
  UPDATE polls         SET total_votes = total_votes + 1 WHERE id = poll_id;
END;
$$;

-- Increment gallery like count
CREATE OR REPLACE FUNCTION increment_gallery_like(upload_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE gallery_uploads SET likes_count = likes_count + 1 WHERE id = upload_id;
END;
$$;

-- Sync profile likes count to students table
CREATE OR REPLACE FUNCTION sync_student_likes()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE students SET likes_count = likes_count + 1 WHERE id = NEW.liked_student_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE students SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.liked_student_id;
  END IF;
  RETURN NULL;
END;
$$;
CREATE TRIGGER trigger_sync_student_likes
  AFTER INSERT OR DELETE ON profile_likes
  FOR EACH ROW EXECUTE FUNCTION sync_student_likes();

-- Sync message reaction counts
CREATE OR REPLACE FUNCTION sync_reaction_counts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction_type = 'like'  THEN UPDATE anonymous_messages SET likes_count  = likes_count + 1  WHERE id = NEW.message_id; END IF;
    IF NEW.reaction_type = 'laugh' THEN UPDATE anonymous_messages SET laughs_count = laughs_count + 1 WHERE id = NEW.message_id; END IF;
    IF NEW.reaction_type = 'fire'  THEN UPDATE anonymous_messages SET fire_count   = fire_count + 1   WHERE id = NEW.message_id; END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction_type = 'like'  THEN UPDATE anonymous_messages SET likes_count  = GREATEST(0, likes_count - 1)  WHERE id = OLD.message_id; END IF;
    IF OLD.reaction_type = 'laugh' THEN UPDATE anonymous_messages SET laughs_count = GREATEST(0, laughs_count - 1) WHERE id = OLD.message_id; END IF;
    IF OLD.reaction_type = 'fire'  THEN UPDATE anonymous_messages SET fire_count   = GREATEST(0, fire_count - 1)   WHERE id = OLD.message_id; END IF;
  END IF;
  RETURN NULL;
END;
$$;
CREATE TRIGGER trigger_sync_reactions
  AFTER INSERT OR DELETE ON reactions
  FOR EACH ROW EXECUTE FUNCTION sync_reaction_counts();

-- ── STORAGE BUCKETS ──────────────────────────────────────────
-- Run these after creating the tables above
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to uploads bucket
CREATE POLICY "uploads_insert_auth"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'uploads' AND auth.uid() IS NOT NULL);

-- Allow public read of uploads
CREATE POLICY "uploads_read_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads');

-- ── SEED DATA ────────────────────────────────────────────────
-- Sample polls (no user_id needed for seed — replace with a real admin UUID)
-- Uncomment and replace <ADMIN_USER_ID> after creating the first admin account

/*
INSERT INTO polls (question, created_by, is_active, total_votes) VALUES
  ('Who is most likely to become a famous marine scientist?', '<ADMIN_USER_ID>', TRUE, 0),
  ('Best dressed in Marine Minds 29?', '<ADMIN_USER_ID>', TRUE, 0),
  ('Most likely to cry at a fish farm?', '<ADMIN_USER_ID>', TRUE, 0),
  ('Who would survive on a deserted island?', '<ADMIN_USER_ID>', TRUE, 0);

-- Add options after inserting polls
INSERT INTO poll_options (poll_id, option_text) SELECT id, 'Option A' FROM polls WHERE question = 'Who is most likely to become a famous marine scientist?';
*/

-- Sample events
/*
INSERT INTO events (title, description, event_date, event_type, location, created_by) VALUES
  ('Marine Genetics Seminar', 'CRISPR applications in aquaculture. Attendance compulsory.', NOW() + INTERVAL '4 days', 'academic', 'Lecture Hall A', '<ADMIN_USER_ID>'),
  ('Fish Farm Field Trip', 'Annual visit to Ogun State Fish Farm. Bring rubber boots.', NOW() + INTERVAL '10 days', 'fieldtrip', 'Ogun State', '<ADMIN_USER_ID>'),
  ('Marine Minds End-of-Semester Hangout', 'Food, games, and class superlatives reveal!', NOW() + INTERVAL '17 days', 'social', 'AFM Common Room', '<ADMIN_USER_ID>');
*/

-- ── MAKE A USER ADMIN ────────────────────────────────────────
-- After signing up, run this to make yourself admin:
-- UPDATE students SET is_admin = TRUE WHERE user_id = '<YOUR_USER_ID>';
-- Get your user ID from: Authentication → Users in Supabase dashboard

-- AIXONTRA Enhanced Schema Migration
-- This migration adds all new tables and columns required for the full platform

-- ============================================================================
-- STEP 1: Enhance existing tracks table with additional metadata fields
-- ============================================================================

ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS duration interval;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS file_size bigint;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS bit_rate integer;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS sample_rate integer;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS explicit_content boolean DEFAULT false;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS download_count bigint DEFAULT 0;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Add index for soft deletes
CREATE INDEX IF NOT EXISTS tracks_deleted_at_idx ON public.tracks(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- STEP 2: Create comments table for track comments and replies
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_not_empty CHECK (length(trim(content)) > 0)
);

CREATE INDEX IF NOT EXISTS comments_track_idx ON public.comments(track_id, created_at DESC);
CREATE INDEX IF NOT EXISTS comments_user_idx ON public.comments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS comments_parent_idx ON public.comments(parent_id, created_at DESC) WHERE parent_id IS NOT NULL;

-- ============================================================================
-- STEP 3: Create follows table for user following relationships
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.follows (
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS follows_follower_idx ON public.follows(follower_id, created_at DESC);
CREATE INDEX IF NOT EXISTS follows_following_idx ON public.follows(following_id, created_at DESC);

-- ============================================================================
-- STEP 4: Create playlists table for user-created playlists
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  cover_url text,
  is_public boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS playlists_user_idx ON public.playlists(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS playlists_public_idx ON public.playlists(is_public, created_at DESC) WHERE is_public = true;

-- ============================================================================
-- STEP 5: Create playlist_tracks join table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.playlist_tracks (
  playlist_id uuid NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  position integer NOT NULL,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (playlist_id, track_id),
  CONSTRAINT position_positive CHECK (position >= 0)
);

CREATE INDEX IF NOT EXISTS playlist_tracks_playlist_idx ON public.playlist_tracks(playlist_id, position);
CREATE INDEX IF NOT EXISTS playlist_tracks_track_idx ON public.playlist_tracks(track_id);

-- ============================================================================
-- STEP 6: Create listening_history table for play tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.listening_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  played_at timestamptz NOT NULL DEFAULT now(),
  duration_played interval
);

CREATE INDEX IF NOT EXISTS listening_history_user_idx ON public.listening_history(user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS listening_history_track_idx ON public.listening_history(track_id, played_at DESC);

-- ============================================================================
-- STEP 7: Create notifications table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  link text,
  read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON public.notifications(user_id, read, created_at DESC) WHERE read = false;

-- ============================================================================
-- STEP 8: Create reports table for content moderation
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  track_id uuid REFERENCES public.tracks(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  resolved_by uuid REFERENCES public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT report_target CHECK (track_id IS NOT NULL OR comment_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS reports_status_idx ON public.reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS reports_reporter_idx ON public.reports(reporter_id, created_at DESC);

-- ============================================================================
-- STEP 9: Create tags table for categorization
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT category_valid CHECK (category IN ('genre', 'mood', 'ai_tool'))
);

CREATE INDEX IF NOT EXISTS tags_category_idx ON public.tags(category);
CREATE INDEX IF NOT EXISTS tags_name_idx ON public.tags(name);

-- ============================================================================
-- STEP 10: Insert default tags
-- ============================================================================

INSERT INTO public.tags (name, category) VALUES
  -- Genres
  ('Electronic', 'genre'), ('Ambient', 'genre'), ('Classical', 'genre'),
  ('Pop', 'genre'), ('Rock', 'genre'), ('Jazz', 'genre'),
  ('Hip Hop', 'genre'), ('Lo-fi', 'genre'), ('Experimental', 'genre'),
  ('House', 'genre'), ('Techno', 'genre'), ('Drum & Bass', 'genre'),
  -- Moods
  ('Calm', 'mood'), ('Energetic', 'mood'), ('Dark', 'mood'),
  ('Happy', 'mood'), ('Melancholic', 'mood'), ('Epic', 'mood'),
  ('Chill', 'mood'), ('Intense', 'mood'), ('Uplifting', 'mood'),
  -- AI Tools
  ('Suno AI', 'ai_tool'), ('Udio', 'ai_tool'), ('MusicGen', 'ai_tool'),
  ('Stable Audio', 'ai_tool'), ('AIVA', 'ai_tool'), ('Soundraw', 'ai_tool'),
  ('Boomy', 'ai_tool'), ('Amper Music', 'ai_tool'), ('Loudly', 'ai_tool')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- STEP 11: Enable RLS on new tables
-- ============================================================================

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 12: Create RLS policies for comments
-- ============================================================================

DROP POLICY IF EXISTS "comments_select_public" ON public.comments;
CREATE POLICY "comments_select_public" ON public.comments 
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "comments_insert_own" ON public.comments;
CREATE POLICY "comments_insert_own" ON public.comments 
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
CREATE POLICY "comments_update_own" ON public.comments 
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "comments_delete_own" ON public.comments;
CREATE POLICY "comments_delete_own" ON public.comments 
  FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- ============================================================================
-- STEP 13: Create RLS policies for follows
-- ============================================================================

DROP POLICY IF EXISTS "follows_select_public" ON public.follows;
CREATE POLICY "follows_select_public" ON public.follows 
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "follows_insert_own" ON public.follows;
CREATE POLICY "follows_insert_own" ON public.follows 
  FOR INSERT TO authenticated WITH CHECK (follower_id = auth.uid());

DROP POLICY IF EXISTS "follows_delete_own" ON public.follows;
CREATE POLICY "follows_delete_own" ON public.follows 
  FOR DELETE TO authenticated USING (follower_id = auth.uid());

-- ============================================================================
-- STEP 14: Create RLS policies for playlists
-- ============================================================================

DROP POLICY IF EXISTS "playlists_select_public" ON public.playlists;
CREATE POLICY "playlists_select_public" ON public.playlists 
  FOR SELECT TO authenticated USING (is_public = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "playlists_insert_own" ON public.playlists;
CREATE POLICY "playlists_insert_own" ON public.playlists 
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "playlists_update_own" ON public.playlists;
CREATE POLICY "playlists_update_own" ON public.playlists 
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "playlists_delete_own" ON public.playlists;
CREATE POLICY "playlists_delete_own" ON public.playlists 
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- STEP 15: Create RLS policies for playlist_tracks
-- ============================================================================

DROP POLICY IF EXISTS "playlist_tracks_select" ON public.playlist_tracks;
CREATE POLICY "playlist_tracks_select" ON public.playlist_tracks 
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE id = playlist_id AND (is_public = true OR user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "playlist_tracks_insert_own" ON public.playlist_tracks;
CREATE POLICY "playlist_tracks_insert_own" ON public.playlist_tracks 
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "playlist_tracks_delete_own" ON public.playlist_tracks;
CREATE POLICY "playlist_tracks_delete_own" ON public.playlist_tracks 
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND user_id = auth.uid())
  );

-- ============================================================================
-- STEP 16: Create RLS policies for listening_history
-- ============================================================================

DROP POLICY IF EXISTS "listening_history_select_own" ON public.listening_history;
CREATE POLICY "listening_history_select_own" ON public.listening_history 
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "listening_history_insert_own" ON public.listening_history;
CREATE POLICY "listening_history_insert_own" ON public.listening_history 
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- STEP 17: Create RLS policies for notifications
-- ============================================================================

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications 
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications 
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own" ON public.notifications 
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- STEP 18: Create RLS policies for reports
-- ============================================================================

DROP POLICY IF EXISTS "reports_select_own_or_admin" ON public.reports;
CREATE POLICY "reports_select_own_or_admin" ON public.reports 
  FOR SELECT TO authenticated USING (
    public.is_admin(auth.uid()) OR reporter_id = auth.uid()
  );

DROP POLICY IF EXISTS "reports_insert_authenticated" ON public.reports;
CREATE POLICY "reports_insert_authenticated" ON public.reports 
  FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "reports_update_admin" ON public.reports;
CREATE POLICY "reports_update_admin" ON public.reports 
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- ============================================================================
-- STEP 19: Create RLS policies for tags
-- ============================================================================

DROP POLICY IF EXISTS "tags_select_all" ON public.tags;
CREATE POLICY "tags_select_all" ON public.tags 
  FOR SELECT TO authenticated, anon USING (true);

-- Only admins can modify tags
DROP POLICY IF EXISTS "tags_insert_admin" ON public.tags;
CREATE POLICY "tags_insert_admin" ON public.tags 
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "tags_update_admin" ON public.tags;
CREATE POLICY "tags_update_admin" ON public.tags 
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "tags_delete_admin" ON public.tags;
CREATE POLICY "tags_delete_admin" ON public.tags 
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- ============================================================================
-- STEP 20: Create helper functions for counts
-- ============================================================================

-- Function to count followers
CREATE OR REPLACE FUNCTION public.get_follower_count(profile_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*) FROM public.follows WHERE following_id = profile_id;
$$;

-- Function to count following
CREATE OR REPLACE FUNCTION public.get_following_count(profile_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*) FROM public.follows WHERE follower_id = profile_id;
$$;

-- Function to count user tracks
CREATE OR REPLACE FUNCTION public.get_tracks_count(profile_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*) FROM public.tracks WHERE creator_id = profile_id AND status = 'approved' AND deleted_at IS NULL;
$$;

-- Function to count unread notifications
CREATE OR REPLACE FUNCTION public.get_unread_notifications_count(profile_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*) FROM public.notifications WHERE user_id = profile_id AND read = false;
$$;

-- ============================================================================
-- Migration Complete
-- ============================================================================

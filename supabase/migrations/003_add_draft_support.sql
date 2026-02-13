-- Migration: Add draft support to tracks
-- Allows users to save songs as drafts before publishing

-- Add is_draft field to distinguish drafts from published/pending tracks
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS is_draft BOOLEAN NOT NULL DEFAULT false;

-- Add index for efficient draft queries
CREATE INDEX IF NOT EXISTS tracks_is_draft_idx ON public.tracks(creator_id, is_draft, created_at DESC) 
WHERE is_draft = true;

-- Update RLS policy to allow users to see their own drafts
-- Drop and recreate the tracks_select_approved policy to include drafts
DROP POLICY IF EXISTS "tracks_select_approved" ON public.tracks;
CREATE POLICY "tracks_select_approved"
ON public.tracks FOR SELECT
TO anon, authenticated
USING (
  status = 'approved' 
  OR creator_id = auth.uid() 
  OR public.is_admin(auth.uid())
);

-- Comment explaining the is_draft field
COMMENT ON COLUMN public.tracks.is_draft IS 'True if track is saved as draft, false if submitted/published. Drafts are only visible to creator.';

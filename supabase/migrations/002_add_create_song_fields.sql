-- Migration: Add fields for Create Song feature
-- Adds lyrics and generation metadata to tracks table

-- Add lyrics field to store AI-generated or user-provided lyrics
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS lyrics TEXT;

-- Add generation_metadata field to store AI generation parameters
-- This will store JSON data like: prompt, genre selections, instruments, AI model used, etc.
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS generation_metadata JSONB;

-- Add index for searching tracks with lyrics
CREATE INDEX IF NOT EXISTS tracks_lyrics_idx ON public.tracks USING gin(to_tsvector('english', lyrics));

-- Add comment to explain the generation_metadata structure
COMMENT ON COLUMN public.tracks.generation_metadata IS 'JSON metadata for AI-generated tracks: {prompt, genres, instruments, ai_model, generation_params}';

-- Migration: Add voice generation fields for TTS integration
-- Description: Adds fields to store voice metadata for AI-generated vocal tracks

-- Add voice-related columns to tracks table
ALTER TABLE public.tracks 
ADD COLUMN IF NOT EXISTS voice_audio_path TEXT,
ADD COLUMN IF NOT EXISTS voice_metadata JSONB;

-- Add comment for documentation
COMMENT ON COLUMN public.tracks.voice_audio_path IS 'Path to generated vocal audio file in Supabase storage';
COMMENT ON COLUMN public.tracks.voice_metadata IS 'JSON metadata about voice generation (voice_id, provider, language, style, etc.)';

-- Create index for voice metadata queries
CREATE INDEX IF NOT EXISTS tracks_voice_metadata_idx ON public.tracks USING gin(voice_metadata);

-- Create index for tracks with voice
CREATE INDEX IF NOT EXISTS tracks_with_voice_idx ON public.tracks (id) WHERE voice_audio_path IS NOT NULL;

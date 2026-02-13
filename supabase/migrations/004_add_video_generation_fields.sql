-- Migration: Add video generation fields for AI-generated music videos
-- Description: Adds fields to store video metadata for AI-generated music videos

-- Add video-related columns to tracks table
ALTER TABLE public.tracks 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_status VARCHAR(50) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS video_metadata JSONB;

-- Add comment for documentation
COMMENT ON COLUMN public.tracks.video_url IS 'URL to generated music video file in storage';
COMMENT ON COLUMN public.tracks.video_status IS 'Video generation status: none, pending, generating, completed, failed';
COMMENT ON COLUMN public.tracks.video_metadata IS 'JSON metadata about video generation (style, resolution, aspect_ratio, duration, provider, etc.)';

-- Create index for video metadata queries
CREATE INDEX IF NOT EXISTS tracks_video_metadata_idx ON public.tracks USING gin(video_metadata);

-- Create index for tracks with video
CREATE INDEX IF NOT EXISTS tracks_with_video_idx ON public.tracks (id) WHERE video_url IS NOT NULL;

-- Create index for video status queries
CREATE INDEX IF NOT EXISTS tracks_video_status_idx ON public.tracks (video_status) WHERE video_status != 'none';

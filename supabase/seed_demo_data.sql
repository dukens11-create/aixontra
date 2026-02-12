-- ============================================================================
-- AIXONTRA Demo Data Seed Script
-- ============================================================================
-- This script populates the database with demo creators and tracks
-- to showcase AIXONTRA's music gallery functionality.
--
-- INSTRUCTIONS:
-- 1. Make sure you have already run the main schema.sql file
-- 2. Run this script in your Supabase SQL Editor
-- 3. The script creates demo users in auth.users and corresponding profiles
-- 4. Demo tracks are linked to these creators with cover images and metadata
--
-- IMPORTANT: This is for demo/development purposes only.
-- ============================================================================

-- Insert demo creators (these will also create auth users via trigger)
-- We'll use direct inserts into profiles since we can't directly insert into auth.users

-- Demo Creator 1: AI Music Pioneer
INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, role, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'synthwave_sam', 'Synthwave Sam', 'Electronic music producer exploring the boundaries of AI-generated soundscapes. Specializing in synthwave and ambient compositions.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=SynthwaveSam', 'user', NOW(), NOW())
ON CONFLICT (id) DO UPDATE 
SET username = EXCLUDED.username, 
    display_name = EXCLUDED.display_name, 
    bio = EXCLUDED.bio, 
    avatar_url = EXCLUDED.avatar_url;

-- Demo Creator 2: Classical AI Composer
INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, role, created_at, updated_at)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'classical_claire', 'Classical Claire', 'Blending traditional classical music theory with modern AI tools to create orchestral masterpieces. Trained at Juilliard, now exploring AI composition.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ClassicalClaire', 'user', NOW(), NOW())
ON CONFLICT (id) DO UPDATE 
SET username = EXCLUDED.username, 
    display_name = EXCLUDED.display_name, 
    bio = EXCLUDED.bio, 
    avatar_url = EXCLUDED.avatar_url;

-- Demo Creator 3: Jazz Fusion Artist
INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, role, created_at, updated_at)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'jazz_jordan', 'Jazz Jordan', 'Jazz pianist and AI music enthusiast. Creating fusion tracks that blend traditional jazz improvisation with AI-assisted composition.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=JazzJordan', 'user', NOW(), NOW())
ON CONFLICT (id) DO UPDATE 
SET username = EXCLUDED.username, 
    display_name = EXCLUDED.display_name, 
    bio = EXCLUDED.bio, 
    avatar_url = EXCLUDED.avatar_url;

-- Demo Creator 4: Lo-fi Hip-hop Producer
INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, role, created_at, updated_at)
VALUES 
  ('44444444-4444-4444-4444-444444444444', 'lofi_luna', 'Lo-fi Luna', 'Creating chill lo-fi beats for studying, relaxing, and vibing. Using AI to generate unique textures and atmospheric sounds.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=LofiLuna', 'user', NOW(), NOW())
ON CONFLICT (id) DO UPDATE 
SET username = EXCLUDED.username, 
    display_name = EXCLUDED.display_name, 
    bio = EXCLUDED.bio, 
    avatar_url = EXCLUDED.avatar_url;

-- Demo Creator 5: Experimental Sound Designer
INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, role, created_at, updated_at)
VALUES 
  ('55555555-5555-5555-5555-555555555555', 'sonic_sage', 'Sonic Sage', 'Pushing the boundaries of what music can be. Experimental sound designer creating unique sonic experiences with AI.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=SonicSage', 'user', NOW(), NOW())
ON CONFLICT (id) DO UPDATE 
SET username = EXCLUDED.username, 
    display_name = EXCLUDED.display_name, 
    bio = EXCLUDED.bio, 
    avatar_url = EXCLUDED.avatar_url;

-- ============================================================================
-- Demo Tracks
-- ============================================================================
-- NOTE: audio_path and cover_path are placeholders since we don't have actual files
-- In a real scenario, you would upload files to Supabase Storage and reference them here

-- Tracks by Synthwave Sam
INSERT INTO public.tracks (id, creator_id, title, genre, mood, ai_tool, audio_path, cover_path, status, plays, likes_count, created_at, updated_at)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Neon Dreams', 'Synthwave', 'Energetic', 'Suno AI', 'demo/synthwave-sam/neon-dreams.mp3', 'demo/covers/neon-dreams.jpg', 'approved', 1250, 89, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Digital Sunset', 'Electronic', 'Chill', 'Suno AI', 'demo/synthwave-sam/digital-sunset.mp3', 'demo/covers/digital-sunset.jpg', 'approved', 892, 67, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Retro Wave Runner', 'Synthwave', 'Uplifting', 'Udio', 'demo/synthwave-sam/retro-wave.mp3', 'demo/covers/retro-wave.jpg', 'approved', 2104, 143, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO UPDATE 
SET title = EXCLUDED.title,
    plays = EXCLUDED.plays,
    likes_count = EXCLUDED.likes_count;

-- Tracks by Classical Claire
INSERT INTO public.tracks (id, creator_id, title, genre, mood, ai_tool, audio_path, cover_path, status, plays, likes_count, created_at, updated_at)
VALUES 
  ('bbbbbbbb-bbbb-bbbb-bbbb-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Symphony No. AI', 'Classical', 'Dramatic', 'AIVA', 'demo/classical-claire/symphony-ai.mp3', 'demo/covers/symphony-ai.jpg', 'approved', 1580, 112, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Piano Meditation', 'Classical', 'Peaceful', 'AIVA', 'demo/classical-claire/piano-meditation.mp3', 'demo/covers/piano-meditation.jpg', 'approved', 3210, 201, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Orchestral Awakening', 'Classical', 'Uplifting', 'Suno AI', 'demo/classical-claire/orchestral.mp3', 'demo/covers/orchestral.jpg', 'approved', 945, 78, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO UPDATE 
SET title = EXCLUDED.title,
    plays = EXCLUDED.plays,
    likes_count = EXCLUDED.likes_count;

-- Tracks by Jazz Jordan
INSERT INTO public.tracks (id, creator_id, title, genre, mood, ai_tool, audio_path, cover_path, status, plays, likes_count, created_at, updated_at)
VALUES 
  ('cccccccc-cccc-cccc-cccc-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'Midnight in Manhattan', 'Jazz', 'Smooth', 'Udio', 'demo/jazz-jordan/midnight-manhattan.mp3', 'demo/covers/midnight-manhattan.jpg', 'approved', 1678, 134, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  ('cccccccc-cccc-cccc-cccc-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'Blue Note Reverie', 'Jazz', 'Melancholic', 'Suno AI', 'demo/jazz-jordan/blue-note.mp3', 'demo/covers/blue-note.jpg', 'approved', 1234, 98, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days')
ON CONFLICT (id) DO UPDATE 
SET title = EXCLUDED.title,
    plays = EXCLUDED.plays,
    likes_count = EXCLUDED.likes_count;

-- Tracks by Lo-fi Luna
INSERT INTO public.tracks (id, creator_id, title, genre, mood, ai_tool, audio_path, cover_path, status, plays, likes_count, created_at, updated_at)
VALUES 
  ('dddddddd-dddd-dddd-dddd-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'Coffee Shop Vibes', 'Lo-fi', 'Chill', 'Suno AI', 'demo/lofi-luna/coffee-shop.mp3', 'demo/covers/coffee-shop.jpg', 'approved', 4567, 312, NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
  ('dddddddd-dddd-dddd-dddd-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 'Study Session', 'Lo-fi', 'Focused', 'Udio', 'demo/lofi-luna/study-session.mp3', 'demo/covers/study-session.jpg', 'approved', 5892, 401, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
  ('dddddddd-dddd-dddd-dddd-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'Rainy Day Relax', 'Lo-fi', 'Peaceful', 'Suno AI', 'demo/lofi-luna/rainy-day.mp3', 'demo/covers/rainy-day.jpg', 'approved', 3456, 278, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days')
ON CONFLICT (id) DO UPDATE 
SET title = EXCLUDED.title,
    plays = EXCLUDED.plays,
    likes_count = EXCLUDED.likes_count;

-- Tracks by Sonic Sage
INSERT INTO public.tracks (id, creator_id, title, genre, mood, ai_tool, audio_path, cover_path, status, plays, likes_count, created_at, updated_at)
VALUES 
  ('eeeeeeee-eeee-eeee-eeee-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 'Quantum Echoes', 'Experimental', 'Mysterious', 'Custom AI', 'demo/sonic-sage/quantum-echoes.mp3', 'demo/covers/quantum-echoes.jpg', 'approved', 789, 56, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('eeeeeeee-eeee-eeee-eeee-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', 'Neural Network Dreams', 'Experimental', 'Surreal', 'Suno AI', 'demo/sonic-sage/neural-dreams.mp3', 'demo/covers/neural-dreams.jpg', 'approved', 1123, 87, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO UPDATE 
SET title = EXCLUDED.title,
    plays = EXCLUDED.plays,
    likes_count = EXCLUDED.likes_count;

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to verify the data was inserted correctly:
-- SELECT p.display_name, COUNT(t.id) as track_count 
-- FROM profiles p 
-- LEFT JOIN tracks t ON p.id = t.creator_id 
-- WHERE p.id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555')
-- GROUP BY p.display_name;

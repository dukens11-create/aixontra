# AIXONTRA Demo Data Setup Instructions

This guide will help you populate your AIXONTRA instance with demo tracks and creators to showcase the music gallery functionality.

## Prerequisites

1. You must have already set up your Supabase project
2. The main schema (`schema.sql`) must be applied to your database
3. You have access to your Supabase SQL Editor

## Step 1: Insert Demo Data

1. Navigate to your Supabase project dashboard
2. Go to the **SQL Editor** section (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `seed_demo_data.sql`
5. Paste it into the SQL Editor
6. Click **Run** to execute the script

The script will:
- Create 5 demo creators with profiles, bios, and avatars
- Insert 15 demo tracks across various genres (Synthwave, Classical, Jazz, Lo-fi, Experimental)
- Set realistic play counts and like counts for each track
- Mark all tracks as "approved" so they appear immediately

## Step 2: Verify the Data

After running the script, verify the data was inserted correctly:

```sql
-- Check creators
SELECT display_name, username, bio 
FROM profiles 
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);

-- Check tracks count per creator
SELECT p.display_name, COUNT(t.id) as track_count 
FROM profiles p 
LEFT JOIN tracks t ON p.id = t.creator_id 
WHERE p.id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
)
GROUP BY p.display_name;
```

You should see:
- 5 creators with unique usernames and bios
- Each creator should have 2-3 tracks

## Step 3: Understanding the Demo Content

### Demo Creators

1. **Synthwave Sam** (@synthwave_sam) - Electronic/Synthwave producer
2. **Classical Claire** (@classical_claire) - Classical AI composer
3. **Jazz Jordan** (@jazz_jordan) - Jazz fusion artist
4. **Lo-fi Luna** (@lofi_luna) - Lo-fi hip-hop producer
5. **Sonic Sage** (@sonic_sage) - Experimental sound designer

### Demo Tracks

The demo includes 15 tracks across various genres:
- 3 Synthwave/Electronic tracks
- 3 Classical tracks
- 2 Jazz tracks
- 3 Lo-fi tracks
- 2 Experimental tracks

Each track has:
- A unique title and genre
- Mood tags (Energetic, Chill, Peaceful, etc.)
- AI tool attribution (Suno AI, AIVA, Udio, etc.)
- Realistic play counts (700-5000+)
- Like counts proportional to plays
- Different creation dates (spanning the last 12 days)

## Important Notes

### Audio Files and Cover Images

**The demo tracks reference placeholder file paths** since we cannot include actual audio files in the SQL script. The paths look like:
- Audio: `demo/creator-name/track-name.mp3`
- Covers: `demo/covers/track-name.jpg`

In production, these would be real files uploaded to Supabase Storage. For the demo:

1. **Option A: Use Placeholder Behavior**
   - The app will gracefully handle missing files
   - Track cards will show "No cover" for missing cover images
   - Audio player will show an error when attempting to play

2. **Option B: Upload Real Demo Files** (Recommended for full demo experience)
   - Create the folder structure in Supabase Storage under the `audio` and `covers` buckets
   - Upload sample audio files (can be any short music clips for demo purposes)
   - Upload cover images (can be simple colored squares or AI-generated album art)
   - Update the paths in the database to match your uploaded files

### Creator Avatars

Creator avatars use the DiceBear API to generate unique SVG avatars:
```
https://api.dicebear.com/7.x/avataaars/svg?seed={CreatorName}
```

These are external URLs that work immediately without any file uploads. The avatars are:
- Unique for each creator
- Free to use
- Always available
- Deterministic (same seed = same avatar)

## Customization

### Adding More Creators

```sql
INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, role, created_at, updated_at)
VALUES 
  ('your-uuid-here', 'username', 'Display Name', 'Bio text here', 'https://api.dicebear.com/7.x/avataaars/svg?seed=YourName', 'user', NOW(), NOW());
```

### Adding More Tracks

```sql
INSERT INTO public.tracks (id, creator_id, title, genre, mood, ai_tool, audio_path, cover_path, status, plays, likes_count, created_at, updated_at)
VALUES 
  ('track-uuid-here', 'creator-uuid-here', 'Track Title', 'Genre', 'Mood', 'AI Tool', 'path/to/audio.mp3', 'path/to/cover.jpg', 'approved', 0, 0, NOW(), NOW());
```

### Updating Play/Like Counts

```sql
UPDATE tracks 
SET plays = plays + 100, likes_count = likes_count + 10 
WHERE id = 'track-uuid-here';
```

## Troubleshooting

### "Insert violates foreign key constraint"

Make sure the main schema has been applied first. The demo data depends on:
- The `profiles` table existing
- The `tracks` table existing
- The proper relationships between tables

### "Duplicate key value violates unique constraint"

The script uses `ON CONFLICT` clauses to handle re-runs. If you see this error, it means the IDs conflict with existing data. You can:
1. Delete the existing demo data first
2. Generate new UUIDs for the demo data
3. Skip inserting that specific record

### No Tracks Showing on Homepage

1. Verify tracks are marked as "approved":
   ```sql
   SELECT id, title, status FROM tracks WHERE status != 'approved';
   ```

2. Update any pending tracks:
   ```sql
   UPDATE tracks SET status = 'approved' WHERE status = 'pending';
   ```

## Cleaning Up Demo Data

To remove all demo data later:

```sql
-- Delete demo tracks
DELETE FROM tracks WHERE creator_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);

-- Delete demo profiles
DELETE FROM profiles WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);
```

## Next Steps

After inserting the demo data:
1. Visit your AIXONTRA homepage - you should see the demo tracks
2. Click on a creator's name to view their profile
3. Explore different genres and moods
4. Test the like and play functionality (requires login)

Enjoy exploring AIXONTRA with demo content! 🎵

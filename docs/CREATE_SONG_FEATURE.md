# Create Song Feature - Setup and Usage Guide

## Overview

The **Create Song** feature allows logged-in users to generate AI-powered songs with lyrics and music. Users can input creative prompts, select genres and instruments, generate content using AI APIs, and publish their creations to the AIXONTRA gallery.

## Features

- **AI-Powered Lyrics Generation**: Uses OpenAI GPT models to generate creative song lyrics
- **Music Generation Support**: Integrates with music AI APIs (Suno, Stable Audio, Riffusion)
- **Audio Preview**: Listen to your generated music before publishing with an in-browser audio player
- **Save as Draft**: Save your work in progress and return to it later
- **Draft Management**: Access and manage your drafts from the "My Music" page
- **Demo Mode**: Works without API keys using sample data
- **Multi-Step Creation Process**:
  1. Generate Lyrics: Input prompt, select genre/mood, generate and edit lyrics
  2. Generate Music: Select instruments, generate audio tracks, and preview them
  3. Publish: Review, save as draft, or submit song for approval
- **Authentication Required**: Only logged-in users can create songs
- **Review System**: All submitted songs go through moderation before publication

## Setup Instructions

### 1. API Keys Configuration

To enable AI generation features, you need to configure API keys in your `.env` file.

#### Required for Lyrics Generation

**OpenAI API** (for lyrics generation):
1. Sign up at https://platform.openai.com/
2. Navigate to API keys section
3. Create a new API key
4. Add to `.env` file:
   ```env
   OPENAI_API_KEY=sk-...your-key-here
   ```

#### Optional for Music Generation

Choose one or more music generation providers:

**Option 1: Suno AI**
1. Visit https://www.suno.ai/
2. Get API access (availability may vary)
3. Add to `.env`:
   ```env
   SUNO_API_KEY=your-suno-key-here
   ```

**Option 2: Stable Audio**
1. Visit https://stableaudio.com/
2. Sign up for API access
3. Add to `.env`:
   ```env
   STABLE_AUDIO_API_KEY=your-stable-audio-key-here
   ```

**Option 3: Riffusion**
1. Set up Riffusion (self-hosted or API service)
2. Add to `.env`:
   ```env
   RIFFUSION_API_KEY=your-riffusion-key-here
   ```

### 2. Database Migration

Run the database migration to add the necessary fields:

```sql
-- Execute this in your Supabase SQL editor
-- File: supabase/migrations/002_add_create_song_fields.sql

ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS lyrics TEXT;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS generation_metadata JSONB;
CREATE INDEX IF NOT EXISTS tracks_lyrics_idx ON public.tracks USING gin(to_tsvector('english', lyrics));
```

Or use the Supabase CLI:
```bash
supabase db push
```

### 3. Restart Your Application

After configuring API keys, restart your development server:

```bash
npm run dev
```

## Demo Mode

If no API keys are configured, the Create Song feature operates in **Demo Mode**:

- **Lyrics**: Returns sample/demo lyrics with instructions
- **Music**: Uses placeholder audio files
- **Full Functionality**: All UI features work, but with demo content

Demo mode is perfect for:
- Testing the feature without API costs
- Development and staging environments
- Demonstrating the feature to users

## Usage Guide

### For End Users

1. **Access the Feature**
   - Log in to your AIXONTRA account
   - Click "Create" in the navigation menu
   - You'll be redirected to `/create`

2. **Step 1: Generate Lyrics**
   - Enter a creative prompt describing your song idea
   - Select one or more genres (Pop, Rock, Electronic, etc.)
   - Choose a mood/style (Energetic, Calm, Epic, etc.)
   - Click "Generate Lyrics"
   - Review and edit the generated lyrics

3. **Step 2: Generate Music**
   - Select instruments you want in your track
   - Click "Generate Music"
   - **Preview the audio** using the enhanced audio player
   - Listen to ensure you're happy with the result
   - Adjust instrument selection and regenerate if needed

4. **Step 3: Publish or Save as Draft**
   - Enter a title for your track
   - Review the lyrics (you can still edit them)
   - **Preview the audio one last time** before deciding
   - Check your selected genres and mood
   - Choose one of two options:
     - **Save as Draft**: Save your work to continue later
     - **Submit for Review**: Send your song for moderation
   
5. **Managing Drafts**
   - Access your drafts from the "My Music" page (navigation menu)
   - View all your drafts, pending, and published tracks
   - Edit any draft to continue working on it
   - Publish drafts when ready
   - Delete drafts you no longer want

5. **After Submission**
   - Your song enters the review queue
   - Admins will review and approve/reject it
   - Once approved, it appears in the gallery
   - You can view it from your profile

### For Developers

#### File Structure

```
src/
├── app/
│   ├── create/
│   │   └── page.tsx              # Main Create Song page
│   └── api/
│       └── generate/
│           ├── lyrics/
│           │   └── route.ts      # Lyrics generation API
│           └── music/
│               └── route.ts      # Music generation API
├── lib/
│   └── aiConfig.ts               # AI API configuration
└── types/
    └── index.ts                  # Updated Track type with lyrics
```

#### Adding Custom Music Generation Providers

To integrate additional music generation APIs, edit `/src/app/api/generate/music/route.ts`:

```typescript
// Example: Adding a new provider
if (musicAPIs.yourProvider.enabled && musicAPIs.yourProvider.apiKey) {
  const response = await fetch('https://api.yourprovider.com/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${musicAPIs.yourProvider.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: `${genre || ''} ${mood || ''} ${prompt}`,
      instruments,
    }),
  });
  
  if (response.ok) {
    const data = await response.json();
    return NextResponse.json({
      audioUrl: data.audio_url,
      metadata: {
        prompt,
        genre,
        mood,
        instruments,
        isDemoMode: false,
        provider: 'yourProvider',
      }
    });
  }
}
```

#### Customizing Genres and Instruments

Edit `/src/lib/aiConfig.ts`:

```typescript
export const GENRES = [
  'Your Custom Genre',
  // ... existing genres
];

export const INSTRUMENTS = [
  { id: 'custom', label: 'Custom Instrument', icon: '🎵' },
  // ... existing instruments
];
```

## API Endpoints

### POST /api/generate/lyrics

Generates song lyrics using OpenAI API.

**Request Body:**
```json
{
  "prompt": "A song about chasing dreams",
  "genre": "Pop, Electronic",
  "mood": "Uplifting",
  "language": "English"
}
```

**Response:**
```json
{
  "lyrics": "[Verse 1]\n...",
  "metadata": {
    "prompt": "...",
    "genre": "Pop, Electronic",
    "mood": "Uplifting",
    "model": "gpt-4",
    "isDemoMode": false
  }
}
```

### POST /api/generate/music

Generates music tracks using configured music AI APIs.

**Request Body:**
```json
{
  "prompt": "Energetic electronic track",
  "genre": "Electronic",
  "mood": "Energetic",
  "instruments": ["synth", "drums", "bass"],
  "duration": 30
}
```

**Response (Real API):**
```json
{
  "audioUrl": "https://...",
  "metadata": {
    "prompt": "...",
    "isDemoMode": false,
    "provider": "suno"
  }
}
```

**Response (Demo Mode):**
```json
{
  "demoTracks": [
    { "name": "Synth Demo", "file": "/demo-audio/synth-demo.mp3", "instrument": "synth" }
  ],
  "metadata": {
    "isDemoMode": true,
    "provider": "demo",
    "note": "Configure API keys for real generation"
  }
}
```

### GET /api/generate/music

Returns information about available music generation providers.

**Response:**
```json
{
  "providers": [
    { "name": "Suno", "status": "configured" }
  ],
  "demoMode": false,
  "availableInstruments": ["piano", "drums", "synth"]
}
```

## Security Considerations

1. **API Keys**: Never commit API keys to version control
   - Use `.env` files (already in `.gitignore`)
   - Use environment variables in production

2. **Authentication**: The feature is protected by `AuthGuard`
   - Only logged-in users can access `/create`
   - All API calls should verify authentication

3. **Rate Limiting**: Consider implementing rate limiting for API calls
   - Prevents abuse of OpenAI/music APIs
   - Protects your API quotas

4. **Content Moderation**: All songs go through review
   - Admins approve before publication
   - Helps maintain quality and appropriateness

## Troubleshooting

### "Demo mode" message appears even with API keys configured

1. Check that your `.env` file is in the project root
2. Verify the API key variable names match exactly:
   - `OPENAI_API_KEY`
   - `SUNO_API_KEY`
   - `STABLE_AUDIO_API_KEY`
   - `RIFFUSION_API_KEY`
3. Restart your development server after adding keys
4. Check the console for API error messages

### OpenAI API errors

- **401 Unauthorized**: Invalid API key
- **429 Too Many Requests**: Rate limit exceeded
- **500 Server Error**: Check OpenAI service status

### Music generation not working

- Music generation APIs may require additional setup
- Check provider-specific documentation
- Verify your API access level/subscription
- Fall back to demo mode if provider unavailable

### Lyrics not saving to database

- Ensure database migration was applied
- Check that `lyrics` column exists in `tracks` table
- Verify RLS policies allow insert with lyrics field

### Demo mode tracks don't have audio

This is expected behavior. Tracks created in demo mode use a placeholder audio path (`demo/placeholder.mp3`). These tracks:
- Are still submitted for review
- Show up in the admin review queue
- Should be reviewed/approved based on lyrics and metadata
- May need special handling by admins (marked as demo/sample tracks)

For production use with real audio:
- Configure music generation API keys
- Implement audio file download and upload (see code comments in `src/app/create/page.tsx`)
- Or use the existing Upload feature for tracks with audio files

## Cost Considerations

### OpenAI API Costs

- GPT-4: ~$0.03-0.06 per song (1000 tokens)
- GPT-3.5-turbo: ~$0.002 per song (cheaper alternative)
- Monitor usage in OpenAI dashboard

### Music Generation Costs

- Suno: Varies by plan
- Stable Audio: Check their pricing
- Riffusion: Self-hosted (compute costs)

**Recommendation**: Start with demo mode, then add OpenAI for lyrics only, and finally add music generation as budget allows.

## Future Enhancements

Potential improvements for this feature:

1. **Audio File Upload**: Complete audio file handling by downloading generated audio and uploading to Supabase storage
2. **Multi-track Editing**: Allow users to mix multiple instrument tracks
3. **Audio Upload**: Let users upload custom audio instead of generating
4. **Collaboration**: Multiple users working on same song
5. **Version History**: Save multiple versions of lyrics/audio
6. **Genre-specific Templates**: Pre-configured settings for popular genres
7. **Real-time Preview**: Live lyrics/music preview during generation
8. **Export Options**: Download lyrics as text file, audio in various formats

## Support

For issues or questions:

1. Check this documentation first
2. Review API provider documentation
3. Check console logs for error messages
4. Verify database schema is up to date
5. Ensure API keys are correctly configured

## License

This feature is part of the AIXONTRA project and follows the same license terms.

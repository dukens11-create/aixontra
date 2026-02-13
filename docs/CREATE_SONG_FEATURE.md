# Create Song Feature - Setup and Usage Guide

## Overview

The **Create Song** feature allows logged-in users to generate AI-powered songs with lyrics, AI voices, and music. Users can input creative prompts, select genres and instruments, choose AI voices for vocal synthesis, generate content using AI APIs, and publish their creations to the AIXONTRA gallery.

## Features

- **AI-Powered Lyrics Generation**: Uses OpenAI GPT models to generate creative song lyrics
- **AI Voice Generation**: Synthesize realistic human-like vocals from lyrics using state-of-the-art TTS
- **Music Generation Support**: Integrates with music AI APIs (Suno, Stable Audio, Riffusion)
- **Audio Preview**: Listen to your generated music and voice before publishing with an in-browser audio player
- **Save as Draft**: Save your work in progress and return to it later
- **Draft Management**: Access and manage your drafts from the "My Music" page
- **Demo Mode**: Works without API keys using sample data
- **Multi-Step Creation Process**:
  1. Generate Lyrics: Input prompt, select genre/mood, generate and edit lyrics
  2. Generate Voice: Select AI voice, preview and generate vocal audio from lyrics
  3. Generate Music: Select instruments, generate audio tracks, and preview them
  4. Publish: Review, save as draft, or submit song for approval
- **Multi-language Support**: Generate lyrics and voices in multiple languages
- **Voice Options**: Choose from various voice styles, genders, and languages
- **Authentication Required**: Only logged-in users can create songs
- **Review System**: All submitted songs go through moderation before publication

## Setup Instructions

### 1. API Keys Configuration

To enable AI generation features, you need to configure API keys in your `.env` file.

#### Required for Lyrics Generation

**OpenAI API** (for lyrics generation and TTS voice):
1. Sign up at https://platform.openai.com/
2. Navigate to API keys section
3. Create a new API key
4. Add to `.env` file:
   ```env
   OPENAI_API_KEY=sk-...your-key-here
   ```

#### Optional TTS Voice Providers

Choose one or more TTS providers for high-quality voice generation:

**Option 1: OpenAI TTS** (Included with OpenAI API Key)
- 6 natural-sounding voices (Alloy, Echo, Fable, Onyx, Nova, Shimmer)
- Multiple languages supported
- No additional setup needed if you have OpenAI API key

**Option 2: ElevenLabs**
1. Visit https://elevenlabs.io/
2. Create an account and get API key
3. Add to `.env`:
   ```env
   ELEVENLABS_API_KEY=your-elevenlabs-key-here
   ```
- Offers the most realistic and expressive voices
- Supports voice cloning and custom voices
- Multiple language and emotion options

**Option 3: Google Cloud TTS**
1. Visit https://cloud.google.com/text-to-speech
2. Create a project and enable Text-to-Speech API
3. Generate API key
4. Add to `.env`:
   ```env
   GOOGLE_TTS_API_KEY=your-google-tts-key-here
   ```
- Supports 40+ languages
- WaveNet and Neural2 voice models
- Great for multi-language support

**Option 4: Azure Neural TTS**
1. Visit https://azure.microsoft.com/services/cognitive-services/text-to-speech/
2. Create a Speech service resource
3. Get your API key and region
4. Add to `.env`:
   ```env
   AZURE_TTS_API_KEY=your-azure-key-here
   AZURE_TTS_REGION=eastus
   ```
- Enterprise-grade reliability
- 100+ languages and locales
- Neural voice models for natural speech

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

Run the database migrations to add the necessary fields:

```bash
# Using Supabase CLI (recommended)
supabase db push

# Or execute migrations manually in Supabase SQL editor:
# - supabase/migrations/002_add_create_song_fields.sql
# - supabase/migrations/003_add_voice_generation_fields.sql
```

**Migration 002 - Create Song Fields:**
```sql
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS lyrics TEXT;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS generation_metadata JSONB;
CREATE INDEX IF NOT EXISTS tracks_lyrics_idx ON public.tracks USING gin(to_tsvector('english', lyrics));
```

**Migration 003 - Voice Generation Fields:**
```sql
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS voice_audio_path TEXT;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS voice_metadata JSONB;
CREATE INDEX IF NOT EXISTS tracks_voice_metadata_idx ON public.tracks USING gin(voice_metadata);
CREATE INDEX IF NOT EXISTS tracks_with_voice_idx ON public.tracks (id) WHERE voice_audio_path IS NOT NULL;
```

### 3. Restart Your Application

After configuring API keys, restart your development server:

```bash
npm run dev
```

## Demo Mode

If no API keys are configured, the Create Song feature operates in **Demo Mode**:

- **Lyrics**: Returns sample/demo lyrics with instructions
- **Voice**: Shows demo voice options but cannot generate audio
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
   - Optionally add style/rhythm description for more control
   - Select lyrics language (supports multiple languages)
   - Click "Generate Lyrics"
   - Review and edit the generated lyrics

3. **Step 2: Generate Voice**
   - Filter available voices by gender and language
   - Browse and select an AI voice that fits your song
   - Adjust voice speed if desired (0.5x to 2.0x)
   - Click "Generate Voice"
   - Preview the generated vocal audio
   - Regenerate with different voice or settings if needed

4. **Step 3: Generate Music**
   - Select instruments you want in your track
   - Click "Generate Music"
   - **Preview the audio** using the enhanced audio player
   - Listen to ensure you're happy with the result
   - Adjust instrument selection and regenerate if needed

5. **Step 4: Publish or Save as Draft**
   - Enter a title for your track
   - Review the lyrics, voice, and music (you can still edit lyrics)
   - **Preview the audio one last time** before deciding
   - Check your selected genres and mood
   - Choose one of two options:
     - **Save as Draft**: Save your work to continue later
     - **Submit for Review**: Send your song for moderation
   
6. **Managing Drafts**
   - Access your drafts from the "My Music" page (navigation menu)
   - View all your drafts, pending, and published tracks
   - Edit any draft to continue working on it
   - Publish drafts when ready
   - Delete drafts you no longer want

7. **After Submission**
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
│   │   └── page.tsx              # Main Create Song page (with voice UI)
│   └── api/
│       └── generate/
│           ├── lyrics/
│           │   └── route.ts      # Lyrics generation API
│           ├── voice/
│           │   └── route.ts      # Voice/TTS generation API
│           └── music/
│               └── route.ts      # Music generation API
├── lib/
│   └── aiConfig.ts               # AI API configuration (includes TTS)
└── types/
    └── index.ts                  # Updated Track type with voice fields
```

#### Voice Provider Configuration

Available voices are automatically loaded based on configured TTS API keys. The system supports:

- **OpenAI TTS**: 6 built-in voices, automatically available with OpenAI API key
- **ElevenLabs**: Pre-configured voices + custom voice support
- **Google Cloud TTS**: Neural voices in 40+ languages
- **Azure Neural TTS**: 100+ languages with style control

To add custom ElevenLabs voices, edit `/src/lib/aiConfig.ts`:

```typescript
export const ELEVENLABS_VOICES: VoiceOption[] = [
  // Add your custom voice
  { 
    id: 'your-voice-id', 
    name: 'Custom Voice Name', 
    provider: 'elevenlabs', 
    gender: 'female', 
    language: 'en', 
    languageName: 'English',
    style: 'Professional'
  },
  // ... existing voices
];
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
  "language": "English",
  "styleDescription": "Upbeat with catchy hooks"
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
    "language": "English",
    "model": "gpt-4",
    "isDemoMode": false
  }
}
```

### GET /api/generate/voice

Returns available TTS voices based on configured API keys.

**Response:**
```json
{
  "voices": [
    {
      "id": "nova",
      "name": "Nova",
      "provider": "openai",
      "gender": "female",
      "language": "en",
      "languageName": "English"
    }
  ],
  "providers": [
    { "name": "OpenAI TTS", "status": "configured" }
  ],
  "demoMode": false
}
```

### POST /api/generate/voice

Generates vocal audio from lyrics using TTS APIs.

**Request Body:**
```json
{
  "lyrics": "[Verse 1]\nChasing dreams under city lights...",
  "voiceId": "nova",
  "voiceProvider": "openai",
  "language": "en",
  "speed": 1.0,
  "singing": false
}
```

**Response (Real API):**
```json
{
  "audioData": "base64_encoded_audio_data...",
  "format": "mp3",
  "metadata": {
    "voiceId": "nova",
    "voiceName": "Nova",
    "voiceProvider": "openai",
    "voiceGender": "female",
    "voiceLanguage": "en",
    "isDemoMode": false,
    "generatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (Demo Mode):**
```json
{
  "demoMode": true,
  "metadata": {
    "voiceId": "demo-voice",
    "voiceName": "Demo Voice",
    "voiceProvider": "demo",
    "isDemoMode": true,
    "note": "Configure TTS API keys in .env for real voice generation"
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
   - Prevents abuse of OpenAI/TTS/music APIs
   - Protects your API quotas
   - Especially important for TTS which can be costly

4. **Content Moderation**: All songs go through review
   - Admins approve before publication
   - Helps maintain quality and appropriateness
   - Voice-generated content is also reviewed

## Troubleshooting

### "Demo mode" message appears even with API keys configured

1. Check that your `.env` file is in the project root
2. Verify the API key variable names match exactly:
   - `OPENAI_API_KEY` (for lyrics and TTS)
   - `ELEVENLABS_API_KEY` (optional TTS)
   - `GOOGLE_TTS_API_KEY` (optional TTS)
   - `AZURE_TTS_API_KEY` (optional TTS)
   - `SUNO_API_KEY` (music)
   - `STABLE_AUDIO_API_KEY` (music)
   - `RIFFUSION_API_KEY` (music)
3. Restart your development server after adding keys
4. Check the console for API error messages

### OpenAI API errors

- **401 Unauthorized**: Invalid API key
- **429 Too Many Requests**: Rate limit exceeded
- **500 Server Error**: Check OpenAI service status

### Voice generation not working

- Ensure TTS API keys are properly configured
- Check provider-specific documentation for setup
- Verify your account has access to the TTS service
- Some providers require billing to be enabled
- Check browser console for detailed error messages

### Music generation not working

- Music generation APIs may require additional setup
- Check provider-specific documentation
- Verify your API access level/subscription
- Fall back to demo mode if provider unavailable

### Lyrics or voice not saving to database

- Ensure all database migrations were applied
- Check that required columns exist in `tracks` table
- Verify RLS policies allow insert with new fields
- Check Supabase storage permissions for voice audio uploads

### Demo mode tracks don't have audio

This is expected behavior. Tracks created in demo mode use a placeholder audio path (`demo/placeholder.mp3`). These tracks:
- Are still submitted for review
- Show up in the admin review queue
- Should be reviewed/approved based on lyrics and metadata
- May need special handling by admins (marked as demo/sample tracks)

For production use with real audio:
- Configure music generation API keys
- Configure TTS API keys for voice generation
- Implement audio file download and upload (see code comments in `src/app/create/page.tsx`)
- Or use the existing Upload feature for tracks with audio files

## Cost Considerations

### OpenAI API Costs

**Lyrics Generation:**
- GPT-4: ~$0.03-0.06 per song (1000 tokens)
- GPT-3.5-turbo: ~$0.002 per song (cheaper alternative)

**TTS Voice Generation:**
- TTS-1: $0.015 per 1,000 characters (~$0.02-0.05 per song)
- TTS-1-HD: $0.030 per 1,000 characters (~$0.04-0.10 per song)
- Monitor usage in OpenAI dashboard

**Combined:** ~$0.05-0.16 per complete song (lyrics + voice) with GPT-4 and TTS-1-HD

### ElevenLabs Costs

- Free tier: 10,000 characters/month
- Starter: $5/month for 30,000 characters
- Creator: $22/month for 100,000 characters
- Pro: $99/month for 500,000 characters
- Highest quality and most natural voices
- Best for professional productions

### Google Cloud TTS Costs

- WaveNet voices: $16 per 1 million characters
- Neural2 voices: $16 per 1 million characters
- Standard voices: $4 per 1 million characters
- Very cost-effective for high volume
- Great multi-language support

### Azure Neural TTS Costs

- Neural voices: $16 per 1 million characters
- Pay-as-you-go pricing
- Enterprise-grade reliability
- Good for production deployments

### Music Generation Costs

- Suno: Varies by plan
- Stable Audio: Check their pricing
- Riffusion: Self-hosted (compute costs)

**Recommendation**: 
- **Budget-Friendly**: Start with OpenAI API (lyrics + TTS) for ~$0.10 per song
- **Best Quality**: Use OpenAI for lyrics + ElevenLabs for voice
- **High Volume**: Use Google Cloud TTS or Azure for cost-effective voice at scale
- **Demo/Testing**: Start with demo mode, no costs

## Future Enhancements

Potential improvements for this feature:

1. **Voice Mixing**: Combine voice audio with instrumental background music
2. **Singing Mode**: Enhanced singing voice generation with better musical phrasing
3. **Voice Cloning**: Allow users to clone their own voice with ElevenLabs
4. **Multi-Voice Songs**: Support duets and harmonies with multiple voices
5. **Audio File Upload**: Complete audio file handling by downloading generated audio and uploading to Supabase storage
6. **Multi-track Editing**: Allow users to mix multiple instrument tracks
7. **Collaboration**: Multiple users working on same song
8. **Version History**: Save multiple versions of lyrics/voice/audio
9. **Genre-specific Templates**: Pre-configured settings for popular genres
10. **Real-time Preview**: Live lyrics/music/voice preview during generation
11. **Export Options**: Download lyrics as text file, audio in various formats
12. **Voice Style Control**: More granular control over emotion, pitch, and pacing

## Support

For issues or questions:

1. Check this documentation first
2. Review API provider documentation (OpenAI, ElevenLabs, Google, Azure)
3. Check console logs for error messages
4. Verify database schema is up to date (all migrations applied)
5. Ensure API keys are correctly configured
6. Check Supabase storage permissions for voice audio uploads

## License

This feature is part of the AIXONTRA project and follows the same license terms.

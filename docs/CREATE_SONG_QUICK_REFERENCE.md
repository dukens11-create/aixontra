# Create Song Feature - Quick Reference

## Accessing the Feature

1. **Login Required**: Navigate to `/create` - you'll be redirected to login if not authenticated
2. **Navigation**: Click "Create" link in the top navigation bar

## Three-Step Process

### Step 1: Generate Lyrics
1. Enter a creative prompt (e.g., "A song about dreams and ambitions")
2. Select one or more genres (Pop, Rock, Electronic, etc.)
3. Choose a mood (Energetic, Calm, Epic, etc.)
4. Click "Generate Lyrics"
5. Edit the generated lyrics if needed

### Step 2: Generate Music
1. Select instruments (Piano, Guitar, Drums, Synth, etc.)
2. Click "Generate Music"
3. Preview the generated audio with the play button

### Step 3: Publish Song
1. Enter a track title
2. Review and edit lyrics one final time
3. Verify selected genres and mood
4. Click "Submit for Review"
5. Your song will be sent to admins for approval

## Demo Mode vs Live Mode

### Demo Mode (No API Keys)
- Returns sample/template lyrics with setup instructions
- Uses placeholder audio files
- Perfect for testing and development
- All UI features work normally

### Live Mode (API Keys Configured)
- Real AI-generated lyrics from OpenAI
- Real music generation (when music API keys added)
- Professional results
- Costs per API usage

## API Keys Setup

### For Lyrics Generation (Recommended)
```env
OPENAI_API_KEY=sk-your-openai-key-here
```

### For Music Generation (Optional)
```env
SUNO_API_KEY=your-suno-key-here
# OR
STABLE_AUDIO_API_KEY=your-stable-audio-key-here
# OR
RIFFUSION_API_KEY=your-riffusion-key-here
```

Add these to your `.env` file and restart the server.

## Available Options

### Genres
Pop, Rock, Hip-Hop, Electronic, Jazz, Classical, R&B, Country, Reggae, Blues, Metal, Folk, Latin, Ambient, Lo-fi, Indie, Funk, Soul

### Moods
Energetic, Calm, Happy, Melancholic, Epic, Romantic, Dark, Uplifting, Chill, Dramatic, Mysterious, Playful

### Instruments
Piano 🎹, Guitar 🎸, Bass 🎸, Drums 🥁, Synthesizer 🎛️, Strings 🎻, Brass 🎺, Vocals 🎤, Percussion 🥁, Woodwind 🎷

## Troubleshooting

**"Demo mode" message appears**
- API keys not configured or invalid
- Add valid API keys to `.env` file
- Restart server after adding keys

**Cannot access /create page**
- Must be logged in
- Create an account or login first

**Song not publishing**
- Title is required
- Lyrics are required
- Check console for error messages

## Support

- Full documentation: [docs/CREATE_SONG_FEATURE.md](CREATE_SONG_FEATURE.md)
- Check console logs for detailed error messages
- Verify database migration was applied
- Ensure API keys are valid if using live mode

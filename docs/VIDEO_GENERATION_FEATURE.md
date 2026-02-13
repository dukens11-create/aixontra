# AI Video Generation Feature

## Overview

The AI Video Generation feature allows users to create music videos for their AI-generated songs. This feature integrates seamlessly into the existing song creation workflow, adding a new "Video" step between music generation and publishing.

## Table of Contents

- [Features](#features)
- [Supported Providers](#supported-providers)
- [Setup](#setup)
- [Usage](#usage)
- [API Integration](#api-integration)
- [Demo Mode](#demo-mode)
- [Database Schema](#database-schema)
- [Technical Details](#technical-details)

## Features

### Video Generation Options

- **Multiple Video Styles**: Abstract, Nature, Urban, Animated, Visualizer, Cinematic, Retro, Minimal, Psychedelic, Neon
- **Resolution Support**: 720p (HD), 1080p (Full HD), 4K (Ultra HD)
- **Aspect Ratios**: 16:9 (Landscape), 9:16 (Vertical/Mobile), 1:1 (Square), 4:3 (Classic)
- **Video Moods**: Dark, Vibrant, Minimalist, Energetic, Calm, Dreamy, Intense, Futuristic

### User Experience

- **5-Step Workflow**: Lyrics → Voice → Music → **Video** → Publish
- **Preview Player**: Built-in HTML5 video player to preview generated videos
- **Optional Generation**: Video generation is optional - users can skip to publish
- **Progress Tracking**: Loading indicators and status messages during generation
- **Demo Mode**: Works without API keys using sample videos

## Supported Providers

The feature supports integration with multiple AI video generation providers:

### 1. Replicate (Stable Video Diffusion)
- **Website**: https://replicate.com/
- **Models**: Stable Video Diffusion, AnimateDiff, and more
- **API Key**: `REPLICATE_API_KEY`
- **Best For**: High-quality, stable video generation

### 2. Runway ML
- **Website**: https://runwayml.com/
- **Models**: Gen-2, Gen-3
- **API Key**: `RUNWAY_API_KEY`
- **Best For**: Professional-grade music videos

### 3. Stability AI
- **Website**: https://stability.ai/
- **Models**: Stable Video Diffusion
- **API Key**: `STABILITY_API_KEY`
- **Best For**: Open-source based generation

### 4. Pika Labs
- **Website**: https://pika.art/
- **API Key**: `PIKA_API_KEY`
- **Best For**: Emerging video generation technology

### 5. Luma AI Dream Machine
- **Website**: https://lumalabs.ai/
- **API Key**: `LUMA_API_KEY`
- **Best For**: Text-to-video generation

## Setup

### 1. Environment Configuration

Add your preferred video API key(s) to `.env`:

```env
# Choose one or more providers:
REPLICATE_API_KEY=your_replicate_key_here
RUNWAY_API_KEY=your_runway_key_here
STABILITY_API_KEY=your_stability_key_here
PIKA_API_KEY=your_pika_key_here
LUMA_API_KEY=your_luma_key_here
```

### 2. Database Migration

Run the video generation migration:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the migration
# Execute: supabase/migrations/004_add_video_generation_fields.sql
```

This adds the following columns to the `tracks` table:
- `video_url` (TEXT): URL to the generated video
- `video_status` (VARCHAR): Status of video generation
- `video_metadata` (JSONB): Video generation metadata

### 3. Demo Videos (Optional)

For demo mode testing, create sample video files in `public/demo-video/`:

```bash
cd public/demo-video
# Add these files:
# - abstract-demo.mp4
# - nature-demo.mp4
# - urban-demo.mp4
```

See `public/demo-video/README.md` for instructions on creating demo videos.

## Usage

### For Users

1. **Create a Song**: Navigate to `/create` and generate lyrics, voice, and music
2. **Generate Video**: In the Video step:
   - Select video style (e.g., Abstract, Nature, Urban)
   - Choose resolution (720p, 1080p, 4K)
   - Select aspect ratio (16:9, 9:16, 1:1, 4:3)
   - Pick a video mood (Dark, Vibrant, Calm, etc.)
3. **Generate**: Click "Generate Video" button
4. **Preview**: Watch the generated video in the built-in player
5. **Publish**: Proceed to publish your song with video

### Video Display

Videos are displayed on:
- **Track Page**: Main video player with controls
- **Create Page**: Preview during generation
- **Profile Page**: Video thumbnails (if implemented)

## API Integration

### Endpoint: POST `/api/generate/video`

**Request Body:**
```json
{
  "title": "Song Title",
  "lyrics": "Optional song lyrics for context",
  "genre": "Pop",
  "mood": "upbeat",
  "style": "abstract",
  "duration": 180,
  "resolution": "1080p",
  "aspectRatio": "16:9",
  "videoMood": "vibrant"
}
```

**Response (Real API):**
```json
{
  "videoUrl": "https://storage.example.com/video.mp4",
  "metadata": {
    "style": "abstract",
    "resolution": "1080p",
    "aspectRatio": "16:9",
    "duration": 180,
    "provider": "replicate",
    "generatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Response (Demo Mode):**
```json
{
  "demoVideo": {
    "name": "Abstract Demo",
    "file": "/demo-video/abstract-demo.mp4",
    "style": "abstract",
    "duration": 180,
    "resolution": "1080p",
    "aspectRatio": "16:9"
  },
  "metadata": {
    "isDemoMode": true,
    "provider": "demo",
    "note": "Configure video API keys for real generation"
  }
}
```

### Endpoint: GET `/api/generate/video`

Returns information about configured providers:

```json
{
  "providers": [
    { "name": "Replicate", "status": "configured" }
  ],
  "demoMode": false,
  "availableStyles": ["abstract", "nature", "urban"]
}
```

## Demo Mode

When no video API keys are configured, the feature operates in demo mode:

- Returns sample video files from `public/demo-video/`
- Shows info message: "Demo mode: Configure video API keys in .env for real video generation"
- All other functionality works the same
- Useful for development and testing

## Database Schema

### Tracks Table Updates

```sql
ALTER TABLE public.tracks 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_status VARCHAR(50) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS video_metadata JSONB;
```

**video_status values:**
- `none`: No video generated
- `pending`: Video generation queued
- `generating`: Video being generated
- `completed`: Video generated successfully
- `failed`: Video generation failed

**video_metadata structure:**
```json
{
  "style": "abstract",
  "resolution": "1080p",
  "aspectRatio": "16:9",
  "duration": 180,
  "provider": "replicate",
  "model": "stable-video-diffusion",
  "prompt": "Generated prompt text",
  "generatedAt": "2024-01-01T00:00:00Z",
  "thumbnailUrl": "https://storage.example.com/thumbnail.jpg"
}
```

## Technical Details

### File Structure

```
src/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── video/
│   │           └── route.ts          # Video generation API
│   ├── create/
│   │   └── page.tsx                  # Updated with video step
│   └── track/
│       └── [id]/
│           └── page.tsx              # Updated with video player
├── lib/
│   └── aiConfig.ts                   # Video provider config
└── types/
    └── index.ts                      # VideoMetadata type

supabase/
└── migrations/
    └── 004_add_video_generation_fields.sql

public/
└── demo-video/
    ├── README.md                     # Demo video setup guide
    ├── abstract-demo.mp4             # Demo videos
    ├── nature-demo.mp4
    └── urban-demo.mp4
```

### Key Components

1. **Video Generation Handler** (`src/app/create/page.tsx`):
   - State management for video options
   - API call to `/api/generate/video`
   - Video preview player
   - Integration with publish workflow

2. **Video API Route** (`src/app/api/generate/video/route.ts`):
   - Provider selection logic
   - Request validation
   - Demo mode fallback
   - Response formatting

3. **Track Display** (`src/app/track/[id]/page.tsx`):
   - HTML5 video player
   - Conditional rendering (video or cover image)
   - Video controls and styling

### Video Prompt Generation

The API includes a `generateVideoPrompt()` helper that creates AI-friendly prompts based on:
- Selected video style
- Song genre and mood
- Lyrics content (first 100 characters)
- Video mood setting

Example prompt:
```
"Abstract flowing shapes and patterns, fluid motion, dynamic colors, 
vibrant atmosphere, inspired by Pop music, 
visual representation of: Chasing dreams under city lights..."
```

### Performance Considerations

- **Generation Time**: 2-15 minutes depending on provider
- **File Size**: Videos can be 100MB-2GB
- **Async Processing**: Consider implementing job queues for production
- **Storage**: Use CDN for efficient video delivery
- **Caching**: Cache video URLs to avoid regeneration

## Future Enhancements

Potential improvements for the video generation feature:

1. **Beat Sync**: Sync visual effects with music tempo
2. **Multiple Styles**: Generate multiple video variations
3. **User Uploads**: Allow users to upload custom video clips
4. **Video Editing**: Basic editing capabilities
5. **Thumbnails**: Auto-generate video thumbnails
6. **Queue System**: Background job processing for long videos
7. **Webhooks**: Handle async callbacks from providers
8. **Cost Tracking**: Monitor API usage and costs
9. **Rate Limiting**: Prevent abuse with generation limits
10. **Mobile Optimization**: Optimize video playback for mobile devices

## Troubleshooting

### Video not generating
- Check API key configuration in `.env`
- Verify API key has sufficient credits
- Check network connectivity
- Review API logs for errors

### Demo mode not working
- Ensure demo video files exist in `public/demo-video/`
- Check file paths match configuration
- Verify video files are in MP4 format

### Video not displaying on track page
- Check `video_url` field in database
- Verify video URL is accessible
- Check browser console for errors
- Ensure video format is supported (MP4/H.264)

## Support

For issues or questions:
1. Check this documentation
2. Review API provider documentation
3. Check application logs
4. Open an issue on GitHub

## License

This feature is part of the AIXONTRA platform and follows the project's license terms.

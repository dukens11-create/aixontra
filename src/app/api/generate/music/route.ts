import { NextRequest, NextResponse } from 'next/server';
import { AI_CONFIG } from '@/lib/aiConfig';

/**
 * POST /api/generate/music
 * 
 * Generates music tracks using AI music generation APIs.
 * Falls back to demo sample tracks if no API keys are configured.
 * 
 * Request body:
 * {
 *   prompt: string,          // Musical prompt/description
 *   genre?: string,          // Musical genre
 *   mood?: string,           // Mood/style
 *   instruments?: string[],  // Selected instruments
 *   language?: string,       // Language for music generation
 *   duration?: number        // Duration in seconds (default: 30)
 * }
 * 
 * Response:
 * {
 *   audioUrl?: string,       // URL to generated audio (real API)
 *   demoTracks?: Array,      // Demo sample tracks (demo mode)
 *   metadata: {
 *     prompt: string,
 *     genre?: string,
 *     mood?: string,
 *     language?: string,
 *     instruments?: string[],
 *     isDemoMode: boolean,
 *     provider?: string
 *   }
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, genre, mood, instruments = [], language = 'English', duration = 30 } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check if any music generation API is configured
    const musicAPIs = AI_CONFIG.music;
    
    // Try Suno API first
    if (musicAPIs.suno.enabled && musicAPIs.suno.apiKey) {
      // NOTE: This is a placeholder for Suno API integration
      // Real implementation would call Suno's API endpoint
      // For now, return 501 Not Implemented
      return NextResponse.json(
        { 
          error: 'Suno API integration is configured but not yet fully implemented. Please see code comments in /src/app/api/generate/music/route.ts for implementation guidance.',
          provider: 'suno',
          status: 'not_implemented'
        },
        { status: 501 }
      );
    }
    
    // Try Stable Audio
    if (musicAPIs.stableAudio.enabled && musicAPIs.stableAudio.apiKey) {
      // NOTE: Placeholder for Stable Audio integration
      return NextResponse.json(
        { 
          error: 'Stable Audio API integration is configured but not yet fully implemented. Please see code comments in /src/app/api/generate/music/route.ts for implementation guidance.',
          provider: 'stable_audio',
          status: 'not_implemented'
        },
        { status: 501 }
      );
    }
    
    // Try Riffusion
    if (musicAPIs.riffusion.enabled && musicAPIs.riffusion.apiKey) {
      // NOTE: Placeholder for Riffusion integration
      return NextResponse.json(
        { 
          error: 'Riffusion API integration is configured but not yet fully implemented. Please see code comments in /src/app/api/generate/music/route.ts for implementation guidance.',
          provider: 'riffusion',
          status: 'not_implemented'
        },
        { status: 501 }
      );
    }

    // Demo mode - return sample tracks
    return NextResponse.json({
      demoTracks: AI_CONFIG.demo.sampleTracks.filter(track => 
        instruments.length === 0 || instruments.includes(track.instrument)
      ),
      metadata: {
        prompt,
        genre,
        mood,
        language,
        instruments,
        isDemoMode: true,
        provider: 'demo',
        note: 'Configure SUNO_API_KEY, STABLE_AUDIO_API_KEY, or RIFFUSION_API_KEY in .env for real music generation'
      }
    });
  } catch (error) {
    console.error('Error generating music:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate/music
 * 
 * Returns information about available music generation providers
 */
export async function GET() {
  const providers = [];
  
  if (AI_CONFIG.music.suno.enabled) {
    providers.push({ name: 'Suno', status: 'configured' });
  }
  if (AI_CONFIG.music.stableAudio.enabled) {
    providers.push({ name: 'Stable Audio', status: 'configured' });
  }
  if (AI_CONFIG.music.riffusion.enabled) {
    providers.push({ name: 'Riffusion', status: 'configured' });
  }
  
  return NextResponse.json({
    providers: providers.length > 0 ? providers : [{ name: 'Demo', status: 'active' }],
    demoMode: providers.length === 0,
    availableInstruments: AI_CONFIG.demo.sampleTracks.map(t => t.instrument),
  });
}

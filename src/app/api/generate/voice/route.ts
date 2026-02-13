import { NextRequest, NextResponse } from 'next/server';
import { AI_CONFIG, getAvailableVoices, OPENAI_VOICES } from '@/lib/aiConfig';

/**
 * GET /api/generate/voice
 * 
 * Returns information about available TTS voices based on configured APIs
 */
export async function GET() {
  try {
    const availableVoices = getAvailableVoices();
    
    const providers = [];
    if (AI_CONFIG.tts.openai.enabled) {
      providers.push({ name: 'OpenAI TTS', status: 'configured' });
    }
    if (AI_CONFIG.tts.elevenlabs.enabled) {
      providers.push({ name: 'ElevenLabs', status: 'configured' });
    }
    if (AI_CONFIG.tts.googleTTS.enabled) {
      providers.push({ name: 'Google Cloud TTS', status: 'configured' });
    }
    if (AI_CONFIG.tts.azureTTS.enabled) {
      providers.push({ name: 'Azure Neural TTS', status: 'configured' });
    }
    
    return NextResponse.json({
      voices: availableVoices,
      providers: providers.length > 0 ? providers : [{ name: 'Demo', status: 'active' }],
      demoMode: providers.length === 0,
    });
  } catch (error) {
    console.error('Error fetching available voices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/generate/voice
 * 
 * Generates vocal audio from lyrics using TTS APIs.
 * Supports multiple providers: OpenAI, ElevenLabs, Google TTS, Azure TTS.
 * Falls back to demo mode if no API keys are configured.
 * 
 * Request body:
 * {
 *   lyrics: string,          // Song lyrics to synthesize
 *   voiceId: string,         // Voice ID from available voices
 *   voiceProvider?: string,  // Provider name (openai, elevenlabs, google, azure)
 *   language?: string,       // Language code (e.g., 'en', 'es', 'fr')
 *   speed?: number,          // Speech speed (0.5 - 2.0, default: 1.0)
 *   singing?: boolean        // Attempt to use singing voice if available
 * }
 * 
 * Response:
 * {
 *   audioUrl?: string,       // URL to generated audio (real API)
 *   audioData?: string,      // Base64 encoded audio data (for download)
 *   metadata: {
 *     voiceId: string,
 *     voiceName: string,
 *     voiceProvider: string,
 *     voiceLanguage: string,
 *     isDemoMode: boolean,
 *     generatedAt: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lyrics, voiceId, voiceProvider, language = 'en', speed = 1.0, singing = false } = body;

    if (!lyrics || typeof lyrics !== 'string' || lyrics.trim().length === 0) {
      return NextResponse.json(
        { error: 'Lyrics are required' },
        { status: 400 }
      );
    }

    if (!voiceId || typeof voiceId !== 'string') {
      return NextResponse.json(
        { error: 'Voice ID is required' },
        { status: 400 }
      );
    }

    // Clean lyrics for TTS (remove section markers like [Verse 1], [Chorus], etc.)
    const cleanedLyrics = lyrics
      .replace(/\[.*?\]/g, '') // Remove section markers
      .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
      .trim();

    // Try OpenAI TTS
    if (voiceProvider === 'openai' && AI_CONFIG.tts.openai.enabled && AI_CONFIG.tts.openai.apiKey) {
      const voice = OPENAI_VOICES.find(v => v.id === voiceId);
      if (!voice) {
        return NextResponse.json(
          { error: 'Invalid voice ID for OpenAI TTS' },
          { status: 400 }
        );
      }

      const openaiResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.tts.openai.apiKey}`,
        },
        body: JSON.stringify({
          model: AI_CONFIG.tts.openai.model,
          input: cleanedLyrics,
          voice: voiceId,
          speed: speed,
        }),
      });

      if (!openaiResponse.ok) {
        const error = await openaiResponse.json();
        console.error('OpenAI TTS API error:', error);
        return NextResponse.json(
          { error: 'Failed to generate voice. Please check your API key.' },
          { status: 500 }
        );
      }

      // Get audio data as buffer
      const audioBuffer = await openaiResponse.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');

      return NextResponse.json({
        audioData: audioBase64,
        format: 'mp3',
        metadata: {
          voiceId,
          voiceName: voice.name,
          voiceProvider: 'openai',
          voiceGender: voice.gender,
          voiceLanguage: voice.language,
          isDemoMode: false,
          generatedAt: new Date().toISOString(),
        }
      });
    }

    // Try ElevenLabs TTS
    if (voiceProvider === 'elevenlabs' && AI_CONFIG.tts.elevenlabs.enabled && AI_CONFIG.tts.elevenlabs.apiKey) {
      const elevenlabsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': AI_CONFIG.tts.elevenlabs.apiKey,
        },
        body: JSON.stringify({
          text: cleanedLyrics,
          model_id: singing ? 'eleven_multilingual_v2' : 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: singing ? 0.5 : 0,
            use_speaker_boost: true,
          }
        }),
      });

      if (!elevenlabsResponse.ok) {
        const error = await elevenlabsResponse.text();
        console.error('ElevenLabs API error:', error);
        return NextResponse.json(
          { error: 'Failed to generate voice with ElevenLabs. Please check your API key.' },
          { status: 500 }
        );
      }

      const audioBuffer = await elevenlabsResponse.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');

      return NextResponse.json({
        audioData: audioBase64,
        format: 'mp3',
        metadata: {
          voiceId,
          voiceName: voiceId, // ElevenLabs uses voice ID
          voiceProvider: 'elevenlabs',
          voiceLanguage: language,
          isDemoMode: false,
          generatedAt: new Date().toISOString(),
        }
      });
    }

    // Try Google Cloud TTS
    if (voiceProvider === 'google' && AI_CONFIG.tts.googleTTS.enabled && AI_CONFIG.tts.googleTTS.apiKey) {
      const googleResponse = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${AI_CONFIG.tts.googleTTS.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: { text: cleanedLyrics },
            voice: {
              languageCode: language,
              name: voiceId,
            },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: speed,
            },
          }),
        }
      );

      if (!googleResponse.ok) {
        const error = await googleResponse.json();
        console.error('Google TTS API error:', error);
        return NextResponse.json(
          { error: 'Failed to generate voice with Google TTS. Please check your API key.' },
          { status: 500 }
        );
      }

      const data = await googleResponse.json();

      return NextResponse.json({
        audioData: data.audioContent,
        format: 'mp3',
        metadata: {
          voiceId,
          voiceName: voiceId,
          voiceProvider: 'google',
          voiceLanguage: language,
          isDemoMode: false,
          generatedAt: new Date().toISOString(),
        }
      });
    }

    // Try Azure Neural TTS
    if (voiceProvider === 'azure' && AI_CONFIG.tts.azureTTS.enabled && AI_CONFIG.tts.azureTTS.apiKey) {
      const region = AI_CONFIG.tts.azureTTS.region;
      
      // Validate speed parameter
      const validSpeed = Math.max(0.5, Math.min(2.0, Number(speed) || 1.0));
      
      // Sanitize values for SSML to prevent XML injection
      // IMPORTANT: Ampersand must be replaced FIRST to avoid double-encoding
      const sanitizeForXML = (text: string) => {
        return text
          .replace(/&/g, '&amp;')  // Must be first
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
      };
      
      const sanitizedLyrics = sanitizeForXML(cleanedLyrics);
      const sanitizedVoiceId = sanitizeForXML(voiceId);
      const sanitizedLanguage = sanitizeForXML(language);
      
      const ssml = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${sanitizedLanguage}">
          <voice name="${sanitizedVoiceId}">
            <prosody rate="${validSpeed}">
              ${sanitizedLyrics}
            </prosody>
          </voice>
        </speak>
      `;

      const azureResponse = await fetch(
        `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/ssml+xml',
            'Ocp-Apim-Subscription-Key': AI_CONFIG.tts.azureTTS.apiKey,
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          },
          body: ssml,
        }
      );

      if (!azureResponse.ok) {
        const error = await azureResponse.text();
        console.error('Azure TTS API error:', error);
        return NextResponse.json(
          { error: 'Failed to generate voice with Azure TTS. Please check your API key.' },
          { status: 500 }
        );
      }

      const audioBuffer = await azureResponse.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');

      return NextResponse.json({
        audioData: audioBase64,
        format: 'mp3',
        metadata: {
          voiceId,
          voiceName: voiceId,
          voiceProvider: 'azure',
          voiceLanguage: language,
          isDemoMode: false,
          generatedAt: new Date().toISOString(),
        }
      });
    }

    // Demo mode - return demo response
    return NextResponse.json({
      demoMode: true,
      metadata: {
        voiceId,
        voiceName: 'Demo Voice',
        voiceProvider: 'demo',
        voiceLanguage: language,
        isDemoMode: true,
        generatedAt: new Date().toISOString(),
        note: 'Configure TTS API keys in .env for real voice generation. Supported providers: OpenAI, ElevenLabs, Google Cloud TTS, Azure Neural TTS'
      }
    });
  } catch (error) {
    console.error('Error generating voice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

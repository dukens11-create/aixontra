import { NextRequest, NextResponse } from 'next/server';
import { AI_CONFIG } from '@/lib/aiConfig';

/**
 * POST /api/generate/lyrics
 * 
 * Generates song lyrics using OpenAI API based on user prompt.
 * Falls back to demo lyrics if no API key is configured.
 * 
 * Request body:
 * {
 *   prompt: string,      // Creative prompt or song idea
 *   genre?: string,      // Musical genre
 *   mood?: string,       // Mood/style
 *   styleDescription?: string, // Free-text style/rhythm description
 *   language?: string    // Language for lyrics (default: English)
 * }
 * 
 * Response:
 * {
 *   lyrics: string,
 *   metadata: {
 *     prompt: string,
 *     genre?: string,
 *     mood?: string,
 *     model?: string,
 *     isDemoMode: boolean
 *   }
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, genre, mood, styleDescription, language = 'English' } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check if OpenAI is configured
    if (AI_CONFIG.openai.enabled && AI_CONFIG.openai.apiKey) {
      // Real OpenAI API call
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
        },
        body: JSON.stringify({
          model: AI_CONFIG.openai.model,
          messages: [
            {
              role: 'system',
              content: `You are a creative songwriter. Generate singable, clear, and precise song lyrics in ${language} based on the user's prompt. 
                       The lyrics MUST be written entirely in ${language} language.
                       Include verse, chorus, and bridge sections. Make the lyrics creative, engaging, and appropriate for the ${genre || 'any'} genre with a ${mood || 'neutral'} mood.${
                         styleDescription 
                           ? ` Pay special attention to the following style/rhythm description: ${styleDescription}` 
                           : ''
                       } 
                       Ensure the lyrics are natural and singable in ${language}, using appropriate rhythm and phrasing for that language.
                       Format with clear section labels like [Verse 1], [Chorus], [Verse 2], [Bridge], etc.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: AI_CONFIG.openai.maxTokens,
          temperature: 0.8,
        }),
      });

      if (!openaiResponse.ok) {
        const error = await openaiResponse.json();
        console.error('OpenAI API error:', error);
        return NextResponse.json(
          { error: 'Failed to generate lyrics. Please check your API key.' },
          { status: 500 }
        );
      }

      const data = await openaiResponse.json();
      const generatedLyrics = data.choices[0]?.message?.content || '';

      return NextResponse.json({
        lyrics: generatedLyrics,
        metadata: {
          prompt,
          genre,
          mood,
          styleDescription,
          language,
          model: AI_CONFIG.openai.model,
          isDemoMode: false,
        }
      });
    } else {
      // Demo mode - return sample lyrics
      const demoLyrics = generateDemoLyrics(prompt, genre, mood, styleDescription);
      
      return NextResponse.json({
        lyrics: demoLyrics,
        metadata: {
          prompt,
          genre,
          mood,
          styleDescription,
          language,
          model: 'demo',
          isDemoMode: true,
        }
      });
    }
  } catch (error) {
    console.error('Error generating lyrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate demo lyrics when no API key is available
 */
function generateDemoLyrics(prompt: string, genre?: string, mood?: string, styleDescription?: string): string {
  const MAX_PROMPT_PREVIEW_LENGTH = 50;
  const genreText = genre ? ` ${genre}` : '';
  const moodText = mood ? ` ${mood.toLowerCase()}` : '';
  const styleText = styleDescription ? `\nStyle: ${styleDescription}` : '';
  
  // Truncate at word boundary
  let promptPreview = prompt.slice(0, MAX_PROMPT_PREVIEW_LENGTH);
  if (prompt.length > MAX_PROMPT_PREVIEW_LENGTH) {
    const lastSpace = promptPreview.lastIndexOf(' ');
    if (lastSpace > 20) { // Only truncate at word if we have at least 20 chars
      promptPreview = promptPreview.slice(0, lastSpace);
    }
  }
  
  return `[DEMO MODE - Replace OPENAI_API_KEY in .env for real generation]

[Verse 1]
${promptPreview}${prompt.length > MAX_PROMPT_PREVIEW_LENGTH ? '...' : ''}
This is a demo track, generated without AI
${genreText}${moodText} vibes flowing through${styleText}
Sample lyrics just for you

[Chorus]
This is demo mode, demo mode
Configure your API to unlock the code
Creative lyrics will come alive
When you add your OpenAI drive

[Verse 2]
Add your key to the .env file
OPENAI_API_KEY with your profile
Restart the server and try again
Real AI lyrics, that's the aim

[Bridge]
Demo tracks are here to show
How the feature starts to flow
But real magic happens when
You configure your API, my friend

[Chorus]
This is demo mode, demo mode
Configure your API to unlock the code
Creative lyrics will come alive
When you add your OpenAI drive

[Outro]
Check the docs for more details
Setup guide never fails
Your creative song awaits
Beyond these demo gates`;
}

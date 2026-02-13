import { NextRequest, NextResponse } from 'next/server';
import { AI_CONFIG } from '@/lib/aiConfig';
import { LANGUAGES } from '@/lib/constants';
import { enhanceLyricPromptWithGenre } from '@/lib/services/genreRules';

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

    // Validate language parameter
    const supportedLanguages = LANGUAGES.map(l => l.name);
    const isLanguageSupported = supportedLanguages.includes(language) || language === 'English';
    
    if (!isLanguageSupported && language !== 'English') {
      console.warn(`Unsupported language requested: ${language}, using English as fallback`);
    }

    // Parse genre (can be comma-separated string or array)
    const genres = typeof genre === 'string' 
      ? genre.split(',').map(g => g.trim()).filter(g => g.length > 0)
      : Array.isArray(genre) 
        ? genre 
        : [];

    // Enhance prompt with genre-specific guidance
    const enhancedPrompt = genres.length > 0 
      ? enhanceLyricPromptWithGenre(prompt, genres)
      : prompt;

    // Check if OpenAI is configured
    if (AI_CONFIG.openai.enabled && AI_CONFIG.openai.apiKey) {
      // Build genre description for the system prompt
      const genreDescription = genres.length > 0 
        ? `${genres.join(' and ')} song`
        : 'contemporary song';
      
      const moodDescription = mood ? ` with a ${mood.toLowerCase()} mood` : '';
      
      // Build language-specific instructions
      const languageInstructions = language !== 'English'
        ? `\n\nLANGUAGE REQUIREMENTS:
- Write ALL lyrics exclusively in ${language}
- Use natural, authentic ${language} expressions and idioms
- Ensure proper grammar, spelling, and syntax for ${language}
- Adapt rhyme schemes to work naturally in ${language}
- Use culturally appropriate references for ${language}-speaking audiences
- Make sure the lyrics sound natural to native ${language} speakers`
        : `\n\nLANGUAGE REQUIREMENTS:
- Write lyrics in clear, conversational English
- Use natural expressions and contemporary language
- Ensure the lyrics are accessible to a wide audience`;

      // Build style instructions
      const styleInstructions = styleDescription
        ? `\n\nSTYLE/RHYTHM INSTRUCTIONS: ${styleDescription}\nMake sure the lyrics match this specific style and rhythm.`
        : '';

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
              content: `You are an expert professional songwriter specializing in creating catchy, memorable, and singable lyrics. Your goal is to create high-quality, AI-powered lyrics that are:

1. CATCHY: Use memorable hooks, repetitive elements, and earworms that stick in listeners' heads
2. SINGABLE: Write lyrics with natural rhythm, appropriate syllable counts, and vowel sounds that flow easily
3. CLEAR: Use vivid imagery and concrete language that listeners can easily understand and relate to
4. RELEVANT: Match the theme, emotion, and story of the user's prompt perfectly
5. PROFESSIONAL: Include proper song structure with [Verse 1], [Chorus], [Verse 2], [Bridge], etc.

Generate lyrics for a ${genreDescription}${moodDescription}.${languageInstructions}${styleInstructions}

LYRIC QUALITY GUIDELINES:
- Create a memorable, repeating chorus that is the emotional core of the song
- Use rhyme schemes that feel natural (AABB, ABAB, or ABCB patterns work well)
- Vary line lengths and rhythms to maintain interest
- Include sensory details and metaphors that paint pictures
- Build emotional progression from verse to chorus to bridge
- Keep language conversational and authentic
- Ensure phrases have natural breathing points for singers
- Use words that are easy to pronounce and project vocally

Generate creative, engaging, radio-ready lyrics that would work in a professional recording.`
            },
            {
              role: 'user',
              content: enhancedPrompt
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
      const demoLyrics = generateDemoLyrics(prompt, genres, mood, styleDescription, language);
      
      return NextResponse.json({
        lyrics: demoLyrics,
        metadata: {
          prompt,
          genre: genres.join(', '),
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
function generateDemoLyrics(
  prompt: string, 
  genres: string[], 
  mood?: string, 
  styleDescription?: string,
  language: string = 'English'
): string {
  const MAX_PROMPT_PREVIEW_LENGTH = 50;
  const genreText = genres.length > 0 ? ` ${genres.join(', ')}` : '';
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
  
  // Language-specific demo lyrics
  const demoLyricsByLanguage: Record<string, string> = {
    'Spanish': `[MODO DEMO - Reemplaza OPENAI_API_KEY en .env para generación real]

[Verso 1]
${promptPreview}${prompt.length > MAX_PROMPT_PREVIEW_LENGTH ? '...' : ''}
Esta es una pista demo, generada sin IA
${genreText}${moodText} vibes fluyendo a través${styleText}
Letras de ejemplo solo para ti

[Coro]
Esto es modo demo, modo demo
Configura tu API para desbloquear el código
Las letras creativas cobrarán vida
Cuando agregues tu clave de OpenAI

[Verso 2]
Agrega tu clave al archivo .env
OPENAI_API_KEY con tu perfil
Reinicia el servidor e intenta de nuevo
Letras de IA reales, ese es el objetivo

[Puente]
Las pistas demo están aquí para mostrar
Cómo comienza a fluir la función
Pero la verdadera magia sucede cuando
Configuras tu API, mi amigo

[Coro]
Esto es modo demo, modo demo
Configura tu API para desbloquear el código
Las letras creativas cobrarán vida
Cuando agregues tu clave de OpenAI`,

    'French': `[MODE DÉMO - Remplacez OPENAI_API_KEY dans .env pour une génération réelle]

[Couplet 1]
${promptPreview}${prompt.length > MAX_PROMPT_PREVIEW_LENGTH ? '...' : ''}
Ceci est une piste démo, générée sans IA
${genreText}${moodText} ambiances qui coulent${styleText}
Paroles d'exemple juste pour toi

[Refrain]
C'est le mode démo, mode démo
Configure ton API pour débloquer le code
Les paroles créatives prendront vie
Quand tu ajouteras ta clé OpenAI

[Couplet 2]
Ajoute ta clé dans le fichier .env
OPENAI_API_KEY avec ton profil
Redémarre le serveur et réessaye
De vraies paroles IA, c'est le but

[Pont]
Les pistes démo sont là pour montrer
Comment la fonction commence à couler
Mais la vraie magie se produit quand
Tu configures ton API, mon ami

[Refrain]
C'est le mode démo, mode démo
Configure ton API pour débloquer le code
Les paroles créatives prendront vie
Quand tu ajouteras ta clé OpenAI`,

    'Portuguese': `[MODO DEMO - Substitua OPENAI_API_KEY no .env para geração real]

[Verso 1]
${promptPreview}${prompt.length > MAX_PROMPT_PREVIEW_LENGTH ? '...' : ''}
Esta é uma faixa demo, gerada sem IA
${genreText}${moodText} vibes fluindo através${styleText}
Letras de exemplo só pra você

[Refrão]
Isso é modo demo, modo demo
Configure sua API para desbloquear o código
Letras criativas ganharão vida
Quando você adicionar sua chave OpenAI

[Verso 2]
Adicione sua chave no arquivo .env
OPENAI_API_KEY com seu perfil
Reinicie o servidor e tente novamente
Letras de IA reais, esse é o objetivo

[Ponte]
Faixas demo estão aqui para mostrar
Como o recurso começa a fluir
Mas a magia real acontece quando
Você configura sua API, meu amigo

[Refrão]
Isso é modo demo, modo demo
Configure sua API para desbloquear o código
Letras criativas ganharão vida
Quando você adicionar sua chave OpenAI`,

    'German': `[DEMO-MODUS - Ersetzen Sie OPENAI_API_KEY in .env für echte Generierung]

[Strophe 1]
${promptPreview}${prompt.length > MAX_PROMPT_PREVIEW_LENGTH ? '...' : ''}
Dies ist ein Demo-Track, ohne KI generiert
${genreText}${moodText} Vibes fließen durch${styleText}
Beispiel-Lyrics nur für dich

[Refrain]
Das ist Demo-Modus, Demo-Modus
Konfiguriere deine API, um den Code freizuschalten
Kreative Texte werden lebendig
Wenn du deinen OpenAI-Schlüssel hinzufügst

[Strophe 2]
Füge deinen Schlüssel zur .env-Datei hinzu
OPENAI_API_KEY mit deinem Profil
Starte den Server neu und versuche es erneut
Echte KI-Texte, das ist das Ziel

[Bridge]
Demo-Tracks sind hier, um zu zeigen
Wie die Funktion zu fließen beginnt
Aber echte Magie passiert, wenn
Du deine API konfigurierst, mein Freund

[Refrain]
Das ist Demo-Modus, Demo-Modus
Konfiguriere deine API, um den Code freizuschalten
Kreative Texte werden lebendig
Wenn du deinen OpenAI-Schlüssel hinzufügst`,

    'Italian': `[MODALITÀ DEMO - Sostituisci OPENAI_API_KEY in .env per la generazione reale]

[Strofa 1]
${promptPreview}${prompt.length > MAX_PROMPT_PREVIEW_LENGTH ? '...' : ''}
Questa è una traccia demo, generata senza IA
${genreText}${moodText} vibrazioni che scorrono${styleText}
Testi di esempio solo per te

[Ritornello]
Questa è la modalità demo, modalità demo
Configura la tua API per sbloccare il codice
I testi creativi prenderanno vita
Quando aggiungerai la tua chiave OpenAI

[Strofa 2]
Aggiungi la tua chiave al file .env
OPENAI_API_KEY con il tuo profilo
Riavvia il server e riprova
Testi IA reali, questo è l'obiettivo

[Bridge]
Le tracce demo sono qui per mostrare
Come la funzione inizia a fluire
Ma la vera magia accade quando
Configuri la tua API, amico mio

[Ritornello]
Questa è la modalità demo, modalità demo
Configura la tua API per sbloccare il codice
I testi creativi prenderanno vita
Quando aggiungerai la tua chiave OpenAI`,

    'Japanese': `[デモモード - 実際の生成には .env の OPENAI_API_KEY を置き換えてください]

[ヴァース 1]
${promptPreview}${prompt.length > MAX_PROMPT_PREVIEW_LENGTH ? '...' : ''}
これはデモトラック、AIなしで生成
${genreText}${moodText} バイブスが流れる${styleText}
あなたのためのサンプル歌詞

[コーラス]
これはデモモード、デモモード
APIを設定してコードをアンロック
クリエイティブな歌詞が生き生きと
OpenAIキーを追加すれば

[ヴァース 2]
.envファイルにキーを追加
OPENAI_API_KEY とあなたのプロフィール
サーバーを再起動して再試行
本物のAI歌詞、それが目標

[ブリッジ]
デモトラックはここにあって示す
機能がどのように流れ始めるか
でも本当の魔法は起こる時
あなたがAPIを設定する、友よ

[コーラス]
これはデモモード、デモモード
APIを設定してコードをアンロック
クリエイティブな歌詞が生き生きと
OpenAIキーを追加すれば`,
  };
  
  // Use language-specific demo or fallback to English
  if (language !== 'English' && demoLyricsByLanguage[language]) {
    return demoLyricsByLanguage[language];
  }
  
  // Default English demo lyrics
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

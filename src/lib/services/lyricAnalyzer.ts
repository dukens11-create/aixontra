/**
 * Lyric Quality Analyzer
 * 
 * Analyzes lyrics for:
 * - Emotion depth
 * - Originality
 * - Imagery strength
 * - Coherence
 * - Overall quality score
 */

export interface LyricScore {
  emotion: number;
  originality: number;
  imagery: number;
  coherence: number;
  overall: number;
  breakdown: {
    emotion: string;
    originality: string;
    imagery: string;
    coherence: string;
  };
  poeticDevices: string[];
}

export class LyricAnalyzer {
  /**
   * Analyze lyrics and return quality scores
   */
  analyzeLyrics(lyrics: string): LyricScore {
    if (!lyrics || lyrics.trim().length === 0) {
      return this.getEmptyScore();
    }

    const emotion = this.analyzeEmotion(lyrics);
    const originality = this.analyzeOriginality(lyrics);
    const imagery = this.analyzeImagery(lyrics);
    const coherence = this.analyzeCoherence(lyrics);
    
    const overall = Math.round((emotion + originality + imagery + coherence) / 4);

    return {
      emotion,
      originality,
      imagery,
      coherence,
      overall,
      breakdown: {
        emotion: this.getEmotionBreakdown(emotion),
        originality: this.getOriginalityBreakdown(originality),
        imagery: this.getImageryBreakdown(imagery),
        coherence: this.getCoherenceBreakdown(coherence),
      },
      poeticDevices: this.detectPoeticDevices(lyrics),
    };
  }

  /**
   * Analyze emotional depth and impact
   */
  private analyzeEmotion(lyrics: string): number {
    let score = 50; // Base score

    const lyricsLower = lyrics.toLowerCase();

    // Emotional keywords - positive emotions
    const positiveEmotions = [
      'love', 'happy', 'joy', 'hope', 'dream', 'peace', 'smile', 'heart',
      'light', 'heaven', 'forever', 'beautiful', 'amazing', 'wonderful'
    ];

    // Emotional keywords - intense emotions
    const intenseEmotions = [
      'pain', 'cry', 'tears', 'broken', 'hurt', 'fear', 'rage', 'anger',
      'lost', 'alone', 'dark', 'die', 'death', 'blood', 'scream'
    ];

    // Count emotional words
    const positiveCount = positiveEmotions.filter(word => lyricsLower.includes(word)).length;
    const intenseCount = intenseEmotions.filter(word => lyricsLower.includes(word)).length;

    score += (positiveCount + intenseCount) * 3;

    // Check for metaphors and similes (emotional depth)
    if (lyricsLower.includes('like') || lyricsLower.includes('as')) {
      score += 10;
    }

    // Check for personal pronouns (emotional connection)
    const personalPronouns = ['i', 'me', 'my', 'you', 'your', 'we', 'our'];
    const pronounCount = personalPronouns.filter(word => 
      new RegExp(`\\b${word}\\b`, 'i').test(lyricsLower)
    ).length;
    score += pronounCount * 2;

    // Check for questions (emotional engagement)
    const questionCount = (lyrics.match(/\?/g) || []).length;
    score += questionCount * 5;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Analyze originality and uniqueness
   */
  private analyzeOriginality(lyrics: string): number {
    let score = 50; // Base score

    const words = lyrics.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);

    // Vocabulary diversity
    const diversityRatio = uniqueWords.size / words.length;
    score += diversityRatio * 40;

    // Check for clichés (reduce score)
    // TODO: Consider moving to configuration file for easier maintenance
    const cliches = [
      'baby', 'yeah', 'oh', 'la la', 'na na', 'uh', 'ooh',
      'tonight', 'all night', 'dance floor', 'party'
    ];
    
    const clicheCount = cliches.filter(cliche => 
      lyrics.toLowerCase().includes(cliche)
    ).length;
    score -= clicheCount * 5;

    // Unique word combinations boost
    if (lyrics.length > 100) {
      const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
      if (avgWordLength > 5) {
        score += 10; // Longer words often mean more sophisticated vocabulary
      }
    }

    // Check for creative compound words or unique phrases
    const uniquePhrases = lyrics.match(/[a-z]+-[a-z]+/gi) || [];
    score += uniquePhrases.length * 5;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Analyze imagery and descriptive language
   */
  private analyzeImagery(lyrics: string): number {
    let score = 50; // Base score

    const lyricsLower = lyrics.toLowerCase();

    // Sensory words (visual, auditory, tactile, etc.)
    const sensoryWords = [
      'see', 'look', 'watch', 'eyes', 'bright', 'dark', 'color', 'shine',
      'hear', 'sound', 'loud', 'whisper', 'voice', 'echo', 'silence',
      'feel', 'touch', 'warm', 'cold', 'soft', 'rough',
      'taste', 'sweet', 'bitter',
      'smell', 'scent', 'fragrance'
    ];

    const sensoryCount = sensoryWords.filter(word => 
      new RegExp(`\\b${word}\\b`, 'i').test(lyricsLower)
    ).length;
    score += sensoryCount * 4;

    // Color words
    const colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gold', 'silver'];
    const colorCount = colors.filter(color => lyricsLower.includes(color)).length;
    score += colorCount * 5;

    // Nature imagery
    const natureWords = [
      'sun', 'moon', 'star', 'sky', 'ocean', 'sea', 'mountain', 'river',
      'tree', 'flower', 'rain', 'storm', 'wind', 'fire', 'earth'
    ];
    const natureCount = natureWords.filter(word => lyricsLower.includes(word)).length;
    score += natureCount * 4;

    // Vivid adjectives
    const vividAdjectives = [
      'blazing', 'shimmering', 'glowing', 'frozen', 'burning', 'soaring',
      'crashing', 'whispered', 'thundering', 'velvet', 'crystal'
    ];
    const adjectiveCount = vividAdjectives.filter(adj => lyricsLower.includes(adj)).length;
    score += adjectiveCount * 6;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Analyze coherence and structure
   */
  private analyzeCoherence(lyrics: string): number {
    let score = 70; // Base score

    const lines = lyrics.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0) return 0;

    // Check for section markers (Verse, Chorus, Bridge, etc.)
    const sectionMarkers = lyrics.match(/\[(Verse|Chorus|Bridge|Intro|Outro|Pre-Chorus|Hook).*?\]/gi);
    if (sectionMarkers && sectionMarkers.length >= 2) {
      score += 15; // Well-structured
    }

    // Check line length consistency
    const lineLengths = lines.map(line => line.length);
    const avgLength = lineLengths.reduce((sum, len) => sum + len, 0) / lineLengths.length;
    const variance = lineLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lineLengths.length;
    
    if (variance < 500) {
      score += 10; // Consistent line lengths
    }

    // Check for repetition (good for choruses)
    const lineSet = new Set(lines);
    const repetitionRatio = 1 - (lineSet.size / lines.length);
    if (repetitionRatio > 0.2 && repetitionRatio < 0.5) {
      score += 10; // Good amount of repetition
    } else if (repetitionRatio > 0.5) {
      score -= 10; // Too repetitive
    }

    // Check for connecting words and phrases
    const connectingWords = ['and', 'but', 'so', 'then', 'now', 'when', 'if', 'because'];
    const connectingCount = connectingWords.filter(word =>
      new RegExp(`\\b${word}\\b`, 'i').test(lyrics)
    ).length;
    score += Math.min(15, connectingCount * 2);

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Detect poetic devices used in lyrics
   */
  private detectPoeticDevices(lyrics: string): string[] {
    const devices: string[] = [];

    const lyricsLower = lyrics.toLowerCase();

    // Metaphor detection (contains "is" constructions)
    if (/is (a|an|the)/i.test(lyrics)) {
      devices.push('Metaphor');
    }

    // Simile detection
    if (/like (a|an|the)/i.test(lyrics) || /as .* as/i.test(lyrics)) {
      devices.push('Simile');
    }

    // Alliteration detection (3+ words starting with same letter)
    const words = lyrics.split(/\s+/);
    for (let i = 0; i < words.length - 2; i++) {
      const first = words[i][0]?.toLowerCase();
      const second = words[i + 1][0]?.toLowerCase();
      const third = words[i + 2][0]?.toLowerCase();
      if (first && first === second && second === third) {
        devices.push('Alliteration');
        break;
      }
    }

    // Repetition detection
    const lines = lyrics.split('\n');
    const lineSet = new Set(lines.map(l => l.trim()));
    if (lines.length > lineSet.size) {
      devices.push('Repetition');
    }

    // Rhyme detection (checked in rhyme engine, but we can note it here)
    const endsWithSameSound = lines.map(line => {
      const words = line.trim().split(/\s+/);
      return words[words.length - 1]?.slice(-2) || '';
    });
    const rhymeSet = new Set(endsWithSameSound);
    if (rhymeSet.size < endsWithSameSound.length) {
      devices.push('Rhyme');
    }

    // Personification detection (inanimate objects doing human actions)
    const personificationPatterns = [
      /\b(wind|rain|sun|moon|time|death|love|heart) (speaks|cries|laughs|dances|sings|whispers)\b/i
    ];
    if (personificationPatterns.some(pattern => pattern.test(lyrics))) {
      devices.push('Personification');
    }

    return [...new Set(devices)]; // Remove duplicates
  }

  /**
   * Get breakdown text for emotion score
   */
  private getEmotionBreakdown(score: number): string {
    if (score >= 85) return 'Very strong emotional impact';
    if (score >= 70) return 'Strong emotional connection';
    if (score >= 55) return 'Good emotional depth';
    if (score >= 40) return 'Moderate emotional content';
    return 'Could use more emotional depth';
  }

  /**
   * Get breakdown text for originality score
   */
  private getOriginalityBreakdown(score: number): string {
    if (score >= 85) return 'Highly original and unique';
    if (score >= 70) return 'Fresh perspective';
    if (score >= 55) return 'Good creativity';
    if (score >= 40) return 'Somewhat conventional';
    return 'Contains common phrases';
  }

  /**
   * Get breakdown text for imagery score
   */
  private getImageryBreakdown(score: number): string {
    if (score >= 85) return 'Vivid and engaging imagery';
    if (score >= 70) return 'Strong visual elements';
    if (score >= 55) return 'Good descriptive language';
    if (score >= 40) return 'Some imagery present';
    return 'Could use more vivid descriptions';
  }

  /**
   * Get breakdown text for coherence score
   */
  private getCoherenceBreakdown(score: number): string {
    if (score >= 85) return 'Excellent structure and flow';
    if (score >= 70) return 'Well-organized and clear';
    if (score >= 55) return 'Good coherence';
    if (score >= 40) return 'Some lines could connect better';
    return 'Structure needs improvement';
  }

  /**
   * Get empty score object
   */
  private getEmptyScore(): LyricScore {
    return {
      emotion: 0,
      originality: 0,
      imagery: 0,
      coherence: 0,
      overall: 0,
      breakdown: {
        emotion: 'No lyrics to analyze',
        originality: 'No lyrics to analyze',
        imagery: 'No lyrics to analyze',
        coherence: 'No lyrics to analyze',
      },
      poeticDevices: [],
    };
  }
}

// Singleton instance
export const lyricAnalyzer = new LyricAnalyzer();

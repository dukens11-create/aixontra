/**
 * Rhyme & Flow Engine
 * 
 * Analyzes lyrics for:
 * - Syllable counting
 * - Rhyme scheme detection
 * - Flow pattern analysis
 * - Singability scoring
 */

export interface FlowAnalysis {
  totalSyllables: number;
  averageSyllablesPerLine: number;
  rhymeScheme: string;
  flowScore: number;
  suggestions: string[];
  syllableDistribution: number[];
}

export interface RhymeSuggestion {
  word: string;
  rhymeStrength: 'perfect' | 'near' | 'slant';
  syllables: number;
}

export class RhymeEngine {
  /**
   * Count syllables in a word or phrase
   * Simple algorithm: count vowel groups
   */
  countSyllables(text: string): number {
    if (!text || text.trim().length === 0) return 0;
    
    text = text.toLowerCase().trim();
    
    // Remove punctuation
    text = text.replace(/[^a-z\s'-]/g, '');
    
    // Handle special cases
    if (text.length <= 3) return 1;
    
    // Count vowel groups to estimate syllables
    // Remove silent 'e' at end (e.g., "make" = 1 syllable, not 2)
    // Remove 'ed' ending for past tense (e.g., "walked" = 1 syllable)
    // Handle 'es' plural ending (e.g., "wishes" doesn't add extra syllable)
    text = text.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    text = text.replace(/^y/, '');
    const matches = text.match(/[aeiouy]{1,2}/g);
    
    return matches ? matches.length : 1;
  }

  /**
   * Analyze the flow of lyrics
   */
  analyzeFlow(lyrics: string, bpm: number): FlowAnalysis {
    const lines = lyrics.split('\n').filter(line => line.trim().length > 0);
    const syllableCounts = lines.map(line => this.countSyllables(line));
    
    const totalSyllables = syllableCounts.reduce((sum, count) => sum + count, 0);
    const averageSyllablesPerLine = lines.length > 0 ? totalSyllables / lines.length : 0;
    
    // Detect rhyme scheme
    const rhymeScheme = this.detectRhymeScheme(lines);
    
    // Calculate flow score (0-100)
    const flowScore = this.calculateFlowScore(syllableCounts, bpm, lines);
    
    // Generate suggestions
    const suggestions = this.generateSuggestions(syllableCounts, averageSyllablesPerLine, flowScore);
    
    return {
      totalSyllables,
      averageSyllablesPerLine: Math.round(averageSyllablesPerLine * 10) / 10,
      rhymeScheme,
      flowScore,
      suggestions,
      syllableDistribution: syllableCounts,
    };
  }

  /**
   * Detect rhyme scheme pattern (AABB, ABAB, etc.)
   */
  private detectRhymeScheme(lines: string[]): string {
    if (lines.length === 0) return '';
    
    const endWords = lines.map(line => {
      const words = line.trim().split(/\s+/);
      return words[words.length - 1]?.toLowerCase().replace(/[^a-z]/g, '') || '';
    });
    
    const scheme: string[] = [];
    const rhymeMap = new Map<string, string>();
    let currentLetter = 'A';
    
    for (const word of endWords) {
      if (!word) {
        scheme.push('X');
        continue;
      }
      
      // Get the phonetic ending (last 2-3 letters)
      const ending = word.slice(-2);
      
      if (rhymeMap.has(ending)) {
        scheme.push(rhymeMap.get(ending)!);
      } else {
        rhymeMap.set(ending, currentLetter);
        scheme.push(currentLetter);
        currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
      }
    }
    
    return scheme.join('');
  }

  /**
   * Calculate flow score based on consistency and BPM matching
   */
  private calculateFlowScore(syllableCounts: number[], bpm: number, lines: string[]): number {
    if (syllableCounts.length === 0) return 0;
    
    // Check syllable consistency (±2 syllables is good)
    const avgSyllables = syllableCounts.reduce((sum, c) => sum + c, 0) / syllableCounts.length;
    const variance = syllableCounts.reduce((sum, c) => sum + Math.pow(c - avgSyllables, 2), 0) / syllableCounts.length;
    const consistencyScore = Math.max(0, 100 - variance * 5);
    
    // Check BPM matching (ideal: 8-12 syllables per line for mid-tempo)
    const idealSyllables = bpm < 90 ? 6 : bpm < 120 ? 8 : bpm < 140 ? 10 : 12;
    const bpmMatchScore = Math.max(0, 100 - Math.abs(avgSyllables - idealSyllables) * 10);
    
    // Check for empty lines (breaks flow)
    const emptyLinesPenalty = lines.filter(l => !l.trim()).length * 10;
    
    return Math.max(0, Math.min(100, (consistencyScore * 0.6 + bpmMatchScore * 0.4) - emptyLinesPenalty));
  }

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(syllableCounts: number[], avgSyllables: number, flowScore: number): string[] {
    const suggestions: string[] = [];
    
    if (flowScore < 50) {
      suggestions.push('Consider making line lengths more consistent');
    }
    
    const maxVariance = Math.max(...syllableCounts.map(c => Math.abs(c - avgSyllables)));
    if (maxVariance > 4) {
      suggestions.push('Some lines are too long or too short - try to balance them');
    }
    
    if (avgSyllables > 15) {
      suggestions.push('Lines are too dense - try shorter, punchier phrases');
    } else if (avgSyllables < 4) {
      suggestions.push('Lines are very short - consider adding more detail');
    }
    
    return suggestions;
  }

  /**
   * Find rhyming words (simplified - returns words with similar endings)
   */
  findRhymes(word: string, wordList: string[] = []): RhymeSuggestion[] {
    if (!word) return [];
    
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    const ending = word.slice(-2);
    
    // In a real implementation, this would use a phonetic dictionary
    // For now, we'll use simple pattern matching
    const rhymes: RhymeSuggestion[] = wordList
      .filter(w => w !== word && w.toLowerCase().endsWith(ending))
      .map(w => ({
        word: w,
        rhymeStrength: 'near' as const,
        syllables: this.countSyllables(w),
      }));
    
    return rhymes;
  }

  /**
   * Match lyrics to beat timing
   */
  matchToBeat(lyrics: string, bpm: number): { aligned: boolean; adjustments: string[] } {
    const lines = lyrics.split('\n').filter(line => line.trim().length > 0);
    const syllableCounts = lines.map(line => this.countSyllables(line));
    
    // Calculate ideal syllables per line based on BPM
    const idealSyllables = bpm < 90 ? 6 : bpm < 120 ? 8 : bpm < 140 ? 10 : 12;
    
    const adjustments: string[] = [];
    const aligned = syllableCounts.every(count => {
      const diff = Math.abs(count - idealSyllables);
      if (diff > 3) {
        adjustments.push(`Line with ${count} syllables should be closer to ${idealSyllables}`);
        return false;
      }
      return true;
    });
    
    return { aligned, adjustments };
  }

  /**
   * Analyze phonetic patterns for singing
   */
  analyzeSingability(lyrics: string): number {
    if (!lyrics) return 0;
    
    const lines = lyrics.split('\n').filter(line => line.trim().length > 0);
    let score = 100;
    
    // Check for difficult consonant clusters
    const difficultPatterns = /[bcdfghjklmnpqrstvwxyz]{4,}/gi;
    const clusters = lyrics.match(difficultPatterns);
    if (clusters) {
      score -= clusters.length * 5;
    }
    
    // Check for good vowel distribution
    const vowels = lyrics.match(/[aeiou]/gi);
    const consonants = lyrics.match(/[bcdfghjklmnpqrstvwxyz]/gi);
    const vowelRatio = vowels ? vowels.length / lyrics.length : 0;
    
    if (vowelRatio < 0.3 || vowelRatio > 0.6) {
      score -= 20;
    }
    
    // Prefer shorter words for singing
    const words = lyrics.split(/\s+/);
    const longWords = words.filter(w => w.length > 10).length;
    score -= longWords * 3;
    
    return Math.max(0, Math.min(100, score));
  }
}

// Singleton instance
export const rhymeEngine = new RhymeEngine();

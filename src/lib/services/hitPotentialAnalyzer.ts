/**
 * Hit Potential Analyzer
 * 
 * Analyzes songs for commercial success potential based on:
 * - Hook catchiness
 * - Hook timing and placement
 * - Repetition patterns
 * - Energy levels
 * - Viral moment detection
 */

export interface HitPotentialScore {
  overall: number;
  hookCatchiness: number;
  hookTiming: number;
  repetition: number;
  energy: number;
  viralMoment: {
    start: number;
    end: number;
    score: number;
  } | null;
  breakdown: {
    hookCatchiness: string;
    hookTiming: string;
    repetition: string;
    energy: string;
  };
  suggestions: string[];
}

export class HitPotentialAnalyzer {
  /**
   * Analyze a song's hit potential
   */
  analyzeHitPotential(
    lyrics: string,
    bpm: number = 120,
    duration: number = 180 // Duration in seconds (default 3 minutes)
  ): HitPotentialScore {
    if (!lyrics || lyrics.trim().length === 0) {
      return this.getEmptyScore();
    }

    const hookCatchiness = this.analyzeHookCatchiness(lyrics);
    const hookTiming = this.analyzeHookTiming(lyrics, duration);
    const repetition = this.analyzeRepetition(lyrics);
    const energy = this.analyzeEnergy(lyrics, bpm);
    const viralMoment = this.detectViralMoment(lyrics, duration);

    const overall = Math.round(
      (hookCatchiness * 0.3) + 
      (hookTiming * 0.2) + 
      (repetition * 0.2) + 
      (energy * 0.2) + 
      ((viralMoment?.score || 0) * 0.1)
    );

    const suggestions = this.generateSuggestions({
      hookCatchiness,
      hookTiming,
      repetition,
      energy,
      viralMomentScore: viralMoment?.score || 0,
    });

    return {
      overall,
      hookCatchiness,
      hookTiming,
      repetition,
      energy,
      viralMoment,
      breakdown: {
        hookCatchiness: this.getHookCatchinessBreakdown(hookCatchiness),
        hookTiming: this.getHookTimingBreakdown(hookTiming),
        repetition: this.getRepetitionBreakdown(repetition),
        energy: this.getEnergyBreakdown(energy),
      },
      suggestions,
    };
  }

  /**
   * Analyze hook catchiness
   */
  private analyzeHookCatchiness(lyrics: string): number {
    let score = 50; // Base score

    const lyricsLower = lyrics.toLowerCase();
    const sections = this.parseSections(lyrics);

    // Find chorus sections
    const chorusSections = sections.filter(s => s.type === 'chorus');
    
    if (chorusSections.length === 0) {
      return 30; // No clear chorus/hook
    }

    const chorusText = chorusSections[0].text.toLowerCase();

    // Short, punchy hooks are catchier
    const chorusWords = chorusText.split(/\s+/).filter(w => w.length > 0);
    if (chorusWords.length >= 4 && chorusWords.length <= 12) {
      score += 20; // Ideal length
    } else if (chorusWords.length > 20) {
      score -= 15; // Too long
    }

    // Repetition within the hook
    const uniqueWords = new Set(chorusWords);
    const repetitionRatio = 1 - (uniqueWords.size / chorusWords.length);
    score += repetitionRatio * 20;

    // Simple, common words are more catchy
    const simpleWords = ['love', 'you', 'me', 'we', 'go', 'get', 'want', 'need', 'feel', 'know'];
    const simpleWordCount = simpleWords.filter(word => chorusText.includes(word)).length;
    score += Math.min(15, simpleWordCount * 5);

    // Rhythmic patterns (repeated sounds)
    const hasRhyme = /\w+\b.*\b\w+/.test(chorusText);
    if (hasRhyme) {
      score += 10;
    }

    // Check for question format (engaging)
    if (chorusText.includes('?')) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Analyze hook timing (should appear early)
   */
  private analyzeHookTiming(lyrics: string, duration: number): number {
    const sections = this.parseSections(lyrics);
    const totalSections = sections.length;

    if (totalSections === 0) return 0;

    // Find first chorus
    const firstChorusIndex = sections.findIndex(s => s.type === 'chorus');
    
    if (firstChorusIndex === -1) {
      return 30; // No chorus found
    }

    // Ideal: chorus appears within first 30 seconds (roughly 2-3 sections)
    const positionRatio = firstChorusIndex / totalSections;
    
    if (positionRatio <= 0.2) {
      return 100; // Perfect! Hook in first 20%
    } else if (positionRatio <= 0.3) {
      return 90; // Great! Hook in first 30%
    } else if (positionRatio <= 0.4) {
      return 70; // Good, hook in first 40%
    } else if (positionRatio <= 0.5) {
      return 50; // Acceptable, hook in first half
    } else {
      return 30; // Hook comes too late
    }
  }

  /**
   * Analyze repetition patterns
   */
  private analyzeRepetition(lyrics: string): number {
    const sections = this.parseSections(lyrics);
    const chorusSections = sections.filter(s => s.type === 'chorus');

    if (chorusSections.length === 0) {
      return 20; // No chorus repetition
    }

    // Optimal: 3-4 choruses
    let score = 50;

    if (chorusSections.length === 3 || chorusSections.length === 4) {
      score = 100; // Perfect amount
    } else if (chorusSections.length === 2) {
      score = 70; // Acceptable
    } else if (chorusSections.length >= 5) {
      score = 60; // Too many, might get boring
    } else if (chorusSections.length === 1) {
      score = 40; // Not enough repetition
    }

    // Check if choruses are identical (consistency)
    const chorusTexts = chorusSections.map(s => s.text.trim().toLowerCase());
    const uniqueChorusTexts = new Set(chorusTexts);
    
    if (uniqueChorusTexts.size === 1) {
      score += 0; // All choruses identical (standard)
    } else if (uniqueChorusTexts.size === 2) {
      score -= 10; // Slight variation (might confuse)
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Analyze energy level
   */
  private analyzeEnergy(lyrics: string, bpm: number): number {
    let score = 50; // Base score

    const lyricsLower = lyrics.toLowerCase();

    // High-energy words
    const energyWords = [
      'go', 'up', 'high', 'loud', 'jump', 'dance', 'move', 'run', 'fly',
      'fire', 'burn', 'blaze', 'wild', 'crazy', 'alive', 'power', 'strong',
      'yeah', 'oh', 'whoa', 'hey', 'come on'
    ];

    const energyWordCount = energyWords.filter(word => lyricsLower.includes(word)).length;
    score += Math.min(30, energyWordCount * 3);

    // BPM consideration
    if (bpm >= 120) {
      score += 20; // High-energy tempo
    } else if (bpm >= 100) {
      score += 10; // Medium tempo
    } else {
      score -= 10; // Slow tempo (lower energy)
    }

    // Exclamation marks indicate energy
    const exclamations = (lyrics.match(/!/g) || []).length;
    score += Math.min(15, exclamations * 5);

    // Short, punchy lines
    const lines = lyrics.split('\n').filter(line => line.trim().length > 0);
    const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / (lines.length || 1);
    
    if (avgLineLength < 40) {
      score += 10; // Short, energetic lines
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Detect potential viral moment (15-30 second highlight)
   */
  private detectViralMoment(lyrics: string, duration: number): HitPotentialScore['viralMoment'] {
    const sections = this.parseSections(lyrics);
    
    if (sections.length === 0) return null;

    // Look for the catchiest chorus
    const chorusSections = sections.filter(s => s.type === 'chorus');
    
    if (chorusSections.length === 0) return null;

    // Find the first chorus (usually the catchiest spot)
    const firstChorus = chorusSections[0];
    const firstChorusIndex = sections.indexOf(firstChorus);

    // Estimate timing (rough approximation)
    const avgSectionDuration = duration / sections.length;
    const start = Math.floor(firstChorusIndex * avgSectionDuration);
    const end = Math.floor((firstChorusIndex + 1) * avgSectionDuration);

    // Score the viral potential
    let viralScore = 60; // Base score

    // Short, catchy hooks are more viral
    const words = firstChorus.text.split(/\s+/).filter(w => w.length > 0);
    if (words.length >= 5 && words.length <= 15) {
      viralScore += 20;
    }

    // Repetitive elements
    const uniqueWords = new Set(words);
    if (uniqueWords.size < words.length * 0.7) {
      viralScore += 15; // High repetition = catchy
    }

    // All caps or exclamations (emphasis)
    if (firstChorus.text.includes('!') || /[A-Z]{3,}/.test(firstChorus.text)) {
      viralScore += 5;
    }

    return {
      start,
      end: Math.min(end, start + 30), // Max 30 seconds
      score: Math.min(100, viralScore),
    };
  }

  /**
   * Parse lyrics into sections
   */
  private parseSections(lyrics: string): Array<{ type: string; text: string }> {
    const lines = lyrics.split('\n');
    const sections: Array<{ type: string; text: string }> = [];
    let currentSection: { type: string; text: string } | null = null;

    for (const line of lines) {
      const sectionMatch = line.match(/^\[(Verse|Chorus|Bridge|Intro|Outro|Pre-Chorus|Hook).*?\]/i);
      
      if (sectionMatch) {
        // Save previous section
        if (currentSection && currentSection.text.trim()) {
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          type: sectionMatch[1].toLowerCase(),
          text: '',
        };
      } else if (currentSection) {
        currentSection.text += line + '\n';
      } else {
        // No section marker yet, assume verse
        if (!currentSection) {
          currentSection = { type: 'verse', text: '' };
        }
        currentSection.text += line + '\n';
      }
    }

    // Save last section
    if (currentSection && currentSection.text.trim()) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(scores: {
    hookCatchiness: number;
    hookTiming: number;
    repetition: number;
    energy: number;
    viralMomentScore: number;
  }): string[] {
    const suggestions: string[] = [];

    if (scores.hookCatchiness < 60) {
      suggestions.push('Make your hook shorter and more repetitive');
      suggestions.push('Use simpler, more relatable words in the chorus');
    }

    if (scores.hookTiming < 60) {
      suggestions.push('Move your hook/chorus earlier in the song (within first 30 seconds)');
    }

    if (scores.repetition < 60) {
      suggestions.push('Repeat your chorus 3-4 times throughout the song');
    }

    if (scores.energy < 60) {
      suggestions.push('Add more energetic words and exclamations');
      suggestions.push('Consider increasing the BPM');
    }

    if (scores.viralMomentScore < 60) {
      suggestions.push('Create a standout 15-30 second section with a catchy hook');
    }

    if (suggestions.length === 0) {
      suggestions.push('Great work! Your song has strong hit potential');
    }

    return suggestions;
  }

  /**
   * Breakdown text for each metric
   */
  private getHookCatchinessBreakdown(score: number): string {
    if (score >= 80) return 'Excellent - Very catchy hook';
    if (score >= 60) return 'Good - Hook has potential';
    if (score >= 40) return 'Fair - Hook needs work';
    return 'Poor - Hook is not memorable';
  }

  private getHookTimingBreakdown(score: number): string {
    if (score >= 90) return 'Perfect! Hook appears within 30 seconds';
    if (score >= 70) return 'Good - Hook comes early enough';
    if (score >= 50) return 'Acceptable - Hook timing could be better';
    return 'Poor - Hook comes too late';
  }

  private getRepetitionBreakdown(score: number): string {
    if (score >= 90) return 'Optimal - Perfect amount of repetition';
    if (score >= 70) return 'Good - Decent repetition';
    if (score >= 50) return 'Fair - Could use more repetition';
    return 'Poor - Not enough or too much repetition';
  }

  private getEnergyBreakdown(score: number): string {
    if (score >= 80) return 'High energy throughout';
    if (score >= 60) return 'Good energy level';
    if (score >= 40) return 'Moderate energy';
    return 'Low energy - needs more excitement';
  }

  /**
   * Get empty score object
   */
  private getEmptyScore(): HitPotentialScore {
    return {
      overall: 0,
      hookCatchiness: 0,
      hookTiming: 0,
      repetition: 0,
      energy: 0,
      viralMoment: null,
      breakdown: {
        hookCatchiness: 'No lyrics to analyze',
        hookTiming: 'No lyrics to analyze',
        repetition: 'No lyrics to analyze',
        energy: 'No lyrics to analyze',
      },
      suggestions: ['Add lyrics to analyze hit potential'],
    };
  }
}

// Singleton instance
export const hitPotentialAnalyzer = new HitPotentialAnalyzer();

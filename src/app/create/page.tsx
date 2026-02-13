"use client";

import AuthGuard from "@/components/AuthGuard";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { GENRES, INSTRUMENTS, MOODS, VoiceOption, getAvailableVoices } from "@/lib/aiConfig";
import { LANGUAGES } from "@/lib/constants";
import { GenerationMetadata, VoiceMetadata } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Music, Sparkles, Save, Play, Pause, Mic2 } from "lucide-react";
import { LyricQualityScore } from "@/components/LyricQualityScore";
import { HitPotentialMeter } from "@/components/HitPotentialMeter";
import { FlowAnalysisDisplay } from "@/components/FlowAnalysisDisplay";
import { GenreRecommendations } from "@/components/GenreRecommendations";
import { rhymeEngine } from "@/lib/services/rhymeEngine";
import { lyricAnalyzer } from "@/lib/services/lyricAnalyzer";
import { hitPotentialAnalyzer } from "@/lib/services/hitPotentialAnalyzer";
import { getIdealBpmForGenres, enhanceLyricPromptWithGenre } from "@/lib/services/genreRules";

export default function CreatePage() {
  return (
    <AuthGuard>
      <CreateSongForm />
    </AuthGuard>
  );
}

function CreateSongForm() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("lyrics");
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState("");
  const [styleDescription, setStyleDescription] = useState("");
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [lyrics, setLyrics] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [customLanguage, setCustomLanguage] = useState("");
  const [bpm, setBpm] = useState(120); // BPM control
  const [showAnalysis, setShowAnalysis] = useState(false); // Toggle analysis display
  const [generationMetadata, setGenerationMetadata] = useState<GenerationMetadata | null>(null);
  
  // Voice generation state
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null);
  const [voiceFilterGender, setVoiceFilterGender] = useState<string>("all");
  const [voiceFilterLanguage, setVoiceFilterLanguage] = useState<string>("all");
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voiceMetadata, setVoiceMetadata] = useState<VoiceMetadata | null>(null);
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | null>(null);
  const [voiceAudioBlob, setVoiceAudioBlob] = useState<Blob | null>(null);
  
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [musicLoading, setMusicLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [voiceAudioElement, setVoiceAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  // Load available voices on mount
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const response = await fetch('/api/generate/voice');
        const data = await response.json();
        setAvailableVoices(data.voices || []);
      } catch (error) {
        console.error('Error loading voices:', error);
      }
    };
    loadVoices();
  }, []);

  // Auto-suggest BPM when genres change
  useEffect(() => {
    if (selectedGenres.length > 0) {
      const idealBpm = getIdealBpmForGenres(selectedGenres);
      setBpm(idealBpm);
    }
  }, [selectedGenres]);

  const handleGenerateLyrics = async () => {
    if (!prompt.trim()) {
      setMessage({ type: 'error', text: 'Please enter a creative prompt' });
      return;
    }

    setLyricsLoading(true);
    setMessage(null);

    try {
      // Determine the actual language to use
      const languageToUse = selectedLanguage === 'custom' 
        ? (customLanguage.trim() || 'English')
        : selectedLanguage;

      // Enhance prompt with genre-specific guidance
      const enhancedPrompt = enhanceLyricPromptWithGenre(prompt, selectedGenres);

      const response = await fetch('/api/generate/lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          genre: selectedGenres.join(', '),
          mood: selectedMood,
          styleDescription,
          language: languageToUse,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate lyrics');
      }

      setLyrics(data.lyrics);
      setIsDemoMode(data.metadata.isDemoMode);
      setGenerationMetadata(data.metadata);
      
      if (data.metadata.isDemoMode) {
        setMessage({ 
          type: 'info', 
          text: 'Demo mode: Add OPENAI_API_KEY to .env for real AI lyrics generation' 
        });
      } else {
        setMessage({ type: 'success', text: 'Lyrics generated successfully!' });
      }
      
      setActiveTab("voice");
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLyricsLoading(false);
    }
  };

  const handleGenerateVoice = async () => {
    if (!selectedVoice) {
      setMessage({ type: 'error', text: 'Please select a voice' });
      return;
    }

    if (!lyrics.trim()) {
      setMessage({ type: 'error', text: 'Please generate lyrics first' });
      return;
    }

    setVoiceLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/generate/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lyrics,
          voiceId: selectedVoice.id,
          voiceProvider: selectedVoice.provider,
          language: selectedVoice.language,
          speed: voiceSpeed,
          singing: false, // Can be made configurable later
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate voice');
      }

      if (data.demoMode) {
        setIsDemoMode(true);
        setMessage({ 
          type: 'info', 
          text: 'Demo mode: Configure TTS API keys in .env for real voice generation' 
        });
      } else {
        try {
          // Convert base64 audio data to blob and create URL
          const audioData = data.audioData;
          const audioBlob = new Blob(
            [Uint8Array.from(atob(audioData), c => c.charCodeAt(0))],
            { type: 'audio/mpeg' }
          );
          const audioUrl = URL.createObjectURL(audioBlob);
          
          setVoiceAudioUrl(audioUrl);
          setVoiceAudioBlob(audioBlob);
          setVoiceMetadata(data.metadata);
          setMessage({ type: 'success', text: 'Voice generated successfully! Preview below.' });
        } catch (decodeError) {
          throw new Error('Failed to process audio data. This may be due to network issues or invalid response from the server. Please try generating again.');
        }
      }

      setActiveTab("music");
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setVoiceLoading(false);
    }
  };

  const toggleVoicePlayback = () => {
    if (!voiceAudioUrl) return;

    if (!voiceAudioElement) {
      const audio = new Audio(voiceAudioUrl);
      audio.onended = () => setIsVoicePlaying(false);
      setVoiceAudioElement(audio);
      audio.play();
      setIsVoicePlaying(true);
    } else {
      if (isVoicePlaying) {
        voiceAudioElement.pause();
        setIsVoicePlaying(false);
      } else {
        voiceAudioElement.play();
        setIsVoicePlaying(true);
      }
    }
  };

  const getFilteredVoices = () => {
    return availableVoices.filter(voice => {
      const genderMatch = voiceFilterGender === 'all' || voice.gender === voiceFilterGender;
      const languageMatch = voiceFilterLanguage === 'all' || voice.language.startsWith(voiceFilterLanguage);
      return genderMatch && languageMatch;
    });
  };

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleGenerateMusic = async () => {
    setMusicLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/generate/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          genre: selectedGenres.join(', '),
          mood: selectedMood,
          instruments: selectedInstruments,
          styleDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate music');
      }

      if (data.demoTracks && data.demoTracks.length > 0) {
        setAudioUrl(data.demoTracks[0].file);
        setIsDemoMode(true);
        setMessage({ 
          type: 'info', 
          text: 'Demo mode: Configure music API keys in .env for real music generation. Using sample track.' 
        });
      } else if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
        setIsDemoMode(false);
        setMessage({ type: 'success', text: 'Music generated successfully!' });
      }

      setActiveTab("publish");
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setMusicLoading(false);
    }
  };

  const togglePlayback = () => {
    if (!audioUrl) return;

    if (!audioElement) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a track title' });
      return;
    }

    if (!lyrics.trim()) {
      setMessage({ type: 'error', text: 'Please generate or enter lyrics first' });
      return;
    }

    setPublishLoading(true);
    setMessage(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        throw new Error('Not logged in');
      }

      // Note: Audio file handling for Create Song feature
      // 
      // DEMO MODE: Uses a placeholder path. Admins should be aware that tracks created
      // in demo mode don't have actual audio files and should handle them accordingly.
      // 
      // PRODUCTION: When using real music generation APIs, you would:
      // 1. Receive audioUrl from the music generation API
      // 2. Download the audio file from that URL
      // 3. Upload it to Supabase storage
      // 4. Use the Supabase storage path here
      // 
      // Example implementation for production:
      // if (audioUrl && !isDemoMode) {
      //   const audioBlob = await fetch(audioUrl).then(r => r.blob());
      //   const audioPath = `${user.id}/${crypto.randomUUID()}.mp3`;
      //   await supabase.storage.from('tracks').upload(audioPath, audioBlob);
      // }
      const audioPath = isDemoMode ? 'demo/placeholder.mp3' : `generated/${user.id}/${crypto.randomUUID()}.mp3`;

      // Handle voice audio upload if generated
      let voiceAudioPath = null;
      if (voiceAudioBlob && !isDemoMode) {
        const voicePath = `voices/${user.id}/${crypto.randomUUID()}.mp3`;
        const { error: uploadError } = await supabase.storage
          .from('tracks')
          .upload(voicePath, voiceAudioBlob);
        
        if (!uploadError) {
          voiceAudioPath = voicePath;
        } else {
          console.error('Voice upload error:', uploadError);
          // Continue with publishing even if voice upload fails
        }
      }

      const { error: insErr } = await supabase.from("tracks").insert({
        creator_id: user.id,
        title,
        genre: selectedGenres.join(', '),
        mood: selectedMood,
        ai_tool: isDemoMode ? 'AIXONTRA Demo Mode' : 'AIXONTRA Create',
        audio_path: audioPath,
        lyrics: lyrics,
        voice_audio_path: voiceAudioPath,
        voice_metadata: voiceMetadata,
        generation_metadata: {
          prompt,
          genres: selectedGenres,
          mood: selectedMood,
          instruments: selectedInstruments,
          styleDescription,
          isDemoMode,
          voice: voiceMetadata,
          ...generationMetadata,
        },
        status: "pending",
      });

      if (insErr) throw new Error(insErr.message);

      setMessage({ 
        type: 'success', 
        text: 'Song submitted for review! Your track will be published after approval.' 
      });
      
      // Navigate using Next.js router
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setPublishLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a track title' });
      return;
    }

    if (!lyrics.trim()) {
      setMessage({ type: 'error', text: 'Please generate or enter lyrics first' });
      return;
    }

    setDraftLoading(true);
    setMessage(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        throw new Error('Not logged in');
      }

      const audioPath = isDemoMode ? 'demo/placeholder.mp3' : `generated/${user.id}/${crypto.randomUUID()}.mp3`;

      // Handle voice audio upload if generated
      let voiceAudioPath = null;
      if (voiceAudioBlob && !isDemoMode) {
        const voicePath = `voices/${user.id}/${crypto.randomUUID()}.mp3`;
        const { error: uploadError } = await supabase.storage
          .from('tracks')
          .upload(voicePath, voiceAudioBlob);
        
        if (!uploadError) {
          voiceAudioPath = voicePath;
        }
      }

      const draftData = {
        creator_id: user.id,
        title,
        genre: selectedGenres.join(', '),
        mood: selectedMood,
        ai_tool: isDemoMode ? 'AIXONTRA Demo Mode' : 'AIXONTRA Create',
        audio_path: audioPath,
        lyrics: lyrics,
        voice_audio_path: voiceAudioPath,
        voice_metadata: voiceMetadata,
        generation_metadata: {
          prompt,
          genres: selectedGenres,
          mood: selectedMood,
          instruments: selectedInstruments,
          styleDescription,
          isDemoMode,
          voice: voiceMetadata,
          ...generationMetadata,
        },
        status: "pending" as const,
        is_draft: true,
      };

      if (draftId) {
        // Update existing draft
        const { error: updateErr } = await supabase
          .from("tracks")
          .update(draftData)
          .eq("id", draftId)
          .eq("creator_id", user.id);

        if (updateErr) throw new Error(updateErr.message);
      } else {
        // Create new draft
        const { data: insertedTrack, error: insErr } = await supabase
          .from("tracks")
          .insert(draftData)
          .select()
          .single();

        if (insErr) throw new Error(insErr.message);
        if (insertedTrack) setDraftId(insertedTrack.id);
      }

      setMessage({ 
        type: 'success', 
        text: 'Draft saved! You can continue editing or return to it later from your profile.' 
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setDraftLoading(false);
    }
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const toggleInstrument = (instrumentId: string) => {
    setSelectedInstruments(prev =>
      prev.includes(instrumentId) ? prev.filter(i => i !== instrumentId) : [...prev, instrumentId]
    );
  };

  return (
    <div className="card" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <Sparkles size={32} style={{ color: 'var(--primary)' }} />
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Create AI Song</h1>
          <p className="muted">Generate lyrics and music with AI</p>
        </div>
      </div>

      {message && (
        <div 
          className="card" 
          style={{ 
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 
                           message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 
                           'rgba(59, 130, 246, 0.1)',
            border: `1px solid ${message.type === 'error' ? 'rgb(239, 68, 68)' : 
                                 message.type === 'success' ? 'rgb(34, 197, 94)' : 
                                 'rgb(59, 130, 246)'}`
          }}
        >
          {message.text}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4" aria-label="Song creation steps">
          <TabsTrigger value="lyrics" aria-label="Step 1: Generate Lyrics">1. Lyrics</TabsTrigger>
          <TabsTrigger value="voice" aria-label="Step 2: Select and Generate Voice">2. Voice</TabsTrigger>
          <TabsTrigger value="music" aria-label="Step 3: Generate Music">3. Music</TabsTrigger>
          <TabsTrigger value="publish" aria-label="Step 4: Publish Song">4. Publish</TabsTrigger>
        </TabsList>

        <TabsContent value="lyrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Song Idea</CardTitle>
              <CardDescription>
                Describe your song idea or theme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prompt">Creative Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g., A song about chasing dreams under the city lights..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>

              <GenreRecommendations
                prompt={prompt}
                selectedGenres={selectedGenres}
                onGenreSelect={(genre) => {
                  if (!selectedGenres.includes(genre)) {
                    setSelectedGenres([...selectedGenres, genre]);
                  }
                }}
              />

              <div>
                <Label>Genres (select one or more)</Label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {GENRES.map(genre => (
                    <Badge
                      key={genre}
                      variant={selectedGenres.includes(genre) ? "default" : "outline"}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleGenre(genre)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleGenre(genre);
                        }
                      }}
                      tabIndex={0}
                      role="checkbox"
                      aria-checked={selectedGenres.includes(genre)}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Mood/Style</Label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {MOODS.map(mood => (
                    <Badge
                      key={mood}
                      variant={selectedMood === mood ? "default" : "outline"}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedMood(mood)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedMood(mood);
                        }
                      }}
                      tabIndex={0}
                      role="radio"
                      aria-checked={selectedMood === mood}
                    >
                      {mood}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="styleDescription">Style/Rhythm Description (optional)</Label>
                <Textarea
                  id="styleDescription"
                  placeholder="e.g., traditional Vodou drumming, upbeat carnival Rabòday, slow romantic ballad..."
                  value={styleDescription}
                  onChange={(e) => setStyleDescription(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
                <p className="muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Describe the specific style or rhythm you want for your song
                </p>
              </div>

              <div>
                <Label htmlFor="language">Lyrics Language</Label>
                <Select
                  value={selectedLanguage}
                  onValueChange={(value) => setSelectedLanguage(value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.name}>
                        {lang.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Language...</SelectItem>
                  </SelectContent>
                </Select>
                {selectedLanguage === 'custom' && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <Input
                      id="customLanguage"
                      placeholder="Enter language (e.g., Haitian Creole, Swahili, etc.)"
                      value={customLanguage}
                      onChange={(e) => setCustomLanguage(e.target.value)}
                    />
                  </div>
                )}
                <p className="muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Select the language for AI-generated lyrics. The AI will generate singable, clear lyrics in the selected language.
                </p>
              </div>

              <div>
                <Label htmlFor="bpm">BPM (Beats Per Minute)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    id="bpm"
                    min={60}
                    max={180}
                    step={5}
                    value={[bpm]}
                    onValueChange={(value) => setBpm(value[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="60"
                    max="180"
                    value={bpm}
                    onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
                    className="w-20"
                  />
                </div>
                <p className="muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Set the tempo for your song (60-180 BPM). This affects flow analysis and ideal syllable count.
                </p>
              </div>

              <Button
                onClick={handleGenerateLyrics}
                disabled={lyricsLoading || !prompt.trim()}
                className="w-full"
              >
                {lyricsLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2" size={16} />
                    Generate Lyrics
                  </>
                )}
              </Button>

              {lyrics && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <Label>Generated Lyrics (editable)</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateLyrics}
                      disabled={lyricsLoading || !prompt.trim()}
                    >
                      <Sparkles className="mr-2" size={14} />
                      Regenerate
                    </Button>
                  </div>
                  <Textarea
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    rows={12}
                    className="mt-2 font-mono"
                  />
                  
                  {/* Analysis Section */}
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowAnalysis(!showAnalysis)}
                      className="w-full"
                    >
                      {showAnalysis ? "Hide" : "Show"} Lyric Analysis
                    </Button>
                    
                    {showAnalysis && lyrics && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                        <LyricQualityScore score={lyricAnalyzer.analyzeLyrics(lyrics)} />
                        <FlowAnalysisDisplay 
                          analysis={rhymeEngine.analyzeFlow(lyrics, bpm)} 
                          bpm={bpm}
                        />
                        <div className="lg:col-span-2">
                          <HitPotentialMeter 
                            score={hitPotentialAnalyzer.analyzeHitPotential(lyrics, bpm, 180)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select AI Voice</CardTitle>
              <CardDescription>
                Choose a voice to sing your lyrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Voice Filters */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <Label>Filter by Gender</Label>
                  <Select value={voiceFilterGender} onValueChange={setVoiceFilterGender}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Filter by Language</Label>
                  <Select value={voiceFilterLanguage} onValueChange={setVoiceFilterLanguage}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Voice Selection Grid */}
              <div>
                <Label>Available Voices</Label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {getFilteredVoices().map(voice => (
                    <div
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedVoice(voice);
                        }
                      }}
                      className="card"
                      style={{
                        cursor: 'pointer',
                        padding: '1rem',
                        border: selectedVoice?.id === voice.id 
                          ? '2px solid var(--primary)' 
                          : '1px solid var(--border)',
                        backgroundColor: selectedVoice?.id === voice.id
                          ? 'rgba(139, 92, 246, 0.1)'
                          : 'var(--card)',
                      }}
                      tabIndex={0}
                      role="radio"
                      aria-checked={selectedVoice?.id === voice.id}
                      aria-label={`${voice.name} voice`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Mic2 size={20} style={{ color: 'var(--primary)' }} />
                        <strong>{voice.name}</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem' }} className="muted">
                        <div>{voice.gender && capitalizeFirstLetter(voice.gender)}</div>
                        <div>{voice.languageName}</div>
                        {voice.style && <div>{voice.style}</div>}
                        <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          {voice.provider}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {getFilteredVoices().length === 0 && (
                  <p className="muted" style={{ marginTop: '1rem', textAlign: 'center' }}>
                    No voices available. Configure TTS API keys in .env
                  </p>
                )}
              </div>

              {/* Voice Speed Control */}
              {selectedVoice && (
                <div>
                  <Label>Voice Speed: {voiceSpeed.toFixed(1)}x</Label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={voiceSpeed}
                    onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  />
                  <p className="muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Adjust the speed of the voice (0.5x = slower, 2.0x = faster)
                  </p>
                </div>
              )}

              <Button
                onClick={handleGenerateVoice}
                disabled={voiceLoading || !selectedVoice || !lyrics.trim()}
                className="w-full"
              >
                {voiceLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Generating Voice...
                  </>
                ) : (
                  <>
                    <Mic2 className="mr-2" size={16} />
                    Generate Voice
                  </>
                )}
              </Button>

              {voiceAudioUrl && (
                <div className="card" style={{ padding: '1rem' }}>
                  <Label>Voice Preview</Label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleVoicePlayback}
                    >
                      {isVoicePlaying ? <Pause size={16} /> : <Play size={16} />}
                    </Button>
                    <span className="muted">
                      {selectedVoice?.name} - {selectedVoice?.languageName}
                    </span>
                  </div>
                  <p className="muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Listen to the generated voice. You can regenerate with different settings if needed.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="music" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Music</CardTitle>
              <CardDescription>
                Select instruments and generate audio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Instruments</Label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {INSTRUMENTS.map(instrument => (
                    <div
                      key={instrument.id}
                      onClick={() => toggleInstrument(instrument.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleInstrument(instrument.id);
                        }
                      }}
                      className="card"
                      style={{
                        cursor: 'pointer',
                        padding: '0.75rem',
                        textAlign: 'center',
                        border: selectedInstruments.includes(instrument.id) 
                          ? '2px solid var(--primary)' 
                          : '1px solid var(--border)',
                        backgroundColor: selectedInstruments.includes(instrument.id)
                          ? 'rgba(139, 92, 246, 0.1)'
                          : 'var(--card)',
                      }}
                      tabIndex={0}
                      role="checkbox"
                      aria-checked={selectedInstruments.includes(instrument.id)}
                      aria-label={`${instrument.label} instrument`}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{instrument.icon}</div>
                      <div style={{ fontSize: '0.875rem' }}>{instrument.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerateMusic}
                disabled={musicLoading}
                className="w-full"
              >
                {musicLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Music className="mr-2" size={16} />
                    Generate Music
                  </>
                )}
              </Button>

              {audioUrl && (
                <div className="card" style={{ padding: '1.5rem', backgroundColor: 'rgba(139, 92, 246, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <Label style={{ fontSize: '1rem', fontWeight: 600 }}>🎵 Preview Your Music</Label>
                    <Badge variant="outline">{isDemoMode ? 'Demo Sample' : 'Generated'}</Badge>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={togglePlayback}
                      style={{ minWidth: '120px' }}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="mr-2" size={20} />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-2" size={20} />
                          Play
                        </>
                      )}
                    </Button>
                    <div style={{ flex: 1, fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                      Listen to your generated music before publishing
                    </div>
                  </div>
                  
                  <div className="card" style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>
                      💡 <strong>Tip:</strong> Make sure you're happy with how it sounds before proceeding to publish!
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publish" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publish Your Song</CardTitle>
              <CardDescription>
                Review and publish your creation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Track Title *</Label>
                <Input
                  id="title"
                  placeholder="My Amazing AI Song"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Lyrics</Label>
                <Textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  rows={10}
                  className="mt-2 font-mono"
                />
              </div>

              <div>
                <Label>Genres</Label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {selectedGenres.map(genre => (
                    <Badge key={genre}>{genre}</Badge>
                  ))}
                </div>
              </div>

              {selectedMood && (
                <div>
                  <Label>Mood</Label>
                  <div style={{ marginTop: '0.5rem' }}>
                    <Badge>{selectedMood}</Badge>
                  </div>
                </div>
              )}

              {styleDescription && (
                <div>
                  <Label>Style/Rhythm Description</Label>
                  <div className="card" style={{ padding: '0.75rem', marginTop: '0.5rem', backgroundColor: 'rgba(139, 92, 246, 0.05)' }}>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>{styleDescription}</p>
                  </div>
                </div>
              )}

              {audioUrl && (
                <div className="card" style={{ padding: '1.5rem', backgroundColor: 'rgba(139, 92, 246, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <Label style={{ fontSize: '1rem', fontWeight: 600 }}>🎵 Final Audio Preview</Label>
                    <Badge variant="outline">{isDemoMode ? 'Demo Sample' : 'Generated'}</Badge>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={togglePlayback}
                      style={{ minWidth: '120px' }}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="mr-2" size={20} />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-2" size={20} />
                          Play
                        </>
                      )}
                    </Button>
                    <div style={{ flex: 1, fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                      Listen one last time before submitting
                    </div>
                  </div>
                </div>
              )}

              <div className="card" style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <p style={{ fontSize: '0.875rem', margin: 0 }}>
                  📝 Your song will be submitted for review. Once approved, 
                  it will be published to the AIXONTRA gallery.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <Button
                  onClick={handleSaveAsDraft}
                  disabled={draftLoading || !title.trim() || !lyrics.trim()}
                  variant="outline"
                  className="w-full"
                >
                  {draftLoading ? (
                    <>
                      <Spinner className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2" size={16} />
                      Save as Draft
                    </>
                  )}
                </Button>

                <Button
                  onClick={handlePublish}
                  disabled={publishLoading || !title.trim() || !lyrics.trim()}
                  className="w-full"
                >
                  {publishLoading ? (
                    <>
                      <Spinner className="mr-2" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2" size={16} />
                      Submit for Review
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

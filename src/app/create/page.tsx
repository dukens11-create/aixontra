"use client";

import AuthGuard from "@/components/AuthGuard";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { GENRES, INSTRUMENTS, MOODS } from "@/lib/aiConfig";
import { LANGUAGES } from "@/lib/constants";
import { GenerationMetadata } from "@/types";
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
import { Music, Sparkles, Save, Play, Pause } from "lucide-react";

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
  const [generationMetadata, setGenerationMetadata] = useState<GenerationMetadata | null>(null);
  
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [musicLoading, setMusicLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

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

      const response = await fetch('/api/generate/lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
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
      
      setActiveTab("music");
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLyricsLoading(false);
    }
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

      const { error: insErr } = await supabase.from("tracks").insert({
        creator_id: user.id,
        title,
        genre: selectedGenres.join(', '),
        mood: selectedMood,
        ai_tool: isDemoMode ? 'AIXONTRA Demo Mode' : 'AIXONTRA Create',
        audio_path: audioPath,
        lyrics: lyrics,
        generation_metadata: {
          prompt,
          genres: selectedGenres,
          mood: selectedMood,
          instruments: selectedInstruments,
          styleDescription,
          isDemoMode,
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lyrics">1. Lyrics</TabsTrigger>
          <TabsTrigger value="music">2. Music</TabsTrigger>
          <TabsTrigger value="publish">3. Publish</TabsTrigger>
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
                    Generate Lyrics with AI (ChatGPT)
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
                <div className="card" style={{ padding: '1rem' }}>
                  <Label>Audio Preview</Label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={togglePlayback}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </Button>
                    <span className="muted">
                      {isDemoMode ? 'Demo Sample' : 'Generated Track'}
                    </span>
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

              <div className="card" style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <p style={{ fontSize: '0.875rem', margin: 0 }}>
                  📝 Your song will be submitted for review. Once approved, 
                  it will be published to the AIXONTRA gallery.
                </p>
              </div>

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
                    <Save className="mr-2" size={16} />
                    Submit for Review
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

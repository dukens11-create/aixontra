"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { GENRES, INSTRUMENTS, MOODS } from "@/lib/aiConfig";
import { LANGUAGES } from "@/lib/constants";
import { GenerationMetadata } from "@/types";
import AuthGuard from "@/components/AuthGuard";
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

export default function EditDraftPage() {
  return (
    <AuthGuard>
      <EditDraftForm />
    </AuthGuard>
  );
}

function EditDraftForm() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const params = useParams();
  const draftId = params.id as string;
  
  const [loading, setLoading] = useState(true);
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
  const [draftLoading, setDraftLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadDraft();
  }, [draftId]);

  const loadDraft = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: draft, error } = await supabase
        .from("tracks")
        .select("*")
        .eq("id", draftId)
        .eq("creator_id", user.id)
        .eq("is_draft", true)
        .single();

      if (error || !draft) {
        setMessage({ type: 'error', text: 'Draft not found or access denied' });
        setTimeout(() => router.push('/profile'), 2000);
        return;
      }

      // Load draft data
      setTitle(draft.title);
      setLyrics(draft.lyrics || "");
      setSelectedGenres(draft.genre ? draft.genre.split(', ') : []);
      setSelectedMood(draft.mood || "");
      
      if (draft.generation_metadata) {
        const metadata = draft.generation_metadata as GenerationMetadata;
        setPrompt(metadata.prompt || "");
        setSelectedInstruments(metadata.instruments || []);
        setStyleDescription(metadata.styleDescription || "");
        setIsDemoMode(metadata.isDemoMode || false);
        setGenerationMetadata(metadata);
      }

      // Set audio URL if available
      const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      if (draft.audio_path) {
        setAudioUrl(`${base}/storage/v1/object/public/tracks/${draft.audio_path}`);
      }

      setActiveTab("publish"); // Go directly to publish tab for editing
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLyrics = async () => {
    if (!prompt.trim()) {
      setMessage({ type: 'error', text: 'Please enter a creative prompt' });
      return;
    }

    setLyricsLoading(true);
    setMessage(null);

    try {
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

      const { error: updateErr } = await supabase
        .from("tracks")
        .update({
          title,
          genre: selectedGenres.join(', '),
          mood: selectedMood,
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
          is_draft: false,
          status: "pending",
        })
        .eq("id", draftId)
        .eq("creator_id", user.id);

      if (updateErr) throw new Error(updateErr.message);

      setMessage({ 
        type: 'success', 
        text: 'Song submitted for review! Your track will be published after approval.' 
      });
      
      setTimeout(() => {
        router.push('/profile');
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

      const { error: updateErr } = await supabase
        .from("tracks")
        .update({
          title,
          genre: selectedGenres.join(', '),
          mood: selectedMood,
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
          updated_at: new Date().toISOString(),
        })
        .eq("id", draftId)
        .eq("creator_id", user.id);

      if (updateErr) throw new Error(updateErr.message);

      setMessage({ 
        type: 'success', 
        text: 'Draft updated successfully!' 
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

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <Spinner className="mx-auto mb-4" />
        <p>Loading draft...</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <Sparkles size={32} style={{ color: 'var(--primary)' }} />
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Edit Draft</h1>
          <p className="muted">Continue editing your AI song</p>
        </div>
      </div>

      {message && (
        <div 
          className="card" 
          style={{ 
            padding: '1rem', 
            marginBottom: '1.5rem',
            backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 
                           message.type === 'info' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 
                                message.type === 'info' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`
          }}
        >
          <p style={{ margin: 0 }}>{message.text}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lyrics">1. Lyrics</TabsTrigger>
          <TabsTrigger value="music">2. Music</TabsTrigger>
          <TabsTrigger value="publish">3. Publish</TabsTrigger>
        </TabsList>

        <TabsContent value="lyrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edit or Generate Lyrics</CardTitle>
              <CardDescription>
                Modify your lyrics or generate new ones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prompt">Creative Prompt</Label>
                <Input
                  id="prompt"
                  placeholder="A song about..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Genres</Label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {GENRES.map(genre => (
                    <div
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleGenre(genre);
                        }
                      }}
                      className="card"
                      style={{
                        cursor: 'pointer',
                        padding: '0.75rem',
                        textAlign: 'center',
                        border: selectedGenres.includes(genre) 
                          ? '2px solid var(--primary)' 
                          : '1px solid var(--border)',
                        backgroundColor: selectedGenres.includes(genre)
                          ? 'rgba(139, 92, 246, 0.1)'
                          : 'var(--card)',
                      }}
                      tabIndex={0}
                      role="checkbox"
                      aria-checked={selectedGenres.includes(genre)}
                      aria-label={`${genre} genre`}
                    >
                      {genre}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="mood">Mood/Style</Label>
                <Select value={selectedMood} onValueChange={setSelectedMood}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a mood" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOODS.map(mood => (
                      <SelectItem key={mood} value={mood}>
                        {mood}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerateLyrics}
                disabled={lyricsLoading}
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
                    Generate New Lyrics
                  </>
                )}
              </Button>

              {lyrics && (
                <div>
                  <Label>Lyrics (editable)</Label>
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
              <CardTitle>Generate or Update Music</CardTitle>
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
                    Generate New Music
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
              <CardTitle>Review and Publish</CardTitle>
              <CardDescription>
                Review your changes and publish or save as draft
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
                      Update Draft
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

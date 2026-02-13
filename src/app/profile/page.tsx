"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Track } from "@/types";
import AuthGuard from "@/components/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Edit, Trash2, Send, Play } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [drafts, setDrafts] = useState<Track[]>([]);
  const [publishedTracks, setPublishedTracks] = useState<Track[]>([]);
  const [pendingTracks, setPendingTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      // Load drafts
      const { data: draftsData } = await supabase
        .from("tracks")
        .select("*")
        .eq("creator_id", user.id)
        .eq("is_draft", true)
        .order("updated_at", { ascending: false });

      // Load published tracks
      const { data: publishedData } = await supabase
        .from("tracks")
        .select("*")
        .eq("creator_id", user.id)
        .eq("is_draft", false)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      // Load pending tracks
      const { data: pendingData } = await supabase
        .from("tracks")
        .select("*")
        .eq("creator_id", user.id)
        .eq("is_draft", false)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      setDrafts(draftsData || []);
      setPublishedTracks(publishedData || []);
      setPendingTracks(pendingData || []);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;

    try {
      const { error } = await supabase
        .from("tracks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setDrafts(drafts.filter(d => d.id !== id));
      setMessage({ type: 'success', text: 'Draft deleted successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handlePublishDraft = async (draft: Track) => {
    try {
      const { error } = await supabase
        .from("tracks")
        .update({ is_draft: false, status: "pending" })
        .eq("id", draft.id);

      if (error) throw error;

      setDrafts(drafts.filter(d => d.id !== draft.id));
      setPendingTracks([draft, ...pendingTracks]);
      setMessage({ type: 'success', text: 'Draft submitted for review!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const TrackItem = ({ track, isDraft }: { track: Track, isDraft?: boolean }) => {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const audioUrl = `${base}/storage/v1/object/public/tracks/${track.audio_path}`;

    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                {track.title}
              </h3>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                {track.genre && (
                  <Badge variant="secondary">{track.genre}</Badge>
                )}
                {track.mood && (
                  <Badge variant="outline">{track.mood}</Badge>
                )}
                {isDraft && (
                  <Badge variant="default">Draft</Badge>
                )}
              </div>

              {track.lyrics && (
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--muted-foreground)',
                  maxHeight: '3rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '0.75rem'
                }}>
                  {track.lyrics.substring(0, 100)}...
                </p>
              )}

              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                {isDraft ? 'Last updated' : 'Created'}: {new Date(isDraft ? track.updated_at : track.created_at).toLocaleDateString()}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
              {isDraft ? (
                <>
                  <Link href={`/create/${track.id}`}>
                    <Button size="sm" variant="outline">
                      <Edit size={16} className="mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    onClick={() => handlePublishDraft(track)}
                  >
                    <Send size={16} className="mr-2" />
                    Publish
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDeleteDraft(track.id)}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </Button>
                </>
              ) : (
                <Link href={`/track/${track.id}`}>
                  <Button size="sm" variant="outline">
                    <Play size={16} className="mr-2" />
                    View
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Loading your tracks...</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <Music size={32} style={{ color: 'var(--primary)' }} />
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>My Music</h1>
          <p className="muted">Manage your drafts and published tracks</p>
        </div>
      </div>

      {message && (
        <div 
          className="card" 
          style={{ 
            padding: '1rem', 
            marginBottom: '1.5rem',
            backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`
          }}
        >
          <p style={{ margin: 0 }}>{message.text}</p>
        </div>
      )}

      <Tabs defaultValue="drafts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="drafts">
            Drafts ({drafts.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Review ({pendingTracks.length})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published ({publishedTracks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drafts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Drafts</CardTitle>
              <CardDescription>
                Continue editing or publish your saved drafts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {drafts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <p className="muted">No drafts yet</p>
                  <Link href="/create">
                    <Button className="mt-4">Create Your First Song</Button>
                  </Link>
                </div>
              ) : (
                <div>
                  {drafts.map(draft => (
                    <TrackItem key={draft.id} track={draft} isDraft={true} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Review</CardTitle>
              <CardDescription>
                Tracks submitted and awaiting admin approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingTracks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <p className="muted">No pending tracks</p>
                </div>
              ) : (
                <div>
                  {pendingTracks.map(track => (
                    <TrackItem key={track.id} track={track} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Published Tracks</CardTitle>
              <CardDescription>
                Your approved and published songs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {publishedTracks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <p className="muted">No published tracks yet</p>
                </div>
              ) : (
                <div>
                  {publishedTracks.map(track => (
                    <TrackItem key={track.id} track={track} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

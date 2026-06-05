import { Song } from './demoData';
import { Track } from '@/types';

export const toTrack = (song: Song): Track => ({
  id: song.id,
  creator_id: song.creatorId,
  title: song.title,
  genre: song.genre,
  mood: song.mood,
  ai_tool: 'AIXENTRA Demo',
  audio_path: song.audioUrl,
  cover_path: song.coverUrl,
  status: 'approved',
  review_note: null,
  plays: song.plays,
  likes_count: song.likes,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  duration: null,
  file_size: null,
  bit_rate: null,
  sample_rate: null,
  description: song.prompt,
  tags: [song.genre, song.mood],
  language: song.language,
  explicit_content: false,
  download_count: 0,
  deleted_at: null,
  lyrics: song.lyrics,
  generation_metadata: null,
  voice_audio_path: null,
  voice_metadata: null,
  is_draft: false,
  creator: {
    id: song.creatorId,
    username:
      song.creatorName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 24) || `creator${song.creatorId.replace(/[^a-z0-9]/gi, '').slice(0, 8)}`,
    display_name: song.creatorName,
    bio: null,
    avatar_url: song.creatorAvatar,
    role: 'user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
});

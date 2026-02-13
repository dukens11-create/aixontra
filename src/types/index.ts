// ============================================================================
// Create Song Feature Types
// ============================================================================

export interface VoiceMetadata {
  voiceId: string;
  voiceName: string;
  voiceProvider: 'openai' | 'elevenlabs' | 'google' | 'azure' | 'demo';
  voiceGender?: 'male' | 'female' | 'neutral';
  voiceLanguage: string;
  voiceStyle?: string;
  audioUrl?: string; // URL of generated voice audio
  generatedAt?: string;
}

export interface GenerationMetadata {
  prompt: string;
  genres?: string[];
  mood?: string;
  instruments?: string[];
  language?: string;
  isDemoMode: boolean;
  model?: string;
  provider?: string;
  generatedAt?: string;
  voice?: VoiceMetadata; // Voice generation metadata
  [key: string]: any; // Allow additional properties for extensibility
}

// ============================================================================
// Base Types and Enums
// ============================================================================

export type TrackStatus = "pending" | "approved" | "rejected";
export type NotificationType = "like" | "comment" | "follow" | "track_approved" | "track_rejected" | "mention" | "reply";
export type ReportStatus = "pending" | "resolved" | "dismissed";
export type TagCategory = "genre" | "mood" | "ai_tool";
export type UserRole = "user" | "admin" | "moderator";

// ============================================================================
// Core Entities
// ============================================================================

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  // Computed fields
  followers_count?: number;
  following_count?: number;
  tracks_count?: number;
}

export interface Track {
  id: string;
  creator_id: string;
  title: string;
  genre: string | null;
  mood: string | null;
  ai_tool: string | null;
  audio_path: string;
  cover_path: string | null;
  status: TrackStatus;
  review_note: string | null;
  plays: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
  // Enhanced fields
  duration: string | null;
  file_size: number | null;
  bit_rate: number | null;
  sample_rate: number | null;
  description: string | null;
  tags: string[] | null;
  language: string;
  explicit_content: boolean;
  download_count: number;
  deleted_at: string | null;
  // Create Song feature fields
  lyrics: string | null;
  generation_metadata: GenerationMetadata | null;
  // Voice generation fields
  voice_audio_path: string | null;
  voice_metadata: VoiceMetadata | null;
  // Joined data
  creator?: Profile;
  is_liked?: boolean;
  comments_count?: number;
}

export interface Comment {
  id: string;
  track_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: Profile;
  replies?: Comment[];
  replies_count?: number;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
  // Joined data
  follower?: Profile;
  following?: Profile;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: Profile;
  tracks_count?: number;
  tracks?: Track[];
}

export interface PlaylistTrack {
  playlist_id: string;
  track_id: string;
  position: number;
  added_at: string;
  // Joined data
  track?: Track;
  playlist?: Playlist;
}

export interface ListeningHistory {
  id: string;
  user_id: string;
  track_id: string;
  played_at: string;
  duration_played: string | null;
  // Joined data
  track?: Track;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  track_id: string | null;
  comment_id: string | null;
  reason: string;
  description: string | null;
  status: ReportStatus;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  // Joined data
  reporter?: Profile;
  track?: Track;
  comment?: Comment;
  resolver?: Profile;
}

export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  created_at: string;
}

// ============================================================================
// Search and Filter Types
// ============================================================================

export interface SearchFilters {
  query?: string;
  genre?: string;
  mood?: string;
  ai_tool?: string;
  sort?: 'recent' | 'popular' | 'plays' | 'likes';
  explicit?: boolean;
  language?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

// ============================================================================
// Form Types
// ============================================================================

export interface TrackUploadFormData {
  title: string;
  description?: string;
  genre?: string;
  mood?: string;
  ai_tool?: string;
  tags?: string[];
  language?: string;
  explicit_content?: boolean;
  audio_file: File;
  cover_file?: File;
}

export interface TrackUpdateFormData {
  title?: string;
  description?: string;
  genre?: string;
  mood?: string;
  ai_tool?: string;
  tags?: string[];
  language?: string;
  explicit_content?: boolean;
  cover_file?: File;
}

export interface ProfileUpdateFormData {
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_file?: File;
}

export interface CommentFormData {
  content: string;
  parent_id?: string;
}

export interface PlaylistFormData {
  name: string;
  description?: string;
  is_public?: boolean;
  cover_file?: File;
}

export interface ReportFormData {
  track_id?: string;
  comment_id?: string;
  reason: string;
  description?: string;
}

// ============================================================================
// Audio Player Types
// ============================================================================

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  mode: 'normal' | 'repeat-one' | 'repeat-all' | 'shuffle';
  isLoading: boolean;
}

export interface PlayerControls {
  play: (track?: Track) => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setMode: (mode: PlayerState['mode']) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface PlatformAnalytics {
  totalTracks: number;
  totalUsers: number;
  totalPlays: number;
  totalLikes: number;
  tracksToday: number;
  usersToday: number;
  playsToday: number;
  likesToday: number;
  pendingTracks: number;
  pendingReports: number;
}

export interface UserAnalytics {
  totalTracks: number;
  totalPlays: number;
  totalLikes: number;
  totalFollowers: number;
  totalFollowing: number;
  mostPlayedTrack?: Track;
  recentPlays: ListeningHistory[];
}

// ============================================================================
// Utility Types
// ============================================================================

export type SortOption = 'recent' | 'popular' | 'plays' | 'likes';

export interface SelectOption {
  value: string;
  label: string;
}

// ============================================================================
// Database Types (for Supabase queries)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      tracks: {
        Row: Track;
        Insert: Omit<Track, 'id' | 'created_at' | 'updated_at' | 'plays' | 'likes_count' | 'download_count'>;
        Update: Partial<Omit<Track, 'id' | 'created_at'>>;
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Comment, 'id' | 'created_at' | 'track_id' | 'user_id'>>;
      };
      follows: {
        Row: Follow;
        Insert: Omit<Follow, 'created_at'>;
        Update: never;
      };
      playlists: {
        Row: Playlist;
        Insert: Omit<Playlist, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Playlist, 'id' | 'created_at' | 'user_id'>>;
      };
      playlist_tracks: {
        Row: PlaylistTrack;
        Insert: Omit<PlaylistTrack, 'added_at'>;
        Update: Partial<Pick<PlaylistTrack, 'position'>>;
      };
      listening_history: {
        Row: ListeningHistory;
        Insert: Omit<ListeningHistory, 'id' | 'played_at'>;
        Update: never;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Pick<Notification, 'read'>>;
      };
      reports: {
        Row: Report;
        Insert: Omit<Report, 'id' | 'created_at' | 'resolved_by' | 'resolved_at'>;
        Update: Partial<Pick<Report, 'status' | 'resolved_by' | 'resolved_at'>>;
      };
      tags: {
        Row: Tag;
        Insert: Omit<Tag, 'id' | 'created_at'>;
        Update: never;
      };
    };
  };
}


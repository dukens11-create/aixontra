// Application constants

// Genres
export const GENRES = [
  "Electronic",
  "Ambient",
  "Classical",
  "Pop",
  "Rock",
  "Jazz",
  "Hip Hop",
  "Lo-fi",
  "Experimental",
  "House",
  "Techno",
  "Drum & Bass",
  "Dubstep",
  "Trance",
  "Cinematic",
  "World",
  "Folk",
  "Metal",
  "Indie",
  "Kompa (Haiti)",
  "Zouk",
  "Rabòday",
  "Vodou (Haitian)",
  "Other",
] as const;

// Moods
export const MOODS = [
  "Calm",
  "Energetic",
  "Dark",
  "Happy",
  "Melancholic",
  "Epic",
  "Chill",
  "Intense",
  "Uplifting",
  "Dreamy",
  "Aggressive",
  "Peaceful",
  "Mysterious",
  "Romantic",
  "Nostalgic",
] as const;

// AI Tools
export const AI_TOOLS = [
  "Suno AI",
  "Udio",
  "MusicGen",
  "Stable Audio",
  "AIVA",
  "Soundraw",
  "Boomy",
  "Amper Music",
  "Loudly",
  "Beatoven.ai",
  "Mubert",
  "Other",
] as const;

// Languages
export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ru", name: "Russian" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "other", name: "Other" },
] as const;

// Track statuses
export const TRACK_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

// Report statuses
export const REPORT_STATUSES = {
  PENDING: "pending",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
} as const;

// Report reasons
export const REPORT_REASONS = [
  "Copyright Infringement",
  "Inappropriate Content",
  "Spam",
  "Harassment",
  "Misleading Information",
  "Other",
] as const;

// Notification types
export const NOTIFICATION_TYPES = {
  LIKE: "like",
  COMMENT: "comment",
  FOLLOW: "follow",
  TRACK_APPROVED: "track_approved",
  TRACK_REJECTED: "track_rejected",
  MENTION: "mention",
  REPLY: "reply",
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 30;
export const MAX_PAGE_SIZE = 100;

// File upload limits
export const MAX_AUDIO_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/flac",
];

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Rate limiting
export const RATE_LIMITS = {
  UPLOAD: {
    points: 5, // Number of requests
    duration: 3600, // Per hour
  },
  LIKE: {
    points: 100,
    duration: 3600,
  },
  COMMENT: {
    points: 50,
    duration: 3600,
  },
  SEARCH: {
    points: 60,
    duration: 60, // Per minute
  },
  API: {
    points: 100,
    duration: 60,
  },
} as const;

// Player modes
export const PLAYER_MODES = {
  NORMAL: "normal",
  REPEAT_ONE: "repeat-one",
  REPEAT_ALL: "repeat-all",
  SHUFFLE: "shuffle",
} as const;

// Sort options
export const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "popular", label: "Most Popular" },
  { value: "plays", label: "Most Played" },
  { value: "likes", label: "Most Liked" },
] as const;

// User roles
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  MODERATOR: "moderator",
} as const;

// Supabase storage buckets
export const STORAGE_BUCKETS = {
  TRACKS: "tracks",
  COVERS: "covers",
  AVATARS: "avatars",
} as const;

// URLs
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Meta
export const APP_NAME = "AIXONTRA";
export const APP_DESCRIPTION = "Curated AI Music Gallery - Discover and share AI-generated music";
export const APP_KEYWORDS = [
  "AI music",
  "AI-generated music",
  "music streaming",
  "Suno AI",
  "Udio",
  "music gallery",
  "discover music",
];

// Social
export const SOCIAL_LINKS = {
  twitter: "https://twitter.com/aixontra",
  github: "https://github.com/dukens11-create/aixontra",
  discord: "https://discord.gg/aixontra",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "You must be logged in to perform this action",
  FORBIDDEN: "You don't have permission to perform this action",
  NOT_FOUND: "The requested resource was not found",
  VALIDATION_ERROR: "Please check your input and try again",
  SERVER_ERROR: "An unexpected error occurred. Please try again later",
  RATE_LIMIT: "Too many requests. Please try again later",
  FILE_TOO_LARGE: "File size exceeds the maximum allowed limit",
  INVALID_FILE_TYPE: "Invalid file type",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  TRACK_UPLOADED: "Track uploaded successfully! It will be reviewed by our team",
  TRACK_UPDATED: "Track updated successfully",
  TRACK_DELETED: "Track deleted successfully",
  PROFILE_UPDATED: "Profile updated successfully",
  COMMENT_ADDED: "Comment added successfully",
  COMMENT_UPDATED: "Comment updated successfully",
  COMMENT_DELETED: "Comment deleted successfully",
  PLAYLIST_CREATED: "Playlist created successfully",
  PLAYLIST_UPDATED: "Playlist updated successfully",
  PLAYLIST_DELETED: "Playlist deleted successfully",
  TRACK_LIKED: "Track liked!",
  TRACK_UNLIKED: "Track unliked",
  USER_FOLLOWED: "User followed!",
  USER_UNFOLLOWED: "User unfollowed",
  REPORT_SUBMITTED: "Report submitted successfully. Thank you for helping us keep the community safe",
} as const;

export type TrackStatus = "pending" | "approved" | "rejected";

export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: string;
};

export type Track = {
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
};

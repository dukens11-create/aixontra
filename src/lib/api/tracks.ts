/**
 * Tracks API – AIXENTRA API abstraction layer
 *
 * Provides typed wrappers around track-related endpoints.
 * Swap `apiClient` for a native-compatible client in React Native / Flutter.
 */

import { apiClient } from './client';

export type TrackListResponse = {
  tracks: Array<{
    id: string;
    title: string;
    creatorId: string;
    creatorName: string;
    genre: string;
    mood: string;
    audioUrl: string;
    coverUrl: string;
    likes: number;
    plays: number;
    isPublic: boolean;
    createdAt: string;
  }>;
};

export type LikeResponse = { success: boolean; likes: number };
export type PlayResponse = { success: boolean };
export type PublishResponse = { success: boolean; id: string };

/** Fetch the public song feed. */
export function fetchFeed(params?: { genre?: string; limit?: number; offset?: number }) {
  return apiClient.get<TrackListResponse>('/api/songs', { params });
}

/** Like a track. */
export function likeTrack(songId: string, userId: string) {
  return apiClient.post<LikeResponse>('/api/songs/like', { songId, userId });
}

/** Record a play event. */
export function recordPlay(songId: string, userId?: string) {
  return apiClient.post<PlayResponse>('/api/play', { songId, userId });
}

/** Publish a generated draft as a public track. */
export function publishTrack(draftId: string, userId: string) {
  return apiClient.post<PublishResponse>('/api/songs/publish', { draftId, userId });
}

/** Post a comment on a track. */
export function postComment(songId: string, userId: string, text: string) {
  return apiClient.post('/api/songs/comment', { songId, userId, text });
}

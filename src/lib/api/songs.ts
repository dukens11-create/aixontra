/**
 * Songs/Generation API – AIXENTRA API abstraction layer
 *
 * Provides typed wrappers around song-generation endpoints.
 */

import { apiClient } from './client';

export type GenerationJobParams = {
  prompt: string;
  genre?: string;
  mood?: string;
  bpm?: number;
  durationSeconds?: number;
  userId?: string;
};

export type GenerationJobResponse = {
  jobId: string;
  status: 'queued' | 'processing' | 'complete' | 'error';
  audioUrl?: string;
  wavUrl?: string;
  coverUrl?: string;
  error?: string;
};

export type JobStatusResponse = GenerationJobResponse & {
  progress?: number;
};

/** Start a new music generation job. */
export function startGenerationJob(params: GenerationJobParams) {
  return apiClient.post<GenerationJobResponse>('/api/generate', params);
}

/** Poll the status of an existing generation job. */
export function getJobStatus(jobId: string) {
  return apiClient.get<JobStatusResponse>(`/api/generate/${jobId}`);
}

/** Cancel an in-progress generation job. */
export function cancelGenerationJob(jobId: string) {
  return apiClient.post<{ success: boolean }>(`/api/generate/${jobId}/cancel`);
}

/** Generate AI lyrics. */
export function generateLyrics(params: { prompt: string; genre?: string; mood?: string; userId?: string }) {
  return apiClient.post<{ lyrics: string }>('/api/generate/lyrics', params);
}

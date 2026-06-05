/**
 * AIXENTRA API Abstraction Layer – public exports
 *
 * Import from `@/lib/api` to access all API helpers.
 * This barrel file is the single entry-point for consumers and makes it
 * easy to swap implementations for React Native or Flutter in the future.
 */

export { apiClient, ApiClient, ApiError } from './client';
export type { ApiRequestOptions, ApiResponse } from './client';

export { fetchFeed, likeTrack, recordPlay, publishTrack, postComment } from './tracks';
export type { TrackListResponse, LikeResponse, PlayResponse, PublishResponse } from './tracks';

export {
  startGenerationJob,
  getJobStatus,
  cancelGenerationJob,
  generateLyrics,
} from './songs';
export type { GenerationJobParams, GenerationJobResponse, JobStatusResponse } from './songs';

export {
  sendNotification,
  registerPushSubscription,
  removePushSubscription,
  sendPushNotification,
} from './notifications';
export type { NotificationPayload, PushSubscribeParams } from './notifications';

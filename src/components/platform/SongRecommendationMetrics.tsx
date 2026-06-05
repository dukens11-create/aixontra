import { Song } from '@/lib/platform/demoData';

type SongMetricsProps = {
  song: Pick<Song, 'plays' | 'likes' | 'comments' | 'shares' | 'remixes' | 'averageWatchTimeSeconds'>;
  className?: string;
  showLikes?: boolean;
  showComments?: boolean;
  showShares?: boolean;
  showRemixes?: boolean;
  showWatchTime?: boolean;
};

export default function SongRecommendationMetrics({
  song,
  className = 'muted',
  showLikes = false,
  showComments = false,
  showShares = true,
  showRemixes = false,
  showWatchTime = true,
}: SongMetricsProps) {
  const metrics = [`${song.plays.toLocaleString()} plays`];

  if (showLikes) metrics.push(`${song.likes.toLocaleString()} likes`);
  if (showComments) metrics.push(`${song.comments.toLocaleString()} comments`);
  if (showShares) metrics.push(`${(song.shares ?? 0).toLocaleString()} shares`);
  if (showRemixes) metrics.push(`${song.remixes.toLocaleString()} remixes`);
  if (showWatchTime) metrics.push(`${Math.round(song.averageWatchTimeSeconds ?? 0)}s avg watch`);

  return <p className={className}>{metrics.join(' · ')}</p>;
}

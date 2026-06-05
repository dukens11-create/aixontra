import { Song } from './demoData';

const likeWeight = 3;
const commentWeight = 4;
const remixWeight = 5;

export const getRecentBoost = (createdAtIso?: string) => {
  if (!createdAtIso) return 0;
  const ageHours = Math.max(0, (Date.now() - new Date(createdAtIso).getTime()) / 36e5);
  return Math.max(0, 48 - ageHours);
};

export const recommendationScore = (song: Song) =>
  song.plays + song.likes * likeWeight + song.comments * commentWeight + song.remixes * remixWeight + getRecentBoost(song.createdAt);

export const rankSongs = (items: Song[]) => [...items].sort((a, b) => recommendationScore(b) - recommendationScore(a));

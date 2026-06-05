import { Song } from './demoData';
import { calculateTrendingScore, getRecencyBoost } from './recommendationEngine';

export const getRecentBoost = getRecencyBoost;

export const recommendationScore = (song: Song) => calculateTrendingScore(song).score;

export const rankSongs = (items: Song[]) => [...items].sort((a, b) => recommendationScore(b) - recommendationScore(a));

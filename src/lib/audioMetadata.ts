import { parseBuffer } from 'music-metadata-browser';
import { FileUploadError } from './errors';

export interface AudioMetadata {
  duration: number; // in seconds
  bitrate: number; // in bps
  sampleRate: number; // in Hz
  format: string;
  title?: string;
  artist?: string;
  album?: string;
  year?: number;
  genre?: string[];
}

/**
 * Extracts metadata from an audio file buffer
 */
export async function extractAudioMetadata(
  buffer: Buffer
): Promise<AudioMetadata> {
  try {
    const metadata = await parseBuffer(buffer, { skipCovers: true });

    return {
      duration: metadata.format.duration || 0,
      bitrate: metadata.format.bitrate || 0,
      sampleRate: metadata.format.sampleRate || 44100,
      format: metadata.format.container || 'unknown',
      title: metadata.common.title,
      artist: metadata.common.artist,
      album: metadata.common.album,
      year: metadata.common.year,
      genre: metadata.common.genre,
    };
  } catch (error) {
    console.error('Error extracting audio metadata:', error);
    throw new FileUploadError('Failed to extract audio metadata');
  }
}

/**
 * Validates audio file duration (max 15 minutes)
 */
export function validateAudioDuration(duration: number): boolean {
  const MAX_DURATION = 15 * 60; // 15 minutes in seconds
  return duration > 0 && duration <= MAX_DURATION;
}

/**
 * Validates audio bitrate (min 128 kbps, max 320 kbps)
 */
export function validateAudioBitrate(bitrate: number): boolean {
  const MIN_BITRATE = 128000; // 128 kbps in bps
  const MAX_BITRATE = 320000; // 320 kbps in bps
  return bitrate >= MIN_BITRATE && bitrate <= MAX_BITRATE;
}

/**
 * Formats bitrate for display
 */
export function formatBitrate(bitrate: number): string {
  return `${Math.round(bitrate / 1000)} kbps`;
}

/**
 * Formats sample rate for display
 */
export function formatSampleRate(sampleRate: number): string {
  if (sampleRate >= 1000) {
    return `${(sampleRate / 1000).toFixed(1)} kHz`;
  }
  return `${sampleRate} Hz`;
}

/**
 * Gets audio format icon/label
 */
export function getAudioFormatLabel(format: string): string {
  const formats: Record<string, string> = {
    'mp3': 'MP3',
    'mpeg': 'MP3',
    'wav': 'WAV',
    'wave': 'WAV',
    'ogg': 'OGG',
    'flac': 'FLAC',
    'm4a': 'M4A',
    'aac': 'AAC',
  };

  return formats[format.toLowerCase()] || format.toUpperCase();
}

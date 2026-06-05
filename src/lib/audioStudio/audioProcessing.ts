import { AudioEditorState } from '@/lib/audioStudio/editorState';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function extractWaveformPeaks(audioBuffer: AudioBuffer, targetPoints = 480): number[] {
  const channelData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / targetPoints) || 1;
  const peaks: number[] = [];

  for (let index = 0; index < targetPoints; index += 1) {
    const start = index * blockSize;
    const end = Math.min(start + blockSize, channelData.length);
    let peak = 0;

    for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
      peak = Math.max(peak, Math.abs(channelData[sampleIndex]));
    }

    peaks.push(peak);
  }

  return peaks;
}

export async function renderEditedAudio(
  sourceBuffer: AudioBuffer,
  editState: AudioEditorState,
): Promise<AudioBuffer> {
  const sampleRate = sourceBuffer.sampleRate;
  const trimStart = clamp(editState.trimStart, 0, sourceBuffer.duration);
  const trimEnd = clamp(editState.trimEnd, trimStart, sourceBuffer.duration);
  const segmentDuration = Math.max(trimEnd - trimStart, 0.05);
  const frameCount = Math.ceil(segmentDuration * sampleRate);

  const offlineContext = new OfflineAudioContext(sourceBuffer.numberOfChannels, frameCount, sampleRate);
  const source = offlineContext.createBufferSource();
  source.buffer = sourceBuffer;

  const gain = offlineContext.createGain();
  const normalizedVolume = clamp(editState.volume, 0, 2);
  gain.gain.setValueAtTime(normalizedVolume, 0);

  const fadeIn = clamp(editState.fadeIn, 0, segmentDuration);
  if (fadeIn > 0) {
    gain.gain.setValueAtTime(0.0001, 0);
    gain.gain.linearRampToValueAtTime(normalizedVolume, fadeIn);
  }

  const fadeOut = clamp(editState.fadeOut, 0, segmentDuration);
  if (fadeOut > 0) {
    const fadeOutStart = Math.max(segmentDuration - fadeOut, 0);
    gain.gain.setValueAtTime(normalizedVolume, fadeOutStart);
    gain.gain.linearRampToValueAtTime(0.0001, segmentDuration);
  }

  source.connect(gain);
  gain.connect(offlineContext.destination);
  source.start(0, trimStart, segmentDuration);

  return offlineContext.startRendering();
}

export function audioBufferToWavBlob(audioBuffer: AudioBuffer): Blob {
  const channelCount = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const bytesPerSample = 2;
  const blockAlign = channelCount * bytesPerSample;
  const dataLength = audioBuffer.length * blockAlign;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  const channels = Array.from({ length: channelCount }, (_, index) => audioBuffer.getChannelData(index));
  let offset = 44;

  for (let frame = 0; frame < audioBuffer.length; frame += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = clamp(channels[channel][frame], -1, 1);
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += bytesPerSample;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

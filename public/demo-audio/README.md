# Demo Audio Files

This directory contains demo audio samples used when no music generation API keys are configured.

## Default Demo Files

The following demo files should be placed in this directory:

- `piano-demo.mp3` - Piano sample track
- `drums-demo.mp3` - Drums sample track
- `synth-demo.mp3` - Synthesizer sample track
- `guitar-demo.mp3` - Guitar sample track
- `bass-demo.mp3` - Bass sample track

## Usage

These files are referenced in `/src/lib/aiConfig.ts` and served when users generate music in demo mode.

## Creating Demo Files

You can use any short (10-30 second) audio clips representing different instruments. Ensure they are:
- MP3 format
- Small file size (< 1MB each recommended)
- Copyright-free or your own recordings
- Clearly demonstrate the instrument sound

## Note for Production

In production, you may want to:
1. Use actual professional samples
2. Host them on a CDN
3. Or disable demo mode entirely and require API keys

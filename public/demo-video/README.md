# Demo Video Files

This directory should contain demo video files for testing the video generation feature in demo mode.

## Required Files

The following demo video files are referenced in the application:

1. `abstract-demo.mp4` - Abstract style demo video
2. `nature-demo.mp4` - Nature style demo video  
3. `urban-demo.mp4` - Urban style demo video

## Creating Demo Videos

You can create simple demo videos using any of these methods:

### Option 1: Using FFmpeg (Command Line)

Create a simple colored video with text:

```bash
# Abstract demo (purple/pink gradient)
ffmpeg -f lavfi -i color=c=purple:s=1920x1080:d=10 -vf "drawtext=text='Abstract Demo Video':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" -c:v libx264 -pix_fmt yuv420p abstract-demo.mp4

# Nature demo (green)
ffmpeg -f lavfi -i color=c=green:s=1920x1080:d=10 -vf "drawtext=text='Nature Demo Video':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" -c:v libx264 -pix_fmt yuv420p nature-demo.mp4

# Urban demo (gray/blue)
ffmpeg -f lavfi -i color=c=gray:s=1920x1080:d=10 -vf "drawtext=text='Urban Demo Video':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" -c:v libx264 -pix_fmt yuv420p urban-demo.mp4
```

### Option 2: Using Online Tools

1. Use a tool like Canva, Adobe Express, or Kapwing
2. Create a 10-second video with animated text or simple graphics
3. Export as MP4 format
4. Save with the filenames listed above

### Option 3: Use Existing Videos

You can use any existing video files you have:
1. Ensure they are in MP4 format
2. Rename them to match the expected filenames
3. Place them in this directory

## Video Specifications

- **Format**: MP4 (H.264)
- **Resolution**: 1920x1080 (1080p) recommended
- **Duration**: 10-30 seconds is sufficient for demo
- **File Size**: Keep under 5MB for faster loading

## Testing Without Demo Videos

If demo video files are not present, the application will still work but may show broken video links in demo mode. To test without videos:

1. Configure real video API keys in `.env`
2. Or disable video generation feature temporarily
3. Or create placeholder videos using the methods above

## Note

These demo videos are only used when no video generation API is configured. When a real video API (Replicate, Runway, etc.) is configured with valid keys, the application will use that API instead of these demo files.

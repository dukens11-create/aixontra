import sharp from 'sharp';
import { FileUploadError } from './errors';

/**
 * Optimizes an image for web use
 */
export async function optimizeImage(
  buffer: Buffer,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  } = {}
): Promise<Buffer> {
  const {
    width = 1200,
    height,
    quality = 85,
    format = 'webp',
  } = options;

  try {
    let transformer = sharp(buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
        withoutEnlargement: true,
      });

    switch (format) {
      case 'jpeg':
        transformer = transformer.jpeg({ quality, progressive: true });
        break;
      case 'png':
        transformer = transformer.png({ quality, compressionLevel: 9 });
        break;
      case 'webp':
      default:
        transformer = transformer.webp({ quality });
        break;
    }

    return await transformer.toBuffer();
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw new FileUploadError('Failed to optimize image');
  }
}

/**
 * Creates a thumbnail from an image
 */
export async function createThumbnail(
  buffer: Buffer,
  size: number = 300
): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 80 })
      .toBuffer();
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    throw new FileUploadError('Failed to create thumbnail');
  }
}

/**
 * Validates image dimensions
 */
export async function getImageDimensions(
  buffer: Buffer
): Promise<{ width: number; height: number }> {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
    };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    throw new FileUploadError('Failed to read image metadata');
  }
}

/**
 * Validates if buffer is a valid image
 */
export async function isValidImage(buffer: Buffer): Promise<boolean> {
  try {
    await sharp(buffer).metadata();
    return true;
  } catch {
    return false;
  }
}

/**
 * Converts image to a specific format
 */
export async function convertImageFormat(
  buffer: Buffer,
  format: 'jpeg' | 'png' | 'webp',
  quality: number = 85
): Promise<Buffer> {
  try {
    let transformer = sharp(buffer);

    switch (format) {
      case 'jpeg':
        transformer = transformer.jpeg({ quality, progressive: true });
        break;
      case 'png':
        transformer = transformer.png({ quality, compressionLevel: 9 });
        break;
      case 'webp':
        transformer = transformer.webp({ quality });
        break;
    }

    return await transformer.toBuffer();
  } catch (error) {
    console.error('Error converting image format:', error);
    throw new FileUploadError('Failed to convert image format');
  }
}

// Image processing helpers for uploads.
// Customization:
// - MAX_OUTPUT_PIXELS controls the target resolution cap (12MP by default)
// - TARGET_IMAGE_BYTES controls the target encoded file size (~5MB by default)
// - OUTPUT_IMAGE_TYPE changes the stored format; WebP keeps quality high and strips metadata
// - QUALITY_STEPS changes how aggressively we compress before shrinking dimensions

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import heic2anyModule from 'heic2any';

const heic2any = (heic2anyModule as any).default || heic2anyModule;

export const SUPPORTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/svg+xml',
  'image/avif',
  'image/tiff',
  'image/heic',
  'image/heif',
]);

export const SUPPORTED_IMAGE_FORMAT_LABEL =
  'JPG, PNG, WebP, GIF, BMP, SVG, AVIF, TIFF, HEIC/HEIF';

const HEIC_EXTENSIONS = ['.heic', '.heif'];

// Resolution cap — 12MP keeps phone photos sharp without storing full 50MP originals
const MAX_OUTPUT_PIXELS = 12_000_000;
// Target encoded size — around 5MB per stored image
const TARGET_IMAGE_BYTES = 5 * 1024 * 1024;
// Stored format — WebP preserves transparency better than JPEG and strips metadata on re-encode
const OUTPUT_IMAGE_TYPE = 'image/webp';
// Compression ladder — lower values mean smaller files with more artifacts
const QUALITY_STEPS = [0.92, 0.88, 0.84, 0.8, 0.76, 0.72, 0.68];
// Extra downscale step if quality alone is not enough
const SCALE_STEP = 0.9;
const MAX_SCALE_ATTEMPTS = 4;

const readBlobAsDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read processed image.'));
    reader.readAsDataURL(blob);
  });

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error('Failed to encode processed image.'));
    }, type, quality);
  });

const loadImageFromBlob = (blob: Blob) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode image.'));
    };
    img.src = objectUrl;
  });

const drawToCanvas = (img: HTMLImageElement, width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // Re-drawing to canvas strips camera metadata/EXIF from the stored result.
  ctx.drawImage(img, 0, 0, width, height);

  return canvas;
};

const optimizeImageBlob = async (blob: Blob) => {
  const img = await loadImageFromBlob(blob);
  const sourceWidth = img.naturalWidth || img.width;
  const sourceHeight = img.naturalHeight || img.height;
  const sourcePixels = sourceWidth * sourceHeight;
  const pixelScale = sourcePixels > MAX_OUTPUT_PIXELS
    ? Math.sqrt(MAX_OUTPUT_PIXELS / sourcePixels)
    : 1;

  let width = Math.max(1, Math.round(sourceWidth * pixelScale));
  let height = Math.max(1, Math.round(sourceHeight * pixelScale));
  let bestBlob: Blob | null = null;

  for (let scaleAttempt = 0; scaleAttempt < MAX_SCALE_ATTEMPTS; scaleAttempt += 1) {
    const canvas = drawToCanvas(img, width, height);

    for (const quality of QUALITY_STEPS) {
      const encodedBlob = await canvasToBlob(canvas, OUTPUT_IMAGE_TYPE, quality);
      bestBlob = encodedBlob;

      if (encodedBlob.size <= TARGET_IMAGE_BYTES) {
        return readBlobAsDataUrl(encodedBlob);
      }
    }

    width = Math.max(1, Math.round(width * SCALE_STEP));
    height = Math.max(1, Math.round(height * SCALE_STEP));
  }

  return readBlobAsDataUrl(bestBlob ?? blob);
};

const convertHeicFile = async (file: File) => {
  try {
    const { heicTo } = await import('heic-to/csp');
    return await heicTo({ blob: file, type: 'image/jpeg', quality: 0.96 });
  } catch {
    const fallbackBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.96 });
    return Array.isArray(fallbackBlob) ? fallbackBlob[0] : fallbackBlob;
  }
};

export const isHeicLike = (file: File) => {
  const lowerName = file.name.toLowerCase();
  return HEIC_EXTENSIONS.some((extension) => lowerName.endsWith(extension))
    || file.type === 'image/heic'
    || file.type === 'image/heif';
};

export const isSupportedImage = (file: File) => file.type.startsWith('image/') || SUPPORTED_IMAGE_TYPES.has(file.type) || isHeicLike(file);

export const normalizeImageFile = async (file: File) => {
  const normalizedBlob = isHeicLike(file)
    ? await convertHeicFile(file)
    : file;

  return optimizeImageBlob(normalizedBlob);
};

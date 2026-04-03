import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ClothingCategory } from '@/types/closet';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/types/closet';
import {
  isHeicLike,
  isSupportedImage,
  normalizeImageFile,
  SUPPORTED_IMAGE_FORMAT_LABEL,
} from '@/lib/image-processing';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (data: { name: string; category: ClothingCategory; imageData: string }) => void;
}

export function UploadModal({ open, onClose, onUpload }: UploadModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('tops');
  const [imageData, setImageData] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setFileError(null);
    setConverting(true);

    if (!isSupportedImage(file)) {
      setFileError(`"${file.type || 'unknown'}" is not a supported image format. Supported: ${SUPPORTED_IMAGE_FORMAT_LABEL}.`);
      setConverting(false);
      return;
    }

    try {
      const normalizedImage = await normalizeImageFile(file);
      setImageData(normalizedImage);
    } catch (error) {
      console.error('Image processing failed:', error);
      setFileError(
        isHeicLike(file)
          ? 'Failed to convert HEIC/HEIF file. Please try another image or convert it manually to JPG.'
          : 'Failed to process the selected image. Please try another photo.'
      );
    } finally {
      setConverting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = () => {
    if (!imageData || !name.trim()) return;
    onUpload({ name: name.trim(), category, imageData });
    setName('');
    setCategory('tops');
    setImageData(null);
    setFileError(null);
    onClose();
  };

  const reset = () => {
    setName('');
    setCategory('tops');
    setImageData(null);
    setFileError(null);
    setConverting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={reset} />
          <motion.div
            className="relative z-10 w-full max-w-md rounded-2xl bg-card p-6 shadow-float"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-heading font-semibold text-foreground">Add to Closet</h2>
              <button onClick={reset} className="rounded-full p-1 transition-colors hover:bg-muted">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {fileError && (
              <Alert variant="destructive" className="mb-4 rounded-xl">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">{fileError}</AlertDescription>
              </Alert>
            )}

            <div
              className={`relative mb-4 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
                dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              } ${imageData ? 'h-48' : 'h-36'}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              {converting ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm font-medium">{imageData ? 'Re-processing image…' : 'Processing image…'}</span>
                  <span className="text-xs text-muted-foreground/70">High-res photos are resized to about 12MP and stripped of metadata.</span>
                </div>
              ) : imageData ? (
                <img src={imageData} alt="Preview" className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Upload className="h-8 w-8" />
                  <span className="text-sm font-medium">Drop a photo or tap to browse</span>
                  <span className="text-xs text-muted-foreground/70">Supported: {SUPPORTED_IMAGE_FORMAT_LABEL}</span>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml,image/avif,image/tiff,image/heic,image/heif,.heic,.heif"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>

            <div className="space-y-3">
              <Input
                placeholder="Item name (e.g. Blue denim jacket)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl bg-background"
              />
              <Select value={category} onValueChange={(v) => setCategory(v as ClothingCategory)}>
                <SelectTrigger className="rounded-xl bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_ORDER.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleSubmit}
                disabled={!imageData || !name.trim() || converting}
                className="w-full rounded-xl font-semibold"
              >
                Add Item
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

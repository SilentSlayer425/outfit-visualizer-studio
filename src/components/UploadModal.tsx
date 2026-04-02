import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import heic2anyModule from 'heic2any';
const heic2any = (heic2anyModule as any).default || heic2anyModule;
import type { ClothingCategory } from '@/types/closet';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/types/closet';

// Supported image MIME types — add more here if needed
const SUPPORTED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp',
  'image/svg+xml', 'image/avif', 'image/tiff',
  'image/heic', 'image/heif',
]);

// Extensions that need client-side conversion via heic2any
const HEIC_EXTENSIONS = ['.heic', '.heif'];

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
    const ext = file.name.toLowerCase();

    // Convert HEIC/HEIF to JPEG using heic2any
    if (HEIC_EXTENSIONS.some(u => ext.endsWith(u)) || file.type === 'image/heic' || file.type === 'image/heif') {
      setConverting(true);
      try {
        const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
        const resultBlob = Array.isArray(blob) ? blob[0] : blob;
        const reader = new FileReader();
        reader.onload = (e) => { setImageData(e.target?.result as string); setConverting(false); };
        reader.onerror = () => { setFileError('Failed to convert HEIC file.'); setConverting(false); };
        reader.readAsDataURL(resultBlob);
      } catch {
        setFileError('Failed to convert HEIC/HEIF file. Please try converting it manually to JPG.');
        setConverting(false);
      }
      return;
    }

    // Check MIME type
    if (!file.type.startsWith('image/') && !SUPPORTED_TYPES.has(file.type)) {
      setFileError(
        `"${file.type || 'unknown'}" is not a supported image format. Supported: JPG, PNG, WebP, GIF, BMP, SVG, AVIF, TIFF, HEIC/HEIF.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setImageData(e.target?.result as string);
    reader.onerror = () => setFileError('Failed to read the file. Please try again.');
    reader.readAsDataURL(file);
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
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-heading font-semibold text-foreground">Add to Closet</h2>
              <button onClick={reset} className="p-1 rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Unsupported format alert */}
            {fileError && (
              <Alert variant="destructive" className="mb-4 rounded-xl">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">{fileError}</AlertDescription>
              </Alert>
            )}

            {/* Drop zone — accepts common image formats + HEIC/HEIF (auto-converted) */}
            <div
              className={`relative mb-4 rounded-xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden ${
                dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              } ${imageData ? 'h-48' : 'h-36'}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              {converting ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-sm font-medium">Converting HEIC…</span>
                </div>
              ) : imageData ? (
                <img src={imageData} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                  <Upload className="w-8 h-8" />
                  <span className="text-sm font-medium">Drop a photo or tap to browse</span>
                  <span className="text-xs text-muted-foreground/70">JPG, PNG, WebP, GIF, HEIC/HEIF, BMP, AVIF, TIFF</span>
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
                disabled={!imageData || !name.trim()}
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

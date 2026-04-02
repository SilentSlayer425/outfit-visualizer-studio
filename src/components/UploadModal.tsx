import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ClothingCategory } from '@/types/closet';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/types/closet';

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
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setImageData(e.target?.result as string);
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
    onClose();
  };

  const reset = () => {
    setName('');
    setCategory('tops');
    setImageData(null);
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

            {/* Drop zone */}
            <div
              className={`relative mb-4 rounded-xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden ${
                dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              } ${imageData ? 'h-48' : 'h-36'}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              {imageData ? (
                <img src={imageData} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                  <Upload className="w-8 h-8" />
                  <span className="text-sm font-medium">Drop a photo or tap to browse</span>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
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

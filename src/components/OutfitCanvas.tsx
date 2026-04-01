import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Trash2, Plus, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ClothingItem, OutfitItem } from '@/types/closet';

interface OutfitCanvasProps {
  outfitItems: OutfitItem[];
  getItemById: (id: string) => ClothingItem | undefined;
  onUpdateItem: (index: number, updates: Partial<OutfitItem>) => void;
  onRemoveItem: (index: number) => void;
  onSave: (name: string) => void;
}

export function OutfitCanvas({ outfitItems, getItemById, onUpdateItem, onRemoveItem, onSave }: OutfitCanvasProps) {
  const [outfitName, setOutfitName] = useState('');
  const [dragging, setDragging] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleDragEnd = useCallback((index: number, info: any) => {
    onUpdateItem(index, {
      x: outfitItems[index].x + info.offset.x,
      y: outfitItems[index].y + info.offset.y,
    });
    setDragging(null);
  }, [outfitItems, onUpdateItem]);

  const handleScale = (index: number, delta: number) => {
    const current = outfitItems[index].scale;
    onUpdateItem(index, { scale: Math.max(0.3, Math.min(2.5, current + delta)) });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Canvas area */}
      <div className="relative flex-1 rounded-2xl bg-card shadow-soft overflow-hidden min-h-[400px]"
        onClick={() => setSelectedIdx(null)}
      >
        {/* Mannequin silhouette guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06]">
          <svg viewBox="0 0 200 500" className="h-[80%]">
            <ellipse cx="100" cy="50" rx="30" ry="40" fill="currentColor" />
            <rect x="70" y="90" width="60" height="120" rx="10" fill="currentColor" />
            <rect x="50" y="210" width="40" height="140" rx="8" fill="currentColor" />
            <rect x="110" y="210" width="40" height="140" rx="8" fill="currentColor" />
            <rect x="55" y="350" width="35" height="30" rx="6" fill="currentColor" />
            <rect x="110" y="350" width="35" height="30" rx="6" fill="currentColor" />
          </svg>
        </div>

        {outfitItems.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <Plus className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm font-medium">Select items from your closet</p>
            <p className="text-xs mt-1">Drag to position, resize with controls</p>
          </div>
        )}

        {outfitItems.map((oi, idx) => {
          const item = getItemById(oi.clothingId);
          if (!item) return null;
          const isSelected = selectedIdx === idx;
          return (
            <motion.div
              key={`${oi.clothingId}-${idx}`}
              className={`absolute cursor-grab active:cursor-grabbing ${
                isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''
              }`}
              style={{
                zIndex: oi.zIndex + (dragging === idx ? 100 : 0),
                width: `${120 * oi.scale}px`,
                left: '50%',
                top: '50%',
              }}
              initial={false}
              animate={{
                x: oi.x - (120 * oi.scale) / 2,
                y: oi.y - (120 * oi.scale) / 2,
              }}
              drag
              dragMomentum={false}
              onDragStart={() => { setDragging(idx); setSelectedIdx(idx); }}
              onDragEnd={(_, info) => handleDragEnd(idx, info)}
              onClick={(e) => { e.stopPropagation(); setSelectedIdx(idx); }}
            >
              <img
                src={item.imageData}
                alt={item.name}
                className="w-full h-auto object-contain pointer-events-none"
                draggable={false}
              />
              {isSelected && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-1 bg-card rounded-full shadow-float p-1">
                  <button onClick={() => handleScale(idx, -0.15)} className="p-1 rounded-full hover:bg-muted">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleScale(idx, 0.15)} className="p-1 rounded-full hover:bg-muted">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button onClick={() => { onRemoveItem(idx); setSelectedIdx(null); }}
                    className="p-1 rounded-full hover:bg-destructive hover:text-destructive-foreground">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Save bar */}
      {outfitItems.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex gap-2 mt-4"
        >
          <Input
            placeholder="Name this outfit..."
            value={outfitName}
            onChange={(e) => setOutfitName(e.target.value)}
            className="rounded-xl bg-card flex-1"
          />
          <Button
            onClick={() => { if (outfitName.trim()) { onSave(outfitName.trim()); setOutfitName(''); } }}
            disabled={!outfitName.trim()}
            className="rounded-xl px-6"
          >
            <Save className="w-4 h-4 mr-2" /> Save
          </Button>
        </motion.div>
      )}
    </div>
  );
}

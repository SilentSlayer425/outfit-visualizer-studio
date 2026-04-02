/**
 * Outfit Canvas
 * 
 * Drag-and-drop canvas for building outfits.
 * Items follow the mouse exactly (no snapping) and can't leave the canvas.
 * Arrow keys move the selected item. Items are placed at smart positions
 * based on their clothing category.
 * 
 * Customization:
 *  - Canvas height: change CANVAS_MIN_HEIGHT in src/config.ts
 *  - Arrow key speed: change ARROW_KEY_STEP in src/config.ts
 *  - Item size: change ITEM_BASE_SIZE in src/config.ts
 *  - Zoom range: change ITEM_MIN_SCALE / ITEM_MAX_SCALE in src/config.ts
 *  - Smart placement positions: change CATEGORY_Y_DEFAULTS in src/config.ts
 *  - Canvas background color: change bg-card below
 *  - Canvas corner roundness: change rounded-2xl below
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Trash2, Plus, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CANVAS_MIN_HEIGHT,
  ARROW_KEY_STEP,
  ITEM_MIN_SCALE,
  ITEM_MAX_SCALE,
  SCALE_STEP,
  ITEM_BASE_SIZE,
} from '@/config';
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
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [dragging, setDragging] = useState<{ idx: number; startX: number; startY: number; itemX: number; itemY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // ── Mouse / touch drag (no snapping, stays under cursor) ──
  const handlePointerDown = useCallback((e: React.PointerEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIdx(idx);
    setDragging({
      idx,
      startX: e.clientX,
      startY: e.clientY,
      itemX: outfitItems[idx].x,
      itemY: outfitItems[idx].y,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [outfitItems]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !canvasRef.current) return;
    const canvas = canvasRef.current.getBoundingClientRect();
    const item = outfitItems[dragging.idx];
    const halfW = (ITEM_BASE_SIZE * item.scale) / 2;
    const halfH = (ITEM_BASE_SIZE * item.scale) / 2;

    let newX = dragging.itemX + (e.clientX - dragging.startX);
    let newY = dragging.itemY + (e.clientY - dragging.startY);

    // Constrain to canvas bounds
    const maxX = canvas.width / 2 - halfW;
    const maxY = canvas.height / 2 - halfH;
    newX = Math.max(-maxX, Math.min(maxX, newX));
    newY = Math.max(-maxY, Math.min(maxY, newY));

    onUpdateItem(dragging.idx, { x: newX, y: newY });
  }, [dragging, outfitItems, onUpdateItem]);

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  // ── Arrow key movement ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIdx === null || !canvasRef.current) return;
      const item = outfitItems[selectedIdx];
      if (!item) return;

      let dx = 0, dy = 0;
      // Arrow keys: move selected item by ARROW_KEY_STEP pixels
      if (e.key === 'ArrowLeft') dx = -ARROW_KEY_STEP;
      else if (e.key === 'ArrowRight') dx = ARROW_KEY_STEP;
      else if (e.key === 'ArrowUp') dy = -ARROW_KEY_STEP;
      else if (e.key === 'ArrowDown') dy = ARROW_KEY_STEP;
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        onRemoveItem(selectedIdx);
        setSelectedIdx(null);
        return;
      }
      else return;

      e.preventDefault();
      const canvas = canvasRef.current.getBoundingClientRect();
      const halfW = (ITEM_BASE_SIZE * item.scale) / 2;
      const halfH = (ITEM_BASE_SIZE * item.scale) / 2;
      const maxX = canvas.width / 2 - halfW;
      const maxY = canvas.height / 2 - halfH;
      const newX = Math.max(-maxX, Math.min(maxX, item.x + dx));
      const newY = Math.max(-maxY, Math.min(maxY, item.y + dy));
      onUpdateItem(selectedIdx, { x: newX, y: newY });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, outfitItems, onUpdateItem, onRemoveItem]);

  const handleScale = (index: number, delta: number) => {
    const current = outfitItems[index].scale;
    onUpdateItem(index, { scale: Math.max(ITEM_MIN_SCALE, Math.min(ITEM_MAX_SCALE, current + delta)) });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Canvas area — change bg-card for background, rounded-2xl for corners */}
      <div
        ref={canvasRef}
        className="relative flex-1 rounded-2xl bg-card shadow-soft overflow-hidden"
        style={{ minHeight: `${CANVAS_MIN_HEIGHT}px` }}
        onClick={() => setSelectedIdx(null)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Mannequin silhouette — change opacity-[0.06] to make more/less visible */}
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
            <p className="text-xs mt-1">Drag to position · Arrow keys to nudge · Delete to remove</p>
          </div>
        )}

        {outfitItems.map((oi, idx) => {
          const item = getItemById(oi.clothingId);
          if (!item) return null;
          const isSelected = selectedIdx === idx;
          const size = ITEM_BASE_SIZE * oi.scale;

          return (
            <div
              key={`${oi.clothingId}-${idx}`}
              className={`absolute cursor-grab active:cursor-grabbing select-none ${
                isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''
              }`}
              style={{
                // Position items from canvas center
                left: `calc(50% + ${oi.x}px - ${size / 2}px)`,
                top: `calc(50% + ${oi.y}px - ${size / 2}px)`,
                width: `${size}px`,
                zIndex: oi.zIndex + (dragging?.idx === idx ? 100 : 0),
                touchAction: 'none',
              }}
              onPointerDown={(e) => handlePointerDown(e, idx)}
              onClick={(e) => { e.stopPropagation(); setSelectedIdx(idx); }}
            >
              <img
                src={item.imageData}
                alt={item.name}
                className="w-full h-auto object-contain pointer-events-none"
                draggable={false}
              />
              {/* Item controls — appear when selected */}
              {isSelected && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-1 bg-card rounded-full shadow-float p-1 z-50">
                  {/* Zoom out button */}
                  <button onClick={(e) => { e.stopPropagation(); handleScale(idx, -SCALE_STEP); }}
                    className="p-1 rounded-full hover:bg-muted">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  {/* Zoom in button */}
                  <button onClick={(e) => { e.stopPropagation(); handleScale(idx, SCALE_STEP); }}
                    className="p-1 rounded-full hover:bg-muted">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  {/* Delete button — change hover:bg-destructive for different delete color */}
                  <button onClick={(e) => { e.stopPropagation(); onRemoveItem(idx); setSelectedIdx(null); }}
                    className="p-1 rounded-full hover:bg-destructive hover:text-destructive-foreground">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save bar — appears when items are on canvas */}
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

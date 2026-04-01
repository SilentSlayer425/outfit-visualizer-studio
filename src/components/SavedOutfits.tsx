import { motion } from 'framer-motion';
import { Trash2, Calendar, Heart } from 'lucide-react';
import type { Outfit, ClothingItem } from '@/types/closet';

interface SavedOutfitsProps {
  outfits: Outfit[];
  getItemById: (id: string) => ClothingItem | undefined;
  onRemove: (id: string) => void;
}

export function SavedOutfits({ outfits, getItemById, onRemove }: SavedOutfitsProps) {
  if (outfits.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-lg font-medium">No saved outfits yet</p>
        <p className="text-sm mt-1">Build and save outfits in the builder!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {outfits.map((outfit, i) => (
        <motion.div
          key={outfit.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="group relative rounded-2xl bg-card shadow-soft overflow-hidden"
        >
          <div className="relative h-48 bg-muted/30 flex items-center justify-center gap-1 p-4 overflow-hidden">
            {outfit.items.slice(0, 5).map((oi, idx) => {
              const item = getItemById(oi.clothingId);
              if (!item) return null;
              return (
                <img key={idx} src={item.imageData} alt={item.name} className="h-24 w-auto object-contain" />
              );
            })}
            {outfit.items.length === 0 && <p className="text-xs text-muted-foreground">Empty outfit</p>}
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-semibold text-foreground">{outfit.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                {new Date(outfit.createdAt).toLocaleDateString()}
                <span className="mx-1">·</span>
                {outfit.items.length} items
              </p>
            </div>
            <button
              onClick={() => onRemove(outfit.id)}
              className="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Saved Outfits
 *
 * Shows saved outfits as cards. Hovering items shows their name.
 * "Load" button reloads the outfit into the builder.
 *
 * Customization:
 *  - Card columns: change sm:grid-cols-2
 *  - Preview height: change h-48
 *  - Card corners: change rounded-2xl
 */
import { motion } from 'framer-motion';
import { Trash2, Calendar, Heart, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Outfit, ClothingItem } from '@/types/closet';

interface SavedOutfitsProps {
  outfits: Outfit[];
  getItemById: (id: string) => ClothingItem | undefined;
  onRemove: (id: string) => void;
  onLoad?: (outfit: Outfit) => void;
}

export function SavedOutfits({ outfits, getItemById, onRemove, onLoad }: SavedOutfitsProps) {
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
          {/* Outfit preview — items shown with hover tooltip for names */}
          <div className="relative h-48 bg-muted/30 flex items-center justify-center gap-1 p-4 overflow-hidden">
            {outfit.items.slice(0, 5).map((oi, idx) => {
              const item = getItemById(oi.clothingId);
              if (!item) return null;
              return (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <img
                      src={item.imageData}
                      alt={item.name}
                      className="h-24 w-auto object-contain cursor-pointer hover:scale-110 transition-transform"
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs font-medium">{item.name}</p>
                  </TooltipContent>
                </Tooltip>
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
            <div className="flex gap-1">
              {/* Load into builder button */}
              {onLoad && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLoad(outfit)}
                  className="rounded-full px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Load into builder"
                >
                  <RotateCcw className="w-4 h-4 mr-1" /> Load
                </Button>
              )}
              {/* Delete button */}
              <button
                onClick={() => onRemove(outfit.id)}
                className="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

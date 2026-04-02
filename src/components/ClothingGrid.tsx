/**
 * Clothing Grid
 * 
 * Displays uploaded clothing items in a filterable grid.
 * 
 * Customization:
 *  - Grid columns: change GRID_COLS in src/config.ts
 *  - Item animation speed: change GRID_ITEM_STAGGER in src/config.ts
 *  - Card shape: change rounded-xl below for more/less rounding
 *  - Card shadow: change shadow-soft to shadow-card or shadow-float for more depth
 *  - Image aspect ratio: change aspect-square to aspect-[3/4] for taller cards
 *  - Category pill colors: change bg-primary / bg-secondary in CategoryPill
 */
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import type { ClothingItem, ClothingCategory } from '@/types/closet';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/types/closet';
import { GRID_COLS, GRID_ITEM_STAGGER } from '@/config';

interface ClothingGridProps {
  items: ClothingItem[];
  activeCategory: ClothingCategory | 'all';
  onCategoryChange: (cat: ClothingCategory | 'all') => void;
  onRemove: (id: string) => void;
  onSelect?: (item: ClothingItem) => void;
  selectable?: boolean;
}

export function ClothingGrid({
  items, activeCategory, onCategoryChange, onRemove, onSelect, selectable,
}: ClothingGridProps) {
  const filtered = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory);

  return (
    <div>
      {/* Category filter pills — scrollable row */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <CategoryPill label="All" active={activeCategory === 'all'} onClick={() => onCategoryChange('all')} />
        {CATEGORY_ORDER.map((cat) => (
          <CategoryPill
            key={cat}
            label={CATEGORY_LABELS[cat]}
            active={activeCategory === cat}
            onClick={() => onCategoryChange(cat)}
            count={items.filter(i => i.category === cat).length}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Nothing here yet</p>
          <p className="text-sm mt-1">Upload some items to get started!</p>
        </div>
      ) : (
        /* Grid — column count set in config.ts via GRID_COLS */
        <div className={`grid ${GRID_COLS} gap-3`}>
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * GRID_ITEM_STAGGER }}
              /* Card shape: rounded-xl | shadow: shadow-soft */
              className={`group relative rounded-xl overflow-hidden bg-card shadow-soft ${
                selectable ? 'cursor-pointer hover:shadow-card transition-shadow' : ''
              }`}
              onClick={() => selectable && onSelect?.(item)}
            >
              {/* Image container — aspect-square for 1:1 ratio */}
              <div className="aspect-square p-2">
                <img src={item.imageData} alt={item.name} className="w-full h-full object-contain" />
              </div>
              <div className="px-3 pb-3">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[item.category]}</p>
              </div>
              {!selectable && (
                /* Delete button — appears on hover */
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-card/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Category filter pill button
 * Customization:
 *  - Active color: change bg-primary → any color token
 *  - Inactive color: change bg-secondary
 *  - Shape: change rounded-full → rounded-xl for less rounding
 *  - Size: change px-4 py-2 for padding, text-sm for font size
 */
function CategoryPill({ label, active, onClick, count }: {
  label: string; active: boolean; onClick: () => void; count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
        active
          ? 'bg-primary text-primary-foreground shadow-soft'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className="ml-1.5 text-xs opacity-70">{count}</span>
      )}
    </button>
  );
}

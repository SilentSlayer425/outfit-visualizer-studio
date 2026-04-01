import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import type { ClothingItem, ClothingCategory } from '@/types/closet';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/types/closet';

interface ClothingGridProps {
  items: ClothingItem[];
  activeCategory: ClothingCategory | 'all';
  onCategoryChange: (cat: ClothingCategory | 'all') => void;
  onRemove: (id: string) => void;
  onSelect?: (item: ClothingItem) => void;
  selectable?: boolean;
}

export function ClothingGrid({
  items,
  activeCategory,
  onCategoryChange,
  onRemove,
  onSelect,
  selectable,
}: ClothingGridProps) {
  const filtered = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory);

  return (
    <div>
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <CategoryPill
          label="All"
          active={activeCategory === 'all'}
          onClick={() => onCategoryChange('all')}
        />
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`group relative rounded-xl overflow-hidden bg-card shadow-soft ${
                selectable ? 'cursor-pointer hover:shadow-card transition-shadow' : ''
              }`}
              onClick={() => selectable && onSelect?.(item)}
            >
              <div className="aspect-square p-2">
                <img
                  src={item.imageData}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="px-3 pb-3">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[item.category]}</p>
              </div>
              {!selectable && (
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

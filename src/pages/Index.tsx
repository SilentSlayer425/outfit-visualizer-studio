import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCloset } from '@/hooks/useCloset';
import { AppNav } from '@/components/AppNav';
import { UploadModal } from '@/components/UploadModal';
import { ClothingGrid } from '@/components/ClothingGrid';
import { OutfitCanvas } from '@/components/OutfitCanvas';
import { SavedOutfits } from '@/components/SavedOutfits';
import type { ClothingCategory, ClothingItem, OutfitItem } from '@/types/closet';

type Tab = 'closet' | 'builder' | 'outfits';

const CATEGORY_Y_DEFAULTS: Partial<Record<ClothingCategory, number>> = {
  tops: -80,
  outerwear: -70,
  bottoms: 40,
  dresses: -20,
  shoes: 140,
  accessories: -120,
  bags: 60,
  jewelry: -130,
};

export default function Index() {
  const { items, outfits, addItem, removeItem, getItemsByCategory, saveOutfit, removeOutfit, getItemById } = useCloset();
  const [tab, setTab] = useState<Tab>('closet');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ClothingCategory | 'all'>('all');

  // Outfit builder state
  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([]);

  const handleUpload = useCallback((data: { name: string; category: ClothingCategory; imageData: string }) => {
    addItem(data);
  }, [addItem]);

  const addToOutfit = useCallback((item: ClothingItem) => {
    setOutfitItems(prev => [
      ...prev,
      {
        clothingId: item.id,
        category: item.category,
        x: 0,
        y: CATEGORY_Y_DEFAULTS[item.category] ?? 0,
        scale: 1,
        zIndex: prev.length,
      },
    ]);
  }, []);

  const updateOutfitItem = useCallback((index: number, updates: Partial<OutfitItem>) => {
    setOutfitItems(prev => prev.map((oi, i) => i === index ? { ...oi, ...updates } : oi));
  }, []);

  const removeOutfitItem = useCallback((index: number) => {
    setOutfitItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSaveOutfit = useCallback((name: string) => {
    saveOutfit({ name, items: outfitItems });
    setOutfitItems([]);
  }, [outfitItems, saveOutfit]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.h1
            className="text-2xl font-heading font-bold text-foreground"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {tab === 'closet' && 'My Closet'}
            {tab === 'builder' && 'Build Outfit'}
            {tab === 'outfits' && 'Saved Outfits'}
          </motion.h1>
          {tab === 'closet' && (
            <Button onClick={() => setUploadOpen(true)} className="rounded-xl gap-2">
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {tab === 'closet' && (
          <ClothingGrid
            items={items}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onRemove={removeItem}
          />
        )}

        {tab === 'builder' && (
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <OutfitCanvas
              outfitItems={outfitItems}
              getItemById={getItemById}
              onUpdateItem={updateOutfitItem}
              onRemoveItem={removeOutfitItem}
              onSave={handleSaveOutfit}
            />
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-3">Add from closet</h3>
              <ClothingGrid
                items={items}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                onRemove={removeItem}
                onSelect={addToOutfit}
                selectable
              />
            </div>
          </div>
        )}

        {tab === 'outfits' && (
          <SavedOutfits outfits={outfits} getItemById={getItemById} onRemove={removeOutfit} />
        )}
      </main>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUpload={handleUpload} />
      <AppNav active={tab} onChange={setTab} />
    </div>
  );
}

/**
 * Main App Page
 *
 * Three tabs: My Closet, Build Outfit, Saved Outfits.
 * Includes Google Drive sync controls and smooth tab transition animations.
 *
 * Customization:
 *  - Tab animation speed: change PAGE_TRANSITION_DURATION in src/config.ts
 *  - Max content width: change max-w-4xl below
 *  - Header blur: change backdrop-blur-md intensity
 *  - Header background opacity: change bg-background/80
 */
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Cloud, CloudOff } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { useCloset } from '@/hooks/useCloset';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { AppNav } from '@/components/AppNav';
import { UploadModal } from '@/components/UploadModal';
import { ClothingGrid } from '@/components/ClothingGrid';
import { OutfitCanvas } from '@/components/OutfitCanvas';
import { SavedOutfits } from '@/components/SavedOutfits';
import { CATEGORY_Y_DEFAULTS, CATEGORY_X_DEFAULTS, PAGE_TRANSITION_DURATION } from '@/config';
import type { ClothingCategory, ClothingItem, OutfitItem } from '@/types/closet';
import type { GoogleUser } from '@/hooks/useGoogleAuth';

type Tab = 'closet' | 'builder' | 'outfits';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

interface IndexProps {
  user: GoogleUser;
  onSignOut: () => void;
}

export default function Index({ user, onSignOut }: IndexProps) {
  const { items, outfits, ready, addItem, removeItem, saveOutfit, removeOutfit, getItemById, replaceAll } = useCloset();
  const { saveToDrive, loadFromDrive, syncing, lastSync } = useGoogleDrive(user.accessToken);
  const [tab, setTab] = useState<Tab>('closet');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ClothingCategory | 'all'>('all');
  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([]);

  useEffect(() => {
    if (!ready) return;

    loadFromDrive().then((data) => {
      if (data && (data.items?.length || data.outfits?.length)) {
        replaceAll(data.items || [], data.outfits || []);
      }
    });
  }, [loadFromDrive, ready, replaceAll]);

  useEffect(() => {
    if (!ready) return;

    const timer = setTimeout(() => {
      if (items.length > 0 || outfits.length > 0) {
        saveToDrive({ items, outfits });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [items, outfits, saveToDrive, ready]);

  const handleUpload = useCallback((data: { name: string; category: ClothingCategory; imageData: string }) => {
    addItem(data);
  }, [addItem]);

  const addToOutfit = useCallback((item: ClothingItem) => {
    setOutfitItems((prev) => [
      ...prev,
      {
        clothingId: item.id,
        category: item.category,
        x: CATEGORY_X_DEFAULTS[item.category] ?? 0,
        y: CATEGORY_Y_DEFAULTS[item.category] ?? 0,
        scale: 1,
        zIndex: prev.length,
      },
    ]);
  }, []);

  const updateOutfitItem = useCallback((index: number, updates: Partial<OutfitItem>) => {
    setOutfitItems((prev) => prev.map((oi, i) => (i === index ? { ...oi, ...updates } : oi)));
  }, []);

  const removeOutfitItem = useCallback((index: number) => {
    setOutfitItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSaveOutfit = useCallback((name: string) => {
    saveOutfit({ name, items: outfitItems });
    setOutfitItems([]);
  }, [outfitItems, saveOutfit]);

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <motion.h1
            key={tab}
            className="text-2xl font-heading font-bold text-foreground"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {tab === 'closet' && 'My Closet'}
            {tab === 'builder' && 'Build Outfit'}
            {tab === 'outfits' && 'Saved Outfits'}
          </motion.h1>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {syncing ? (
                <><Cloud className="h-3.5 w-3.5 animate-pulse" /> Syncing...</>
              ) : lastSync ? (
                <><Cloud className="h-3.5 w-3.5 text-primary" /> Synced</>
              ) : (
                <><CloudOff className="h-3.5 w-3.5" /> Local</>
              )}
            </span>
            {tab === 'closet' && (
              <Button onClick={() => setUploadOpen(true)} className="gap-2 rounded-xl" size="sm">
                <Plus className="h-4 w-4" /> Add Item
              </Button>
            )}
            <button
              onClick={onSignOut}
              className="flex items-center gap-1 rounded-full p-1 transition-colors hover:bg-muted"
              title="Sign out"
            >
              <img src={user.picture} alt={user.name} className="h-7 w-7 rounded-full" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <AnimatePresence mode="wait">
          {tab === 'closet' && (
            <motion.div
              key="closet"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: PAGE_TRANSITION_DURATION }}
            >
              <ClothingGrid
                items={items}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                onRemove={removeItem}
              />
            </motion.div>
          )}

          {tab === 'builder' && (
            <motion.div
              key="builder"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: PAGE_TRANSITION_DURATION }}
            >
              <ResizablePanelGroup direction="horizontal" className="rounded-2xl border border-border">
                <ResizablePanel defaultSize={70} minSize={40}>
                  <div className="h-full p-4">
                    <OutfitCanvas
                      outfitItems={outfitItems}
                      getItemById={getItemById}
                      onUpdateItem={updateOutfitItem}
                      onRemoveItem={removeOutfitItem}
                      onSave={handleSaveOutfit}
                    />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30} minSize={20}>
                  <div className="h-full overflow-y-auto p-4">
                    <h3 className="mb-3 font-heading font-semibold text-foreground">Add from closet</h3>
                    <ClothingGrid
                      items={items}
                      activeCategory={activeCategory}
                      onCategoryChange={setActiveCategory}
                      onRemove={removeItem}
                      onSelect={addToOutfit}
                      selectable
                    />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </motion.div>
          )}

          {tab === 'outfits' && (
            <motion.div
              key="outfits"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: PAGE_TRANSITION_DURATION }}
            >
              <SavedOutfits outfits={outfits} getItemById={getItemById} onRemove={removeOutfit} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUpload={handleUpload} />
      <AppNav active={tab} onChange={setTab} />
    </div>
  );
}

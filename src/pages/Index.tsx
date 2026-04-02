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
import { Plus, Cloud, CloudOff, LogOut } from 'lucide-react';
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

// Page transition animation variants
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
  const { items, outfits, addItem, removeItem, getItemsByCategory, saveOutfit, removeOutfit, getItemById, replaceAll } = useCloset();
  const { saveToDrive, loadFromDrive, syncing, lastSync } = useGoogleDrive(user.accessToken);
  const [tab, setTab] = useState<Tab>('closet');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ClothingCategory | 'all'>('all');

  // Outfit builder state
  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([]);

  // Load from Drive on first mount
  useEffect(() => {
    loadFromDrive().then(data => {
      if (data && (data.items?.length || data.outfits?.length)) {
        replaceAll(data.items || [], data.outfits || []);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save to Drive when data changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (items.length > 0 || outfits.length > 0) {
        saveToDrive({ items, outfits });
      }
    }, 2000); // 2 second debounce — increase for less frequent saves
    return () => clearTimeout(timer);
  }, [items, outfits, saveToDrive]);

  const handleUpload = useCallback((data: { name: string; category: ClothingCategory; imageData: string }) => {
    addItem(data);
  }, [addItem]);

  const addToOutfit = useCallback((item: ClothingItem) => {
    setOutfitItems(prev => [
      ...prev,
      {
        clothingId: item.id,
        category: item.category,
        // Smart placement: position based on clothing category
        x: CATEGORY_X_DEFAULTS[item.category] ?? 0,
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
      {/* Header — sticky with blur effect */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
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
            {/* Sync indicator */}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              {syncing ? (
                <><Cloud className="w-3.5 h-3.5 animate-pulse" /> Syncing...</>
              ) : lastSync ? (
                <><Cloud className="w-3.5 h-3.5 text-primary" /> Synced</>
              ) : (
                <><CloudOff className="w-3.5 h-3.5" /> Local</>
              )}
            </span>
            {tab === 'closet' && (
              <Button onClick={() => setUploadOpen(true)} className="rounded-xl gap-2" size="sm">
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            )}
            {/* User avatar + sign out */}
            <button onClick={onSignOut} className="flex items-center gap-1 p-1 rounded-full hover:bg-muted transition-colors"
              title="Sign out">
              <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full" />
            </button>
          </div>
        </div>
      </header>

      {/* Content with page transition animations */}
      <main className="max-w-4xl mx-auto px-4 py-6">
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
                  <div className="h-full p-4 overflow-y-auto">
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

/**
 * Main App Page
 *
 * Four tabs: My Closet, Build Outfit, Saved Outfits, Support.
 * 
 * Customization:
 *  - Tab animation speed: change PAGE_TRANSITION_DURATION in src/config.ts
 *  - Max content width: change max-w-4xl below
 *  - Header blur: change backdrop-blur-md intensity
 *  - Footer text: change the analytics notice at the bottom
 */
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Cloud, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCloset } from '@/hooks/useCloset';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { useIsMobile } from '@/hooks/use-mobile';
import { AppNav } from '@/components/AppNav';
import type { Tab } from '@/components/AppNav';
import { UploadModal } from '@/components/UploadModal';
import { EditItemModal } from '@/components/EditItemModal';
import { ClothingGrid } from '@/components/ClothingGrid';
import { OutfitCanvas } from '@/components/OutfitCanvas';
import { SavedOutfits } from '@/components/SavedOutfits';
import { DonationPage } from '@/components/DonationPage';
import { CATEGORY_Y_DEFAULTS, CATEGORY_X_DEFAULTS, PAGE_TRANSITION_DURATION } from '@/config';
import type { ClothingCategory, ClothingItem, OutfitItem, Outfit } from '@/types/closet';
import type { GoogleUser } from '@/hooks/useGoogleAuth';

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
  const { items, outfits, ready, addItem, updateItem, removeItem, saveOutfit, removeOutfit, getItemById, replaceAll } = useCloset();
  const { saveToDrive, loadFromDrive, syncing, lastSync } = useGoogleDrive(user.accessToken);
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<Tab>('closet');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editItem, setEditItem] = useState<ClothingItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<ClothingCategory | 'all'>('all');
  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([]);

  // Load from Drive on mount
  useEffect(() => {
    if (!ready) return;
    loadFromDrive().then((data) => {
      if (data && (data.items?.length || data.outfits?.length)) {
        replaceAll(data.items || [], data.outfits || []);
      }
    });
  }, [loadFromDrive, ready, replaceAll]);

  // Auto-save to Drive
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      if (items.length > 0 || outfits.length > 0) {
        saveToDrive({ items, outfits });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [items, outfits, saveToDrive, ready]);

  const handleUpload = useCallback((data: { name: string; category: ClothingCategory; subcategory?: string; customTags?: string[]; imageData: string }) => {
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

  /** Load a saved outfit back into the builder with its saved positions */
  const handleLoadOutfit = useCallback((outfit: Outfit) => {
    setOutfitItems(outfit.items.map((oi) => ({ ...oi })));
    setTab('builder');
  }, []);

  const headerTitle: Record<Tab, string> = {
    closet: 'My Closet',
    builder: 'Build Outfit',
    outfits: 'Saved Outfits',
    donate: 'Support',
  };

  return (
    <div className="min-h-screen pb-20">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <motion.h1
            key={tab}
            className="text-2xl font-heading font-bold text-foreground"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {headerTitle[tab]}
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

      {/* ── Main Content ── */}
      <main className="mx-auto max-w-4xl px-4 py-6">
        <AnimatePresence mode="wait">
          {tab === 'closet' && (
            <motion.div key="closet" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: PAGE_TRANSITION_DURATION }}>
              <ClothingGrid
                items={items}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                onRemove={removeItem}
                onEdit={setEditItem}
              />
            </motion.div>
          )}

          {tab === 'builder' && (
            <motion.div key="builder" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: PAGE_TRANSITION_DURATION }}>
              {isMobile ? (
                /* Mobile: canvas on top, clothing grid below */
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl border border-border p-4">
                    <OutfitCanvas
                      outfitItems={outfitItems}
                      getItemById={getItemById}
                      onUpdateItem={updateOutfitItem}
                      onRemoveItem={removeOutfitItem}
                      onSave={handleSaveOutfit}
                    />
                  </div>
                  <div>
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
                </div>
              ) : (
                /* Desktop: clothing 2/3 left, canvas 1/3 right */
                <div className="flex gap-4">
                  <div className="w-2/3 overflow-y-auto">
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
                  <div className="w-1/3 rounded-2xl border border-border p-4 sticky top-24 self-start">
                    <OutfitCanvas
                      outfitItems={outfitItems}
                      getItemById={getItemById}
                      onUpdateItem={updateOutfitItem}
                      onRemoveItem={removeOutfitItem}
                      onSave={handleSaveOutfit}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {tab === 'outfits' && (
            <motion.div key="outfits" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: PAGE_TRANSITION_DURATION }}>
              <SavedOutfits outfits={outfits} getItemById={getItemById} onRemove={removeOutfit} onLoad={handleLoadOutfit} />
            </motion.div>
          )}

          {tab === 'donate' && (
            <motion.div key="donate" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: PAGE_TRANSITION_DURATION }}>
              <DonationPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Analytics notice footer ── */}
      <footer className="fixed bottom-14 left-0 right-0 z-30 text-center py-1.5 bg-background/60 backdrop-blur-sm border-t border-border">
        <p className="text-[10px] text-muted-foreground/60">
          We use Vercel Web Analytics to collect anonymous usage data (page views, device type, country). No personal information is tracked.
        </p>
      </footer>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUpload={handleUpload} />
      <EditItemModal open={!!editItem} item={editItem} onClose={() => setEditItem(null)} onSave={updateItem} />
      <AppNav active={tab} onChange={setTab} />
    </div>
  );
}

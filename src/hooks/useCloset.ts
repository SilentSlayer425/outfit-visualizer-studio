/**
 * Closet Data Hook
 *
 * Manages all clothing items and saved outfits.
 * Data persists in IndexedDB so high-quality photos don't hit localStorage quotas.
 *
 * Customization:
 *  - Change DB_NAME / STORE_NAME in src/lib/closet-storage.ts to rename local storage buckets
 *  - The setItems/setOutfits functions accept the standard React setter pattern
 */
import { useState, useEffect, useCallback } from 'react';
import type { ClothingItem, Outfit, ClothingCategory } from '@/types/closet';
import {
  clearLegacyClosetState,
  readClosetState,
  readLegacyClosetState,
  writeClosetState,
} from '@/lib/closet-storage';

export function useCloset() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadState = async () => {
      try {
        const stored = await readClosetState();

        if (!cancelled && (stored.items.length > 0 || stored.outfits.length > 0)) {
          setItems(stored.items);
          setOutfits(stored.outfits);
          setReady(true);
          return;
        }
      } catch (error) {
        console.error('Failed to load IndexedDB closet state:', error);
      }

      const legacy = readLegacyClosetState();
      if (!cancelled) {
        setItems(legacy.items);
        setOutfits(legacy.outfits);
        setReady(true);
      }

      if (legacy.items.length > 0 || legacy.outfits.length > 0) {
        writeClosetState(legacy)
          .then(() => clearLegacyClosetState())
          .catch((error) => console.error('Failed to migrate legacy closet state:', error));
      }
    };

    loadState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    writeClosetState({ items, outfits }).catch((error) => {
      console.error('Failed to persist closet state:', error);
    });
  }, [items, outfits, ready]);

  const addItem = useCallback((item: Omit<ClothingItem, 'id' | 'createdAt'>) => {
    const newItem: ClothingItem = { ...item, id: crypto.randomUUID(), createdAt: Date.now() };
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    // Also remove from any outfits that reference this item
    setOutfits((prev) => prev.map((o) => ({ ...o, items: o.items.filter((oi) => oi.clothingId !== id) })));
  }, []);

  const getItemsByCategory = useCallback((category: ClothingCategory) => {
    return items.filter((i) => i.category === category);
  }, [items]);

  const saveOutfit = useCallback((outfit: Omit<Outfit, 'id' | 'createdAt'>) => {
    const newOutfit: Outfit = { ...outfit, id: crypto.randomUUID(), createdAt: Date.now() };
    setOutfits((prev) => [newOutfit, ...prev]);
    return newOutfit;
  }, []);

  const removeOutfit = useCallback((id: string) => {
    setOutfits((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const getItemById = useCallback((id: string) => items.find((i) => i.id === id), [items]);

  // Bulk setters for Drive sync/import
  const replaceAll = useCallback((newItems: ClothingItem[], newOutfits: Outfit[]) => {
    setItems(newItems);
    setOutfits(newOutfits);
  }, []);

  return {
    items,
    outfits,
    ready,
    addItem,
    removeItem,
    getItemsByCategory,
    saveOutfit,
    removeOutfit,
    getItemById,
    replaceAll,
  };
}

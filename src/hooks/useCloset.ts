/**
 * Closet Data Hook
 * 
 * Manages all clothing items and saved outfits.
 * Data persists in localStorage and optionally syncs to Google Drive.
 * 
 * Customization:
 *  - Change ITEMS_KEY / OUTFITS_KEY to rename localStorage keys
 *  - The setItems/setOutfits functions accept the standard React setter pattern
 */
import { useState, useEffect, useCallback } from 'react';
import type { ClothingItem, Outfit, ClothingCategory } from '@/types/closet';

// localStorage keys — change these if you want different storage keys
const ITEMS_KEY = 'closet-items';
const OUTFITS_KEY = 'closet-outfits';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function useCloset() {
  const [items, setItems] = useState<ClothingItem[]>(() => loadFromStorage(ITEMS_KEY, []));
  const [outfits, setOutfits] = useState<Outfit[]>(() => loadFromStorage(OUTFITS_KEY, []));

  // Save to localStorage whenever data changes
  useEffect(() => { localStorage.setItem(ITEMS_KEY, JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem(OUTFITS_KEY, JSON.stringify(outfits)); }, [outfits]);

  const addItem = useCallback((item: Omit<ClothingItem, 'id' | 'createdAt'>) => {
    const newItem: ClothingItem = { ...item, id: crypto.randomUUID(), createdAt: Date.now() };
    setItems(prev => [newItem, ...prev]);
    return newItem;
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    // Also remove from any outfits that reference this item
    setOutfits(prev => prev.map(o => ({ ...o, items: o.items.filter(oi => oi.clothingId !== id) })));
  }, []);

  const getItemsByCategory = useCallback((category: ClothingCategory) => {
    return items.filter(i => i.category === category);
  }, [items]);

  const saveOutfit = useCallback((outfit: Omit<Outfit, 'id' | 'createdAt'>) => {
    const newOutfit: Outfit = { ...outfit, id: crypto.randomUUID(), createdAt: Date.now() };
    setOutfits(prev => [newOutfit, ...prev]);
    return newOutfit;
  }, []);

  const removeOutfit = useCallback((id: string) => {
    setOutfits(prev => prev.filter(o => o.id !== id));
  }, []);

  const getItemById = useCallback((id: string) => items.find(i => i.id === id), [items]);

  // Bulk setters for Drive sync
  const replaceAll = useCallback((newItems: ClothingItem[], newOutfits: Outfit[]) => {
    setItems(newItems);
    setOutfits(newOutfits);
  }, []);

  return {
    items, outfits, addItem, removeItem, getItemsByCategory,
    saveOutfit, removeOutfit, getItemById, replaceAll,
  };
}

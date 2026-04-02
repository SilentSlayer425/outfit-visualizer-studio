export type ClothingCategory =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'outerwear'
  | 'shoes'
  | 'accessories'
  | 'bags'
  | 'jewelry';

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  imageData: string; // base64
  color?: string;
  createdAt: number;
}

export interface OutfitItem {
  clothingId: string;
  category: ClothingCategory;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
}

export interface Outfit {
  id: string;
  name: string;
  items: OutfitItem[];
  createdAt: number;
}

export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  dresses: 'Dresses',
  outerwear: 'Outerwear',
  shoes: 'Shoes',
  accessories: 'Accessories',
  bags: 'Bags',
  jewelry: 'Jewelry',
};

export const CATEGORY_ORDER: ClothingCategory[] = [
  'tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'bags', 'jewelry',
];

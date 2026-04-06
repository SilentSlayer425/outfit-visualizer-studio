/**
 * Closet Types
 *
 * ClothingCategory: broad group (tops, bottoms, etc.)
 * ClothingSubcategory: specific type within a category (t-shirt, jeans, etc.)
 * 
 * To add a new category:
 *  1. Add to ClothingCategory union
 *  2. Add label in CATEGORY_LABELS
 *  3. Add to CATEGORY_ORDER
 *  4. Add subcategories in SUBCATEGORIES
 *  5. Add default Y/X in src/config.ts CATEGORY_Y_DEFAULTS / CATEGORY_X_DEFAULTS
 * 
 * To add a new subcategory:
 *  1. Add to the relevant array in SUBCATEGORIES
 */

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
  /** Subcategory tag — can be a built-in or user-created custom tag */
  subcategory?: string;
  /** User-created custom tags (free-form strings) */
  customTags?: string[];
  /** User-written description for this item */
  description?: string;
  imageData: string; // optimized image data URL (metadata stripped during processing)
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

/**
 * Built-in subcategories for each clothing category.
 * Users can also create their own custom tags beyond these.
 * 
 * To add a built-in subcategory, add it to the relevant array below.
 */
export const SUBCATEGORIES: Record<ClothingCategory, string[]> = {
  tops: ['T-Shirt', 'Polo', 'Button-Up', 'Blouse', 'Tank Top', 'Crop Top', 'Hoodie', 'Sweater', 'Henley', 'Flannel'],
  bottoms: ['Jeans', 'Chinos', 'Sweats', 'Joggers', 'Shorts', 'Skirt', 'Cargo Pants', 'Dress Pants', 'Leggings'],
  dresses: ['Mini Dress', 'Midi Dress', 'Maxi Dress', 'Sundress', 'Cocktail Dress', 'Formal Gown', 'Romper', 'Jumpsuit'],
  outerwear: ['Jacket', 'Blazer', 'Coat', 'Windbreaker', 'Puffer', 'Bomber', 'Denim Jacket', 'Trench Coat', 'Vest', 'Parka'],
  shoes: ['Sneakers', 'Boots', 'Loafers', 'Sandals', 'Heels', 'Flats', 'Slides', 'Running Shoes', 'Dress Shoes', 'Platforms'],
  accessories: ['Hat', 'Beanie', 'Scarf', 'Belt', 'Sunglasses', 'Watch', 'Gloves', 'Tie', 'Hair Accessory'],
  bags: ['Backpack', 'Tote', 'Crossbody', 'Clutch', 'Messenger', 'Duffle', 'Fanny Pack', 'Shoulder Bag'],
  jewelry: ['Necklace', 'Bracelet', 'Earrings', 'Ring', 'Anklet', 'Brooch', 'Chain', 'Pendant'],
};

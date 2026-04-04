# Outfit Visualizer Studio — Project Roadmap

## Main Idea

Host the entire website online, accessible from any device via a browser.

---

## Features

### 1. Cloud Hosting & Cross-Device Access
- **How:** Deploy on Vercel (free tier). Users visit the URL from phone, laptop, or PC.
- **Where:** `vercel.json`, Vercel dashboard settings.

### 2. Photo Upload & Google Drive Sync
- **How:** Users upload photos from their device. Images are processed client-side (compressed, metadata stripped), then stored in IndexedDB locally. A JSON file with all items/outfits is synced to Google Drive for cross-device persistence.
- **Where:**
  - Upload flow: `src/components/UploadModal.tsx`
  - Image processing: `src/lib/image-processing.ts`
  - Local storage (IndexedDB): `src/lib/closet-storage.ts`
  - Google Drive sync: `src/hooks/useGoogleDrive.ts`
  - Google OAuth: `src/hooks/useGoogleAuth.ts`

### 3. Universal Image Format Support
- **How:** All common image types are accepted (JPEG, PNG, WebP, GIF, BMP, TIFF, AVIF, SVG, HEIC, HEIF). HEIC/HEIF files are converted client-side using `heic-to` / `heic2any`. All images are re-encoded to WebP at ≤12MP and ~85% quality, stripping all EXIF metadata.
- **Where:** `src/lib/image-processing.ts`, `src/components/UploadModal.tsx`

### 4. Categories, Subcategories & Custom Tags
- **How:** Each item has a broad category (Tops, Bottoms, Shoes, etc.) and an optional subcategory (T-Shirt, Jeans, Sneakers, etc.). Users can also create free-form custom tags. Filtering by category and subcategory is available on the main page and builder.
- **Where:**
  - Type definitions & built-in subcategories: `src/types/closet.ts`
  - Upload with tags: `src/components/UploadModal.tsx`
  - Edit tags: `src/components/EditItemModal.tsx`
  - Grid filtering: `src/components/ClothingGrid.tsx`

### 5. Saved Outfits & Reload
- **How:** Outfits are saved with the exact positions, scales, and z-indices of each item. Users can reload a saved outfit into the builder to view or modify it. Hovering over items in the saved outfits view shows the item name.
- **Where:**
  - Save logic: `src/pages/Index.tsx` → `handleSaveOutfit`
  - Load logic: `src/pages/Index.tsx` → `handleLoadOutfit`
  - Saved outfits UI: `src/components/SavedOutfits.tsx`
  - Builder canvas: `src/components/OutfitCanvas.tsx`

### 6. Editing Saved Items
- **How:** Each item in "My Closet" has an edit button (pencil icon on hover). Users can change the name, category, subcategory, and custom tags without re-uploading the photo.
- **Where:** `src/components/EditItemModal.tsx`, `src/components/ClothingGrid.tsx`

### 7. Smart Placement by Tag
- **How:** When adding an item to the outfit builder, it's automatically placed at a sensible position based on its category (tops near the top, shoes at the bottom, etc.). Custom-tagged items are placed at center.
- **Where:**
  - Default positions: `src/config.ts` → `CATEGORY_Y_DEFAULTS`, `CATEGORY_X_DEFAULTS`
  - Placement logic: `src/pages/Index.tsx` → `addToOutfit`

### 8. Arrow Key Nudging
- **How:** Select an item on the canvas, then use arrow keys to nudge it pixel-by-pixel. Step size is configurable.
- **Where:** `src/components/OutfitCanvas.tsx`, `src/config.ts` → `ARROW_KEY_STEP`

### 9. Donation Page
- **How:** A "Support" tab in the bottom nav links to a Throne wishlist page.
- **Where:** `src/components/DonationPage.tsx`, `src/components/AppNav.tsx`

### 10. Vercel Web Analytics
- **How:** `@vercel/analytics` is imported in `src/App.tsx`. A small footer notice informs users that anonymous analytics (page views, device type, country) are collected. No personal data is tracked.
- **Setup:**
  1. Deploy to Vercel
  2. Go to your Vercel project dashboard → Analytics tab → Enable
  3. The `<Analytics />` component in `src/App.tsx` handles the rest automatically
- **Where:** `src/App.tsx`, footer in `src/pages/Index.tsx`

---

## Directory Structure (Key Files)

```
src/
├── App.tsx                          # Root: auth gate, routing, analytics
├── config.ts                        # All tunable constants (canvas, grid, placement)
├── types/closet.ts                  # Types, categories, subcategories
├── pages/
│   ├── Index.tsx                    # Main app (tabs, layout, state coordination)
│   └── Login.tsx                    # Google OAuth login page
├── components/
│   ├── AppNav.tsx                   # Bottom tab navigation
│   ├── ClothingGrid.tsx             # Filterable item grid with edit/delete
│   ├── EditItemModal.tsx            # Edit name, category, subcategory, tags
│   ├── UploadModal.tsx              # Upload + tag new items
│   ├── OutfitCanvas.tsx             # Drag-and-drop outfit builder canvas
│   ├── SavedOutfits.tsx             # View/load/delete saved outfits
│   └── DonationPage.tsx             # Throne donation link
├── hooks/
│   ├── useCloset.ts                 # Items & outfits state + IndexedDB persistence
│   ├── useGoogleAuth.ts             # Google OAuth sign-in/out
│   ├── useGoogleDrive.ts            # Google Drive save/load
│   └── use-mobile.tsx               # Mobile breakpoint detection
├── lib/
│   ├── closet-storage.ts            # IndexedDB read/write
│   └── image-processing.ts          # Compress, resize, strip metadata, HEIC convert
└── index.css                        # Design tokens (colors, fonts, shadows)
```

---

## Future Ideas
- Client-side AI background removal for cleaner layering
- Weather-based outfit suggestions
- Color tagging with palette extraction
- Share outfits as image exports
- Outfit calendar / planner

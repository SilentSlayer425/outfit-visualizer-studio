# Outfit — Personal Closet & Outfit Builder

A web app to organize your wardrobe and build outfits by layering your clothing photos on a drag-and-drop canvas.

## Features

| Feature | Description |
|---------|-------------|
| **Google Login** | Sign in with Google OAuth to access the app |
| **Google Drive Sync** | Closet data auto-saves to a Google Drive folder |
| **Photo Upload** | Upload clothing photos with name and category |
| **Category Filtering** | Filter by tops, bottoms, shoes, etc. |
| **Outfit Builder** | Drag-and-drop canvas with mannequin silhouette |
| **Smart Placement** | Items auto-position based on category (shoes at bottom, tops at top) |
| **Keyboard Controls** | Arrow keys to nudge items, Delete to remove |
| **Save Outfits** | Name and save outfit compositions |
| **Resizable Panels** | Drag to resize the builder canvas vs. closet sidebar |
| **Page Animations** | Smooth transitions between tabs |

## Directory Structure

```
src/
├── config.ts                    ← 🎛️ ALL customizable values (sizes, colors, placement)
├── App.tsx                      ← Root component with auth routing
├── main.tsx                     ← Entry point
├── index.css                    ← Theme colors (HSL), fonts, shadows
│
├── pages/
│   ├── Index.tsx                ← Main app (closet, builder, outfits tabs)
│   ├── Login.tsx                ← Google sign-in page
│   └── NotFound.tsx             ← 404 page
│
├── components/
│   ├── AppNav.tsx               ← Bottom navigation bar (tab switching)
│   ├── ClothingGrid.tsx         ← Filterable grid of clothing items
│   ├── OutfitCanvas.tsx         ← Drag-and-drop outfit building canvas
│   ├── SavedOutfits.tsx         ← Grid of saved outfit compositions
│   ├── UploadModal.tsx          ← Upload dialog (drag-drop + file picker)
│   └── ui/                     ← shadcn/ui base components (Button, Input, etc.)
│
├── hooks/
│   ├── useCloset.ts             ← Closet data management (items + outfits)
│   ├── useGoogleAuth.ts         ← Google OAuth sign-in/sign-out
│   └── useGoogleDrive.ts        ← Google Drive read/write sync
│
└── types/
    └── closet.ts                ← TypeScript types + category labels
```

## Customization Guide

Almost everything customizable lives in **`src/config.ts`**. Open that file to change:

- `GOOGLE_CLIENT_ID` — your Google OAuth client ID
- `CANVAS_MIN_HEIGHT` — how tall the outfit builder canvas is
- `ARROW_KEY_STEP` — how many pixels arrow keys move items
- `ITEM_BASE_SIZE` — default size of items on the canvas
- `CATEGORY_Y_DEFAULTS` — where each category lands vertically when added
- `CATEGORY_X_DEFAULTS` — horizontal offset per category
- `GRID_COLS` — number of columns in the clothing grid
- `PAGE_TRANSITION_DURATION` — animation speed between tabs

### Theme Colors

Edit `src/index.css` to change the color palette. Colors use HSL format:

```css
:root {
  --primary: 16 55% 55%;    /* Warm terracotta — main accent */
  --background: 36 56% 96%; /* Cream — page background */
  --accent: 350 30% 75%;    /* Dusty rose — secondary accent */
}
```

### Fonts

Fonts are set in `src/index.css`:
- Headings: **Playfair Display** (serif) — change `--font-heading`
- Body: **Nunito** (sans-serif) — change `--font-body`

Update the Google Fonts import URL at the top of the file to match.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable **Google Drive API**
3. Go to **APIs & Services → Credentials → Create OAuth 2.0 Client ID**
4. Type: Web application
5. Add `http://localhost:5173` to Authorized JavaScript origins AND redirect URIs
6. Copy the Client ID

### 3. Add your Client ID

Open `src/config.ts` and replace:

```ts
export const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';
```

### 4. Run

```bash
npm run dev
```

Visit `http://localhost:5173`

## Tech Stack

- **React 18** + TypeScript
- **Vite 5** — build tool
- **Tailwind CSS v3** — styling
- **Framer Motion** — animations
- **shadcn/ui** — UI components
- **Google Identity Services** — OAuth
- **Google Drive API** — cloud sync

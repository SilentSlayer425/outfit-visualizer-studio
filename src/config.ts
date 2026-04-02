/**
 * ============================================
 * APP CONFIGURATION
 * ============================================
 * All customizable values live here.
 * Change these to adjust app behavior without touching components.
 */

// ── Google OAuth ──────────────────────────────────────
// Get your Client ID from: https://console.cloud.google.com/apis/credentials
// Set this to your OAuth 2.0 Client ID (Web application type)
export const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';

// Google Drive folder name where closet data is stored
// Change this to use a different folder name in the user's Drive
export const DRIVE_FOLDER_NAME = 'OutfitClosetApp';

// File name for the JSON data file in Google Drive
export const DRIVE_DATA_FILE = 'closet-data.json';

// ── Outfit Canvas ─────────────────────────────────────
// Minimum height of the outfit building canvas in pixels
// Increase for more vertical room to arrange outfits
export const CANVAS_MIN_HEIGHT = 650;

// How many pixels arrow keys move an item per press
// Increase for faster keyboard movement
export const ARROW_KEY_STEP = 5;

// Minimum and maximum scale for outfit items
// scale range: 0.3 = 30% size, 2.5 = 250% size
export const ITEM_MIN_SCALE = 0.3;
export const ITEM_MAX_SCALE = 2.5;

// Scale step when using zoom in/out buttons
export const SCALE_STEP = 0.15;

// Default size of an item on the canvas in pixels (before scaling)
// Change to make items appear bigger or smaller by default
export const ITEM_BASE_SIZE = 120;

// ── Smart Placement ───────────────────────────────────
// Y-axis positions for each category when first added to canvas.
// Negative = higher on canvas, Positive = lower.
// These are pixel offsets from canvas center.
// Adjust to change where items land when clicked from the closet.
import type { ClothingCategory } from '@/types/closet';

export const CATEGORY_Y_DEFAULTS: Record<ClothingCategory, number> = {
  tops: -160,        // Upper torso area
  outerwear: -150,   // Slightly above tops (layered over)
  bottoms: 60,       // Lower torso / legs
  dresses: -40,      // Full body, centered slightly up
  shoes: 220,        // Feet area, near bottom
  accessories: -200, // Above head / neck area
  bags: 80,          // Side / hip area
  jewelry: -210,     // Neck / top area
};

// X-axis offset for each category (from center)
// Change to spread items horizontally by default
export const CATEGORY_X_DEFAULTS: Record<ClothingCategory, number> = {
  tops: 0,
  outerwear: 0,
  bottoms: 0,
  dresses: 0,
  shoes: 0,
  accessories: 40,
  bags: 60,
  jewelry: 0,
};

// ── Grid Layout ───────────────────────────────────────
// Number of columns at each breakpoint for the clothing grid
// Format: "grid-cols-{n}" for mobile, "sm:grid-cols-{n}", "md:grid-cols-{n}"
export const GRID_COLS = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';

// ── Animations ────────────────────────────────────────
// Duration in seconds for page transition animations
// Increase for slower, more dramatic transitions
export const PAGE_TRANSITION_DURATION = 0.3;

// Stagger delay between items appearing in grid (seconds)
// Increase to make items cascade in more slowly
export const GRID_ITEM_STAGGER = 0.03;

// ── Colors & Theming ──────────────────────────────────
// Theme colors are defined in src/index.css using CSS custom properties.
// Look for :root { ... } and .dark { ... } blocks.
// All colors use HSL format: "hue saturation% lightness%"
// Example: --primary: 16 55% 55%  → warm terracotta orange

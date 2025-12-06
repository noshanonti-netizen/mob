import { MediaItem, MediaType } from './types';

// Constants file is now largely deprecated in favor of live API data.
// Keeping exports to prevent breaking legacy imports if any exist, 
// though App.tsx has been updated to use api.ts.

export const HERO_ITEM: MediaItem = {
  id: 0,
  title: "Loading...",
  image: "",
  backdrop: "",
  year: 2025,
  rating: 0,
  type: MediaType.SERIES,
  description: "",
  tags: []
};

export const RAMADAN_SERIES: MediaItem[] = [];
export const TRENDING_MOVIES: MediaItem[] = [];
export const TURKISH_SERIES: MediaItem[] = [];

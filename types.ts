export enum MediaType {
  MOVIE = 'MOVIE',
  SERIES = 'SERIES',
  TV_SHOW = 'TV_SHOW'
}

export interface Actor {
  id: number;
  name: string;
  character: string;
  image: string | null;
}

export interface Season {
  id: number;
  name: string;
  poster: string | null;
  seasonNumber: number;
  episodeCount: number;
  airDate: string;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  image: string | null;
  episodeNumber: number;
  seasonNumber: number;
  airDate: string;
  rating: number;
  duration?: number;
}

export interface MediaItem {
  id: number;
  title: string;
  image: string;
  backdrop: string;
  year: number;
  rating: number;
  type: MediaType;
  quality?: string;
  episodes?: number;
  description: string;
  tags: string[];
  duration?: string;
  cast?: Actor[];
  similar?: MediaItem[];
  seasons?: Season[];
  category?: string;
  imdb_id?: string;
}

export interface SectionProps {
  title: string;
  items: MediaItem[];
}
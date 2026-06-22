import { MediaItem, MediaType, Actor, Season, Episode } from './types';

// --- Custom Media Storage & Injector Helper APIs ---

export interface CustomServer {
  name: string;
  url: string;
}

export interface CustomServersData {
  watch: CustomServer[];
  download: CustomServer[];
}

export interface AdPlaceConfig {
  type: string; // "script" | "image" | "html" | "link"
  code: string;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
}

export interface AdsConfigData {
  headerAd: AdPlaceConfig;
  watchPageAd: AdPlaceConfig;
  detailsPageAd: AdPlaceConfig;
  popunderAd: AdPlaceConfig;
  homePageAd?: AdPlaceConfig;
  sidebarAd?: AdPlaceConfig;
  footerAd?: AdPlaceConfig;
}

// Background sync POST helper
const postToServer = async (url: string, data: any) => {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.error(`Failed to sync data to ${url}:`, e);
  }
};

export const getCustomMediaItems = (): MediaItem[] => {
  try {
    const data = localStorage.getItem('aflameco_custom_media');
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    console.error('Error parsing custom media:', e);
    return [];
  }
};

export const saveCustomMediaItems = (items: MediaItem[]) => {
  try {
    localStorage.setItem('aflameco_custom_media', JSON.stringify(items));
    window.dispatchEvent(new Event('aflameco_custom_media_updated'));
    // Sync to backend file storage
    postToServer('/api/custom-media', items);
  } catch (e) {
    console.error('Error saving custom media:', e);
  }
};

export const getCustomServers = (mediaType: string, id: string | number, season?: number | string, episode?: number | string): CustomServersData | null => {
  try {
    const data = localStorage.getItem('aflameco_custom_servers');
    if (!data) return null;
    const map = JSON.parse(data);
    
    // Check specific episode servers first for series, otherwise flow down to template key
    if (mediaType === 'series' && season && episode) {
      const episodeKey = `series-${id}-${season}-${episode}`;
      if (map[episodeKey]) return map[episodeKey];
      
      const templateKey = `series-${id}-template`;
      if (map[templateKey]) {
        // Re-construct servers replacing template placeholders {season} and {episode}
        const template = map[templateKey] as CustomServersData;
        return {
          watch: template.watch.map(s => ({
            name: s.name,
            url: s.url.replace(/{season}/g, String(season)).replace(/{episode}/g, String(episode))
          })),
          download: template.download.map(s => ({
            name: s.name,
            url: s.url.replace(/{season}/g, String(season)).replace(/{episode}/g, String(episode))
          }))
        };
      }
    }
    
    const generalKey = `${mediaType}-${id}`;
    if (map[generalKey]) return map[generalKey];
    
    return null;
  } catch (e) {
    console.error('Error getting custom servers:', e);
    return null;
  }
};

export const saveCustomServers = (mediaType: string, id: string | number, servers: CustomServersData, season?: number | string, episode?: number | string) => {
  try {
    const data = localStorage.getItem('aflameco_custom_servers') || '{}';
    const map = JSON.parse(data);
    
    let key = `${mediaType}-${id}`;
    if (mediaType === 'series') {
      if (season && episode) {
        key = `series-${id}-${season}-${episode}`;
      } else {
        key = `series-${id}-template`;
      }
    }
    
    map[key] = servers;
    localStorage.setItem('aflameco_custom_servers', JSON.stringify(map));
    
    // Sync to backend file storage
    postToServer('/api/custom-servers', map);
  } catch (e) {
    console.error('Error saving custom servers:', e);
  }
};

// Initializer to reconcile server database with client cache
export const initializeServerSync = async () => {
  try {
    // 1. Reconcile Media
    const localMedia = getCustomMediaItems();
    const resMedia = await fetch('/api/custom-media');
    const serverMedia = await resMedia.json();
    
    if (Array.isArray(serverMedia) && serverMedia.length > 0) {
      localStorage.setItem('aflameco_custom_media', JSON.stringify(serverMedia));
      window.dispatchEvent(new Event('aflameco_custom_media_updated'));
    } else if (localMedia.length > 0) {
      await postToServer('/api/custom-media', localMedia);
    }
    
    // 2. Reconcile Servers
    const localServersStr = localStorage.getItem('aflameco_custom_servers');
    const localServers = localServersStr ? JSON.parse(localServersStr) : {};
    const resServers = await fetch('/api/custom-servers');
    const serverServers = await resServers.json();
    
    if (serverServers && Object.keys(serverServers).length > 0) {
      localStorage.setItem('aflameco_custom_servers', JSON.stringify(serverServers));
    } else if (Object.keys(localServers).length > 0) {
      await postToServer('/api/custom-servers', localServers);
    }
  } catch (err) {
    console.error('Failed to initialize server data sync:', err);
  }
};

// Getting and saving Ads Config
export const getAdsConfig = async (): Promise<AdsConfigData | null> => {
  try {
    const cached = localStorage.getItem('aflameco_ads_config');
    
    // Background refresh (using promotions route to bypass adblockers)
    fetch('/api/promotions')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP status ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data) {
          localStorage.setItem('aflameco_ads_config', JSON.stringify(data));
          window.dispatchEvent(new Event('aflameco_ads_updated'));
        }
      })
      .catch(err => {
        // Quiet default logging for developer/testing environments instead of failing scanner logs
        console.warn('Silent fallback: ads background sync not available:', err.message || err);
      });

    if (cached) {
      return JSON.parse(cached);
    }
    
    const res = await fetch('/api/promotions');
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    if (data) {
      localStorage.setItem('aflameco_ads_config', JSON.stringify(data));
    }
    return data;
  } catch (e) {
    console.warn('Quiet log: could not fetch initial ads config:', e);
    return null;
  }
};

export const saveAdsConfig = async (config: AdsConfigData): Promise<boolean> => {
  try {
    localStorage.setItem('aflameco_ads_config', JSON.stringify(config));
    window.dispatchEvent(new Event('aflameco_ads_updated'));
    const res = await fetch('/api/promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    const parsed = await res.json();
    return parsed.success === true;
  } catch (e) {
    console.error('Error saving ads config:', e);
    return false;
  }
};

const API_KEY = 'fe72ad39439df8dc90467fbaf38f3e63';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Genre ID to Arabic Name mapping
const GENRES: Record<number, string> = {
  28: 'أكشن',
  12: 'مغامرة',
  16: 'رسوم متحركة',
  35: 'كوميديا',
  80: 'جريمة',
  99: 'وثائقي',
  18: 'دراما',
  10751: 'عائلي',
  14: 'فانتازيا',
  36: 'تاريخ',
  27: 'رعب',
  10402: 'موسيقى',
  9648: 'غموض',
  10749: 'رومانسية',
  878: 'خيال علمي',
  10770: 'تلفاز',
  53: 'إثارة',
  10752: 'حرب',
  37: 'غرب أمريكي'
};

// Mapper to convert TMDB API response to our app's MediaItem interface
const mapResultToMediaItem = (item: any, type: MediaType): MediaItem => {
  const isMovie = type === MediaType.MOVIE;
  const title = item.title || item.name;
  const date = item.release_date || item.first_air_date || '2025';
  
  // Map genre IDs to names
  const tags = item.genre_ids ? item.genre_ids.map((id: number) => GENRES[id]).filter(Boolean) : 
               (item.genres ? item.genres.map((g: any) => g.name) : []);

  return {
    id: item.id,
    title: title,
    image: item.poster_path ? `${IMAGE_BASE}/w500${item.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Image',
    backdrop: item.backdrop_path ? `${IMAGE_BASE}/original${item.backdrop_path}` : 'https://via.placeholder.com/1920x1080?text=No+Image',
    year: parseInt(date.substring(0, 4)) || 2025,
    rating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 0,
    type: type,
    quality: item.vote_average > 7.5 ? '4K' : 'HD', // Simulated quality based on rating
    description: item.overview || 'لا يوجد وصف متاح لهذا العمل حالياً.',
    tags: tags.slice(0, 3) // Take top 3 tags
  };
};

export const searchContent = async (query: string): Promise<MediaItem[]> => {
  if (!query) return [];
  const customItems = getCustomMediaItems().filter(item => 
    item.title?.toLowerCase().includes(query.toLowerCase()) || 
    item.description?.toLowerCase().includes(query.toLowerCase())
  );
  try {
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=ar-SA&query=${encodeURIComponent(query)}&page=1&include_adult=false`);
    const data = await res.json();
    
    if (!data.results) return customItems;

    // Filter only movie and tv types
    const validResults = data.results.filter((item: any) => 
      (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
    );

    const tmdbResults = validResults.map((item: any) => 
      mapResultToMediaItem(item, item.media_type === 'movie' ? MediaType.MOVIE : MediaType.SERIES)
    );
    
    return [...customItems, ...tmdbResults];
  } catch (e) {
    console.error('Search error:', e);
    return customItems;
  }
};

export const getTrendingMovies = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    const customItems = getCustomMediaItems().filter(item => item.type === MediaType.MOVIE && (!item.category || item.category === 'trending'));
    const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=ar-SA&page=${page}`);
    const data = await res.json();
    if (!data.results) return customItems;
    const tmdbItems = data.results.map((item: any) => mapResultToMediaItem(item, MediaType.MOVIE));
    return page === 1 ? [...customItems, ...tmdbItems] : tmdbItems;
  } catch (e) {
    console.error('Error fetching trending movies:', e);
    return getCustomMediaItems().filter(item => item.type === MediaType.MOVIE && (!item.category || item.category === 'trending'));
  }
};

export const getTrendingSeries = async (): Promise<MediaItem[]> => {
  try {
    const customItems = getCustomMediaItems().filter(item => item.type === MediaType.SERIES && (!item.category || item.category === 'trending'));
    const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&language=ar-SA`);
    const data = await res.json();
    if (!data.results) return customItems;
    const tmdbItems = data.results.map((item: any) => mapResultToMediaItem(item, MediaType.SERIES));
    return [...customItems, ...tmdbItems];
  } catch (e) {
    console.error('Error fetching trending series:', e);
    return getCustomMediaItems().filter(item => item.type === MediaType.SERIES && (!item.category || item.category === 'trending'));
  }
};

export const getDiscoverSeries = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    const customItems = getCustomMediaItems().filter(item => item.type === MediaType.SERIES && (!item.category || item.category === 'series'));
    const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=ar-SA&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    if (!data.results) return customItems;
    const tmdbItems = data.results.map((item: any) => mapResultToMediaItem(item, MediaType.SERIES));
    return page === 1 ? [...customItems, ...tmdbItems] : tmdbItems;
  } catch (e) {
    console.error('Error fetching discover series:', e);
    return getCustomMediaItems().filter(item => item.type === MediaType.SERIES && (!item.category || item.category === 'series'));
  }
};

export const getRamadanSeries = async (): Promise<MediaItem[]> => {
  try {
    const customItems = getCustomMediaItems().filter(item => item.category === 'ramadan');
    const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=ar-SA&with_original_language=ar&sort_by=popularity.desc&page=1`);
    const data = await res.json();
    if (!data.results) return customItems;
    const validResults = data.results.filter((item: any) => item.poster_path);
    const tmdbItems = validResults.map((item: any) => mapResultToMediaItem(item, MediaType.SERIES));
    return [...customItems, ...tmdbItems];
  } catch (e) {
    console.error('Error fetching Arabic/Ramadan series:', e);
    return getCustomMediaItems().filter(item => item.category === 'ramadan');
  }
};

export const getTurkishSeries = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    const customItems = getCustomMediaItems().filter(item => item.category === 'turkish');
    const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=ar-SA&with_origin_country=TR&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    if (!data.results) return customItems;
    const tmdbItems = data.results.map((item: any) => mapResultToMediaItem(item, MediaType.SERIES));
    return page === 1 ? [...customItems, ...tmdbItems] : tmdbItems;
  } catch (e) {
    console.error('Error fetching Turkish series:', e);
    return getCustomMediaItems().filter(item => item.category === 'turkish');
  }
};

export const getActionMovies = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ar-SA&with_genres=28&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map((item: any) => mapResultToMediaItem(item, MediaType.MOVIE));
  } catch (e) {
    return [];
  }
};

// New Categories

export const getArabicMovies = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    const customItems = getCustomMediaItems().filter(item => item.category === 'arabic');
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ar-SA&with_original_language=ar&sort_by=release_date.desc&page=${page}`);
    const data = await res.json();
    if (!data.results) return customItems;
    const validResults = data.results.filter((item: any) => item.poster_path);
    const tmdbItems = validResults.map((item: any) => mapResultToMediaItem(item, MediaType.MOVIE));
    return page === 1 ? [...customItems, ...tmdbItems] : tmdbItems;
  } catch (e) {
    return getCustomMediaItems().filter(item => item.category === 'arabic');
  }
};

export const getEgyptianMovies = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    const customItems = getCustomMediaItems().filter(item => item.category === 'egyptian');
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ar-SA&with_origin_country=EG&sort_by=release_date.desc&page=${page}`);
    const data = await res.json();
    if (!data.results) return customItems;
    const validResults = data.results.filter((item: any) => item.poster_path);
    const tmdbItems = validResults.map((item: any) => mapResultToMediaItem(item, MediaType.MOVIE));
    return page === 1 ? [...customItems, ...tmdbItems] : tmdbItems;
  } catch (e) {
    return getCustomMediaItems().filter(item => item.category === 'egyptian');
  }
};

export const getForeignMovies = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    const customItems = getCustomMediaItems().filter(item => item.category === 'foreign');
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ar-SA&with_original_language=en&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    if (!data.results) return customItems;
    const tmdbItems = data.results.map((item: any) => mapResultToMediaItem(item, MediaType.MOVIE));
    return page === 1 ? [...customItems, ...tmdbItems] : tmdbItems;
  } catch (e) {
    return getCustomMediaItems().filter(item => item.category === 'foreign');
  }
};

export const getAsianMovies = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    const customItems = getCustomMediaItems().filter(item => item.category === 'asian');
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ar-SA&with_original_language=ko|ja|zh|hi|th&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    if (!data.results) return customItems;
    const tmdbItems = data.results.map((item: any) => mapResultToMediaItem(item, MediaType.MOVIE));
    return page === 1 ? [...customItems, ...tmdbItems] : tmdbItems;
  } catch (e) {
    return getCustomMediaItems().filter(item => item.category === 'asian');
  }
};

export const getAdultMovies = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    const customItems = getCustomMediaItems().filter(item => item.category === 'adult');
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ar-SA&certification_country=US&certification=R&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    if (!data.results) return customItems;
    const tmdbItems = data.results.map((item: any) => mapResultToMediaItem(item, MediaType.MOVIE));
    return page === 1 ? [...customItems, ...tmdbItems] : tmdbItems;
  } catch (e) {
    return getCustomMediaItems().filter(item => item.category === 'adult');
  }
};

export const getMediaDetails = async (id: number, type: MediaType): Promise<MediaItem | null> => {
  // Check in custom items first
  const customItems = getCustomMediaItems();
  const customItem = customItems.find(item => item.id === id);
  if (customItem) {
    return customItem;
  }

  try {
    const endpoint = type === MediaType.MOVIE ? 'movie' : 'tv';
    const res = await fetch(`${BASE_URL}/${endpoint}/${id}?api_key=${API_KEY}&language=ar-SA&append_to_response=credits,similar,external_ids`);
    const data = await res.json();
    
    if (data.success === false) return null;

    const baseItem = mapResultToMediaItem(data, type);
    
    // Process cast
    const cast: Actor[] = data.credits?.cast?.slice(0, 10).map((actor: any) => ({
      id: actor.id,
      name: actor.name,
      character: actor.character,
      image: actor.profile_path ? `${IMAGE_BASE}/w185${actor.profile_path}` : null
    })) || [];

    // Process seasons for TV shows
    let seasons: Season[] = [];
    if (type === MediaType.SERIES && data.seasons) {
      seasons = data.seasons.map((s: any) => ({
        id: s.id,
        name: s.name,
        poster: s.poster_path ? `${IMAGE_BASE}/w300${s.poster_path}` : null,
        seasonNumber: s.season_number,
        episodeCount: s.episode_count,
        airDate: s.air_date || ''
      }));
    }

    // Process similar
    const similar = data.similar?.results?.map((item: any) => mapResultToMediaItem(item, type)) || [];

    return {
      ...baseItem,
      duration: type === MediaType.MOVIE ? `${data.runtime} دقيقة` : `${data.number_of_seasons} مواسم`,
      cast,
      similar,
      seasons,
      imdb_id: data.external_ids?.imdb_id || data.imdb_id || undefined
    };
  } catch (e) {
    console.error('Error fetching details:', e);
    return null;
  }
};

export const getSeasonEpisodes = async (seriesId: number, seasonNumber: number): Promise<Episode[]> => {
  // Check in custom series first
  const customItems = getCustomMediaItems();
  const customItem = customItems.find(item => item.id === seriesId);
  if (customItem) {
    const episodes = (customItem as any).customEpisodes || [];
    return episodes.filter((ep: any) => ep.seasonNumber === seasonNumber);
  }

  try {
    const res = await fetch(`${BASE_URL}/tv/${seriesId}/season/${seasonNumber}?api_key=${API_KEY}&language=ar-SA`);
    const data = await res.json();
    
    return data.episodes?.map((e: any) => ({
      id: e.id,
      name: e.name,
      overview: e.overview || 'لا يتوفر وصف للحلقة.',
      image: e.still_path ? `${IMAGE_BASE}/w500${e.still_path}` : null,
      episodeNumber: e.episode_number,
      seasonNumber: e.season_number,
      airDate: e.air_date,
      rating: e.vote_average ? parseFloat(e.vote_average.toFixed(1)) : 0,
      duration: e.runtime
    })) || [];
  } catch (e) {
    console.error('Error fetching episodes:', e);
    return [];
  }
};
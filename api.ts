import { MediaItem, MediaType, Actor, Season, Episode } from './types';

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
  try {
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=ar-SA&query=${encodeURIComponent(query)}&page=1&include_adult=false`);
    const data = await res.json();
    
    if (!data.results) return [];

    // Filter only movie and tv types
    const validResults = data.results.filter((item: any) => 
      (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
    );

    return validResults.map((item: any) => 
      mapResultToMediaItem(item, item.media_type === 'movie' ? MediaType.MOVIE : MediaType.SERIES)
    );
  } catch (e) {
    console.error('Search error:', e);
    return [];
  }
};

export const getTrendingMovies = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=ar-SA&page=${page}`);
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map((item: any) => mapResultToMediaItem(item, MediaType.MOVIE));
  } catch (e) {
    console.error('Error fetching trending movies:', e);
    return [];
  }
};

export const getTrendingSeries = async (): Promise<MediaItem[]> => {
  try {
    const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&language=ar-SA`);
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map((item: any) => mapResultToMediaItem(item, MediaType.SERIES));
  } catch (e) {
    console.error('Error fetching trending series:', e);
    return [];
  }
};

export const getDiscoverSeries = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=ar-SA&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map((item: any) => mapResultToMediaItem(item, MediaType.SERIES));
  } catch (e) {
    console.error('Error fetching discover series:', e);
    return [];
  }
};

export const getRamadanSeries = async (): Promise<MediaItem[]> => {
  try {
    // Sorted by popularity to ensure we get visible results
    const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=ar-SA&with_original_language=ar&sort_by=popularity.desc&page=1`);
    const data = await res.json();
    if (!data.results) return [];
    const validResults = data.results.filter((item: any) => item.poster_path);
    return validResults.map((item: any) => mapResultToMediaItem(item, MediaType.SERIES));
  } catch (e) {
    console.error('Error fetching Arabic/Ramadan series:', e);
    return [];
  }
};

export const getTurkishSeries = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=ar-SA&with_origin_country=TR&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map((item: any) => mapResultToMediaItem(item, MediaType.SERIES));
  } catch (e) {
    console.error('Error fetching Turkish series:', e);
    return [];
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
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ar-SA&with_original_language=ar&sort_by=release_date.desc&page=${page}`);
    const data = await res.json();
    if (!data.results) return [];
    const validResults = data.results.filter((item: any) => item.poster_path);
    return validResults.map((item: any) => mapResultToMediaItem(item, MediaType.MOVIE));
  } catch (e) {
    return [];
  }
};

export const getEgyptianMovies = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    // Fetch Egyptian movies using country code EG (Egypt)
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ar-SA&with_origin_country=EG&sort_by=release_date.desc&page=${page}`);
    const data = await res.json();
    if (!data.results) return [];
    const validResults = data.results.filter((item: any) => item.poster_path);
    return validResults.map((item: any) => mapResultToMediaItem(item, MediaType.MOVIE));
  } catch (e) {
    return [];
  }
};

export const getForeignMovies = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ar-SA&with_original_language=en&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map((item: any) => mapResultToMediaItem(item, MediaType.MOVIE));
  } catch (e) {
    return [];
  }
};

export const getAsianMovies = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    // ko: Korean, ja: Japanese, zh: Chinese, hi: Hindi, th: Thai
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ar-SA&with_original_language=ko|ja|zh|hi|th&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map((item: any) => mapResultToMediaItem(item, MediaType.MOVIE));
  } catch (e) {
    return [];
  }
};

export const getAdultMovies = async (page: number = 1): Promise<MediaItem[]> => {
  try {
    // Fetches R-rated movies to act as the "Adults Only" section (Action/Horror/Thriller +18)
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ar-SA&certification_country=US&certification=R&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map((item: any) => mapResultToMediaItem(item, MediaType.MOVIE));
  } catch (e) {
    return [];
  }
};


export const getMediaDetails = async (id: number, type: MediaType): Promise<MediaItem | null> => {
  try {
    const endpoint = type === MediaType.MOVIE ? 'movie' : 'tv';
    const res = await fetch(`${BASE_URL}/${endpoint}/${id}?api_key=${API_KEY}&language=ar-SA&append_to_response=credits,similar`);
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
      seasons
    };
  } catch (e) {
    console.error('Error fetching details:', e);
    return null;
  }
};

export const getSeasonEpisodes = async (seriesId: number, seasonNumber: number): Promise<Episode[]> => {
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
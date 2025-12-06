import React from 'react';
import { Play, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MediaItem } from '../types';

interface MediaCardProps {
  item: MediaItem;
}

const MediaCard: React.FC<MediaCardProps> = ({ item }) => {
  const linkPath = `/${item.type === 'MOVIE' ? 'movies' : 'series'}/${item.id}`;

  return (
    <Link to={linkPath} className="group relative flex-shrink-0 w-[160px] md:w-[200px] cursor-pointer block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-gray-900 shadow-lg ring-1 ring-white/10">
        <img 
          src={item.image} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
           <div className="w-12 h-12 rounded-full bg-brand-red/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-75 shadow-lg shadow-brand-red/50">
             <Play fill="white" className="ml-1" size={20} />
           </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {item.quality && (
            <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white border border-white/10">
              {item.quality}
            </span>
          )}
        </div>
        
        <div className="absolute top-2 left-2">
           <span className="flex items-center gap-1 bg-yellow-500/90 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
              <Star size={10} fill="currentColor" /> {item.rating}
           </span>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="text-white font-semibold text-sm md:text-base truncate group-hover:text-brand-pink transition-colors">
          {item.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{item.year}</span>
          <span className="border border-white/10 px-1 rounded">{item.type === 'MOVIE' ? 'فيلم' : 'مسلسل'}</span>
        </div>
      </div>
    </Link>
  );
};

export default MediaCard;
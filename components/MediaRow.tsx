import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem, SectionProps } from '../types';
import MediaCard from './MediaCard';

const MediaRow: React.FC<SectionProps> = ({ title, items, viewAllPath }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  // If no items, do not render the section at all
  if (!items || items.length === 0) {
    return null;
  }

  const slide = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="py-8 relative group/row animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-end justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-white relative z-10 border-r-4 border-brand-red pr-4">
          {title}
        </h2>
        {viewAllPath ? (
          <Link 
            to={viewAllPath} 
            className="text-sm font-bold text-brand-pink hover:text-white transition-all bg-white/5 hover:bg-brand-pink/10 border border-white/5 hover:border-brand-pink/30 px-3.5 py-1.5 rounded-lg active:scale-95 shadow-md shadow-black/30"
          >
            عرض الكل
          </Link>
        ) : (
          <button className="text-sm font-bold text-brand-pink hover:text-white transition-colors">عرض الكل</button>
        )}
      </div>

      <div className="relative">
         {/* Navigation Buttons */}
         <button 
          onClick={() => slide('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/row:opacity-100 hover:bg-brand-red transition-all duration-300 disabled:opacity-0"
        >
          <ChevronRight size={24} />
        </button>
        <button 
          onClick={() => slide('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/row:opacity-100 hover:bg-brand-red transition-all duration-300 disabled:opacity-0"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Scroll Container with Mask Effect */}
        <div className="relative w-full overflow-hidden">
          {/* Fade overlays */}
          <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-brand-darker to-transparent z-20 pointer-events-none" />
          <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-brand-darker to-transparent z-20 pointer-events-none" />

          <div 
            ref={rowRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 py-4 snap-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((item) => (
              <div key={item.id} className="snap-start">
                 <MediaCard item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaRow;
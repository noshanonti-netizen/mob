import React from 'react';
import { MediaItem } from '../types';
import MediaCard from './MediaCard';

interface MediaGridProps {
  title: string;
  items: MediaItem[];
}

const MediaGrid: React.FC<MediaGridProps> = ({ title, items }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
      <h1 className="text-3xl font-bold text-white mb-8 border-r-4 border-brand-red pr-4">{title}</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
        {items.map((item) => (
          <div key={item.id} className="flex justify-center w-full">
            <MediaCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaGrid;
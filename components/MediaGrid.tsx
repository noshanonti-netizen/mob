import React from 'react';
import { MediaItem } from '../types';
import MediaCard from './MediaCard';
import BannerAd from './BannerAd';

interface MediaGridProps {
  title: string;
  items: MediaItem[];
}

const MediaGrid: React.FC<MediaGridProps> = ({ title, items }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
      <h1 className="text-3xl font-bold text-white mb-8 border-r-4 border-brand-red pr-4 select-none">{title}</h1>
      
      <div className="flex flex-col lg:flex-row-reverse gap-8 items-start">
        {/* Main Grid Column */}
        <div className="flex-1 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
            {items.map((item) => (
              <div key={item.id} className="flex justify-center w-full">
                <MediaCard item={item} />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Ad Column */}
        <div className="w-full lg:w-[320px] flex-shrink-0 bg-white/5 border border-white/10 p-4 rounded-2xl h-fit text-right">
          <h4 className="text-xs font-bold text-gray-400 mb-3 border-b border-white/5 pb-2">مساحة إعلانية</h4>
          <BannerAd slot="sidebarAd" />
        </div>
      </div>
    </div>
  );
};

export default MediaGrid;
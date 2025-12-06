import React, { useState, useEffect, useRef } from 'react';
import { Play, Star, Calendar, Clock, Eye, Pause } from 'lucide-react';
import { MediaItem } from '../types';
import { Link } from 'react-router-dom';

interface HeroProps {
  items: MediaItem[];
}

const Hero: React.FC<HeroProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  // Using ReturnType<typeof setInterval> to avoid NodeJS namespace dependency
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentItem = items[currentIndex];

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 0.5; // Adjust speed here
        });
      }, 30);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setProgress(0);
  };

  const handleManualChange = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  if (!currentItem) return null;

  return (
    <div className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-12">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
        style={{ backgroundImage: `url(${currentItem.backdrop})` }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-darker via-brand-darker/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-darker via-brand-darker/60 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
          
          {/* Poster Section (Left in code, Right in RTL) */}
          <div className="relative w-52 h-[310px] sm:w-64 sm:h-[380px] md:w-72 md:h-[430px] flex-shrink-0 group order-1 lg:order-none animate-fadeIn">
            {/* Glow Effect */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-brand-red/30 to-brand-purple/30 blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
            
            <div className="relative w-full h-full rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-2xl transform transition-transform duration-500 group-hover:scale-[1.02]">
              <img 
                src={currentItem.image} 
                alt={currentItem.title} 
                className="w-full h-full object-cover"
                loading="eager" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-xs font-bold border border-white/10">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                <span>{currentItem.rating}</span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 text-center lg:text-right relative z-20 order-2 lg:order-none w-full">
            
            {/* Branding Title */}
            <h1 className="sr-only">{currentItem.title}</h1>
            <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-2 tracking-tight">
              <span className="bg-gradient-to-r from-brand-red via-brand-pink to-brand-purple bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(255,37,85,0.3)] animate-fadeIn">
                {currentItem.title}
              </span>
            </div>

            <p className="text-gray-400 text-lg mb-6 max-w-2xl mx-auto lg:mx-0 font-light">
              مشاهدة وتحميل بجودة عالية
            </p>

            {/* Badges */}
            <div className="mb-8 inline-flex flex-wrap justify-center lg:justify-start items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-brand-red text-white text-xs font-bold shadow-[0_0_10px_rgba(255,37,85,0.4)]">
                {currentItem.type === 'MOVIE' ? 'فيلم' : 'مسلسل'}
              </span>
              <span className="px-3 py-1 rounded-md bg-white/10 border border-white/10 text-xs font-medium text-gray-300">
                {currentItem.quality || 'HD'}
              </span>
              <span className="flex items-center gap-1.5 text-yellow-400 text-sm font-medium bg-black/30 px-3 py-1 rounded-full border border-white/5">
                <Star className="w-4 h-4 fill-current" />
                {currentItem.rating}
              </span>
              <span className="flex items-center gap-1.5 text-gray-300 text-sm font-medium bg-black/30 px-3 py-1 rounded-full border border-white/5">
                <Calendar className="w-4 h-4" />
                {currentItem.year}
              </span>
              <span className="flex items-center gap-1.5 text-gray-300 text-sm font-medium bg-black/30 px-3 py-1 rounded-full border border-white/5">
                <Eye className="w-4 h-4" />
                {(currentItem.rating * 12.5).toFixed(1)}M
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-200 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-6 text-base md:text-lg line-clamp-3">
              {currentItem.description}
            </p>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-8">
              {currentItem.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-purple/30 text-sm text-brand-pink hover:bg-brand-purple/30 transition-colors cursor-default">
                  {tag}
                </span>
              ))}
              {(!currentItem.tags || currentItem.tags.length === 0) && (
                 <>
                  <span className="px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-purple/30 text-sm text-brand-pink">دراما</span>
                  <span className="px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-purple/30 text-sm text-brand-pink">تشويق</span>
                 </>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Link 
                to={`/${currentItem.type === 'MOVIE' ? 'movies' : 'series'}/${currentItem.id}`}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-brand-red to-brand-pink text-white shadow-[0_0_20px_rgba(255,37,85,0.4)] hover:shadow-[0_0_30px_rgba(255,37,85,0.6)] hover:scale-105 transition-all duration-300"
              >
                <Play className="w-6 h-6 fill-current" />
                <span>شاهد الآن</span>
              </Link>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors backdrop-blur-sm"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{isPlaying ? 'إيقاف' : 'تشغيل'}</span>
              </button>
            </div>

            {/* Thumbnails & Progress */}
            <div className="mt-4 space-y-5">
              
              {/* Progress Bar */}
              <div className="h-1.5 w-full sm:w-64 bg-white/10 rounded-full overflow-hidden mx-auto lg:mx-0">
                <div 
                  style={{ width: `${progress}%` }} 
                  className="h-full bg-gradient-to-r from-brand-red via-brand-pink to-brand-purple transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(255,37,85,0.5)]"
                ></div>
              </div>

              {/* Thumbnails List */}
              <div className="flex justify-center lg:justify-start gap-3 overflow-x-auto pb-4 scrollbar-hide mask-fade-sides">
                {items.slice(0, 6).map((item, idx) => (
                  <button 
                    key={item.id}
                    onClick={() => handleManualChange(idx)}
                    className={`relative w-14 h-20 sm:w-16 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 ${
                      idx === currentIndex 
                        ? 'ring-2 ring-brand-pink scale-110 shadow-lg shadow-brand-pink/20 z-10' 
                        : 'ring-1 ring-white/10 opacity-60 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover" 
                    />
                    {idx === currentIndex && (
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-red/20 to-transparent"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
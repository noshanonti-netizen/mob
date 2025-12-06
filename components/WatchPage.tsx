import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Play, Download, Server, AlertCircle, ChevronRight, Shield, RefreshCw } from 'lucide-react';
import { getMediaDetails } from '../api';
import { MediaItem, MediaType } from '../types';
import BannerAd from './BannerAd';

// API Key for premium/auth access (Used for VIP server and Downloads)
const API_TOKEN = 'daab58b91dd26081ea83a8e1';

const SERVERS = [
  { id: 1, name: 'سيرفر أساسي (VidSrc)', type: 'VIDSRC' },
  { id: 2, name: 'سيرفر VIP (UpNShare)', type: 'VIP' },
  { id: 3, name: 'سيرفر احتياطي', type: 'VIDSRC_BACKUP' },
];

const WatchPage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [searchParams] = useSearchParams();
  
  const [item, setItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeServerId, setActiveServerId] = useState(1); // Default to VidSrc
  const [refreshCount, setRefreshCount] = useState(0);

  const mediaType = type === 'movie' ? MediaType.MOVIE : MediaType.SERIES;
  
  // Get Season and Episode from URL or default to 1
  const seasonNumber = searchParams.get('season') || '1';
  const episodeNumber = searchParams.get('episode') || '1';

  // Construct Download URL (Keep using URPlayer for downloads as it provides direct links)
  const downloadUrl = mediaType === MediaType.MOVIE
    ? `https://d.urplayer.xyz/movie/${id}?key=${API_TOKEN}`
    : `https://d.urplayer.xyz/tv/${id}/${seasonNumber}/${episodeNumber}?key=${API_TOKEN}`;

  // Helper to determine the Embed URL based on active server
  const getEmbedUrl = () => {
    const activeServer = SERVERS.find(s => s.id === activeServerId);
    
    // VidSrc Logic (New Documentation)
    if (activeServer?.type === 'VIDSRC' || activeServer?.type === 'VIDSRC_BACKUP') {
       if (mediaType === MediaType.MOVIE) {
         return `https://vidsrc-embed.ru/embed/movie?tmdb=${id}`;
       } else {
         return `https://vidsrc-embed.ru/embed/tv?tmdb=${id}&season=${seasonNumber}&episode=${episodeNumber}`;
       }
    }

    // Default / VIP Logic (URPlayer / UpNShare)
    if (mediaType === MediaType.MOVIE) {
      return `https://urplayer.xyz/embed/movie/${id}?key=${API_TOKEN}`;
    } else {
      return `https://urplayer.xyz/embed/tv/${id}/${seasonNumber}/${episodeNumber}?key=${API_TOKEN}`;
    }
  };

  const embedUrl = getEmbedUrl();

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      if (id) {
        const data = await getMediaDetails(parseInt(id), mediaType);
        setItem(data);
      }
      setLoading(false);
    };
    loadDetails();
    window.scrollTo(0, 0);
  }, [id, mediaType]);

  const handleServerChange = (serverId: number) => {
    setActiveServerId(serverId);
    setRefreshCount(prev => prev + 1); // Force reload iframe
  };

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-darker">
        <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="min-h-screen bg-brand-darker pb-20 pt-24">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-3xl"
          style={{ backgroundImage: `url(${item.backdrop})` }}
        />
        <div className="absolute inset-0 bg-brand-darker/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link to="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronRight size={14} />
            <Link to={mediaType === MediaType.MOVIE ? '/movies' : '/series'} className="hover:text-white transition-colors">
              {mediaType === MediaType.MOVIE ? 'أفلام' : 'مسلسلات'}
            </Link>
            <ChevronRight size={14} />
            <Link to={`/${mediaType === MediaType.MOVIE ? 'movies' : 'series'}/${id}`} className="hover:text-white transition-colors">
              {item.title}
            </Link>
            {mediaType === MediaType.SERIES && (
               <>
                 <ChevronRight size={14} />
                 <span className="text-brand-pink">م {seasonNumber} : ح {episodeNumber}</span>
               </>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            مشاهدة {mediaType === MediaType.MOVIE ? 'فيلم' : 'مسلسل'} <span className="text-brand-red">{item.title}</span>
            {mediaType === MediaType.SERIES && <span className="text-gray-400 text-lg mr-2 font-normal">(الموسم {seasonNumber} - الحلقة {episodeNumber})</span>}
          </h1>
        </div>

        {/* Video Player Container */}
        <div className="bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-8 relative group">
          <div className="aspect-video w-full relative">
            <iframe 
              // Key ensures iframe reloads when URL, server, or refresh button changes
              key={`${activeServerId}-${refreshCount}-${seasonNumber}-${episodeNumber}`}
              src={embedUrl}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={`${item.title} Player`}
            ></iframe>
          </div>
          
          {/* Server Selection Bar */}
          <div className="bg-brand-darker/90 backdrop-blur border-t border-white/10 p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto scrollbar-hide pb-2 md:pb-0">
                <div className="flex items-center gap-2 text-gray-400 pl-4 border-l border-white/10 ml-2">
                  <Server size={18} />
                  <span className="text-sm font-medium whitespace-nowrap">سيرفرات المشاهدة:</span>
                </div>
                {SERVERS.map((server) => (
                  <button
                    key={server.id}
                    onClick={() => handleServerChange(server.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      activeServerId === server.id
                        ? 'bg-brand-pink text-white shadow-[0_0_10px_rgba(255,79,156,0.3)]'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {server.name}
                    {server.type === 'VIP' && (
                      <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-1.5 rounded ml-1 border border-yellow-500/20">VIP</span>
                    )}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleRefresh}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <RefreshCw size={16} />
                تحديث المشغل
              </button>
            </div>
          </div>
        </div>
        
        <BannerAd />

        {/* Download Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Download Iframe */}
          <div className="lg:col-span-2 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Download className="text-brand-pink" size={20} />
                روابط التحميل
              </h3>
              <span className="text-xs text-gray-400 bg-black/30 px-2 py-1 rounded flex items-center gap-1">
                <Shield size={10} className="text-green-500" /> سيرفرات سريعة
              </span>
            </div>
            
            <div className="w-full h-[400px] bg-black/20">
              <iframe
                src={downloadUrl}
                className="w-full h-full"
                frameBorder="0"
                title="Download Links"
              ></iframe>
            </div>
          </div>

          {/* Sidebar / Info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-brand-red/10 to-brand-purple/10 rounded-2xl p-6 border border-brand-red/20">
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <AlertCircle size={18} className="text-brand-red" />
                تنبيه هام
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                في حال توقف الفيلم أو المسلسل، يرجى تغيير السيرفر من القائمة أعلاه أو الضغط على زر "تحديث المشغل". ننصح باستخدام السيرفر الأساسي للاستقرار أو VIP للسرعة.
              </p>
              <button onClick={handleRefresh} className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/10">
                إعادة تحميل الصفحة
              </button>
            </div>
            
             <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="text-white font-bold mb-4">قصة العمل</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.description}
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
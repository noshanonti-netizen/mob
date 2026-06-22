import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Play, Download, Server, AlertCircle, ChevronRight, Shield, RefreshCw, Share2, X, Link as LinkIcon, Check, Edit3 } from 'lucide-react';
import { getMediaDetails, getCustomServers, CustomServersData } from '../api';
import { MediaItem, MediaType } from '../types';
import BannerAd from './BannerAd';

// API Key for premium/auth access (Used for VIP server and Downloads)
const API_TOKEN = 'daab58b91dd26081ea83a8e1';

const SERVERS = [
  { id: 1, name: 'سيرفر أساسي (VidSrc Ru)', type: 'VIDSRC_RU' },
  { id: 2, name: 'سيرفر VIP (MultiEmbed)', type: 'MULTIEMBED' },
  { id: 3, name: 'سيرفر GoDrivePlayer', type: 'GODRIVE' },
];

// Custom Social Icons
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.797 1.66-2.797 3.54v.433h4.976l-1.001 3.667h-3.975v7.98H9.101Z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231h.001Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
  </svg>
);

const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

const PinterestIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.399.165-1.495-.69-2.433-2.852-2.433-4.587 0-3.728 2.703-7.161 7.791-7.161 4.092 0 7.276 2.913 7.276 6.813 0 4.056-2.558 7.332-6.113 7.332-1.194 0-2.317-.619-2.702-1.352l-.736 2.802c-.265 1.019-.986 2.293-1.466 3.072 1.099.325 2.256.499 3.447.499 6.613 0 11.979-5.368 11.979-11.9870-.001-6.62-5.366-11.987-11.987-11.987Z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
  </svg>
);

const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.003 1.14c-3.157 0-5.464 2.14-5.74 5.093-.032.325-.262.593-.574.654-.537.106-1.52.366-1.52 1.393 0 .736.438 1.056.764 1.226.436.227.42.597.35 1.002-.124.698-.38 2.17.653 3.097.432.387 1.077.534 1.288 1.295.1.373-.09.917-.373 1.348-.37.568-.78 1.196-.407 1.874.303.551 1.026.732 1.57.514.417-.168.618-.54.99-.54 2.454 0 2.373 2.126 5.992 0 .373 0 .573.372.99.54.544.218 1.267.037 1.57-.514.373-.678-.037-1.306-.407-1.874-.282-.43-.473-.975-.373-1.348.21-.76.856-.908 1.288-1.295 1.033-.927.777-2.4.653-3.097-.07-.405-.086-.775.35-1.002.326-.17.764-.49.764-1.226 0-1.027-.983-1.287-1.52-1.393-.312-.06-.542-.33-.574-.654-.276-2.953-2.583-5.093-5.74-5.093Z" />
  </svg>
);

const WatchPage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [searchParams] = useSearchParams();
  
  const [item, setItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeServerId, setActiveServerId] = useState(100); // Default to Custom Servers
  const [refreshCount, setRefreshCount] = useState(0);
  const [customServers, setCustomServers] = useState<CustomServersData | null>(null);

  // Share Modal State
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const mediaType = type === 'movie' ? MediaType.MOVIE : MediaType.SERIES;
  
  // Get Season and Episode from URL or default to 1
  const seasonNumber = searchParams.get('season') || '1';
  const episodeNumber = searchParams.get('episode') || '1';

  // Helper to determine the list of watch servers (prioritizing custom ones)
  const getServersList = () => {
    if (customServers && customServers.watch.length > 0) {
      return customServers.watch.map((srv, idx) => ({
        id: 100 + idx,
        name: srv.name,
        type: 'CUSTOM' as any,
        url: srv.url
      }));
    }
    return []; // Stop fallback automatic watch servers - only show custom admin ones
  };

  // Construct Download URL (Keep using URPlayer for downloads as it provides direct links)
  const downloadUrl = mediaType === MediaType.MOVIE
    ? `https://d.urplayer.xyz/movie/${id}?key=${API_TOKEN}`
    : `https://d.urplayer.xyz/tv/${id}/${seasonNumber}/${episodeNumber}?key=${API_TOKEN}`;

  // Helper to determine the Embed URL based on active server
  const getEmbedUrl = () => {
    const servers = getServersList();
    const activeServer = servers.find(s => s.id === activeServerId);
    
    if (activeServer && 'url' in activeServer) {
      // Replace {season} and {episode} values dynamically in template URLs
      return activeServer.url
        .replace(/{season}/g, seasonNumber)
        .replace(/{episode}/g, episodeNumber);
    }

    // VidSrc Ru Server Selection
    if (activeServer?.type === 'VIDSRC_RU') {
       if (mediaType === MediaType.MOVIE) {
         if (item?.imdb_id) {
           return `https://vidsrc-embed.ru/embed/movie?imdb=${item.imdb_id}`;
         } else {
           return `https://vidsrc-embed.ru/embed/movie?tmdb=${id}`;
         }
       } else {
         if (item?.imdb_id) {
           return `https://vidsrc-embed.ru/embed/tv?imdb=${item.imdb_id}&season=${seasonNumber}&episode=${episodeNumber}`;
         } else {
           return `https://vidsrc-embed.ru/embed/tv?tmdb=${id}&season=${seasonNumber}&episode=${episodeNumber}`;
         }
       }
    }

    // MultiEmbed Server Selection
    if (activeServer?.type === 'MULTIEMBED') {
       const videoId = item?.imdb_id || id;
       const tmdbParam = item?.imdb_id ? '' : '&tmdb=1';
       if (mediaType === MediaType.MOVIE) {
         return `https://multiembed.mov/?video_id=${videoId}${tmdbParam}`;
       } else {
         return `https://multiembed.mov/?video_id=${videoId}${tmdbParam}&s=${seasonNumber}&e=${episodeNumber}`;
       }
    }

    // GoDrivePlayer Server Selection
    if (activeServer?.type === 'GODRIVE') {
       if (mediaType === MediaType.MOVIE) {
         return `https://godriveplayer.space/player.php?imdb=${item?.imdb_id || id}`;
       } else {
         return `https://godriveplayer.space/player.php?type=series&tmdb=${id}&season=${seasonNumber}&episode=${episodeNumber}`;
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

  useEffect(() => {
    if (id) {
      const typeStr = type === 'movie' ? 'movie' : 'series';
      const srv = getCustomServers(typeStr, id, seasonNumber, episodeNumber);
      setCustomServers(srv);
      if (srv && srv.watch.length > 0) {
        setActiveServerId(100);
      } else {
        setActiveServerId(0); // No custom server exists
      }
    }
  }, [id, type, seasonNumber, episodeNumber]);

  const handleServerChange = (serverId: number) => {
    setActiveServerId(serverId);
    setRefreshCount(prev => prev + 1); // Force reload iframe
  };

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  const handleShare = (platform: string) => {
    if (!item) return;

    const url = window.location.href;
    const text = `شاهد ${item.title} الآن على افلاميكوز`;
    const image = item.image;

    let shareLink = '';

    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'pinterest':
        shareLink = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(text)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return; // Don't open window
      default:
        // For Instagram and Snapchat, we fallback to copy link
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
    setIsShareOpen(false);
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
        
        {/* Breadcrumb & Title & Share */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
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
          
          <div className="flex gap-2">
            {sessionStorage.getItem('aflameco_admin_auth') === 'true' && (
              <Link 
                to={`/admin?editId=${item.id}&type=${type}${mediaType === MediaType.SERIES ? `&season=${seasonNumber}&episode=${episodeNumber}` : ''}`}
                className="flex items-center gap-2 bg-brand-pink/20 hover:bg-brand-pink text-white px-4 py-2 rounded-lg font-medium transition-colors border border-brand-pink/30 hover:border-transparent"
                title="تعديل هذا العمل الفني وتغيير سيرفرات عرضه في صفحة الإشراف"
              >
                <Edit3 size={16} />
                تعديل العمل وروابطه
              </Link>
            )}
            <button 
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-white/10"
            >
              <Share2 size={18} />
              مشاركة العرض
            </button>
          </div>
        </div>

        {/* Top Header Ad banner (WordPress theme placement) */}
        <BannerAd slot="headerAd" />

        {/* Video Player Container */}
        <div className="bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-8 relative group">
          <div className="aspect-video w-full relative bg-[#0a0d14]">
            {embedUrl ? (
              <iframe 
                // Key ensures iframe reloads when URL, server, or refresh button changes
                key={`${activeServerId}-${refreshCount}-${seasonNumber}-${episodeNumber}`}
                src={embedUrl}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title={`${item.title} Player`}
                referrerPolicy="origin"
              ></iframe>
            ) : (
              <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-br from-[#0c101b] to-black">
                <div className="w-16 h-16 rounded-full bg-brand-pink/10 flex items-center justify-center text-brand-pink mb-4 animate-pulse">
                  <Play size={32} fill="currentColor" className="mr-[-2px]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">سيرفرات المشاهدة غير متوفرة حالياً</h3>
                <p className="text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
                  لم يتم إضافة سيرفرات مشاهدة مخصصة لهذا الإصدار بعد. يرجى إضافة روابط سيرفرات البث من خلال صفحة الإشراف لعرضها للزوار.
                </p>
                {sessionStorage.getItem('aflameco_admin_auth') === 'true' && (
                  <Link 
                    to={`/admin?editId=${item.id}&type=${type}${mediaType === MediaType.SERIES ? `&season=${seasonNumber}&episode=${episodeNumber}` : ''}`}
                    className="flex items-center gap-2 bg-brand-pink hover:bg-brand-pink/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm"
                  >
                    <Edit3 size={18} />
                    إضافة سيرفر مشاهدة جديد الآن
                  </Link>
                )}
              </div>
            )}
          </div>
          
          {/* Server Selection Bar */}
          <div className="bg-brand-darker/90 backdrop-blur border-t border-white/10 p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto scrollbar-hide pb-2 md:pb-0">
                <div className="flex items-center gap-2 text-gray-400 pl-4 border-l border-white/10 ml-2">
                  <Server size={18} />
                  <span className="text-sm font-medium whitespace-nowrap">سيرفرات المشاهدة:</span>
                </div>
                {getServersList().length > 0 ? (
                  getServersList().map((server) => (
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
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 italic">لا توجد سيرفرات مضافة حالياً لهذا العمل</span>
                )}
              </div>

              <button 
                onClick={handleRefresh}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                disabled={!embedUrl}
              >
                <RefreshCw size={16} />
                تحديث المشغل
              </button>
            </div>
          </div>
        </div>
        
        <BannerAd slot="watchPageAd" />

        {/* WordPress Interactive Download Central Hub (مكان التحميل المباشر المطور للزوار) */}
        <div className="bg-gradient-to-br from-[#111625] to-[#161f36] border border-white/5 rounded-2xl p-6 shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-brand-pink/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                <Download size={22} className="animate-bounce" />
              </div>
              <div className="text-right">
                <h3 className="text-lg font-black text-white">روابط التحميل المباشرة والسريعة</h3>
                <p className="text-xs text-gray-400 mt-0.5">اختر الجودة والسيرفر المناسب لبدء التحميل الفوري بنقرة واحدة</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3.5 py-1.5 rounded-xl border border-emerald-500/20 text-xs font-bold w-fit">
              <Shield size={14} fill="currentColor" />
              <span>روابط آمنة v2.4 خالية من المشاكل</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* High Quality Preset 1 */}
            <a 
              href={downloadUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 group shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 font-bold text-xs select-none">
                  FHD
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 block">سيرفر سريع (1080p)</span>
                  <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">تحميل مباشر خارجي دقة فائقة</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <span>جاهز للتحميل</span>
                <ChevronRight size={14} className="rotate-180" />
              </div>
            </a>

            {/* Quality Preset 2 */}
            <a 
              href={downloadUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-brand-pink/10 border border-white/10 hover:border-brand-pink/30 transition-all duration-300 group shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-pink/15 flex items-center justify-center text-brand-pink font-bold text-xs select-none">
                  HD
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 block">سيرفر ضغط الجودة (720p)</span>
                  <span className="text-sm font-bold text-white group-hover:text-brand-pink transition-colors">تنزيل سريع بجودة متزنة</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-brand-pink bg-brand-pink/10 px-2.5 py-1 rounded-lg border border-brand-pink/20 group-hover:scale-105 transition-transform">
                <span>جاهز للتحميل</span>
                <ChevronRight size={14} className="rotate-180" />
              </div>
            </a>

            {/* Custom Servers / Fallbacks */}
            {item?.download && item.download.length > 0 ? (
              item.download.map((server, idx) => (
                <a 
                  key={`item-dl-${idx}`}
                  href={server.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-brand-purple/10 border border-white/10 hover:border-brand-purple/30 transition-all duration-300 group shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-purple/15 flex items-center justify-center text-brand-purple font-bold text-xs select-none">
                      DL
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">سيرفر تحميل يدوي مخصص #{idx + 1}</span>
                      <span className="text-sm font-bold text-white group-hover:text-brand-purple transition-colors">{server.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-brand-purple bg-brand-purple/10 px-2.5 py-1 rounded-lg border border-brand-purple/20 group-hover:scale-105 transition-transform">
                    <span>تحميل مباشر</span>
                    <ChevronRight size={14} className="rotate-180" />
                  </div>
                </a>
              ))
            ) : customServers?.download && customServers.download.length > 0 ? (
              customServers.download.map((server, idx) => (
                <a 
                  key={`global-dl-${idx}`}
                  href={server.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 transition-all duration-300 group shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 font-bold text-xs select-none">
                      DL
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">سيرفر وكيل وموزع للشبكة #{idx + 1}</span>
                      <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{server.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 group-hover:scale-105 transition-transform">
                    <span>تنزيل سريع</span>
                    <ChevronRight size={14} className="rotate-180" />
                  </div>
                </a>
              ))
            ) : (
              <>
                {/* Extra simulated options to look complete and rich */}
                <a 
                  href={downloadUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-yellow-500/10 border border-white/10 hover:border-yellow-500/30 transition-all duration-300 group shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/15 flex items-center justify-center text-yellow-400 font-bold text-xs select-none">
                      SD
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">سيرفر ضغط للهواتف (480p)</span>
                      <span className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">جودة متوسطة موفرة للبيانات</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded-lg border border-yellow-500/20 group-hover:scale-105 transition-transform">
                    <span>جاهز للتحميل</span>
                    <ChevronRight size={14} className="rotate-180" />
                  </div>
                </a>

                <a 
                  href="https://t.me/aflameco_portal" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-sky-500/10 border border-white/10 hover:border-sky-500/30 transition-all duration-300 group shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-400 font-bold text-xs select-none">
                      TG
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">مجتمع المنصة التشاركي</span>
                      <span className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">تحميل سريع عبر تطبيق قنوات تيليجرام</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20 group-hover:scale-105 transition-transform">
                    <span>انضم الآن</span>
                    <ChevronRight size={14} className="rotate-180" />
                  </div>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Medium Rectangle or Landscape Ad Section (WordPress theme placement) */}
        <BannerAd slot="homePageAd" />

        {/* Info & Alerts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white/5 shadow-xl rounded-2xl p-6 border border-white/10">
            <h4 className="text-white font-bold mb-4 text-right flex items-center justify-end gap-2">
              <span>قصة العمل</span>
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed text-right">
              {item.description}
            </p>
          </div>

          <div className="bg-gradient-to-br from-brand-red/15 to-brand-purple/15 rounded-2xl p-6 border border-brand-red/25 shadow-xl text-right">
            <h4 className="text-white font-bold mb-3 flex items-center justify-end gap-2">
              <AlertCircle size={18} className="text-brand-pink" />
              تنبيه هام
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              في حال توقف الفيلم أو المسلسل، يرجى تغيير السيرفر من القائمة أعلاه أو الضغط على زر "تحديث المشغل". ننصح باستخدام السيرفر الأساسي للاستقرار أو VIP للسرعة.
            </p>
            <button onClick={handleRefresh} className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/10">
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {isShareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={() => setIsShareOpen(false)}>
          <div className="bg-brand-darker border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl transform transition-all" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">مشاركة العرض</h3>
              <button onClick={() => setIsShareOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <button onClick={() => handleShare('facebook')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-[#1877F2]/20 hover:text-[#1877F2] transition-colors group">
                <FacebookIcon className="w-8 h-8 text-white group-hover:text-[#1877F2] transition-colors" />
                <span className="text-xs font-medium">فيسبوك</span>
              </button>
              
              <button onClick={() => handleShare('twitter')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/20 hover:text-white transition-colors group">
                <TwitterIcon className="w-8 h-8 text-white transition-colors" />
                <span className="text-xs font-medium">تويتر</span>
              </button>
              
              <button onClick={() => handleShare('whatsapp')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-[#25D366]/20 hover:text-[#25D366] transition-colors group">
                <WhatsappIcon className="w-8 h-8 text-white group-hover:text-[#25D366] transition-colors" />
                <span className="text-xs font-medium">واتساب</span>
              </button>

              <button onClick={() => handleShare('pinterest')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-[#BD081C]/20 hover:text-[#BD081C] transition-colors group">
                <PinterestIcon className="w-8 h-8 text-white group-hover:text-[#BD081C] transition-colors" />
                <span className="text-xs font-medium">بنترست</span>
              </button>

              <button onClick={() => handleShare('copy')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white transition-colors group">
                <InstagramIcon className="w-8 h-8 text-white transition-colors" />
                <span className="text-xs font-medium">انستجرام</span>
              </button>

              <button onClick={() => handleShare('copy')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-[#FFFC00]/20 hover:text-[#FFFC00] transition-colors group">
                <SnapchatIcon className="w-8 h-8 text-white group-hover:text-[#FFFC00] transition-colors" />
                <span className="text-xs font-medium">سناب شات</span>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
               <div className="flex items-center gap-2 bg-black/30 p-3 rounded-lg border border-white/5">
                  <LinkIcon size={16} className="text-gray-500" />
                  <span className="text-xs text-gray-400 truncate flex-1 font-mono dir-ltr">{window.location.href}</span>
                  <button 
                    onClick={() => handleShare('copy')} 
                    className="text-brand-pink text-xs font-bold hover:text-white transition-colors flex items-center gap-1"
                  >
                    {copied ? <Check size={14} /> : 'نسخ'}
                  </button>
               </div>
               {copied && (
                 <p className="text-green-500 text-xs text-center mt-2 animate-fadeIn">تم نسخ الرابط بنجاح!</p>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchPage;
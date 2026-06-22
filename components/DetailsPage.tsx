import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, Calendar, Clock, Share2, Download, User, Layers, Info, X, Link as LinkIcon, Check, Edit3, Settings } from 'lucide-react';
import { MediaItem, MediaType, Episode } from '../types';
import { getMediaDetails, getSeasonEpisodes } from '../api';
import MediaRow from './MediaRow';
import BannerAd from './BannerAd';
import SEO from './SEO';

interface DetailsPageProps {
  type: MediaType;
}

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

const DetailsPage: React.FC<DetailsPageProps> = ({ type }) => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Seasons & Episodes State
  const [activeSeason, setActiveSeason] = useState<number | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Share Modal State
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      if (id) {
        const data = await getMediaDetails(parseInt(id), type);
        setItem(data);
        
        // Auto select first season if available
        if (data?.type === MediaType.SERIES && data.seasons && data.seasons.length > 0) {
            const defaultSeason = data.seasons.find(s => s.seasonNumber === 1) || data.seasons[0];
            if (defaultSeason) {
                setActiveSeason(defaultSeason.seasonNumber);
            }
        }
      }
      setLoading(false);
    };
    loadDetails();
    window.scrollTo(0, 0);
  }, [id, type]);

  // Fetch episodes when activeSeason changes
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (id && activeSeason !== null && type === MediaType.SERIES) {
        setLoadingEpisodes(true);
        const eps = await getSeasonEpisodes(parseInt(id), activeSeason);
        setEpisodes(eps);
        setLoadingEpisodes(false);
      }
    };
    fetchEpisodes();
  }, [activeSeason, id, type]);

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

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-darker text-white">
        <h2 className="text-2xl font-bold mb-4">لم يتم العثور على المحتوى</h2>
        <p className="text-gray-400">الرابط الذي تحاول الوصول إليه غير صحيح أو تم حذفه.</p>
      </div>
    );
  }

  const watchLink = `/watch/${type === MediaType.MOVIE ? 'movie' : 'series'}/${item.id}`;

  return (
    <div className="min-h-screen bg-brand-darker pb-20">
      {/* Hero / Backdrop Section */}
      <div className="relative w-full h-[60vh] md:h-[80vh]">
        <div 
          className="absolute inset-0 bg-cover bg-top"
          style={{ backgroundImage: `url(${item.backdrop})` }}
        >
           <div className="absolute inset-0 bg-gradient-to-b from-brand-darker/30 via-brand-darker/60 to-brand-darker"></div>
           <div className="absolute inset-0 bg-gradient-to-r from-brand-darker via-brand-darker/80 to-transparent"></div>
        </div>

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
              
              {/* Poster */}
              <div className="w-48 sm:w-64 md:w-80 flex-shrink-0 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 hidden md:block animate-fadeIn">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 text-white animate-fadeIn">
                {/* WordPress Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-brand-pink mb-3 font-semibold select-none bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 w-fit">
                  <Link to="/" className="hover:underline text-gray-400">الرئيسية</Link>
                  <span className="text-gray-600">/</span>
                  <Link to={type === MediaType.MOVIE ? "/movies" : "/series"} className="hover:underline text-gray-400">
                    {type === MediaType.MOVIE ? "الأفلام" : "المسلسلات"}
                  </Link>
                  <span className="text-gray-600">/</span>
                  <span className="text-brand-pink truncate max-w-[150px]">{item.title}</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                  {item.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm md:text-base font-medium text-gray-300">
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star size={18} fill="currentColor" /> {item.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={18} /> {item.year}
                  </span>
                  {item.duration && (
                    <span className="flex items-center gap-1">
                      <Clock size={18} /> {item.duration}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded border border-white/20 text-xs">
                    {item.quality || 'HD'}
                  </span>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {item.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors cursor-default">
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-3xl line-clamp-4 md:line-clamp-none">
                  {item.description}
                </p>

                {/* Buttons */}
                <div className="flex flex-wrap gap-4 relative">
                  <Link 
                    to={watchLink}
                    className="flex items-center gap-2 bg-brand-red hover:bg-red-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-red/30 hover:shadow-brand-red/50 hover:scale-105"
                  >
                    <Play fill="currentColor" size={20} />
                    مشاهدة الآن
                  </Link>
                  <Link 
                    to={watchLink}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-xl font-semibold transition-all backdrop-blur-sm"
                  >
                    <Download size={20} />
                    تحميل
                  </Link>
                  <button 
                    onClick={() => setIsShareOpen(true)}
                    className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                    aria-label="Share"
                  >
                    <Share2 size={20} />
                  </button>
                  {sessionStorage.getItem('aflameco_admin_auth') === 'true' && (
                    <Link 
                      to={`/admin?editId=${item.id}&type=${type}`}
                      className="flex items-center gap-2 bg-brand-pink/20 hover:bg-brand-pink border border-brand-pink/50 text-brand-pink hover:text-white px-6 py-3.5 rounded-xl font-bold transition-all"
                      title="تعديل تفاصيل العمل وسيرفرات البث"
                    >
                      <Edit3 size={18} />
                      تعديل العمل وروابطه
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {isShareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={() => setIsShareOpen(false)}>
          <div className="bg-brand-darker border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl transform transition-all" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">مشاركة المحتوى</h3>
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

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-0">
        
        {/* Mobile Poster (Visible only on small screens) */}
        <div className="md:hidden -mt-20 mb-8 relative z-10 flex gap-4">
           <div className="w-32 rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/20">
             <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
           </div>
           <div className="pt-20">
              {/* Additional mobile actions if needed */}
           </div>
        </div>
        
        <BannerAd slot="detailsPageAd" />

        {/* Seasons & Episodes Section (Series Only) */}
        {item.type === MediaType.SERIES && item.seasons && item.seasons.length > 0 && (
          <div className="mb-12 animate-fadeIn scroll-mt-24" id="seasons">
            <div className="flex items-center gap-2 mb-6 border-r-4 border-brand-pink pr-4">
              <Layers className="text-brand-pink" size={24} />
              <h3 className="text-2xl font-bold text-white">المواسم والحلقات</h3>
            </div>
            
            {/* Seasons List */}
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 mb-8">
              {item.seasons.map((season) => (
                <button 
                  key={season.id} 
                  onClick={() => setActiveSeason(season.seasonNumber)}
                  className={`flex-shrink-0 w-32 sm:w-36 group cursor-pointer text-right outline-none transition-all duration-300 ${activeSeason === season.seasonNumber ? 'scale-105' : 'opacity-70 hover:opacity-100'}`}
                >
                  <div className={`relative aspect-[2/3] rounded-xl overflow-hidden mb-3 ring-2 shadow-lg transition-all ${activeSeason === season.seasonNumber ? 'ring-brand-pink shadow-brand-pink/20' : 'ring-white/10 group-hover:ring-white/30'}`}>
                    <img 
                      src={season.poster || item.image} 
                      alt={season.name} 
                      className="w-full h-full object-cover" 
                    />
                    <div className={`absolute inset-0 bg-black/40 transition-colors ${activeSeason === season.seasonNumber ? 'bg-transparent' : ''}`}></div>
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur px-2 py-0.5 rounded text-xs text-white font-medium border border-white/10">
                      {season.episodeCount} حلقة
                    </div>
                  </div>
                  <h4 className={`text-sm font-bold truncate transition-colors ${activeSeason === season.seasonNumber ? 'text-brand-pink' : 'text-white'}`}>{season.name}</h4>
                  <p className="text-gray-500 text-xs">{season.airDate?.substring(0, 4) || 'N/A'}</p>
                </button>
              ))}
            </div>

            {/* Episodes List */}
            {activeSeason && (
              <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden animate-fadeIn">
                <div className="p-4 border-b border-white/10 bg-black/20">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers size={18} className="text-gray-400" />
                    قائمة حلقات الموسم {activeSeason}
                  </h4>
                </div>
                
                <div className="p-2 sm:p-4 space-y-3">
                  {loadingEpisodes ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : episodes.length > 0 ? (
                    episodes.map((ep) => (
                      <Link 
                        to={`/watch/series/${item.id}?season=${ep.seasonNumber}&episode=${ep.episodeNumber}`}
                        key={ep.id} 
                        className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brand-pink/30 transition-all group"
                      >
                        {/* Episode Thumbnail */}
                        <div className="relative sm:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-gray-900">
                          {ep.image ? (
                            <img src={ep.image} alt={ep.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                              <Play size={24} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors flex items-center justify-center">
                             <div className="w-10 h-10 rounded-full bg-brand-red/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform shadow-lg">
                               <Play fill="white" className="ml-1" size={16} />
                             </div>
                          </div>
                          <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[10px] px-1.5 rounded">
                            {ep.duration ? `${ep.duration} د` : '45 د'}
                          </span>
                        </div>

                        {/* Episode Info */}
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="text-white font-bold group-hover:text-brand-pink transition-colors">
                              <span className="ml-2 text-gray-500">#{ep.episodeNumber}</span>
                              {ep.name}
                            </h5>
                            <span className="flex items-center gap-1 text-yellow-500 text-xs font-bold bg-yellow-500/10 px-2 py-0.5 rounded">
                              <Star size={10} fill="currentColor" /> {ep.rating}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                            {ep.overview}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto">
                             <span className="flex items-center gap-1"><Calendar size={12} /> {ep.airDate}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-2">
                       <Info size={32} />
                       <p>لا توجد حلقات متاحة لهذا الموسم حالياً.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cast Section */}
        {item.cast && item.cast.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6 border-r-4 border-brand-pink pr-4">طاقم العمل</h3>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
              {item.cast.map((actor) => (
                <div key={actor.id} className="flex-shrink-0 w-32 text-center group">
                  <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-brand-pink transition-all">
                    {actor.image ? (
                      <img src={actor.image} alt={actor.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  <h4 className="text-white text-sm font-medium truncate">{actor.name}</h4>
                  <p className="text-gray-400 text-xs truncate">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ad slot between Cast and Similar */}
        <BannerAd slot="homePageAd" />

        {/* Similar Content */}
        {item.similar && item.similar.length > 0 && (
          <div className="mb-12">
            <MediaRow title={type === MediaType.MOVIE ? "أفلام مشابهة" : "مسلسلات مشابهة"} items={item.similar} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsPage;
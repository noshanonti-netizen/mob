import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AlertCircle, RefreshCw, Flame, Tv, Sparkles, Activity, Bell, ChevronRight, HelpCircle, Heart, Star, Search, Filter } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MediaRow from './components/MediaRow';
import Footer from './components/Footer';
import MediaGrid from './components/MediaGrid';
import DetailsPage from './components/DetailsPage';
import WatchPage from './components/WatchPage';
import AdminPanel from './components/AdminPanel';
import BannerAd from './components/BannerAd';
import { MediaItem, MediaType } from './types';
import { 
  getTrendingMovies, 
  getRamadanSeries, 
  getTurkishSeries, 
  getDiscoverSeries,
  getArabicMovies,
  getEgyptianMovies,
  getForeignMovies,
  getAsianMovies,
  getAdultMovies,
  initializeServerSync,
  getAdsConfig
} from './api';

// Scroll to top wrapper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Loading Component
const Loading = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Generic Pagination Page Component
interface PaginatedPageProps {
  title: string;
  fetchData: (page: number) => Promise<MediaItem[]>;
}

const PaginatedPage: React.FC<PaginatedPageProps> = ({ title, fetchData }) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(99); // Simulating max pages
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const data = await fetchData(currentPage);
        setItems(data);
      } catch (error) {
        console.error("Page load error:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentPage, fetchData]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) return <div className="pt-24"><Loading /></div>;

  return (
    <div className="pb-12">
      <BannerAd />
      <MediaGrid title={`${title} - صفحة ${currentPage}`} items={items} />
      
      {/* Pagination Controls */}
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 mt-8 dir-rtl">
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          السابق
        </button>
        
        <div className="flex gap-1 overflow-x-auto max-w-[200px] md:max-w-none scrollbar-hide">
          {Array.from({ length: 5 }, (_, i) => currentPage - 2 + i)
            .filter(p => p > 0 && p <= totalPages)
            .map(p => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  currentPage === p 
                    ? 'bg-brand-red text-white font-bold' 
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                {p}
              </button>
          ))}
        </div>

        <button 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          التالي
        </button>
      </div>
      <BannerAd />
    </div>
  );
};

const HomePage = () => {
  const [heroItems, setHeroItems] = useState<MediaItem[]>([]);
  const [ramadanItems, setRamadanItems] = useState<MediaItem[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>([]);
  const [turkishSeries, setTurkishSeries] = useState<MediaItem[]>([]);
  
  // New Categories
  const [arabicMovies, setArabicMovies] = useState<MediaItem[]>([]);
  const [foreignMovies, setForeignMovies] = useState<MediaItem[]>([]);
  const [asianMovies, setAsianMovies] = useState<MediaItem[]>([]);
  const [adultMovies, setAdultMovies] = useState<MediaItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(false);
        const [
          ramadan, 
          movies, 
          turkish, 
          arabic, 
          foreign, 
          asian, 
          adult
        ] = await Promise.all([
          getRamadanSeries(),
          getTrendingMovies(1),
          getTurkishSeries(1),
          getArabicMovies(1),
          getForeignMovies(1),
          getAsianMovies(1),
          getAdultMovies(1)
        ]);

        setRamadanItems(ramadan);
        setTrendingMovies(movies);
        setTurkishSeries(turkish);
        setArabicMovies(arabic);
        setForeignMovies(foreign);
        setAsianMovies(asian);
        setAdultMovies(adult);

        // Set Hero Items (Top 8 movies)
        if (movies && movies.length > 0) {
          setHeroItems(movies.slice(0, 8));
        } else {
          // If movies are empty, checking connection might be good
          if (ramadan.length === 0 && turkish.length === 0) {
             setError(true);
          }
        }
      } catch (error) {
        console.error("Failed to load home data", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="pt-24"><Loading /></div>;

  if (error || (!loading && heroItems.length === 0 && ramadanItems.length === 0)) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-brand-darker pt-24">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 max-w-md w-full">
              <AlertCircle size={48} className="text-brand-red mb-4 mx-auto" />
              <h2 className="text-2xl font-bold mb-2 text-white">عذراً، حدث خطأ في الاتصال</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                لم نتمكن من جلب الأفلام والمسلسلات. يرجى التحقق من اتصال الإنترنت أو المحاولة لاحقاً.
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-red hover:bg-red-600 text-white font-bold transition-all shadow-lg shadow-brand-red/30"
              >
                <RefreshCw size={20} />
                إعادة المحاولة
              </button>
            </div>
        </div>
     );
  }

  return (
    <main className="bg-brand-darker min-h-screen">
      {/* Hero Movie Carousel Slider */}
      {heroItems.length > 0 && <Hero items={heroItems} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        
        {/* WordPress Dynamic Marquee Announcement Bar */}
        <div className="bg-gradient-to-r from-brand-red/10 via-brand-pink/5 to-transparent border-r-4 border-brand-red p-3.5 rounded-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg backdrop-blur-sm ring-1 ring-white/5">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-pink opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-red"></span>
            </span>
            <div className="text-right">
              <span className="text-xs text-brand-pink font-bold block md:inline md:ml-2">شريط أخبار المنصة [WordPress Portal Feed] :</span>
              <span className="text-sm text-gray-200">مرحباً بكم في الإطلاق الرسمي المطور لقالب افلاميكوز ووردبريس v2.4 السينمائي الشامل. مدمج مع مشغلات بث ومحرك تصفية متكامل وسيرفرات سريعة جداً!</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 select-none">
            <Sparkles size={14} className="text-yellow-400 animate-pulse" />
            <span>الإصدارالسينمائي v2.4</span>
          </div>
        </div>

        {/* Master WordPress Layout Grid (RTL: Sidebar Left / Content Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Main Grid: Rows of Film & TV Sections (Col-Span 3 on Right) */}
          <div className="lg:col-span-3 space-y-4">
            <BannerAd />
            <MediaRow title="مسلسلات رمضان والعربية الحديثة" items={ramadanItems} viewAllPath="/ramadan" />
            <MediaRow title="أفلام عربية" items={arabicMovies} viewAllPath="/movies/arabic" />
            <MediaRow title="أفلام أجنبية" items={foreignMovies} viewAllPath="/movies/foreign" />
            <BannerAd slot="homePageAd" />
            <MediaRow title="أفلام آسيوية" items={asianMovies} viewAllPath="/movies/asian" />
            <MediaRow title="أفلام للكبار فقط (+18)" items={adultMovies} viewAllPath="/movies/adult" />
            <MediaRow title="الدراما التركية" items={turkishSeries} viewAllPath="/series/turkish" />
          </div>

          {/* Sidebar widget Panel: Left Sidebar (Col-Span 1 on Left) */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            
            {/* Widget 1: Dynamic Search Filter Widget */}
            <div className="bg-gradient-to-br from-white/5 to-black/30 border border-white/5 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                <Filter size={18} className="text-brand-pink" />
                <h3 className="text-base font-bold text-white">فلتر التصفح السريع</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                استخدم وسوم الفلترة الفورية للتنقل السريع بين ملفات الأرشيف ومحرك البحث للقالب السينمائي:
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-center">
                <a href="/ramadan" className="px-3 py-2 bg-white/5 hover:bg-brand-red/25 border border-white/10 hover:border-brand-red hover:text-white rounded-xl text-xs text-gray-300 font-medium transition-all">
                  🌙 رمضان 2026
                </a>
                <a href="/movies" className="px-3 py-2 bg-white/5 hover:bg-brand-pink/20 border border-white/10 hover:border-brand-pink hover:text-white rounded-xl text-xs text-gray-300 font-medium transition-all">
                  🎬 أحدث الأفلام
                </a>
                <a href="/series" className="px-3 py-2 bg-white/5 hover:bg-brand-purple/20 border border-white/10 hover:border-brand-purple hover:text-white rounded-xl text-xs text-gray-300 font-medium transition-all">
                  📺 أحدث المسلسلات
                </a>
                <a href="/egyptian" className="px-3 py-2 bg-white/5 hover:bg-yellow-500/20 border border-white/10 hover:border-yellow-500 hover:text-white rounded-xl text-xs text-gray-300 font-medium transition-all">
                  🇪🇬 أفلام مصرية
                </a>
                <a href="/movies/foreign" className="px-3 py-2 bg-white/5 hover:bg-blue-500/25 border border-white/10 hover:border-blue-500 hover:text-white rounded-xl text-xs text-gray-300 font-medium transition-all">
                  🌐 أفلام أجنبية
                </a>
                <a href="/series/turkish" className="px-3 py-2 bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500 hover:text-white rounded-xl text-xs text-gray-300 font-medium transition-all">
                  🕌 دراما تركية
                </a>
              </div>
            </div>

            {/* Widget 2: WordPress Simulated Platform Stats (Highly standard for Arabic WP Themes) */}
            <div className="bg-gradient-to-br from-white/5 to-black/30 border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-24 bg-brand-pink/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-brand-red animate-pulse" />
                  <h3 className="text-base font-bold text-white">إحصائيات القالب والمنصة</h3>
                </div>
                <div className="flex items-center gap-1 text-[10px] bg-red-500/20 text-brand-pink px-2 py-0.5 rounded-full border border-brand-red/30 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-ping" />
                  <span>مباشر</span>
                </div>
              </div>
              
              <div className="space-y-3.5 text-xs text-gray-300">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">إسم القالب المشغل:</span>
                  <span className="font-semibold text-white">افلاميكوز ووردبريس v2.4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">مجموع مواد الأرشيف:</span>
                  <span className="font-semibold text-brand-pink font-mono">+12,410 عمل</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">عدد سيرفرات المشاهدة:</span>
                  <span className="font-semibold text-emerald-400">3 سيرفرات سريعة</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">المشاهدات اليومية للموقع:</span>
                  <span className="font-semibold text-white font-mono">412,500 زيارة</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-gray-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                    المتصلون بالبث الآن:
                  </span>
                  <span className="font-bold text-emerald-400 font-mono">3,412 زائر</span>
                </div>
              </div>
            </div>

            {/* Widget 3: Trending List (WordPress Popular Posts Sidebar Widget) */}
            <div className="bg-gradient-to-br from-white/5 to-black/30 border border-white/5 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                <Flame size={18} className="text-yellow-400 animate-bounce" />
                <h3 className="text-base font-bold text-white">رائج ومميز اليوم</h3>
              </div>
              
              <div className="space-y-4">
                {ramadanItems.slice(0, 4).map((item, index) => (
                  <a 
                    key={item.id} 
                    href={`/series/${item.id}`}
                    className="flex gap-3 hover:bg-white/5 p-1 px-2 rounded-xl transition-all duration-300 group"
                  >
                    {/* Rank indicator */}
                    <div className="flex items-center justify-center font-bold text-sm text-gray-500 group-hover:text-brand-pink w-4 select-none font-mono">
                      {index + 1}
                    </div>
                    {/* Thumbnail */}
                    <div className="w-10 h-14 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 border border-white/10 group-hover:border-brand-pink transition-colors">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-brand-pink transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                        <span>{item.year}</span>
                        <span className="flex items-center gap-0.5 text-yellow-400">
                          <Star size={8} fill="currentColor" /> {item.rating}
                        </span>
                        <span className="px-1 bg-white/5 rounded text-[8px] border border-white/5 text-gray-400">رمضان 2026</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Widget 4: Admin / Warning & Feedback Box */}
            <div className="bg-gradient-to-br from-brand-red/5 to-brand-purple/5 border border-brand-red/20 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle size={18} className="text-brand-red" />
                <h3 className="text-sm font-bold text-white">هل تواجه مشكلة في البث؟</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed space-y-2">
                <span>تتميز واجهتنا المخصصة لكود ووردبريس بمرونتها التامة. إذا تفاجأت بأي عطل في سيرفر البث أو سيرفر التحميل، يرجى القيام بـ:</span>
                <span className="block mt-2 font-semibold text-brand-pink">1. النقر على تنشيط الصفحة أو إعادة المحاولة.</span>
                <span className="block font-semibold text-brand-pink">2. تبديل مشغلات سيرفرات VIP المرفقة في صفحة المشاهدة.</span>
                <span className="block font-semibold text-gray-400">نتمنى لكم وقت ممتع ومسلي!</span>
              </p>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
};

const RamadanPage = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRamadanSeries();
        setItems(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="pt-24"><Loading /></div>;

  return (
    <>
      <BannerAd />
      <MediaGrid title="مسلسلات رمضان 2026" items={items} />
      <BannerAd />
    </>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    initializeServerSync();

    // Session-based on-click popunder trigger
    const handlePopunderClick = async () => {
      const popunderTriggered = sessionStorage.getItem('aflameco_popunder_triggered');
      if (popunderTriggered === 'true') return;

      const ads = await getAdsConfig();
      if (ads && ads.popunderAd && ads.popunderAd.isActive && ads.popunderAd.targetUrl) {
        try {
          const popup = window.open(ads.popunderAd.targetUrl, '_blank');
          if (popup) {
            sessionStorage.setItem('aflameco_popunder_triggered', 'true');
            popup.blur();
            window.focus();
          }
        } catch (err) {
          console.warn('Popunder popup window was blocked by browser:', err);
        }
      }
    };

    window.addEventListener('click', handlePopunderClick);
    return () => {
      window.removeEventListener('click', handlePopunderClick);
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-brand-darker font-sans text-white selection:bg-brand-red selection:text-white">
        <Navbar />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Main Sections */}
          <Route path="/movies" element={<PaginatedPage title="أحدث الأفلام" fetchData={getTrendingMovies} />} />
          <Route path="/series" element={<PaginatedPage title="أحدث المسلسلات" fetchData={getDiscoverSeries} />} />
          <Route path="/ramadan" element={<RamadanPage />} />
          <Route path="/egyptian" element={<PaginatedPage title="أفلام مصرية" fetchData={getEgyptianMovies} />} />
          
          {/* New Category Pages */}
          <Route path="/movies/arabic" element={<PaginatedPage title="أفلام عربية" fetchData={getArabicMovies} />} />
          <Route path="/movies/foreign" element={<PaginatedPage title="أفلام أجنبية" fetchData={getForeignMovies} />} />
          <Route path="/movies/asian" element={<PaginatedPage title="أفلام آسيوية" fetchData={getAsianMovies} />} />
          <Route path="/movies/adult" element={<PaginatedPage title="أفلام للكبار فقط (+18)" fetchData={getAdultMovies} />} />
          <Route path="/series/turkish" element={<PaginatedPage title="مسلسلات تركية" fetchData={getTurkishSeries} />} />

          {/* Details & Watch */}
          <Route path="/movies/:id" element={<DetailsPage type={MediaType.MOVIE} />} />
          <Route path="/series/:id" element={<DetailsPage type={MediaType.SERIES} />} />
          <Route path="/watch/:type/:id" element={<WatchPage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
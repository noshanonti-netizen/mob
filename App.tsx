import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
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
    <main>
      {heroItems.length > 0 && <Hero items={heroItems} />}
      <div className="-mt-12 relative z-20 space-y-4">
        <BannerAd />
        <MediaRow title="مسلسلات رمضان والعربية الحديثة" items={ramadanItems} />
        <MediaRow title="أفلام عربية" items={arabicMovies} />
        <MediaRow title="أفلام أجنبية" items={foreignMovies} />
        <BannerAd />
        <MediaRow title="أفلام آسيوية" items={asianMovies} />
        <MediaRow title="أفلام للكبار فقط (+18)" items={adultMovies} />
        <MediaRow title="الدراما التركية" items={turkishSeries} />
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
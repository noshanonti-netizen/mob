import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, Play, Monitor, Home, Zap, Star, Film, ChevronDown, Globe, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { searchContent } from '../api';
import { MediaItem, MediaType } from '../types';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  // Search State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Click outside to close search results and dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setResults([]);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounce Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsSearching(true);
        const data = await searchContent(query);
        setResults(data);
        setIsSearching(false);
      } else {
        setResults([]);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const closeSearch = () => {
    setQuery('');
    setResults([]);
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const mainNavLinks = [
    { name: 'الرئيسية', path: '/', icon: <Home size={18} /> },
    { name: 'رمضان 2026', path: '/ramadan', icon: <Zap size={18} className="text-yellow-400" /> },
    { name: 'أفلام', path: '/movies', icon: <Play size={18} /> },
    { name: 'مسلسلات', path: '/series', icon: <Monitor size={18} /> },
    { name: 'أفلام مصرية', path: '/egyptian', icon: <Film size={18} /> },
  ];

  const categoryLinks = [
    { name: 'أفلام عربية', path: '/movies/arabic', icon: <Film size={16} /> },
    { name: 'أفلام أجنبية', path: '/movies/foreign', icon: <Globe size={16} /> },
    { name: 'أفلام آسيوية', path: '/movies/asian', icon: <Globe size={16} /> },
    { name: 'أفلام للكبار', path: '/movies/adult', icon: <Users size={16} /> },
    { name: 'مسلسلات تركية', path: '/series/turkish', icon: <Monitor size={16} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Render search results list
  const SearchResultsList = () => {
    if (results.length === 0 && !isSearching) return null;

    return (
      <div className="absolute top-full right-0 w-full mt-2 bg-brand-darker border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto z-50">
        {isSearching && (
          <div className="p-4 text-center text-gray-400">
             <div className="w-6 h-6 border-2 border-brand-pink border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
             جاري البحث...
          </div>
        )}
        
        {!isSearching && results.length > 0 && (
          <div className="flex flex-col">
            {results.map((item) => (
              <Link
                key={item.id}
                to={`/${item.type === MediaType.MOVIE ? 'movies' : 'series'}/${item.id}`}
                onClick={closeSearch}
                className="flex items-center gap-3 p-3 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
              >
                <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-800">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-bold truncate">{item.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <span>{item.year}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                    <span>{item.type === MediaType.MOVIE ? 'فيلم' : 'مسلسل'}</span>
                    <span className="flex items-center gap-1 text-yellow-500 mr-auto">
                      <Star size={10} fill="currentColor" /> {item.rating}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {!isSearching && results.length === 0 && query.length > 1 && (
           <div className="p-4 text-center text-gray-400 text-sm">
             لا توجد نتائج مطابقة لـ "{query}"
           </div>
        )}
      </div>
    );
  };

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/80 backdrop-blur-md shadow-lg border-b border-white/10' : 'bg-gradient-to-b from-black/90 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Right Side (Logo & Desktop Nav) - RTL ordering */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-red to-brand-purple flex items-center justify-center shadow-[0_0_15px_rgba(255,37,85,0.5)]">
                 <Play fill="white" className="ml-1" size={20} />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 group-hover:from-brand-pink group-hover:to-brand-purple transition-all duration-300">
                افلام<span className="text-brand-red">يكوز</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive(link.path)
                      ? 'bg-white/10 text-brand-pink shadow-[0_0_10px_rgba(255,79,156,0.2)]'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}

              {/* Dropdown for Categories */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  الأقسام
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-brand-darker border border-white/10 rounded-xl shadow-xl overflow-hidden py-1 animate-fadeIn">
                    {categoryLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsDropdownOpen(false)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors ${
                           isActive(link.path) ? 'bg-brand-red/10 text-brand-pink' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {link.icon}
                        {link.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Left Side (Search & Mobile Toggle) */}
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block group" ref={searchContainerRef}>
              <input
                type="text"
                placeholder="ابحث..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-full py-2 pr-10 pl-4 w-64 text-sm text-white focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition-all"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400 group-focus-within:text-brand-pink" size={18} />
              
              {/* Desktop Search Results Dropdown */}
              {query.length > 1 && <SearchResultsList />}
            </div>

            <button className="md:hidden text-white p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-brand-darker/95 backdrop-blur-xl border-t border-white/10 h-screen overflow-y-auto pb-20">
          <div className="px-4 pt-2 pb-6 space-y-2">
             <div className="relative mb-4 mt-2">
                <input
                  type="text"
                  placeholder="ابحث عن فيلم أو مسلسل..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-lg py-3 pr-10 pl-4 text-white focus:outline-none focus:border-brand-pink"
                />
                <Search className="absolute right-3 top-3.5 text-gray-400" size={18} />
                
                {/* Mobile Search Results Dropdown */}
                {query.length > 1 && <SearchResultsList />}
              </div>
            
            <div className="border-b border-white/10 pb-2 mb-2">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium ${
                    isActive(link.path)
                      ? 'bg-gradient-to-r from-brand-red/20 to-transparent text-brand-pink border-r-4 border-brand-pink'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="pt-2">
              <h4 className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">الأقسام</h4>
              {categoryLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium ${
                    isActive(link.path)
                      ? 'text-brand-pink'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
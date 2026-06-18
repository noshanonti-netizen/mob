import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Save, Download, Upload, ShieldAlert, Key, 
  Film, Tv, Server, Database, PlusCircle, CheckCircle, AlertTriangle, 
  Code, RefreshCw, X, ChevronDown, Check, Layers
} from 'lucide-react';
import { MediaItem, MediaType, Episode, Season } from '../types';
import { 
  getCustomMediaItems, 
  saveCustomMediaItems, 
  getCustomServers, 
  saveCustomServers, 
  CustomServersData,
  AdsConfigData,
  getAdsConfig,
  saveAdsConfig
} from '../api';

const PRESET_CATEGORIES = [
  { id: 'ramadan', name: 'مسلسلات رمضان 2026' },
  { id: 'turkish', name: 'الدراما التركية' },
  { id: 'arabic', name: 'أفلام عربية' },
  { id: 'egyptian', name: 'أفلام مصرية' },
  { id: 'foreign', name: 'أفلام أجنبية' },
  { id: 'asian', name: 'أفلام آسيوية' },
  { id: 'adult', name: 'أفلام للكبار فقط (+18)' },
  { id: 'trending', name: 'الأكثر تداولاً (الرئيسية/البانر)' }
];

const AdminPanel: React.FC = () => {
  // Passcode verification
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tabs: 'media' | 'servers' | 'ads' | 'backup'
  const [activeTab, setActiveTab] = useState<'media' | 'servers' | 'ads' | 'backup'>('media');

  // Ads space list and configuration
  const [adsData, setAdsData] = useState<AdsConfigData | null>(null);

  // Custom Media List
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  
  // Media Form State
  const [editingMediaId, setEditingMediaId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: MediaType.MOVIE,
    year: new Date().getFullYear(),
    rating: 8.5,
    quality: 'HD',
    image: '',
    backdrop: '',
    description: '',
    tags: '',
    duration: '120 دقيقة',
    category: 'ramadan'
  });

  // Custom Series Episode List state (if SERIES)
  const [customEpisodes, setCustomEpisodes] = useState<Episode[]>([]);
  const [epForm, setEpForm] = useState({
    seasonNumber: 1,
    episodeNumber: 1,
    name: 'الحلقة ١',
    overview: '',
    image: '',
    duration: 45,
    rating: 8.5
  });

  // Custom Servers Form State
  const [selectedServerMediaId, setSelectedServerMediaId] = useState<string>(''); // Can be TMDB ID or custom ID
  const [selectedServerMediaType, setSelectedServerMediaType] = useState<MediaType>(MediaType.MOVIE);
  const [isSpecificEpisode, setIsSpecificEpisode] = useState(false);
  const [serverSeasonNumber, setServerSeasonNumber] = useState<number>(1);
  const [serverEpisodeNumber, setServerEpisodeNumber] = useState<number>(1);
  
  // Storage for added servers on current focus
  const [watchServers, setWatchServers] = useState<Array<{ name: string, url: string }>>([]);
  const [downloadServers, setDownloadServers] = useState<Array<{ name: string, url: string }>>([]);
  
  // Server inputs helper
  const [newWatchName, setNewWatchName] = useState('');
  const [newWatchUrl, setNewWatchUrl] = useState('');
  const [newDownloadName, setNewDownloadName] = useState('');
  const [newDownloadUrl, setNewDownloadUrl] = useState('');

  // Notification states
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Check if user was already logged in
    const authStatus = sessionStorage.getItem('aflameco_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    // Load custom media
    setMediaList(getCustomMediaItems());
    
    // Load ads config from server / localStorage
    getAdsConfig().then(data => {
      if (data) {
        setAdsData(data);
      }
    });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'admin' && passcode === 'go123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('aflameco_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('aflameco_admin_auth');
  };

  const handleMediaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      showError('يرجى ملء جميع الحقول المطلوبة (العنوان والبوستر)');
      return;
    }

    const tagArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const targetId = editingMediaId !== null ? editingMediaId : Date.now();
    
    // For series, ensure we map a proper seasons list dynamically based on episodes
    let seasonsList: Season[] = [];
    if (formData.type === MediaType.SERIES) {
      const uniqueSeasons = Array.from(new Set(customEpisodes.map(ep => ep.seasonNumber)));
      seasonsList = uniqueSeasons.map(sNum => {
        const seasonEps = customEpisodes.filter(ep => ep.seasonNumber === sNum);
        return {
          id: sNum + targetId,
          name: `الموسم ${sNum}`,
          poster: formData.image,
          seasonNumber: sNum,
          episodeCount: seasonEps.length,
          airDate: `${formData.year}-01-01`
        };
      });
    }

    const newItem: MediaItem = {
      id: targetId,
      title: formData.title,
      image: formData.image,
      backdrop: formData.backdrop || formData.image, // fallback to poster
      year: Number(formData.year),
      rating: Number(formData.rating),
      type: formData.type,
      quality: formData.quality,
      description: formData.description || 'لا يوجد قصة متاحة حالياً.',
      tags: tagArray.length > 0 ? tagArray : ['جديد'],
      duration: formData.type === MediaType.MOVIE ? formData.duration : `${seasonsList.length} مواسم`,
      category: formData.category,
      seasons: formData.type === MediaType.SERIES ? seasonsList : undefined,
      similar: [],
      cast: []
    };

    // Store custom episodes associated with series
    if (formData.type === MediaType.SERIES) {
      (newItem as any).customEpisodes = customEpisodes;
    }

    let updatedList;
    if (editingMediaId !== null) {
      updatedList = mediaList.map(item => item.id === editingMediaId ? newItem : item);
      showSuccess('تم تحديث المحتوى بنجاح!');
    } else {
      updatedList = [newItem, ...mediaList];
      showSuccess('تم إضافة المحتوى بنجاح!');
    }

    saveCustomMediaItems(updatedList);
    setMediaList(updatedList);
    resetMediaForm();
  };

  const handleEditMedia = (item: MediaItem) => {
    setEditingMediaId(item.id);
    setFormData({
      title: item.title,
      type: item.type,
      year: item.year,
      rating: item.rating,
      quality: item.quality || 'HD',
      image: item.image,
      backdrop: item.backdrop,
      description: item.description,
      tags: item.tags.join(', '),
      duration: item.duration || '120 دقيقة',
      category: item.category || 'ramadan'
    });
    if (item.type === MediaType.SERIES) {
      setCustomEpisodes((item as any).customEpisodes || []);
    } else {
      setCustomEpisodes([]);
    }
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteMedia = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العمل؟')) {
      const updatedList = mediaList.filter(item => item.id !== id);
      saveCustomMediaItems(updatedList);
      setMediaList(updatedList);
      showSuccess('تم حذف العمل بنجاح!');
    }
  };

  const resetMediaForm = () => {
    setEditingMediaId(null);
    setFormData({
      title: '',
      type: MediaType.MOVIE,
      year: new Date().getFullYear(),
      rating: 8.5,
      quality: 'HD',
      image: '',
      backdrop: '',
      description: '',
      tags: '',
      duration: '120 دقيقة',
      category: 'ramadan'
    });
    setCustomEpisodes([]);
  };

  // Episode Add Helper
  const handleAddEpisode = () => {
    if (!epForm.name) return;
    const newEp: Episode = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      name: epForm.name,
      overview: epForm.overview || 'لا توجد تفاصيل لهذه الحلقة.',
      image: epForm.image || formData.image || 'https://via.placeholder.com/500x280?text=No+Thumbnail',
      episodeNumber: Number(epForm.episodeNumber),
      seasonNumber: Number(epForm.seasonNumber),
      airDate: `${formData.year}-04-01`,
      rating: Number(epForm.rating),
      duration: Number(epForm.duration)
    };

    setCustomEpisodes([...customEpisodes, newEp]);
    // Increment episode number automatically to save time for user
    setEpForm({
      ...epForm,
      episodeNumber: Number(epForm.episodeNumber) + 1,
      name: `الحلقة ${Number(epForm.episodeNumber) + 1}`,
      overview: ''
    });
  };

  const handleRemoveEpisode = (idx: number) => {
    setCustomEpisodes(customEpisodes.filter((_, i) => i !== idx));
  };

  // Custom Server Configuration Loader
  const handleLoadServersData = () => {
    if (!selectedServerMediaId) {
      showError('يرجى اختيار العمل أو إدخال كود TMDB');
      return;
    }

    const typeStr = selectedServerMediaType === MediaType.MOVIE ? 'movie' : 'series';
    const serverData = getCustomServers(
      typeStr, 
      selectedServerMediaId, 
      isSpecificEpisode ? serverSeasonNumber : undefined, 
      isSpecificEpisode ? serverEpisodeNumber : undefined
    );

    if (serverData) {
      setWatchServers(serverData.watch || []);
      setDownloadServers(serverData.download || []);
      showSuccess('تم جلب السيرفرات الحالية بنجاح.');
    } else {
      setWatchServers([]);
      setDownloadServers([]);
      showSuccess('لا توجد سيرفرات مخصصة مسجلة حالياً لهذا العمل/الحلقة. يمكنك الإضافة الآن!');
    }
  };

  // Add Server Links
  const addWatchServerInput = () => {
    if (!newWatchName || !newWatchUrl) {
      showError('يرجى ملء اسم السيرفر التجريبي ورابط الفيديو Embed');
      return;
    }
    setWatchServers([...watchServers, { name: newWatchName, url: newWatchUrl }]);
    setNewWatchName('');
    setNewWatchUrl('');
  };

  const addDownloadServerInput = () => {
    if (!newDownloadName || !newDownloadUrl) {
      showError('يرجى ملء اسم سيرفر وملف التحميل ورابط التحميل المباشر');
      return;
    }
    setDownloadServers([...downloadServers, { name: newDownloadName, url: newDownloadUrl }]);
    setNewDownloadName('');
    setNewDownloadUrl('');
  };

  const handleSaveServers = () => {
    if (!selectedServerMediaId) {
      showError('يرجى اختيار العمل أو إدخال كود TMDB للملف');
      return;
    }

    const typeStr = selectedServerMediaType === MediaType.MOVIE ? 'movie' : 'series';
    const serversObj: CustomServersData = {
      watch: watchServers,
      download: downloadServers
    };

    saveCustomServers(
      typeStr,
      selectedServerMediaId,
      serversObj,
      isSpecificEpisode ? serverSeasonNumber : undefined,
      isSpecificEpisode ? serverEpisodeNumber : undefined
    );

    showSuccess('تم حفظ السيرفرات وروابط التحميل بنجاح!');
  };

  // Backup handlers
  const handleExportBackup = () => {
    try {
      const backupData = {
        media: getCustomMediaItems(),
        servers: JSON.parse(localStorage.getItem('aflameco_custom_servers') || '{}')
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aflamecoz_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showSuccess('تم تصدير نسخة احتياطية من البيانات بنجاح!');
    } catch (e) {
      showError('فشل تصدير البيانات: ' + e);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.media && Array.isArray(parsed.media)) {
          saveCustomMediaItems(parsed.media);
          setMediaList(parsed.media);
        }
        if (parsed.servers && typeof parsed.servers === 'object') {
          localStorage.setItem('aflameco_custom_servers', JSON.stringify(parsed.servers));
        }
        showSuccess('تم استيراد النسخة الاحتياطية وتحديث بيانات افلاميكوز بنجاح!');
      } catch (err) {
        showError('الملف غير صالح أو تالف!');
      }
    };
    reader.readAsText(file);
  };

  // Utility messaging helpers
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center p-4 pt-24">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none filter blur-lg" style={{ backgroundImage: 'url(https://via.placeholder.com/1200x800)' }} />
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-sm w-full relative z-10 backdrop-blur-md shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-brand-red to-brand-purple rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(255,37,85,0.4)]">
              <Key className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">لوحة تحكم افلاميكوز</h1>
            <p className="text-gray-400 text-sm leading-relaxed">يرجى إدخال الرمز السري للإدارة للتمكن من إضافة وتعديل الأفلام والمسلسلات وسيرفرات المشاهدة والتحميل.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5 text-right">اسم المستخدم:</label>
              <input 
                type="text"
                placeholder="أدخل اسم المستخدم (مثال: admin)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-center text-white focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink font-sans text-base"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5 text-right">كلمة المرور:</label>
              <input 
                type="password"
                placeholder="أدخل كلمة المرور"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-center text-white focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink font-sans text-base"
              />
            </div>
            
            {loginError && (
              <p className="text-brand-red text-sm text-center font-bold flex items-center justify-center gap-1">
                <ShieldAlert size={16} />
                {loginError}
              </p>
            )}

            <button 
              type="submit"
              className="w-full bg-brand-red hover:bg-brand-pink text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:scale-[1.02] shadow-brand-red/20 active:scale-95"
            >
              تسجيل الدخول للنظام
            </button>
          </form>
          <p className="text-center text-xs text-gray-500 mt-6 font-mono">(اسم المستخدم: admin | كلمة المرور: go123)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-darker pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success/Error Toast notification */}
        {successMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-green-500 text-white rounded-xl py-3 px-5 shadow-2xl border border-green-400 flex items-center gap-3 animate-slideIn">
            <CheckCircle size={22} />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-brand-red text-white rounded-xl py-3 px-5 shadow-2xl border border-red-500 flex items-center gap-3 animate-slideIn">
            <ShieldAlert size={22} />
            <span className="font-bold">{errorMsg}</span>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-2">
              <Database className="text-brand-pink" size={32} />
              لوحة تحكم كبار المشرفين
            </h1>
            <p className="text-gray-400 text-sm mt-1">تتيح لك هذه المنصة إضافة أفلام ومسلسلات وتعديل سيرفرات البث وجداول التحميل مباشرة.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-xl hover:bg-white/15 text-gray-300 transition-colors"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>

        {/* System Status Banner */}
        <div className="bg-gradient-to-r from-brand-purple/20 via-brand-red/10 to-transparent p-5 rounded-2xl border border-brand-pink/20 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-right">
            <div className="p-2.5 rounded-xl bg-brand-pink/10 text-brand-pink hidden md:block">
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold">قاعدة البيانات المحلية النشطة</h3>
              <p className="text-gray-400 text-xs mt-0.5">عدد الأعمال المضافة يدوياً حالياً: <span className="text-yellow-400 font-bold">{mediaList.length}</span> أعمال.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
            <span className="text-xs text-green-400 font-bold">النظام متصل وجاهز</span>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-white/5 overflow-x-auto pb-1 scrollbar-hide">
          <button 
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'media' ? 'border-brand-pink text-white bg-white/5' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            <Film size={18} />
            إضافة وإدارة الأفلام والمسلسلات
          </button>
          <button 
            onClick={() => setActiveTab('servers')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'servers' ? 'border-brand-pink text-white bg-white/5' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            <Server size={18} />
            ربط سيرفرات المشاهدة والتحميل
          </button>
          <button 
            onClick={() => setActiveTab('ads')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'ads' ? 'border-brand-pink text-white bg-white/5' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            <Layers size={18} />
            إدارة مساحات الإعلانات (أكواد Ads)
          </button>
          <button 
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'backup' ? 'border-brand-pink text-white bg-white/5' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            <Download size={18} />
            النسخ الاحتياطي وحفظ البيانات
          </button>
        </div>

        {/* TAB 1: MEDIA MANAGEMENT */}
        {activeTab === 'media' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form Column */}
            <div className="lg:col-span-2 bg-white/5 border border-white/10 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
                <Plus className="text-brand-pink" size={20} />
                {editingMediaId !== null ? 'تعديل عمل حالي' : 'إضافة عمل فني جديد'}
              </h3>

              <form onSubmit={handleMediaSubmit} className="space-y-6 text-right">
                
                {/* Visual Type Selector */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: MediaType.MOVIE })}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold transition-all ${formData.type === MediaType.MOVIE ? 'bg-brand-red border-brand-red text-white' : 'bg-black/30 border-white/10 text-gray-400 hover:border-white/20'}`}
                  >
                    <Film size={18} />
                    فيلم سينمائي
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: MediaType.SERIES })}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold transition-all ${formData.type === MediaType.SERIES ? 'bg-brand-red border-brand-red text-white' : 'bg-black/30 border-white/10 text-gray-400 hover:border-white/20'}`}
                  >
                    <Tv size={18} />
                    مسلسل تلفزيوني
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1.5">عنوان العمل (العربية): <span className="text-brand-pink">*</span></label>
                    <input 
                      type="text"
                      required
                      placeholder="مثال: جعفر العمدة"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-pink"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1.5">القسم الرئيسي للاستهداف:</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-pink text-right"
                    >
                      {PRESET_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-brand-darker text-white">{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1.5">سنة الإنتاج:</label>
                    <input 
                      type="number"
                      placeholder="2026"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-pink"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1.5">التقييم الأصلي:</label>
                    <input 
                      type="number"
                      step="0.1"
                      min="1"
                      max="10"
                      placeholder="8.5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-pink"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1.5">الجودة التقنية:</label>
                    <input 
                      type="text"
                      placeholder="مثال: 4K أو HDR أو FHD"
                      value={formData.quality}
                      onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-pink"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1.5">المدة الزمنية للفيلم:</label>
                    <input 
                      type="text"
                      placeholder="مثال: 145 دقيقة"
                      disabled={formData.type === MediaType.SERIES}
                      value={formData.type === MediaType.SERIES ? 'يحدد تلقائياً بالمواسم' : formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-pink disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1.5">رابط صورة البوستر (Poster URL): <span className="text-brand-pink">*</span></label>
                    <input 
                      type="url"
                      required
                      placeholder="أدخل رابط صورة بوستر الفيلم للتصميم"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-pink font-mono text-xs text-left dir-ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1.5">رابط صورة الخلفية (Backdrop URL):</label>
                    <input 
                      type="url"
                      placeholder="اتركه فارغاً ليعتمد على البوستر تلقائياً"
                      value={formData.backdrop}
                      onChange={(e) => setFormData({ ...formData, backdrop: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-pink font-mono text-xs text-left dir-ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1.5">الوسوم والتصنيفات (افصل بينها بفواصل):</label>
                  <input 
                    type="text"
                    placeholder="مثال: أكشن, دراما, تشويق, سيرة ذاتية"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-pink"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1.5">قصة العمل الفني (وصف دقيق):</label>
                  <textarea 
                    rows={4}
                    placeholder="أدخل ملخص القصة والتفاصيل السينمائية للقرّاء..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-pink leading-relaxed"
                  ></textarea>
                </div>

                {/* Subform: Dynamic Episodes Add (Series Only) */}
                {formData.type === MediaType.SERIES && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <h4 className="text-white font-bold flex items-center gap-2 border-b border-white/5 pb-2">
                      <Layers size={18} className="text-brand-pink" />
                      بناء وهيكلة الحلقات (خاص بالمسلسلات)
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">رقم الموسم:</label>
                        <input 
                          type="number"
                          placeholder="1"
                          value={epForm.seasonNumber}
                          onChange={(e) => setEpForm({ ...epForm, seasonNumber: Number(e.target.value) })}
                          className="w-full bg-black/30 border border-white/5 rounded-lg py-2 px-3 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">رقم الحلقة:</label>
                        <input 
                          type="number"
                          placeholder="1"
                          value={epForm.episodeNumber}
                          onChange={(e) => setEpForm({ ...epForm, episodeNumber: Number(e.target.value) })}
                          className="w-full bg-black/30 border border-white/5 rounded-lg py-2 px-3 text-white text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-gray-400 text-xs mb-1">اسم الحلقة:</label>
                        <input 
                          type="text"
                          placeholder="مثال: الحلقة الأولى"
                          value={epForm.name}
                          onChange={(e) => setEpForm({ ...epForm, name: e.target.value })}
                          className="w-full bg-black/30 border border-white/5 rounded-lg py-2 px-3 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-gray-400 text-xs mb-1">رابط صورة مصغرة للحلقة (اختياري):</label>
                        <input 
                          type="url"
                          placeholder="رابط مصغرة حلقة"
                          value={epForm.image}
                          onChange={(e) => setEpForm({ ...epForm, image: e.target.value })}
                          className="w-full bg-black/30 border border-white/5 rounded-lg py-2 px-3 text-white text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">المدة (بالدقائق):</label>
                        <input 
                          type="number"
                          placeholder="45"
                          value={epForm.duration}
                          onChange={(e) => setEpForm({ ...epForm, duration: Number(e.target.value) })}
                          className="w-full bg-black/30 border border-white/5 rounded-lg py-2 px-3 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-gray-400 text-xs mb-1">وصف الحلقة ملخص السرد:</label>
                        <input 
                          type="text"
                          placeholder="اختياري: أحداث سريعة عن الحلقة"
                          value={epForm.overview}
                          onChange={(e) => setEpForm({ ...epForm, overview: e.target.value })}
                          className="w-full bg-black/30 border border-white/5 rounded-lg py-2 px-3 text-white text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddEpisode}
                        className="self-end bg-brand-pink/20 hover:bg-brand-pink/30 text-brand-pink font-bold border border-brand-pink/30 rounded-lg py-2 px-4 text-xs transition-colors whitespace-nowrap"
                      >
                        إضافة تفاصيل الحلقة
                      </button>
                    </div>

                    {/* Added episodes table summary */}
                    {customEpisodes.length > 0 ? (
                      <div className="mt-4 border border-white/5 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-black/50 text-gray-400">
                            <tr>
                              <th className="p-2 border-b border-white/5">الموسم</th>
                              <th className="p-2 border-b border-white/5">الحلقة</th>
                              <th className="p-2 border-b border-white/5">الاسم والملخص</th>
                              <th className="p-2 border-b border-white/5 text-center">أكشن</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 bg-black/10">
                            {customEpisodes.map((ep, idx) => (
                              <tr key={idx} className="hover:bg-white/5 text-gray-300">
                                <td className="p-2 border-l border-white/5 font-bold">{ep.seasonNumber}</td>
                                <td className="p-2 border-l border-white/5 font-bold">#{ep.episodeNumber}</td>
                                <td className="p-2 border-l border-white/5 truncate max-w-[200px]">{ep.name}</td>
                                <td className="p-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEpisode(idx)}
                                    className="text-brand-red hover:text-red-400 p-1 rounded hover:bg-red-500/10"
                                  >
                                    حذف
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-xs text-center border border-dashed border-white/10 p-4 rounded-xl">لا توجد حلقات مضافة يدوياً بعد لجدول المواسم. يرجى هيكلة الحلقات عبر الخيارات أعلاه.</p>
                    )}
                  </div>
                )}

                <div className="flex gap-4 pt-3 border-t border-white/5">
                  <button 
                    type="submit"
                    className="flex-1 bg-gradient-to-tr from-brand-red to-brand-pink border border-brand-pink/20 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-brand-red/10 flex items-center justify-center gap-2 hover:scale-[1.02]"
                  >
                    <Save size={18} />
                    {editingMediaId !== null ? 'تحديث العمل الفني الحالي' : 'إضافة وحفظ العمل الفني'}
                  </button>
                  {editingMediaId !== null && (
                    <button 
                      type="button"
                      onClick={resetMediaForm}
                      className="bg-white/5 border border-white/10 text-gray-300 px-6 py-3.5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      إلغاء التعديل
                    </button>
                  )}
                </div>

              </form>
            </div>

            {/* List Column */}
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Database className="text-brand-pink" size={18} />
                  الأعمال المحلية المضافة يدوياً ({mediaList.length})
                </h3>
                
                {mediaList.length > 0 ? (
                  <div className="space-y-3 max-h-[80vh] overflow-y-auto scrollbar-hide">
                    {mediaList.map((item) => (
                      <div key={item.id} className="bg-black/30 p-3 rounded-xl border border-white/5 flex gap-3 p-2.5 items-center hover:border-brand-pink/30 transition-all">
                        <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-900 border border-white/10">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                          <h4 className="text-white text-sm font-bold truncate leading-tight">{item.title}</h4>
                          <span className="text-[10px] text-gray-500 font-mono">رقم التعريف: {item.id}</span>
                          <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                            <span className="text-brand-pink font-bold">{item.type === MediaType.MOVIE ? 'فيلم' : 'مسلسل'}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-700" />
                            <span>{item.year}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-700" />
                            <span className="text-yellow-500 font-bold">{item.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button 
                            onClick={() => handleEditMedia(item)}
                            className="p-1 px-2.5 rounded bg-white/5 border border-white/5 text-gray-300 hover:bg-brand-pink hover:text-white transition-all text-xs flex items-center gap-1"
                            title="تعديل هذا العمل"
                          >
                            <Edit2 size={12} />
                            تعديل
                          </button>
                          <button 
                            onClick={() => handleDeleteMedia(item.id)}
                            className="p-1.5 rounded bg-brand-red/10 border border-brand-red/10 text-brand-red hover:bg-brand-red hover:text-white transition-all"
                            title="حذف نهائي"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-400">
                    <Film className="mx-auto text-gray-600 mb-3" size={32} />
                    <p className="text-sm">لم تقم بإضافة أي أعمال مخصصة بعد.</p>
                    <p className="text-xs text-gray-500 mt-1">ابدأ بملء الحقول في النموذج لإضافة عملك الأول!</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SERVERS & DOWNLOAD LINK CONFIGURATOR */}
        {activeTab === 'servers' && (
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <Server className="text-brand-pink" size={24} />
              ضبط سيرفرات المشاهدة والتحميل للأعمال الفنية والروابط المباشرة
            </h3>
            
            <p className="text-gray-400 text-sm mb-6 leading-relaxed text-right">
              يمكنك ربط وتعديل أي فيلم أو شو/مسلسل، سواء كان مضافاً يدوياً أو مستورداً من TMDb. فقط اختر نوع العمل الفني وأدخل رقم تعريفه (ID) أو اختر من أعمالك النشطة المضافة يدوياً، تم سجّل السيرفرات المناسبة.
            </p>

            <div className="space-y-6 text-right">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-5 rounded-2xl border border-white/5">
                
                {/* Visual Type Selector */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1.5">النوع للأصل المستهدف:</label>
                  <select 
                    value={selectedServerMediaType}
                    onChange={(e) => setSelectedServerMediaType(e.target.value as MediaType)}
                    className="w-full bg-brand-darker border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-pink text-right"
                  >
                    <option value={MediaType.MOVIE} className="bg-brand-darker text-white">فيلم سينمائي (MOVIE)</option>
                    <option value={MediaType.SERIES} className="bg-brand-darker text-white">مسلسل تلفزيوني (SERIES)</option>
                  </select>
                </div>

                {/* ID Selector & Input */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1.5">اختر من أعمالك اليدوية أو اكتب كود TMDb:</label>
                  <div className="flex gap-2 font-sans direction-rtl">
                    <input 
                      type="text"
                      placeholder="رقم التعريف للفيلم (TMDb / مخصص يدوياً)"
                      value={selectedServerMediaId}
                      onChange={(e) => setSelectedServerMediaId(e.target.value)}
                      className="flex-1 bg-brand-darker border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-pink font-mono text-center text-sm"
                    />
                    
                    {/* PopUp selection of added custom media */}
                    {mediaList.length > 0 && (
                      <select 
                        onChange={(e) => setSelectedServerMediaId(e.target.value)}
                        className="bg-brand-darker border border-white/10 rounded-xl px-2 py-3 text-white text-xs text-right max-w-[150px] outline-none"
                        value=""
                      >
                        <option value="" disabled>اختر عمل يدوياً</option>
                        {mediaList.filter(item => item.type === selectedServerMediaType).map(item => (
                          <option key={item.id} value={item.id} className="bg-brand-darker text-white">{item.title}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Episode Targeting For TV shows */}
              {selectedServerMediaType === MediaType.SERIES && (
                <div className="p-4 bg-gradient-to-r from-brand-pink/5 to-transparent border border-white/5 rounded-2xl text-right">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      id="specific_ep"
                      checked={isSpecificEpisode}
                      onChange={(e) => setIsSpecificEpisode(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-brand-pink focus:ring-brand-pink bg-black accent-brand-pink cursor-pointer"
                    />
                    <label htmlFor="specific_ep" className="text-gray-200 text-sm font-bold cursor-pointer">
                      استهداف حلقة محددة برقم الموسم ورقم الحلقة للروابط المخصصة
                    </label>
                  </div>
                  
                  {isSpecificEpisode ? (
                    <div className="grid grid-cols-2 gap-4 mt-3 max-w-sm">
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">رقم الموسم المستهدف:</label>
                        <input 
                          type="number"
                          min="1"
                          value={serverSeasonNumber}
                          onChange={(e) => setServerSeasonNumber(Number(e.target.value))}
                          className="w-full bg-brand-darker border border-white/10 rounded-lg py-2 px-3 text-white text-center text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">رقم الحلقة المستهدفة:</label>
                        <input 
                          type="number"
                          min="1"
                          value={serverEpisodeNumber}
                          onChange={(e) => setServerEpisodeNumber(Number(e.target.value))}
                          className="w-full bg-brand-darker border border-white/10 rounded-lg py-2 px-3 text-white text-center text-sm font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">
                      ملاحظة: يمكنك استخدام رابط قالبي عام لمسلسل بأكمله باستخدام المتغيرين <code className="text-brand-pink bg-white/5 px-1 py-0.5 rounded font-mono">{"{season}"}</code> و <code className="text-brand-pink bg-white/5 px-1 py-0.5 rounded font-mono">{"{episode}"}</code> في الروابط، وسيتنقل المشاهد آلياً بينها دون الحاجة لإدخال كل حلقة بشكل منفصل!
                    </p>
                  )}
                </div>
              )}

              {/* Action Trigger Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadServersData}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-2.5 px-6 rounded-xl transition-all text-sm flex items-center gap-2 outline-none"
                >
                  <RefreshCw size={16} />
                  جلب السيرفرات الحالية المسجلة لهذا العمل
                </button>
              </div>

              {/* Main Servers Editing Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/5 pt-6">
                
                {/* 1. WATCH SERVERS CONTAINER */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-base flex items-center gap-2 border-b border-white/5 pb-2">
                    <Server size={18} className="text-brand-pink" />
                    سيرفرات البث والمشاهدة الحالية
                  </h4>

                  {/* Add watch server form */}
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <input 
                        type="text"
                        placeholder="اسم السيرفر"
                        value={newWatchName}
                        onChange={(e) => setNewWatchName(e.target.value)}
                        className="w-full bg-brand-darker border border-white/10 rounded-lg py-2 px-3 text-white text-xs"
                      />
                      <input 
                        type="url"
                        placeholder="رابط مشغل iframe"
                        value={newWatchUrl}
                        onChange={(e) => setNewWatchUrl(e.target.value)}
                        className="w-full bg-brand-darker border border-white/10 rounded-lg py-2 px-3 text-white text-xs font-mono col-span-2 text-left dir-ltr"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addWatchServerInput}
                      className="w-full bg-brand-pink/20 hover:bg-brand-pink/30 text-brand-pink text-xs font-bold py-2 rounded-lg border border-brand-pink/20 transition-colors"
                    >
                      + إضافة سيرفر بث للقائمة مؤقتاً
                    </button>
                  </div>

                  {/* Watch servers active list table */}
                  {watchServers.length > 0 ? (
                    <div className="border border-white/5 rounded-xl overflow-hidden bg-black/10">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-black/30 text-gray-400">
                          <tr>
                            <th className="p-2.5">الاسم</th>
                            <th className="p-2.5">رابط المشغل / iframe</th>
                            <th className="p-2.5 text-center">أكشن</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-gray-300 font-medium">
                          {watchServers.map((srv, idx) => (
                            <tr key={idx} className="hover:bg-white/5">
                              <td className="p-2.5 font-bold text-white text-right">{srv.name}</td>
                              <td className="p-2.5 text-left font-mono truncate max-w-[150px] text-[10px] text-gray-400 dir-ltr">{srv.url}</td>
                              <td className="p-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => setWatchServers(watchServers.filter((_, i) => i !== idx))}
                                  className="text-brand-red font-bold hover:text-red-400"
                                >
                                  حذف
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs text-center border border-dashed border-white/10 p-4 rounded-xl">لا توجد أي سيرفرات بث في القائمة بعد.</p>
                  )}

                </div>

                {/* 2. DOWNLOAD LINKS CONTAINER */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-base flex items-center gap-2 border-b border-white/5 pb-2">
                    <Download size={18} className="text-brand-pink" />
                    سيرفرات التنزيل والتحميل المباشر
                  </h4>

                  {/* Add download link form */}
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <input 
                        type="text"
                        placeholder="مثال: جودة 1080p"
                        value={newDownloadName}
                        onChange={(e) => setNewDownloadName(e.target.value)}
                        className="w-full bg-brand-darker border border-white/10 rounded-lg py-2 px-3 text-white text-xs"
                      />
                      <input 
                        type="url"
                        placeholder="رابط التحميل المباشر"
                        value={newDownloadUrl}
                        onChange={(e) => setNewDownloadUrl(e.target.value)}
                        className="w-full bg-brand-darker border border-white/10 rounded-lg py-2 px-3 text-white text-xs font-mono col-span-2 text-left dir-ltr"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addDownloadServerInput}
                      className="w-full bg-brand-pink/20 hover:bg-brand-pink/30 text-brand-pink text-xs font-bold py-2 rounded-lg border border-brand-pink/20 transition-colors"
                    >
                      + إضافة سيرفر تحميل للقائمة مؤقتاً
                    </button>
                  </div>

                  {/* Download servers active list table */}
                  {downloadServers.length > 0 ? (
                    <div className="border border-white/5 rounded-xl overflow-hidden bg-black/10">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-black/30 text-gray-400">
                          <tr>
                            <th className="p-2.5">الجودة / الاسم</th>
                            <th className="p-2.5">رابط الملف</th>
                            <th className="p-2.5 text-center">أكشن</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-gray-300 font-medium">
                          {downloadServers.map((srv, idx) => (
                            <tr key={idx} className="hover:bg-white/5">
                              <td className="p-2.5 font-bold text-white text-right">{srv.name}</td>
                              <td className="p-2.5 text-left font-mono truncate max-w-[150px] text-[10px] text-gray-400 dir-ltr">{srv.url}</td>
                              <td className="p-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => setDownloadServers(downloadServers.filter((_, i) => i !== idx))}
                                  className="text-brand-red font-bold hover:text-red-400"
                                >
                                  حذف
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs text-center border border-dashed border-white/10 p-4 rounded-xl">لا توجد أي تصنيفات تحميل في القائمة بعد.</p>
                  )}

                </div>

              </div>

              {/* Bulk Form Submission Button controls */}
              <div className="border-t border-white/5 pt-6 text-center">
                <button
                  type="button"
                  onClick={handleSaveServers}
                  className="bg-brand-red hover:bg-brand-pink text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-brand-red/10 flex items-center justify-center gap-2 mx-auto active:scale-95 hover:scale-[1.02]"
                >
                  <Save size={18} />
                  حفظ وتطبيق جميع السيرفرات والتسجيل الفوري
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB: ADS MANAGEMENT */}
        {activeTab === 'ads' && adsData && (
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl max-w-4xl mx-auto text-right">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <Layers className="text-brand-pink" size={24} />
              إدارة المساحات الإعلانية وأكواد الـ ADS
            </h3>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              تتيح لك هذه اللوحة وضع إعلاناتك الخاصة بكسب الأرباح. يمكنك استبدال أكواد الإعلانات التلقائية أو وضع أكواد جافا سكريبت/HTML أو رابط Popunder أو صورة مخصصة مع رابط تحويل.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              saveAdsConfig(adsData).then(success => {
                if (success) {
                  showSuccess('تم حفظ وتحديث إعدادات مساحات الإعلان بنجاح!');
                } else {
                  showError('حدث خطأ أثناء حفظ الإعدادات على السيرفر.');
                }
              });
            }} className="space-y-8">
              
              {/* Loop and render block for each active ad slot */}
              {([
                { key: 'headerAd', name: 'إعلان رأس الصفحة (Header Banner)', desc: 'يظهر في جميع الصفحات تحت القائمة العلوية مباشرة.' },
                { key: 'detailsPageAd', name: 'إعلان صفحة تفاصيل العمل الفني', desc: 'يظهر في صفحة التفاصيل الفنية فوق زر المشاهدة.' },
                { key: 'watchPageAd', name: 'إعلان صفحة المشاهدة والتشغيل', desc: 'يظهر مباشرة بجوار أو أسفل مشغل الفيديو وسيرفرات البث.' },
                { key: 'popunderAd', name: 'إعلان النوافذ المنبثقة التلقائي (Popunder Link)', desc: 'يفتح رابطاً إعلانياً عند النقر في أي مكان في الموقع.' }
              ] as const).map((adInfo) => {
                const config = adsData[adInfo.key];
                if (!config) return null;
                return (
                  <div key={adInfo.key} className="bg-black/20 p-5 border border-white/5 rounded-2xl md:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          id={`toggle_${adInfo.key}`}
                          checked={config.isActive}
                          onChange={(e) => {
                            setAdsData({
                              ...adsData,
                              [adInfo.key]: {
                                ...config,
                                isActive: e.target.checked
                              }
                            });
                          }}
                          className="w-4 h-4 text-brand-red bg-black/40 border-white/10 rounded focus:ring-brand-pink"
                        />
                        <label htmlFor={`toggle_${adInfo.key}`} className="text-white font-bold text-base cursor-pointer mr-2">
                          {adInfo.name}
                        </label>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${config.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-gray-400 border border-white/5'}`}>
                        {config.isActive ? 'مُفعّل' : 'مُعطّل'}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-xs">{adInfo.desc}</p>

                    {config.isActive && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-right dir-rtl">
                        <div className="md:col-span-2">
                          <label className="block text-gray-300 text-xs font-semibold mb-1.5">نوع الإعلان:</label>
                          <select
                            value={config.type}
                            onChange={(e) => {
                              setAdsData({
                                ...adsData,
                                [adInfo.key]: {
                                  ...config,
                                  type: e.target.value
                                }
                              });
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-pink"
                          >
                            <option value="script">كود إعلان مخصص (Scripts / HTML / Native Codes)</option>
                            <option value="image">صورة مخصصة مع رابط تحويل (Custom Image Ad)</option>
                            <option value="link">رابط مباشر فقط (Direct URL)</option>
                          </select>
                        </div>

                        {(config.type === 'script' || config.type === 'html') && (
                          <div className="md:col-span-2">
                            <label className="block text-gray-300 text-xs font-semibold mb-1.5">كود الإعلان المخصص (HTML / JS / Adscript):</label>
                            <textarea
                              rows={3}
                              placeholder="أدخل كود الإعلان المقدم من شبكتك الإعلانية هنا..."
                              value={config.code}
                              onChange={(e) => {
                                setAdsData({
                                  ...adsData,
                                  [adInfo.key]: {
                                    ...config,
                                    code: e.target.value
                                  }
                                });
                              }}
                              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-pink font-mono text-xs dir-ltr text-left"
                            />
                          </div>
                        )}

                        {config.type === 'image' && (
                          <>
                            <div>
                              <label className="block text-gray-300 text-xs font-semibold mb-1.5">رابط صورة الإعلان (Banner Image URL):</label>
                              <input
                                type="text"
                                placeholder="https://example.com/banner.png"
                                value={config.imageUrl}
                                onChange={(e) => {
                                  setAdsData({
                                    ...adsData,
                                    [adInfo.key]: {
                                      ...config,
                                      imageUrl: e.target.value
                                    }
                                  });
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-pink font-sans text-xs dir-ltr text-left"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-300 text-xs font-semibold mb-1.5">رابط التحويل عند النقر (Target Destination URL):</label>
                              <input
                                type="text"
                                placeholder="https://example.com/promotions"
                                value={config.targetUrl}
                                onChange={(e) => {
                                  setAdsData({
                                    ...adsData,
                                    [adInfo.key]: {
                                      ...config,
                                      targetUrl: e.target.value
                                    }
                                  });
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-pink font-sans text-xs dir-ltr text-left"
                              />
                            </div>
                          </>
                        )}

                        {config.type === 'link' && (
                          <div className="md:col-span-2">
                            <label className="block text-gray-300 text-xs font-semibold mb-1.5">رابط الوجهة المباشر لقناتك/موقعك (Target URL):</label>
                            <input
                              type="text"
                              placeholder="https://example.com"
                              value={config.targetUrl}
                              onChange={(e) => {
                                setAdsData({
                                  ...adsData,
                                  [adInfo.key]: {
                                    ...config,
                                    targetUrl: e.target.value
                                  }
                                });
                              }}
                              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-pink font-sans text-xs dir-ltr text-left"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="border-t border-white/5 pt-6 text-center">
                <button
                  type="submit"
                  className="bg-brand-red hover:bg-brand-pink text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-brand-red/10 flex items-center justify-center gap-2 mx-auto active:scale-95 hover:scale-[1.02]"
                >
                  <Save size={18} />
                  حفظ وتطبيق إعدادات الإعلانات على السيرفر
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 3: BACKUP / BULK EXPORT & IMPORT */}
        {activeTab === 'backup' && (
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl max-w-2xl mx-auto text-right">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <Download className="text-brand-pink" size={24} />
              النسخ الاحتياطي وحفظ البيانات المكتوبة
            </h3>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              نظراً لأن قاعدة البيانات تعتمد بشكل آمن وعالي الكفاءة على ذاكرة المتصفح النشطة (Local Storage)، فنحن ننصحك بشدة وبشكل دوري بإنشاء نسخة احتياطية (برابط JSON) وتنزيلها على جهازك لتجنب فقدان البيانات المضافة في حال مسح كاش المتصفح أو تثبيت متصفح جديد.
            </p>

            <div className="space-y-6">
              
              <div className="bg-black/20 p-5 border border-white/5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-white font-bold text-base">تصدير وحفظ وتنزيل البيانات الحالية</h4>
                  <p className="text-gray-400 text-xs mt-1">تنزيل جميع الأفلام والمسلسلات والسيرفرات في ملف واحد ومحمي.</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="bg-brand-red hover:bg-brand-pink text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
                >
                  <Download size={18} />
                  تصدير نسخة احتياطية
                </button>
              </div>

              <div className="bg-black/20 p-5 border border-white/5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-white font-bold text-base">استيراد واستعادة البيانات من ملف</h4>
                  <p className="text-gray-400 text-xs mt-1">قم بتحميل ملف البيانات JSON الذي قمت بتصديره سابقاً لإستعادته.</p>
                </div>
                
                <div className="relative overflow-hidden font-sans">
                  <label 
                    htmlFor="import_file"
                    className="bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Upload size={18} />
                    استيراد من ملف JSON
                  </label>
                  <input 
                    type="file"
                    id="import_file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer hidden"
                  />
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-yellow-300 leading-relaxed font-medium">
                  <strong>تحذير هام:</strong> عند استيراد نسخة احتياطية من ملف، سيتم استبدال جميع المحتويات المضافة حالياً وجداول السيرفرات بما في الملف. يرجى أخذ نسخة احتياطية من بياناتك الحالية قبل ذلك لتجنب ضياعها.
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;

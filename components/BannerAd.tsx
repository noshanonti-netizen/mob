import React, { useEffect, useState } from 'react';
import { getAdsConfig, AdsConfigData, AdPlaceConfig } from '../api';

interface BannerAdProps {
  slot?: keyof AdsConfigData;
}

const BannerAd: React.FC<BannerAdProps> = ({ slot = 'headerAd' }) => {
  const [adConfig, setAdConfig] = useState<AdPlaceConfig | null>(null);

  useEffect(() => {
    const loadAds = async () => {
      const data = await getAdsConfig();
      if (data && data[slot]) {
        setAdConfig(data[slot]);
      }
    };
    
    loadAds();

    // Listen for custom update events when ads are saved in Admin Panel
    const handleUpdate = () => {
      loadAds();
    };
    window.addEventListener('aflameco_ads_updated', handleUpdate);
    return () => {
      window.removeEventListener('aflameco_ads_updated', handleUpdate);
    };
  }, [slot]);

  if (!adConfig || !adConfig.isActive) {
    return null;
  }

  // 1. Script / Custom HTML Ad Code
  if (adConfig.type === 'script' || adConfig.type === 'html') {
    return (
      <div 
        className="w-full flex justify-center items-center py-4 my-2 overflow-hidden bg-transparent"
        dangerouslySetInnerHTML={{ __html: adConfig.code }}
      />
    );
  }

  // 2. Custom Banner Image with hyperlink
  if (adConfig.type === 'image') {
    return (
      <div className="w-full flex justify-center items-center py-4 my-2 overflow-hidden bg-transparent">
        <a 
          href={adConfig.targetUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block max-w-full hover:opacity-90 transition-all rounded-lg overflow-hidden border border-white/5 shadow-xl"
        >
          <img 
            src={adConfig.imageUrl} 
            alt="إعلان ممول" 
            referrerPolicy="no-referrer"
            className="max-h-[150px] object-cover max-w-full"
          />
        </a>
      </div>
    );
  }

  // 3. Simple text link ad
  if (adConfig.type === 'link' && adConfig.targetUrl) {
    return (
      <div className="w-full flex justify-center items-center py-4 my-2 bg-transparent">
        <a 
          href={adConfig.targetUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-brand-pink hover:text-white underline font-bold text-sm text-center bg-white/5 px-6 py-2.5 rounded-xl border border-white/10 shadow-lg hover:scale-[1.01] active:scale-95 transition-all"
        >
          إعلان ممول: انقر هنا لزيارة الموقع الحليف وشريك البث
        </a>
      </div>
    );
  }

  return null;
};

export default BannerAd;
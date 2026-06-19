import React, { useEffect, useState, useRef } from 'react';
import { getAdsConfig, AdsConfigData, AdPlaceConfig } from '../api';

interface BannerAdProps {
  slot?: keyof AdsConfigData;
}

const BannerAd: React.FC<BannerAdProps> = ({ slot = 'headerAd' }) => {
  const [adConfig, setAdConfig] = useState<AdPlaceConfig | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Execute scripts if it is dynamic code
  useEffect(() => {
    if (!containerRef.current || !adConfig || !adConfig.isActive) return;
    if (adConfig.type !== 'script' && adConfig.type !== 'html') return;

    // Clear old elements from container
    containerRef.current.innerHTML = '';

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(adConfig.code, 'text/html');
      
      const scriptElements = Array.from(doc.querySelectorAll('script'));
      const nonScripts = Array.from(doc.body.childNodes).filter(node => node.nodeName !== 'SCRIPT');

      // Append standard nodes first
      nonScripts.forEach(node => {
        containerRef.current?.appendChild(node.cloneNode(true));
      });

      // Synchronously execute scripts in order
      scriptElements.forEach(scriptNode => {
        const script = document.createElement('script');
        
        // Copy all attributes
        Array.from(scriptNode.attributes).forEach(attr => {
          script.setAttribute(attr.name, attr.value);
        });

        // Set content if any
        if (scriptNode.innerHTML) {
          script.innerHTML = scriptNode.innerHTML;
        }

        // Append to container to execute
        containerRef.current?.appendChild(script);
      });
    } catch (err) {
      console.error('Error executing custom ad script:', err);
    }
  }, [adConfig]);

  if (!adConfig || !adConfig.isActive) {
    return null;
  }

  // 1. Script / Custom HTML Ad Code
  if (adConfig.type === 'script' || adConfig.type === 'html') {
    return (
      <div 
        ref={containerRef}
        className="w-full flex flex-col justify-center items-center py-4 my-2 overflow-hidden bg-transparent min-h-[100px]"
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
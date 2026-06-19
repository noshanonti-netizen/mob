import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'video.movie' | 'video.tv_show' | 'video.episode';
  schema?: Record<string, any>;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description = 'شاهد أحدث الأفلام والمسلسلات العربية والأجنبية والحصريات بجودة عالية وتحميل مباشر وسريع.',
  keywords = ['افلاميكوز', 'Aflamecoz', 'مشاهدة افلام', 'تحميل مسلسلات', 'سينما', 'بث مباشر', 'رمضان 2026', 'أفلام عربية', 'مسلسلات تركية'],
  image = 'https://aflameco.co/og-image.png',
  url,
  type = 'website',
  schema
}) => {
  useEffect(() => {
    // 1. Update document title
    const formattedTitle = title.includes('افلاميكوز') ? title : `${title} - افلاميكوز Aflamecoz`;
    document.title = formattedTitle;

    // Helper to query or create meta tags
    const getOrCreateMeta = (attrName: string, attrVal: string, contentVal: string) => {
      let element = document.head.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentVal);
    };

    // Helper to query or create links (like canonical)
    const getOrCreateLink = (relVal: string, hrefVal: string) => {
      let element = document.head.querySelector(`link[rel="${relVal}"]`) as HTMLLinkElement;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', relVal);
        document.head.appendChild(element);
      }
      element.setAttribute('href', hrefVal);
    };

    const currentUrl = url || window.location.href;

    // 2. Standard Meta Tags
    getOrCreateMeta('name', 'description', description);
    getOrCreateMeta('name', 'keywords', keywords.join(', '));
    getOrCreateMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    getOrCreateLink('canonical', currentUrl);

    // 3. Open Graph (OG) Tags for Socials & Crawlers
    getOrCreateMeta('property', 'og:title', formattedTitle);
    getOrCreateMeta('property', 'og:description', description);
    getOrCreateMeta('property', 'og:image', image);
    getOrCreateMeta('property', 'og:url', currentUrl);
    getOrCreateMeta('property', 'og:type', type);
    getOrCreateMeta('property', 'og:site_name', 'افلاميكوز Aflamecoz');
    getOrCreateMeta('property', 'og:locale', 'ar_AR');

    // 4. Twitter Card Tags
    getOrCreateMeta('name', 'twitter:card', 'summary_large_image');
    getOrCreateMeta('name', 'twitter:title', formattedTitle);
    getOrCreateMeta('name', 'twitter:description', description);
    getOrCreateMeta('name', 'twitter:image', image);

    // 5. Schema.org JSON-LD Structured Data
    // Remove old schema script tag from this component if exists
    const oldScript = document.getElementById('aflameco_seo_schema');
    if (oldScript) {
      oldScript.remove();
    }

    const finalSchema = schema || {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'افلاميكوز Aflamecoz',
      'url': 'https://aflameco.co/',
      'description': description,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://aflameco.co/series?search={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    };

    const script = document.createElement('script');
    script.id = 'aflameco_seo_schema';
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(finalSchema);
    document.head.appendChild(script);

    return () => {
      // Clean up script tag on unmount if needed (avoid leaving old page schema in dynamic navigation)
      const currentScript = document.getElementById('aflameco_seo_schema');
      if (currentScript) {
        currentScript.remove();
      }
    };
  }, [title, description, keywords, image, url, type, schema]);

  return null;
};

export default SEO;

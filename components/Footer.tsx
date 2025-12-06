import React from 'react';
import { Facebook, Twitter, Instagram, Heart, Play } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/90 border-t border-white/5 pt-16 pb-8 mt-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-red/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-6">
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-red to-brand-purple flex items-center justify-center">
                 <Play fill="white" className="ml-1" size={16} />
              </div>
              <span className="text-xl font-bold text-white">
                افلام<span className="text-brand-red">يكوز</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              موقع افلاميكوز هو وجهتك الأولى لمشاهدة أحدث الأفلام والمسلسلات العربية والأجنبية. نقدم تجربة مشاهدة فريدة بجودة عالية وبدون إعلانات مزعجة.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-blue-600 flex items-center justify-center text-white transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-sky-500 flex items-center justify-center text-white transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-pink-600 flex items-center justify-center text-white transition-colors">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">الأقسام</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-brand-pink transition-colors">أفلام عربية</a></li>
              <li><a href="#" className="hover:text-brand-pink transition-colors">أفلام أجنبية</a></li>
              <li><a href="#" className="hover:text-brand-pink transition-colors">مسلسلات رمضان 2026</a></li>
              <li><a href="#" className="hover:text-brand-pink transition-colors">مسلسلات تركية</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">المساعدة</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-brand-pink transition-colors">سياسة الخصوصية</a></li>
              <li><a href="#" className="hover:text-brand-pink transition-colors">شروط الاستخدام</a></li>
              <li><a href="#" className="hover:text-brand-pink transition-colors">اتصل بنا</a></li>
              <li><a href="#" className="hover:text-brand-pink transition-colors">DMCA</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Aflamecoz. جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-1">
            صنع بـ <Heart size={14} className="text-brand-red fill-brand-red animate-pulse" /> في مصر
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
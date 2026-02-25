import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { ArrowRight, Star, Flower, Wind, Moon } from 'lucide-react';

export const Home: React.FC = () => {
  const { language, convertPrice, t, tours } = useApp();

  const featuredTours = tours.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen bg-sand-50">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop" 
            alt="Vietnam Zen Landscape" 
            className="w-full h-full object-cover animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-sand-50"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl px-4 mt-20">
          <div className="inline-block animate-slide-up" style={{ animationDelay: '0.1s' }}>
             <Flower className="w-12 h-12 text-white/90 mx-auto mb-4 animate-spin-slow" />
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {t('hero.title')}
          </h1>
          <p className="text-xl text-sand-100 mb-10 font-light max-w-2xl mx-auto drop-shadow-sm animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {t('hero.subtitle')}
          </p>
          <div className="flex justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
             <Link to="/tours">
                <Button size="lg" className="bg-white text-teal-900 hover:bg-sand-100 border-none font-bold">{t('btn.book')}</Button>
             </Link>
             <Link to="/locations">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 hover:text-white">
                   {language === 'vi' ? 'Khám phá Địa điểm' : 'Explore Locations'}
                </Button>
             </Link>
          </div>
        </div>
      </section>

      {/* Intro Quote */}
      <section className="py-24 px-6 text-center bg-sand-50">
          <div className="max-w-3xl mx-auto">
             <p className="text-2xl md:text-3xl font-serif italic text-earth-800 leading-relaxed">
                "{language === 'vi' ? 'Hạnh phúc không phải là đích đến, mà là hành trình của sự bình yên trong tâm hồn.' : 'Happiness is not a destination, it is a way of life.'}"
             </p>
             <div className="w-16 h-1 bg-primary/30 mx-auto mt-8 rounded-full"></div>
          </div>
      </section>

      {/* Featured Tours */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
           <div>
              <span className="text-primary font-bold uppercase tracking-widest text-xs mb-2 block">{language === 'vi' ? 'Hành trình chọn lọc' : 'Curated Journeys'}</span>
              <h2 className="text-4xl font-serif font-bold text-earth-900">
                {language === 'vi' ? 'Tìm Về Bản Ngã' : 'Reconnect Within'}
              </h2>
           </div>
           <Link to="/tours" className="hidden md:block">
              <Button variant="ghost" className="group">
                 {language === 'vi' ? 'Xem tất cả' : 'View all'} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
           </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredTours.map((tour, index) => (
              <Link to={`/tours/${tour.id}`} key={tour.id} className="group cursor-pointer">
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col">
                   <div className="relative h-72 overflow-hidden">
                      <img 
                       src={tour.images[0]} 
                       alt={tour.title[language]} 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-earth-900 uppercase tracking-wide shadow-sm">
                        {tour.level}
                      </div>
                   </div>
                   <div className="p-8 flex-1 flex flex-col">
                     <div className="flex justify-between items-baseline mb-3">
                        <span className="text-primary text-xs font-bold uppercase tracking-wider">{tour.duration_days} {language === 'vi' ? 'Ngày' : 'Days'}</span>
                     </div>
                     <h3 className="text-2xl font-serif font-bold text-earth-900 mb-3 group-hover:text-primary transition-colors">{tour.title[language]}</h3>
                     <p className="text-stone-500 text-sm mb-6 line-clamp-2 leading-relaxed">{tour.description[language]}</p>
                     <div className="mt-auto pt-6 border-t border-sand-100 flex items-center justify-between">
                       <span className="text-lg font-bold text-earth-900">{convertPrice(tour.price_vnd)}</span>
                       <span className="w-10 h-10 rounded-full bg-sand-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <ArrowRight className="w-5 h-5" />
                       </span>
                     </div>
                   </div>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-primary-dark text-sand-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
             <div className="text-center mb-16">
                 <h2 className="text-3xl font-serif font-bold mb-4 text-white">Why An Tinh Viet?</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="w-14 h-14 bg-primary-light/20 rounded-full flex items-center justify-center mx-auto mb-6 text-sand-100">
                        <Wind className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-serif font-bold mb-3">{language === 'vi' ? 'Thư Thái' : 'Serenity'}</h3>
                    <p className="text-sand-200 text-sm leading-relaxed">{language === 'vi' ? 'Không gian được thiết kế để xoa dịu tâm hồn.' : 'Spaces designed to soothe the soul.'}</p>
                </div>
                <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                     <div className="w-14 h-14 bg-primary-light/20 rounded-full flex items-center justify-center mx-auto mb-6 text-sand-100">
                        <Moon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-serif font-bold mb-3">{language === 'vi' ? 'Chiều Sâu' : 'Depth'}</h3>
                    <p className="text-sand-200 text-sm leading-relaxed">{language === 'vi' ? 'Kết nối nội tâm sâu sắc qua thiền định.' : 'Profound inner connection through meditation.'}</p>
                </div>
                <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                     <div className="w-14 h-14 bg-primary-light/20 rounded-full flex items-center justify-center mx-auto mb-6 text-sand-100">
                        <Flower className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-serif font-bold mb-3">{language === 'vi' ? 'Văn Hóa' : 'Culture'}</h3>
                    <p className="text-sand-200 text-sm leading-relaxed">{language === 'vi' ? 'Tôn vinh giá trị di sản Việt.' : 'Honoring Vietnamese heritage values.'}</p>
                </div>
             </div>
          </div>
      </section>
    </div>
  );
};
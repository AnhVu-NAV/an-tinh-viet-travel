
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TOURS, LOCATIONS } from '../constants';
import { Filter, Clock, MapPin } from 'lucide-react';

export const Tours: React.FC = () => {
  const { language, convertPrice } = useApp();
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTours = useMemo(() => {
    return TOURS.filter(tour => {
      const matchLevel = filterLevel === 'all' || tour.level === filterLevel;
      const matchSearch = tour.title[language].toLowerCase().includes(searchQuery.toLowerCase());
      return matchLevel && matchSearch;
    });
  }, [filterLevel, searchQuery, language]);

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 space-y-4 md:space-y-0">
          <div>
             <h1 className="text-4xl font-serif font-bold text-teal-900">
               {language === 'vi' ? 'Danh Sách Tour' : 'All Journeys'}
             </h1>
             <p className="text-stone-500 mt-2">
               {language === 'vi' ? 'Chọn hành trình phù hợp với tâm hồn bạn.' : 'Choose a journey that suits your soul.'}
             </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-center">
             <input 
                type="text" 
                placeholder={language === 'vi' ? 'Tìm kiếm tour...' : 'Search tours...'}
                className="px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
             />
             <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-stone-200">
                <Filter className="w-4 h-4 text-stone-400 ml-2" />
                <select 
                  className="bg-transparent border-none text-stone-700 text-sm focus:ring-0 cursor-pointer py-1"
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                >
                  <option value="all">{language === 'vi' ? 'Tất cả cấp độ' : 'All Levels'}</option>
                  <option value="light">{language === 'vi' ? 'Nhẹ' : 'Light'}</option>
                  <option value="moderate">{language === 'vi' ? 'Vừa' : 'Moderate'}</option>
                  <option value="deep">{language === 'vi' ? 'Sâu' : 'Deep'}</option>
                </select>
             </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredTours.map(tour => (
            <Link 
              to={`/tours/${tour.id}`} 
              key={tour.id} 
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col md:flex-row h-auto md:h-72 group"
            >
               <div className="w-full md:w-2/5 h-48 md:h-full relative overflow-hidden">
                 <img 
                   src={tour.images[0]} 
                   alt={tour.title[language]} 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                 />
                 <div className="absolute top-2 left-2 bg-amber-400 text-teal-900 text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
                   {tour.level.toUpperCase()}
                 </div>
               </div>
               <div className="flex-1 p-6 flex flex-col justify-between">
                 <div>
                    <h3 className="text-xl font-serif font-bold text-teal-900 mb-2 group-hover:text-primary transition-colors">{tour.title[language]}</h3>
                    <p className="text-stone-500 text-sm mb-4 line-clamp-2">{tour.description[language]}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-stone-400 mb-4">
                       <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {tour.duration_days} {language === 'vi' ? 'Ngày' : 'Days'}
                       </div>
                       <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {LOCATIONS.find(l => l.id === tour.locations[0])?.region}
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-bold text-teal-800">{convertPrice(tour.price_vnd)}</span>
                    <span className="inline-flex items-center justify-center rounded-full transition-all duration-300 font-medium shadow-sm border border-primary text-primary group-hover:bg-primary group-hover:text-white group-hover:shadow-md px-4 py-1.5 text-xs">
                       {language === 'vi' ? 'Chi tiết' : 'Details'}
                    </span>
                 </div>
               </div>
            </Link>
          ))}

          {filteredTours.length === 0 && (
             <div className="col-span-full text-center py-20 text-stone-400">
               <p>{language === 'vi' ? 'Không tìm thấy tour phù hợp.' : 'No tours found.'}</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

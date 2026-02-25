
import React from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { BookOpen, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Courses: React.FC = () => {
  const { courses, language, convertPrice } = useApp();

  return (
    <div className="min-h-screen bg-sand-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
         <div className="text-center mb-16 animate-slide-up">
             <span className="text-primary font-bold uppercase tracking-widest text-xs mb-2 block">{language === 'vi' ? 'Học hỏi & Thực hành' : 'Learn & Practice'}</span>
             <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-900 mb-4">
                {language === 'vi' ? 'Khóa Học Thiền & Chữa Lành' : 'Meditation & Healing Courses'}
             </h1>
             <p className="text-lg text-stone-500 max-w-2xl mx-auto">
                {language === 'vi' 
                 ? 'Những khóa học được thiết kế chuyên sâu giúp bạn làm chủ cảm xúc và tìm lại sự cân bằng.' 
                 : 'In-depth courses designed to help you master your emotions and rediscover balance.'}
             </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course, idx) => (
                <div 
                    key={course.id} 
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group animate-slide-up"
                    style={{ animationDelay: `${idx * 150}ms` }}
                >
                    <Link to={`/courses/${course.id}`} className="block h-48 overflow-hidden relative">
                        <img src={course.image} alt={course.title[language]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-earth-900/10 group-hover:bg-transparent transition-colors"></div>
                    </Link>
                    <div className="p-8">
                        <Link to={`/courses/${course.id}`}>
                            <h3 className="text-xl font-serif font-bold text-earth-900 mb-3 hover:text-primary transition-colors">{course.title[language]}</h3>
                        </Link>
                        <p className="text-stone-500 text-sm mb-6 line-clamp-2">{course.description[language]}</p>
                        
                        <div className="flex items-center justify-between text-xs text-stone-400 mb-6 border-b border-sand-100 pb-4">
                            <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" /> {course.duration}
                            </div>
                            <div className="flex items-center">
                                <Users className="w-3 h-3 mr-1" /> Online/Offline
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">{convertPrice(course.price_vnd)}</span>
                            <Link to={`/courses/${course.id}`}>
                                <Button size="sm" variant="outline">{language === 'vi' ? 'Xem chi tiết' : 'Details'}</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};

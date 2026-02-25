import React from 'react';
import { useApp } from '../context/AppContext';
import { Flower, Target, Heart, Leaf } from 'lucide-react';

export const About: React.FC = () => {
  const { language } = useApp();

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Hero */}
      <div className="bg-earth-900 text-sand-50 py-24 px-4 text-center relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
             <div className="absolute bottom-10 right-10 w-96 h-96 bg-sand-200 rounded-full blur-3xl"></div>
         </div>
         <div className="max-w-4xl mx-auto relative z-10 animate-fade-in">
             <Flower className="w-12 h-12 text-primary-light mx-auto mb-6" />
             <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
                 {language === 'vi' ? 'Về An Tịnh Việt' : 'About An Tinh Viet'}
             </h1>
             <p className="text-xl text-sand-200 font-light leading-relaxed">
                 {language === 'vi' ? 'Điểm đến của sự an lành.' : 'The destination of serenity.'}
             </p>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20 space-y-20">
          {/* Intro */}
          <section className="text-center animate-slide-up">
              <p className="text-lg text-earth-900 leading-8">
                  {language === 'vi' 
                   ? 'Giữa nhịp sống hiện đại hối hả và đầy áp lực, An Tịnh Việt ra đời như một khoảng lặng cần thiết, nơi du khách có thể tạm tách khỏi những lo toan đô thị để tìm lại sự cân bằng nội tại. Chúng tôi định vị mình là mô hình du lịch trải nghiệm kết hợp chữa lành, tập trung kiến tạo những hành trình có chủ đích và chiều sâu.' 
                   : 'Amidst the hustle and bustle of modern life, An Tinh Viet was born as a necessary pause, a place where travelers can detach from urban worries to rediscover inner balance. We position ourselves as a model of experiential tourism combined with healing, focusing on creating purposeful and deep journeys.'}
              </p>
          </section>

          {/* Vision & Mission */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-sand-100 rounded-full flex items-center justify-center text-primary mb-4">
                      <Target className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-earth-900 mb-4">{language === 'vi' ? 'Tầm nhìn (Vision)' : 'Vision'}</h3>
                  <p className="text-stone-600 leading-relaxed text-sm">
                      {language === 'vi' 
                       ? 'An Tịnh Việt hướng đến trở thành thương hiệu tiên phong định hình chuẩn mực mới cho ngành du lịch chữa lành tại Việt Nam. Khát vọng chuyển dịch mô hình du lịch truyền thống sang một hướng đi nhân văn hơn.'
                       : 'An Tinh Viet aims to become the pioneering brand defining new standards for healing tourism in Vietnam. We aspire to shift traditional tourism models towards a more humanistic direction.'}
                  </p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-sand-100 rounded-full flex items-center justify-center text-primary mb-4">
                      <Heart className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-earth-900 mb-4">{language === 'vi' ? 'Sứ mệnh (Mission)' : 'Mission'}</h3>
                  <p className="text-stone-600 leading-relaxed text-sm">
                      {language === 'vi' 
                       ? 'Thiết kế và vận hành những hành trình du lịch có chiều sâu, giúp con người phục hồi năng lượng và tái tạo nhận thức sống. Cam kết bảo tồn giá trị di sản và cảnh quan thiên nhiên.'
                       : 'Design and operate deep travel journeys that help people restore energy and regenerate living awareness. Committed to preserving heritage values and natural landscapes.'}
                  </p>
              </div>
          </div>

          {/* Core Values */}
          <section className="bg-primary/5 rounded-3xl p-10">
              <div className="text-center mb-10">
                  <h2 className="text-3xl font-serif font-bold text-earth-900 mb-2">{language === 'vi' ? 'Giá Trị Cốt Lõi' : 'Core Values'}</h2>
                  <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  {[
                      {vi: 'Chân thực', en: 'Authenticity', icon: Leaf},
                      {vi: 'Chiều sâu', en: 'Depth', icon: Target},
                      {vi: 'Thấu cảm', en: 'Empathy', icon: Heart},
                      {vi: 'Bền vững', en: 'Sustainability', icon: Flower}
                  ].map((val, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                          <val.icon className="w-8 h-8 text-primary mb-3" />
                          <h4 className="font-bold text-earth-900">{language === 'vi' ? val.vi : val.en}</h4>
                      </div>
                  ))}
              </div>
          </section>
      </div>
    </div>
  );
};
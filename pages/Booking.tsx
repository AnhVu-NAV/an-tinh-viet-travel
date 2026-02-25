import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { Check, Tag, Info } from 'lucide-react';

export const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, convertPrice, addBooking, user, login, discounts } = useApp();
  const { tours } = useApp(); // Get tours from context instead of constants to support admin updates
  const tour = tours.find(t => t.id === id);

  const [step, setStep] = useState(1);
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [guests, setGuests] = useState(1);
  const [email, setEmail] = useState(user?.email || '');
  
  // Discount States
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{code: string, percent: number} | null>(null);
  const [discountError, setDiscountError] = useState('');

  if (!tour) return <div className="p-20 text-center">Tour not found</div>;

  const handleApplyDiscount = () => {
      const code = discountCode.trim().toUpperCase();
      const discount = discounts.find(d => d.code === code);
      
      if (!discount) {
          setDiscountError(language === 'vi' ? 'Mã không hợp lệ' : 'Invalid code');
          setAppliedDiscount(null);
          return;
      }
      
      // Simple validity check (mocking date check)
      if (discount.used_count >= discount.usage_limit) {
           setDiscountError(language === 'vi' ? 'Mã đã hết lượt dùng' : 'Code usage limit reached');
           setAppliedDiscount(null);
           return;
      }

      setAppliedDiscount({ code: discount.code, percent: discount.percent });
      setDiscountError('');
  };

  const totalPrice = tour.price_vnd * guests;
  const discountAmount = appliedDiscount ? (totalPrice * appliedDiscount.percent / 100) : 0;
  const finalPrice = totalPrice - discountAmount;

  const handleBooking = () => {
    if (!user) login(email); // Mock login
    
    addBooking({
      id: 'bk-' + Date.now(),
      userId: user?.id || 'guest',
      tourId: tour.id,
      scheduleId: selectedSchedule,
      guests,
      totalPrice: finalPrice,
      currency: 'VND', // Simplified for demo
      status: 'PAID', // Simplified for demo
      date: new Date().toISOString(),
      discountCode: appliedDiscount?.code
    });
    setStep(3); // Success
  };

  return (
    <div className="min-h-screen bg-sand-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        
        {/* Progress */}
        <div className="flex justify-between mb-8 px-8">
           {[1, 2, 3].map(s => (
              <div key={s} className="flex flex-col items-center">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= s ? 'bg-primary text-white shadow-md' : 'bg-sand-200 text-stone-400'}`}>
                    {step > s ? <Check className="w-5 h-5" /> : s}
                 </div>
                 <span className="text-xs mt-2 text-stone-500 font-medium">
                    {s === 1 ? (language === 'vi' ? 'Chọn lịch' : 'Select') : 
                     s === 2 ? (language === 'vi' ? 'Thanh toán' : 'Payment') : 
                     (language === 'vi' ? 'Hoàn tất' : 'Done')}
                 </span>
              </div>
           ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-sand-100">
           <h2 className="text-2xl font-serif font-bold text-earth-900 mb-2">{tour.title[language]}</h2>
           <p className="text-stone-500 text-sm mb-6 flex items-center">
              <Info className="w-4 h-4 mr-1" />
              {language === 'vi' ? 'Vui lòng kiểm tra kỹ thông tin trước khi đặt.' : 'Please review information carefully.'}
           </p>
           
           {step === 1 && (
             <div className="space-y-6 animate-fade-in">
                <div>
                   <label className="block text-sm font-bold text-earth-900 mb-3">{language === 'vi' ? 'Chọn ngày khởi hành' : 'Select Departure Date'}</label>
                   <div className="grid grid-cols-1 gap-3">
                      {tour.schedule.map(s => (
                         <div 
                           key={s.id} 
                           onClick={() => setSelectedSchedule(s.id)}
                           className={`p-4 border rounded-xl cursor-pointer flex justify-between items-center transition-all ${selectedSchedule === s.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-sand-200 hover:border-primary/50'}`}
                         >
                            <span className="font-semibold text-earth-900">{s.startDate}</span>
                            <span className="text-xs bg-sand-100 text-stone-600 px-2 py-1 rounded-full">{s.slotsLeft} {language === 'vi' ? 'chỗ' : 'slots'}</span>
                         </div>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-bold text-earth-900 mb-3">{language === 'vi' ? 'Số khách' : 'Number of Guests'}</label>
                   <div className="flex items-center space-x-4">
                      <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-10 h-10 rounded-full border border-sand-300 hover:bg-sand-100 flex items-center justify-center text-xl font-bold text-earth-900">-</button>
                      <span className="text-xl font-bold w-8 text-center">{guests}</span>
                      <button onClick={() => setGuests(Math.min(10, guests + 1))} className="w-10 h-10 rounded-full border border-sand-300 hover:bg-sand-100 flex items-center justify-center text-xl font-bold text-earth-900">+</button>
                   </div>
                </div>

                <div className="flex justify-between items-end pt-6 border-t border-sand-100">
                   <div>
                      <p className="text-xs text-stone-500 uppercase tracking-wide">Total Estimate</p>
                      <p className="text-2xl font-bold text-primary">{convertPrice(tour.price_vnd * guests)}</p>
                   </div>
                   <Button onClick={() => selectedSchedule && setStep(2)} disabled={!selectedSchedule}>
                      {language === 'vi' ? 'Tiếp tục' : 'Continue'}
                   </Button>
                </div>
             </div>
           )}

           {step === 2 && (
             <div className="space-y-6 animate-fade-in">
                {!user && (
                   <div>
                     <label className="block text-sm font-bold text-earth-900 mb-2">Email Address</label>
                     <input 
                        type="email" 
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50"
                        placeholder="your@email.com"
                     />
                   </div>
                )}
                
                {/* Discount Section */}
                <div>
                    <label className="block text-sm font-bold text-earth-900 mb-2">{language === 'vi' ? 'Mã giảm giá' : 'Discount Code'}</label>
                    <div className="flex space-x-2">
                        <div className="relative flex-1">
                            <Tag className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                            <input 
                                type="text" 
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value)}
                                className="w-full pl-9 p-2.5 border border-sand-200 rounded-xl focus:ring-primary focus:border-primary uppercase"
                                placeholder="ENTER CODE"
                            />
                        </div>
                        <Button variant="secondary" size="sm" onClick={handleApplyDiscount} disabled={appliedDiscount !== null}>
                            {language === 'vi' ? 'Áp dụng' : 'Apply'}
                        </Button>
                    </div>
                    {discountError && <p className="text-red-500 text-xs mt-1 ml-1">{discountError}</p>}
                    {appliedDiscount && (
                        <div className="mt-2 text-primary text-sm flex items-center bg-primary/10 p-2 rounded-lg">
                            <Check className="w-4 h-4 mr-1" /> 
                            Code <b>{appliedDiscount.code}</b> applied (-{appliedDiscount.percent}%)
                            <button onClick={() => {setAppliedDiscount(null); setDiscountCode('');}} className="ml-auto text-xs text-stone-500 hover:text-red-500 underline">Remove</button>
                        </div>
                    )}
                </div>

                <div className="bg-sand-50 p-6 rounded-2xl border border-sand-100">
                   <h4 className="font-bold mb-4 text-earth-900 border-b border-sand-200 pb-2">Payment Summary</h4>
                   <div className="flex justify-between text-sm mb-2 text-stone-600">
                      <span>Tour Fee ({guests} pax)</span>
                      <span>{convertPrice(totalPrice)}</span>
                   </div>
                   {appliedDiscount && (
                       <div className="flex justify-between text-sm mb-2 text-primary">
                          <span>Discount ({appliedDiscount.percent}%)</span>
                          <span>- {convertPrice(discountAmount)}</span>
                       </div>
                   )}
                   <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t border-sand-200 text-earth-900">
                      <span>Final Total</span>
                      <span>{convertPrice(finalPrice)}</span>
                   </div>
                </div>

                <div className="flex space-x-3 pt-4">
                   <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                   <Button onClick={handleBooking} className="flex-1 shadow-lg shadow-primary/20">
                      {language === 'vi' ? 'Thanh toán (Mock)' : 'Pay Now (Mock)'}
                   </Button>
                </div>
             </div>
           )}

           {step === 3 && (
             <div className="text-center py-10 animate-slide-up">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                   <Check className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-earth-900 mb-2">Booking Confirmed!</h3>
                <p className="text-stone-500 mb-8 max-w-xs mx-auto">
                    {language === 'vi' ? 'Cảm ơn bạn đã lựa chọn An Tịnh Việt. Email xác nhận đã được gửi.' : 'Thank you for choosing An Tinh Viet. A confirmation email has been sent.'}
                </p>
                <Button onClick={() => navigate('/')} size="lg">Return Home</Button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
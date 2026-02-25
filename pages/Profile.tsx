
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Booking, Review } from '../types';
import { User, Package, Clock, CheckCircle, XCircle, Star, MessageSquare } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, bookings, tours, language, convertPrice, addReview, reviews } = useApp();
  const [activeTab, setActiveTab] = useState<'history' | 'settings'>('history');
  
  // Review Modal State
  const [reviewModal, setReviewModal] = useState<{ isOpen: boolean; bookingId: string; tourId: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Filter bookings for current user
  const userBookings = bookings.filter(b => b.userId === user.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmitReview = (e: React.FormEvent) => {
      e.preventDefault();
      if (!reviewModal) return;

      const newReview: Review = {
          id: 'rv-' + Date.now(),
          tourId: reviewModal.tourId,
          bookingId: reviewModal.bookingId,
          user: user.name,
          rating,
          comment,
          date: new Date().toISOString().split('T')[0]
      };

      addReview(newReview);
      setReviewModal(null);
      setComment('');
      setRating(5);
  };

  const hasReviewed = (bookingId: string) => {
      return reviews.some(r => r.bookingId === bookingId);
  };

  return (
    <div className="min-h-screen bg-sand-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
         
         {/* Profile Header */}
         <div className="bg-white rounded-3xl shadow-sm border border-sand-200 p-8 mb-8 flex flex-col md:flex-row items-center gap-6">
             <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold border-4 border-sand-100">
                 {user.name.charAt(0)}
             </div>
             <div className="text-center md:text-left flex-1">
                 <h1 className="text-3xl font-serif font-bold text-earth-900">{user.name}</h1>
                 <p className="text-stone-500">{user.email}</p>
                 <span className="inline-block mt-2 px-3 py-1 bg-sand-100 text-xs font-bold rounded-full text-stone-600 uppercase tracking-wider">{user.role}</span>
             </div>
             <div className="flex gap-3">
                 <Button variant={activeTab === 'history' ? 'primary' : 'secondary'} onClick={() => setActiveTab('history')}>
                    {language === 'vi' ? 'Lịch sử đặt chỗ' : 'Booking History'}
                 </Button>
                 {/* <Button variant={activeTab === 'settings' ? 'primary' : 'secondary'} onClick={() => setActiveTab('settings')}>
                    Settings
                 </Button> */}
             </div>
         </div>

         {/* Content */}
         {activeTab === 'history' && (
             <div className="space-y-6">
                 <h2 className="text-2xl font-serif font-bold text-earth-900 mb-4">{language === 'vi' ? 'Chuyến đi của tôi' : 'My Journeys'}</h2>
                 
                 {userBookings.length === 0 ? (
                     <div className="text-center py-12 bg-white rounded-3xl border border-sand-200">
                         <Package className="w-12 h-12 text-sand-300 mx-auto mb-4" />
                         <p className="text-stone-500 mb-4">{language === 'vi' ? 'Bạn chưa đặt chuyến đi nào.' : 'You have not booked any journeys yet.'}</p>
                         <Link to="/tours"><Button>{language === 'vi' ? 'Khám phá ngay' : 'Explore Now'}</Button></Link>
                     </div>
                 ) : (
                     <div className="grid gap-6">
                         {userBookings.map(booking => {
                             const tour = tours.find(t => t.id === booking.tourId);
                             const isCompleted = booking.status === 'COMPLETED';
                             const isReviewed = hasReviewed(booking.id);

                             return (
                                 <div key={booking.id} className="bg-white rounded-2xl p-6 shadow-sm border border-sand-100 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">
                                     <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0">
                                         <img src={tour?.images[0]} alt="" className="w-full h-full object-cover" />
                                     </div>
                                     <div className="flex-1">
                                         <div className="flex justify-between items-start mb-2">
                                             <div>
                                                <h3 className="text-xl font-bold text-earth-900">{tour?.title[language]}</h3>
                                                <p className="text-sm text-stone-500">Booking ID: #{booking.id.split('-').pop()}</p>
                                             </div>
                                             <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center ${
                                                 booking.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-100' :
                                                 booking.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                 booking.status === 'PAID' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                 'bg-red-50 text-red-700 border-red-100'
                                             }`}>
                                                 {booking.status === 'COMPLETED' ? <CheckCircle className="w-3 h-3 mr-1" /> : 
                                                  booking.status === 'CANCELLED' ? <XCircle className="w-3 h-3 mr-1" /> :
                                                  <Clock className="w-3 h-3 mr-1" />}
                                                 {booking.status}
                                             </div>
                                         </div>
                                         
                                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-stone-600 mb-4">
                                             <div>
                                                 <span className="block text-xs text-stone-400 uppercase">{language === 'vi' ? 'Ngày khởi hành' : 'Date'}</span>
                                                 <span className="font-medium">{booking.date}</span>
                                             </div>
                                             <div>
                                                 <span className="block text-xs text-stone-400 uppercase">{language === 'vi' ? 'Số khách' : 'Guests'}</span>
                                                 <span className="font-medium">{booking.guests}</span>
                                             </div>
                                             <div>
                                                 <span className="block text-xs text-stone-400 uppercase">{language === 'vi' ? 'Tổng tiền' : 'Total'}</span>
                                                 <span className="font-medium text-primary">{convertPrice(booking.totalPrice)}</span>
                                             </div>
                                         </div>

                                         <div className="flex justify-end gap-3 border-t border-sand-50 pt-4">
                                             <Link to={`/tours/${booking.tourId}`}>
                                                 <Button variant="ghost" size="sm">{language === 'vi' ? 'Xem lại Tour' : 'View Tour'}</Button>
                                             </Link>
                                             {isCompleted && !isReviewed && (
                                                 <Button size="sm" onClick={() => setReviewModal({ isOpen: true, bookingId: booking.id, tourId: booking.tourId })}>
                                                     {language === 'vi' ? 'Đánh giá' : 'Write Review'}
                                                 </Button>
                                             )}
                                             {isReviewed && (
                                                 <span className="text-sm text-stone-400 flex items-center px-4">
                                                     <Star className="w-4 h-4 mr-1 text-amber-400 fill-amber-400" /> {language === 'vi' ? 'Đã đánh giá' : 'Reviewed'}
                                                 </span>
                                             )}
                                         </div>
                                     </div>
                                 </div>
                             );
                         })}
                     </div>
                 )}
             </div>
         )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 animate-slide-up">
                  <h3 className="text-2xl font-serif font-bold text-earth-900 mb-2">{language === 'vi' ? 'Đánh giá chuyến đi' : 'Rate your journey'}</h3>
                  <p className="text-stone-500 mb-6">{language === 'vi' ? 'Chia sẻ trải nghiệm của bạn để giúp cộng đồng.' : 'Share your experience to help the community.'}</p>
                  
                  <form onSubmit={handleSubmitReview}>
                      <div className="flex justify-center gap-2 mb-6">
                          {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                  key={star}
                                  type="button"
                                  onClick={() => setRating(star)}
                                  className={`p-2 transition-transform hover:scale-110 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}`}
                              >
                                  <Star className={`w-8 h-8 ${star <= rating ? 'fill-current' : ''}`} />
                              </button>
                          ))}
                      </div>

                      <div className="mb-6">
                          <label className="block text-sm font-bold text-stone-700 mb-2">{language === 'vi' ? 'Nhận xét' : 'Comments'}</label>
                          <textarea
                              required
                              rows={4}
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              placeholder={language === 'vi' ? 'Bạn cảm thấy thế nào về chuyến đi...' : 'How was your trip...'}
                              className="w-full p-4 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50"
                          ></textarea>
                      </div>

                      <div className="flex gap-3 justify-end">
                          <Button type="button" variant="ghost" onClick={() => setReviewModal(null)}>{language === 'vi' ? 'Hủy' : 'Cancel'}</Button>
                          <Button type="submit">{language === 'vi' ? 'Gửi đánh giá' : 'Submit Review'}</Button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

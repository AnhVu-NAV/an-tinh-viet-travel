
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language, Currency, User, Booking, Tour, Location, Course, Discount, Review } from '../types';
import { EXCHANGE_RATE, TOURS as INITIAL_TOURS, LOCATIONS as INITIAL_LOCATIONS, COURSES as INITIAL_COURSES, DISCOUNTS as INITIAL_DISCOUNTS, REVIEWS as INITIAL_REVIEWS, MOCK_USERS } from '../constants';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  
  // Auth
  user: User | null;
  login: (email: string, role?: User['role']) => void;
  logout: () => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;

  // Data State
  tours: Tour[];
  setTours: React.Dispatch<React.SetStateAction<Tour[]>>;
  locations: Location[];
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  discounts: Discount[];
  setDiscounts: React.Dispatch<React.SetStateAction<Discount[]>>;
  reviews: Review[];
  addReview: (review: Review) => void;
  
  // Booking Logic
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  
  // Helpers
  convertPrice: (priceVnd: number) => string;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const translations: Record<string, { vi: string; en: string }> = {
  'nav.home': { vi: 'Trang chủ', en: 'Home' },
  'nav.tours': { vi: 'Hành trình', en: 'Journeys' },
  'nav.locations': { vi: 'Điểm đến', en: 'Locations' },
  'nav.courses': { vi: 'Khóa học', en: 'Courses' },
  'nav.about': { vi: 'Về An Tịnh', en: 'Our Story' },
  'nav.login': { vi: 'Đăng nhập', en: 'Login' },
  'nav.admin': { vi: 'Quản trị', en: 'Admin' },
  'hero.title': { vi: 'Tìm Về Sự An Yên', en: 'Find Your Inner Peace' },
  'hero.subtitle': { vi: 'Hành trình du lịch chữa lành Thân - Tâm - Trí', en: 'A journey of healing Body - Mind - Spirit' },
  'btn.book': { vi: 'Đặt Ngay', en: 'Book Now' },
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('vi');
  const [currency, setCurrency] = useState<Currency>('VND');
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  
  const [tours, setTours] = useState<Tour[]>(INITIAL_TOURS);
  const [locations, setLocations] = useState<Location[]>(INITIAL_LOCATIONS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [discounts, setDiscounts] = useState<Discount[]>(INITIAL_DISCOUNTS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);

  useEffect(() => {
    // Mock initial bookings with specific user IDs
    setBookings([
      { id: 'b1', userId: 'u1', tourId: 't1', scheduleId: 's1-1', guests: 2, totalPrice: 5700000, currency: 'VND', status: 'COMPLETED', date: '2024-01-15' },
      { id: 'b2', userId: 'u1', tourId: 't3', scheduleId: 's3-1', guests: 1, totalPrice: 4950000, currency: 'VND', status: 'PENDING', date: '2024-05-20' },
      { id: 'b3', userId: 'u1', tourId: 't10', scheduleId: 's10-1', guests: 2, totalPrice: 2500000, currency: 'VND', status: 'COMPLETED', date: '2023-11-10' },
    ]);
  }, []);

  const login = (email: string, role: User['role'] = 'USER') => {
    // Check if user exists in mock DB
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        setUser(existingUser);
    } else {
        // Create new mock user
        const newUser: User = {
            id: 'u-' + Date.now(),
            name: email.split('@')[0],
            email,
            role,
            active: true
        };
        setUsers(prev => [...prev, newUser]);
        setUser(newUser);
    }
  };

  const logout = () => setUser(null);

  const addBooking = (booking: Booking) => {
    // Ensure booking has valid userId if logged in
    const newBooking = user ? { ...booking, userId: user.id } : booking;
    setBookings(prev => [newBooking, ...prev]);
  };

  const updateBookingStatus = (id: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const addReview = (review: Review) => {
    setReviews(prev => [review, ...prev]);
  };

  const convertPrice = (priceVnd: number) => {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceVnd);
    } else {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(priceVnd / EXCHANGE_RATE);
    }
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, 
      currency, setCurrency, 
      user, login, logout, users, setUsers,
      tours, setTours,
      locations, setLocations,
      courses, setCourses,
      discounts, setDiscounts,
      reviews, addReview,
      bookings, addBooking, updateBookingStatus,
      convertPrice, t 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

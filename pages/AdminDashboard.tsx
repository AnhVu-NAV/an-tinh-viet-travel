import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { Tour, Booking, Location, Discount, User, Course } from '../types';
import { 
  LayoutDashboard, Map, Calendar, Users, Star, Plus, Trash2, Edit, 
  CheckCircle, XCircle, Tag, Search, BookOpen, X, AlertTriangle, 
  DollarSign, Briefcase, Filter
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up border border-white/50">
        <div className="px-8 py-5 border-b border-sand-200 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
          <h3 className="text-xl font-serif font-bold text-earth-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-sand-100 rounded-full text-stone-400 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const { user, tours, locations, bookings, users, discounts, courses, setTours, setLocations, updateBookingStatus, convertPrice, setDiscounts, setUsers, setCourses } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tours' | 'locations' | 'bookings' | 'discounts' | 'users' | 'courses'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; type: 'TOUR' | 'LOCATION' | 'DISCOUNT' | 'BOOKING' | 'COURSE'; id: string }>({ isOpen: false, type: 'TOUR', id: '' });
  
  const [tourModal, setTourModal] = useState<{ isOpen: boolean; mode: 'ADD' | 'EDIT'; data: Partial<Tour> }>({ isOpen: false, mode: 'ADD', data: {} });
  const [locationModal, setLocationModal] = useState<{ isOpen: boolean; mode: 'ADD' | 'EDIT'; data: Partial<Location> }>({ isOpen: false, mode: 'ADD', data: {} });
  const [discountModal, setDiscountModal] = useState<{ isOpen: boolean; mode: 'ADD' | 'EDIT'; data: Partial<Discount> }>({ isOpen: false, mode: 'ADD', data: {} });
  const [courseModal, setCourseModal] = useState<{ isOpen: boolean; mode: 'ADD' | 'EDIT'; data: Partial<Course> }>({ isOpen: false, mode: 'ADD', data: {} });

  // Access Control
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SALE')) {
    return <Navigate to="/login" />;
  }
  const isSuperAdmin = user.role === 'ADMIN';

  // --- DELETE HANDLERS ---
  const openDeleteModal = (type: 'TOUR' | 'LOCATION' | 'DISCOUNT' | 'BOOKING' | 'COURSE', id: string) => {
    setDeleteModal({ isOpen: true, type, id });
  };

  const confirmDelete = () => {
    const { type, id } = deleteModal;
    if (type === 'TOUR') setTours(prev => prev.filter(t => t.id !== id));
    if (type === 'LOCATION') setLocations(prev => prev.filter(l => l.id !== id));
    if (type === 'DISCOUNT') setDiscounts(prev => prev.filter(d => d.code !== id));
    if (type === 'BOOKING') updateBookingStatus(id, 'CANCELLED');
    if (type === 'COURSE') setCourses(prev => prev.filter(c => c.id !== id));
    
    setDeleteModal({ ...deleteModal, isOpen: false });
  };

  const processImageUrl = (url: string) => {
    // Convert Google Drive shareable links to direct viewable links
    // Matches /d/FILE_ID pattern
    const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
        // Using lh3.googleusercontent.com is often more reliable for embedding images than drive.google.com/uc
        return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
    }
    return url;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleLocationForTour = (locationId: string) => {
      const currentLocations = tourModal.data.locations || [];
      if (currentLocations.includes(locationId)) {
          setTourModal({
              ...tourModal,
              data: { ...tourModal.data, locations: currentLocations.filter(id => id !== locationId) }
          });
      } else {
          setTourModal({
              ...tourModal,
              data: { ...tourModal.data, locations: [...currentLocations, locationId] }
          });
      }
  };

  // --- SAVE HANDLERS ---
  const handleSaveTour = (e: React.FormEvent) => {
    e.preventDefault();
    const data = tourModal.data;
    if (tourModal.mode === 'ADD') {
        const newTour: Tour = {
            id: 't' + Date.now(),
            title: data.title || { en: 'New Tour', vi: 'Tour Mới' },
            description: data.description || { en: 'Description...', vi: 'Mô tả...' },
            price_vnd: Number(data.price_vnd) || 0,
            duration_days: Number(data.duration_days) || 1,
            level: data.level || 'light',
            suitable_for: data.suitable_for || { en: 'Everyone', vi: 'Mọi người' },
            locations: data.locations || [],
            images: data.images || ['https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2000'],
            schedule: []
        };
        setTours(prev => [...prev, newTour]);
    } else {
        setTours(prev => prev.map(t => t.id === data.id ? { ...t, ...data } as Tour : t));
    }
    setTourModal({ ...tourModal, isOpen: false });
  };

  const handleSaveLocation = (e: React.FormEvent) => {
      e.preventDefault();
      const data = locationModal.data;
      if (locationModal.mode === 'ADD') {
          const newLoc: Location = {
              id: 'l' + Date.now(),
              name: data.name || { en: 'New Location', vi: 'Địa điểm mới' },
              type: data.type || 'Landmark',
              region: data.region || 'Vietnam',
              tags: data.tags || [],
              image: data.image || 'https://images.unsplash.com/photo-1599709222625-24017f8b5443?q=80&w=2000'
          };
          setLocations(prev => [...prev, newLoc]);
      } else {
          setLocations(prev => prev.map(l => l.id === data.id ? { ...l, ...data } as Location : l));
      }
      setLocationModal({ ...locationModal, isOpen: false });
  };

  const handleSaveDiscount = (e: React.FormEvent) => {
      e.preventDefault();
      const data = discountModal.data;
      if (discountModal.mode === 'ADD') {
          const newDiscount: Discount = {
              code: (data.code || 'NEWCODE').toUpperCase(),
              percent: Number(data.percent) || 10,
              valid_until: data.valid_until || '2025-12-31',
              usage_limit: Number(data.usage_limit) || 100,
              used_count: 0
          };
          setDiscounts(prev => [...prev, newDiscount]);
      } else {
          setDiscounts(prev => prev.map(d => d.code === data.code ? { ...d, ...data } as Discount : d));
      }
      setDiscountModal({ ...discountModal, isOpen: false });
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const data = courseModal.data;
    if (courseModal.mode === 'ADD') {
        const newCourse: Course = {
            id: 'c' + Date.now(),
            title: data.title || { en: 'New Course', vi: 'Khóa học mới' },
            description: data.description || { en: 'Desc...', vi: 'Mô tả...' },
            price_vnd: Number(data.price_vnd) || 0,
            duration: data.duration || '1 Day',
            group_link: data.group_link || '#',
            image: data.image || 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?q=80&w=2000'
        };
        setCourses(prev => [...prev, newCourse]);
    } else {
        setCourses(prev => prev.map(c => c.id === data.id ? { ...c, ...data } as Course : c));
    }
    setCourseModal({ ...courseModal, isOpen: false });
  };

  const handleToggleUserActive = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  // Filter Data
  const filteredTours = tours.filter(t => t.title.en.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredLocations = locations.filter(l => l.name.en.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredBookings = bookings.filter(b => b.id.includes(searchTerm) || b.status.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredDiscounts = discounts.filter(d => d.code.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCourses = courses.filter(c => c.title.en.toLowerCase().includes(searchTerm.toLowerCase()));

  const SidebarItem = ({ id, icon: Icon, label }: any) => (
    <button
      onClick={() => { setActiveTab(id); setSearchTerm(''); }}
      className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors mb-1 ${activeTab === id ? 'bg-primary/10 text-primary' : 'text-stone-600 hover:bg-sand-100'}`}
    >
      <Icon className="w-5 h-5 mr-3" /> {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-sand-50 flex font-sans text-earth-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl fixed h-full z-10 hidden md:flex flex-col border-r border-sand-200">
        <div className="p-8">
          <h2 className="text-2xl font-serif font-bold text-primary tracking-tight">Admin CMS</h2>
          <p className="text-xs text-stone-400 mt-1 uppercase tracking-wider font-semibold">An Tinh Viet Manager</p>
        </div>
        <nav className="flex-1 px-4 overflow-y-auto space-y-1">
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem id="bookings" icon={Calendar} label="Bookings" />
          
          <div className="pt-6 mt-2 mb-2 px-4 text-xs uppercase text-stone-400 font-bold tracking-wider">Content</div>
          <SidebarItem id="tours" icon={Map} label="Tours" />
          <SidebarItem id="locations" icon={Star} label="Locations" />
          <SidebarItem id="courses" icon={BookOpen} label="Courses" />

          {isSuperAdmin && (
            <>
              <div className="pt-6 mt-2 mb-2 px-4 text-xs uppercase text-stone-400 font-bold tracking-wider">System</div>
              <SidebarItem id="discounts" icon={Tag} label="Discounts" />
              <SidebarItem id="users" icon={Users} label="Users & Roles" />
            </>
          )}
        </nav>
        <div className="p-4 border-t border-sand-200 bg-sand-50/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white ${user.role === 'ADMIN' ? 'bg-primary' : 'bg-amber-500'}`}>
                {user.name.charAt(0)}
            </div>
            <div className="text-xs">
              <p className="font-bold text-earth-900 text-sm">{user.name}</p>
              <p className="text-stone-500 font-medium">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 p-8 md:p-12 overflow-x-hidden">
        
        {/* Header Actions (Search & Add) */}
        {activeTab !== 'dashboard' && (
             <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 animate-fade-in">
                 <div>
                     <h1 className="text-3xl font-serif font-bold text-earth-900 capitalize">{activeTab} Management</h1>
                     <p className="text-stone-500 text-sm mt-1">Manage your {activeTab} data efficiently.</p>
                 </div>
                 <div className="flex gap-3 w-full md:w-auto">
                     <div className="relative flex-1 md:w-64">
                         <Search className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                         <input 
                            type="text" 
                            placeholder="Search..." 
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-200 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none text-sm bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                         />
                     </div>
                     {isSuperAdmin && ['tours', 'locations', 'courses', 'discounts'].includes(activeTab) && (
                         <Button onClick={() => {
                             if(activeTab === 'tours') setTourModal({ isOpen: true, mode: 'ADD', data: {} });
                             if(activeTab === 'locations') setLocationModal({ isOpen: true, mode: 'ADD', data: {} });
                             if(activeTab === 'courses') setCourseModal({ isOpen: true, mode: 'ADD', data: {} });
                             if(activeTab === 'discounts') setDiscountModal({ isOpen: true, mode: 'ADD', data: {} });
                         }} className="flex items-center gap-2 whitespace-nowrap shadow-lg shadow-primary/20">
                             <Plus className="w-4 h-4" /> Add New
                         </Button>
                     )}
                 </div>
             </div>
        )}

        {/* DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
           <div className="space-y-8 animate-slide-up">
              <div className="flex justify-between items-center">
                  <h1 className="text-4xl font-serif font-bold text-earth-900">Dashboard</h1>
                  <div className="text-sm text-stone-500 bg-white px-4 py-2 rounded-full shadow-sm border border-sand-200">
                      Welcome back, <span className="font-bold text-primary">{user.name}</span>
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-sand-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary"><DollarSign className="w-6 h-6" /></div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <div className="text-stone-500 text-sm font-medium">Total Revenue</div>
                    <div className="text-3xl font-bold text-earth-900 mt-1">{convertPrice(bookings.reduce((acc, b) => acc + (b.status !== 'CANCELLED' ? b.totalPrice : 0), 0))}</div>
                 </div>
                 
                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-sand-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-100 rounded-2xl text-amber-600"><Calendar className="w-6 h-6" /></div>
                    </div>
                    <div className="text-stone-500 text-sm font-medium">Total Bookings</div>
                    <div className="text-3xl font-bold text-earth-900 mt-1">{bookings.length}</div>
                 </div>

                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-sand-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-100 rounded-2xl text-blue-600"><Map className="w-6 h-6" /></div>
                    </div>
                    <div className="text-stone-500 text-sm font-medium">Active Tours</div>
                    <div className="text-3xl font-bold text-earth-900 mt-1">{tours.length}</div>
                 </div>

                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-sand-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-100 rounded-2xl text-purple-600"><Users className="w-6 h-6" /></div>
                    </div>
                    <div className="text-stone-500 text-sm font-medium">Total Users</div>
                    <div className="text-3xl font-bold text-earth-900 mt-1">{users.length}</div>
                 </div>
              </div>

              {/* Recent Activity Section could go here */}
           </div>
        )}

        {/* TOURS TAB */}
        {activeTab === 'tours' && (
           <div className="bg-white rounded-3xl shadow-sm border border-sand-200 overflow-hidden animate-slide-up">
              <table className="w-full text-left">
                 <thead className="bg-sand-50 border-b border-sand-200">
                    <tr>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider">Tour Info</th>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider">Price</th>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider">Level</th>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider">Duration</th>
                       {isSuperAdmin && <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">Actions</th>}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-sand-100">
                    {filteredTours.map(tour => (
                       <tr key={tour.id} className="hover:bg-sand-50/50 transition-colors">
                          <td className="p-5">
                              <div className="flex items-center gap-4">
                                  <img src={tour.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                                  <div>
                                      <p className="font-bold text-earth-900 text-sm">{tour.title.en}</p>
                                      <p className="text-xs text-stone-500 truncate max-w-[200px]">{tour.title.vi}</p>
                                  </div>
                              </div>
                          </td>
                          <td className="p-5 text-sm font-medium text-earth-900">{convertPrice(tour.price_vnd)}</td>
                          <td className="p-5"><span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wide">{tour.level}</span></td>
                          <td className="p-5 text-sm text-stone-500">{tour.duration_days} days</td>
                          {isSuperAdmin && (
                            <td className="p-5 flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setTourModal({ isOpen: true, mode: 'EDIT', data: tour })}><Edit className="w-4 h-4 text-stone-500" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => openDeleteModal('TOUR', tour.id)} className="hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-400" /></Button>
                            </td>
                          )}
                       </tr>
                    ))}
                 </tbody>
              </table>
              {filteredTours.length === 0 && <div className="p-10 text-center text-stone-400 italic">No tours found matching your search.</div>}
           </div>
        )}

        {/* LOCATIONS TAB */}
        {activeTab === 'locations' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
              {filteredLocations.map(loc => (
                 <div key={loc.id} className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-all border border-sand-200 flex flex-col group">
                    <div className="flex gap-4 mb-4">
                       <img src={loc.image} className="w-20 h-20 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                       <div>
                          <h3 className="font-bold text-earth-900">{loc.name.en}</h3>
                          <p className="text-xs text-stone-500 mb-2">{loc.region}</p>
                          <span className="text-[10px] bg-sand-100 px-2 py-1 rounded-full uppercase font-bold text-stone-600 tracking-wide">{loc.type}</span>
                       </div>
                    </div>
                    {isSuperAdmin && (
                        <div className="mt-auto pt-4 border-t border-sand-100 flex justify-end gap-2">
                           <Button variant="ghost" size="sm" onClick={() => setLocationModal({ isOpen: true, mode: 'EDIT', data: loc })} className="text-stone-500 hover:text-primary hover:bg-primary/5">Edit</Button>
                           <Button variant="ghost" size="sm" onClick={() => openDeleteModal('LOCATION', loc.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50">Delete</Button>
                        </div>
                    )}
                 </div>
              ))}
           </div>
        )}

        {/* COURSES TAB */}
        {activeTab === 'courses' && (
           <div className="bg-white rounded-3xl shadow-sm border border-sand-200 overflow-hidden animate-slide-up">
              <table className="w-full text-left">
                 <thead className="bg-sand-50 border-b border-sand-200">
                    <tr>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider">Course Name</th>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider">Price</th>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider">Duration</th>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider">Link</th>
                       {isSuperAdmin && <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">Actions</th>}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-sand-100">
                    {filteredCourses.map(course => (
                       <tr key={course.id} className="hover:bg-sand-50/50">
                          <td className="p-5 font-bold text-earth-900 text-sm">{course.title.en}</td>
                          <td className="p-5 text-sm text-stone-600">{convertPrice(course.price_vnd)}</td>
                          <td className="p-5 text-sm text-stone-500">{course.duration}</td>
                          <td className="p-5 text-xs text-blue-500 truncate max-w-[150px] underline cursor-pointer">{course.group_link}</td>
                          {isSuperAdmin && (
                              <td className="p-5 flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setCourseModal({ isOpen: true, mode: 'EDIT', data: course })}><Edit className="w-4 h-4 text-stone-500" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => openDeleteModal('COURSE', course.id)} className="hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-400" /></Button>
                              </td>
                          )}
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
           <div className="bg-white rounded-3xl shadow-sm border border-sand-200 overflow-hidden animate-slide-up">
              <table className="w-full text-left">
                 <thead className="bg-sand-50 border-b border-sand-200">
                    <tr>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider">ID</th>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider">Tour Info</th>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider">Customer</th>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider">Total</th>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider">Status</th>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-sand-100">
                    {filteredBookings.map(bk => (
                       <tr key={bk.id} className="hover:bg-sand-50/50">
                          <td className="p-5 text-xs font-mono text-stone-400">#{bk.id.split('-').pop()}</td>
                          <td className="p-5">
                              <p className="font-bold text-sm text-earth-900">{tours.find(t => t.id === bk.tourId)?.title.en || 'Unknown Tour'}</p>
                              <p className="text-xs text-stone-500">{bk.date}</p>
                          </td>
                          <td className="p-5 text-sm text-stone-600">{bk.guests} Guests</td>
                          <td className="p-5 font-bold text-primary">{convertPrice(bk.totalPrice)}</td>
                          <td className="p-5">
                             <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                bk.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-100' :
                                bk.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                bk.status === 'PAID' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                'bg-red-50 text-red-700 border-red-100'
                             }`}>
                                {bk.status}
                             </span>
                          </td>
                          <td className="p-5 flex justify-end gap-2">
                             {bk.status !== 'COMPLETED' && bk.status !== 'CANCELLED' && (
                                <>
                                   <Button variant="ghost" size="sm" onClick={() => updateBookingStatus(bk.id, 'COMPLETED')} className="text-green-600 hover:bg-green-50" title="Complete Booking"><CheckCircle className="w-5 h-5" /></Button>
                                   <Button variant="ghost" size="sm" onClick={() => openDeleteModal('BOOKING', bk.id)} className="text-red-400 hover:bg-red-50" title="Cancel Booking"><XCircle className="w-5 h-5" /></Button>
                                </>
                             )}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}

        {/* DISCOUNTS TAB */}
        {activeTab === 'discounts' && isSuperAdmin && (
           <div className="bg-white rounded-3xl shadow-sm border border-sand-200 overflow-hidden animate-slide-up">
              <table className="w-full text-left">
                 <thead className="bg-sand-50 border-b border-sand-200">
                    <tr>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider">Code</th>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider">Value</th>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider">Usage</th>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider">Valid Until</th>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-sand-100">
                    {filteredDiscounts.map(d => (
                       <tr key={d.code} className="hover:bg-sand-50/50">
                          <td className="p-5 font-mono font-bold text-primary text-lg tracking-wider">{d.code}</td>
                          <td className="p-5 font-bold text-earth-900">{d.percent}% OFF</td>
                          <td className="p-5 text-sm">
                              <div className="w-32 bg-sand-200 rounded-full h-1.5 mb-2 overflow-hidden">
                                  <div className="bg-primary h-full rounded-full" style={{ width: `${(d.used_count/d.usage_limit)*100}%` }}></div>
                              </div>
                              <span className="text-stone-500 text-xs">{d.used_count} / {d.usage_limit} used</span>
                          </td>
                          <td className="p-5 text-sm text-stone-500">{d.valid_until}</td>
                          <td className="p-5 flex justify-end gap-2">
                             <Button variant="ghost" size="sm" onClick={() => setDiscountModal({ isOpen: true, mode: 'EDIT', data: d })}><Edit className="w-4 h-4 text-stone-500" /></Button>
                             <Button variant="ghost" size="sm" onClick={() => openDeleteModal('DISCOUNT', d.code)} className="hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-400" /></Button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && isSuperAdmin && (
           <div className="bg-white rounded-3xl shadow-sm border border-sand-200 overflow-hidden animate-slide-up">
              <table className="w-full text-left">
                 <thead className="bg-sand-50 border-b border-sand-200">
                    <tr>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider">User</th>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider">Role</th>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider">Status</th>
                       <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-sand-100">
                    {filteredUsers.map(u => (
                       <tr key={u.id} className="hover:bg-sand-50/50">
                          <td className="p-5">
                              <div className="font-bold text-earth-900">{u.name}</div>
                              <div className="text-xs text-stone-500">{u.email}</div>
                          </td>
                          <td className="p-5"><span className="px-2 py-1 bg-sand-100 border border-sand-200 rounded text-xs font-bold text-stone-600">{u.role}</span></td>
                          <td className="p-5">
                              <span className={`text-xs px-2 py-1 rounded-full font-bold ${u.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                  {u.active ? 'Active' : 'Locked'}
                              </span>
                          </td>
                          <td className="p-5 flex justify-end gap-2">
                             <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 onClick={() => handleToggleUserActive(u.id)} 
                                 className={u.active ? "text-red-500 hover:bg-red-50" : "text-green-500 hover:bg-green-50"}
                             >
                                 {u.active ? "Lock User" : "Unlock User"}
                             </Button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} title="Confirm Action">
        <div className="text-center py-6">
           <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 animate-pulse">
              <AlertTriangle className="w-10 h-10" />
           </div>
           <p className="text-xl font-bold text-earth-900 mb-2">Are you sure?</p>
           <p className="text-stone-500 mb-8 max-w-sm mx-auto leading-relaxed">
               {deleteModal.type === 'BOOKING' ? 'Do you really want to cancel this booking? This might affect the customer.' : 'Do you really want to delete this item? This process cannot be undone.'}
           </p>
           <div className="flex gap-4 justify-center">
              <Button variant="outline" className="border-stone-200 text-stone-600" onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-200" onClick={confirmDelete}>
                  {deleteModal.type === 'BOOKING' ? 'Confirm Cancel' : 'Yes, Delete'}
              </Button>
           </div>
        </div>
      </Modal>

      {/* Tour Modal */}
      <Modal isOpen={tourModal.isOpen} onClose={() => setTourModal({ ...tourModal, isOpen: false })} title={tourModal.mode === 'ADD' ? 'Add New Tour' : 'Edit Tour Details'}>
         <form onSubmit={handleSaveTour} className="space-y-6">
             <div className="grid grid-cols-2 gap-6">
                 <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Title (English)</label>
                    <input required type="text" className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50" 
                      value={tourModal.data.title?.en || ''} onChange={e => setTourModal({...tourModal, data: {...tourModal.data, title: {...tourModal.data.title!, en: e.target.value}}})} />
                 </div>
                 <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Title (Vietnamese)</label>
                    <input required type="text" className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50" 
                      value={tourModal.data.title?.vi || ''} onChange={e => setTourModal({...tourModal, data: {...tourModal.data, title: {...tourModal.data.title!, vi: e.target.value}}})} />
                 </div>
             </div>
             
             <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Price (VND)</label>
                    <input required type="number" className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50" 
                      value={tourModal.data.price_vnd || ''} onChange={e => setTourModal({...tourModal, data: {...tourModal.data, price_vnd: parseInt(e.target.value)}})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Duration (Days)</label>
                    <input required type="number" className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50" 
                      value={tourModal.data.duration_days || ''} onChange={e => setTourModal({...tourModal, data: {...tourModal.data, duration_days: parseInt(e.target.value)}})} />
                </div>
             </div>
             
             <div>
                 <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Intensity Level</label>
                 <div className="grid grid-cols-3 gap-4">
                     {['light', 'moderate', 'deep'].map(level => (
                         <div key={level} 
                            onClick={() => setTourModal({...tourModal, data: {...tourModal.data, level: level as any}})}
                            className={`cursor-pointer p-3 rounded-xl border text-center text-sm font-bold capitalize transition-all ${tourModal.data.level === level ? 'border-primary bg-primary/10 text-primary' : 'border-sand-200 text-stone-500 hover:border-primary/50'}`}
                         >
                             {level}
                         </div>
                     ))}
                 </div>
             </div>

             <div className="pt-6 border-t border-sand-100">
                 <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Tour Images</label>
                 <div className="flex items-center gap-4 mb-4">
                     {tourModal.data.images && tourModal.data.images.length > 0 && (
                         <div className="flex gap-2 overflow-x-auto">
                             {tourModal.data.images.map((img, idx) => (
                                 <div key={idx} className="relative group w-20 h-20 flex-shrink-0">
                                     <img src={img} className="w-full h-full object-cover rounded-lg border border-sand-200" />
                                     <button type="button" onClick={() => {
                                         const newImages = tourModal.data.images!.filter((_, i) => i !== idx);
                                         setTourModal({...tourModal, data: {...tourModal.data, images: newImages}});
                                     }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                                 </div>
                             ))}
                         </div>
                     )}
                     <label className="cursor-pointer bg-sand-100 hover:bg-sand-200 text-stone-500 rounded-lg w-20 h-20 flex flex-col items-center justify-center border border-dashed border-stone-300 transition-colors">
                         <Plus className="w-6 h-6 mb-1" />
                         <span className="text-[10px] font-bold uppercase">Upload</span>
                         <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => {
                             const currentImages = tourModal.data.images || [];
                             setTourModal({...tourModal, data: {...tourModal.data, images: [...currentImages, url]}});
                         })} />
                     </label>
                 </div>
                 <div className="flex gap-2">
                    <input type="text" className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50 text-sm" 
                      placeholder="Paste image URL (Google Drive supported)..."
                      onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                              e.preventDefault();
                              const url = (e.target as HTMLInputElement).value;
                              if (url) {
                                  const processedUrl = processImageUrl(url);
                                  const currentImages = tourModal.data.images || [];
                                  setTourModal({...tourModal, data: {...tourModal.data, images: [...currentImages, processedUrl]}});
                                  (e.target as HTMLInputElement).value = '';
                              }
                          }
                      }}
                    />
                 </div>
             </div>

             <div className="pt-6 border-t border-sand-100">
                 <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Select Locations</label>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 border border-sand-200 rounded-xl bg-sand-50">
                     {locations.map(loc => (
                         <div key={loc.id} 
                             onClick={() => toggleLocationForTour(loc.id)}
                             className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-all ${tourModal.data.locations?.includes(loc.id) ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-white'}`}
                         >
                             <div className={`w-5 h-5 rounded border flex items-center justify-center ${tourModal.data.locations?.includes(loc.id) ? 'bg-primary border-primary text-white' : 'border-stone-300 bg-white'}`}>
                                 {tourModal.data.locations?.includes(loc.id) && <CheckCircle className="w-3 h-3" />}
                             </div>
                             <div>
                                 <p className="text-sm font-bold text-earth-900">{loc.name.en}</p>
                                 <p className="text-xs text-stone-500">{loc.region}</p>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>

             <div className="pt-6 flex justify-end gap-3 border-t border-sand-100">
                 <Button type="button" variant="ghost" onClick={() => setTourModal({ ...tourModal, isOpen: false })}>Cancel</Button>
                 <Button type="submit" className="px-8">Save Changes</Button>
             </div>
         </form>
      </Modal>

      {/* Location Modal */}
      <Modal isOpen={locationModal.isOpen} onClose={() => setLocationModal({ ...locationModal, isOpen: false })} title={locationModal.mode === 'ADD' ? 'Add New Location' : 'Edit Location'}>
         <form onSubmit={handleSaveLocation} className="space-y-6">
             <div className="grid grid-cols-2 gap-6">
                 <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Name (English)</label>
                    <input required type="text" className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50" 
                      value={locationModal.data.name?.en || ''} onChange={e => setLocationModal({...locationModal, data: {...locationModal.data, name: {...locationModal.data.name!, en: e.target.value}}})} />
                 </div>
                 <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Name (Vietnamese)</label>
                    <input required type="text" className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50" 
                      value={locationModal.data.name?.vi || ''} onChange={e => setLocationModal({...locationModal, data: {...locationModal.data, name: {...locationModal.data.name!, vi: e.target.value}}})} />
                 </div>
             </div>
             
             <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Region</label>
                   <input required type="text" className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50" 
                     value={locationModal.data.region || ''} onChange={e => setLocationModal({...locationModal, data: {...locationModal.data, region: e.target.value}})} />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Type</label>
                   <input type="text" className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50" 
                     value={locationModal.data.type || ''} onChange={e => setLocationModal({...locationModal, data: {...locationModal.data, type: e.target.value}})} />
                </div>
             </div>

             <div>
                 <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Location Image</label>
                 <div className="flex items-center gap-4">
                     {locationModal.data.image && (
                         <div className="w-24 h-24 rounded-lg overflow-hidden border border-sand-200 shrink-0 relative group">
                             <img src={locationModal.data.image} className="w-full h-full object-cover" />
                             <button type="button" onClick={() => setLocationModal({...locationModal, data: {...locationModal.data, image: ''}})} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                         </div>
                     )}
                     <div className="flex-1 space-y-2">
                         <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-sand-100 hover:bg-sand-200 text-stone-600 rounded-lg text-sm font-bold transition-colors">
                             <Plus className="w-4 h-4" /> Upload Image
                             <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setLocationModal({...locationModal, data: {...locationModal.data, image: url}}))} />
                         </label>
                         <p className="text-xs text-stone-400 text-center w-8 inline-block">OR</p>
                         <input type="text" className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50 text-sm" 
                           placeholder="Paste image URL (Google Drive supported)..."
                           value={locationModal.data.image || ''}
                           onChange={(e) => setLocationModal({...locationModal, data: {...locationModal.data, image: processImageUrl(e.target.value)}})}
                         />
                     </div>
                 </div>
             </div>

             <div className="pt-6 flex justify-end gap-3 border-t border-sand-100">
                 <Button type="button" variant="ghost" onClick={() => setLocationModal({ ...locationModal, isOpen: false })}>Cancel</Button>
                 <Button type="submit" className="px-8">Save Location</Button>
             </div>
         </form>
      </Modal>

      {/* Discount Modal */}
      <Modal isOpen={discountModal.isOpen} onClose={() => setDiscountModal({ ...discountModal, isOpen: false })} title={discountModal.mode === 'ADD' ? 'Create Discount Code' : 'Edit Discount'}>
         <form onSubmit={handleSaveDiscount} className="space-y-6">
             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Coupon Code</label>
                <input required type="text" className="w-full p-4 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none uppercase font-mono text-lg tracking-widest bg-sand-50" 
                  value={discountModal.data.code || ''} onChange={e => setDiscountModal({...discountModal, data: {...discountModal.data, code: e.target.value}})} disabled={discountModal.mode === 'EDIT'} placeholder="EXAMPLE10" />
             </div>
             
             <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Percentage (%)</label>
                    <input required type="number" max="100" className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50" 
                      value={discountModal.data.percent || ''} onChange={e => setDiscountModal({...discountModal, data: {...discountModal.data, percent: parseInt(e.target.value)}})} />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Usage Limit</label>
                    <input required type="number" className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50" 
                      value={discountModal.data.usage_limit || ''} onChange={e => setDiscountModal({...discountModal, data: {...discountModal.data, usage_limit: parseInt(e.target.value)}})} />
                 </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Valid Until</label>
                <input required type="date" className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50" 
                  value={discountModal.data.valid_until || ''} onChange={e => setDiscountModal({...discountModal, data: {...discountModal.data, valid_until: e.target.value}})} />
             </div>

             <div className="pt-6 flex justify-end gap-3 border-t border-sand-100">
                 <Button type="button" variant="ghost" onClick={() => setDiscountModal({ ...discountModal, isOpen: false })}>Cancel</Button>
                 <Button type="submit" className="px-8">Save Discount</Button>
             </div>
         </form>
      </Modal>

      {/* Course Modal */}
      <Modal isOpen={courseModal.isOpen} onClose={() => setCourseModal({ ...courseModal, isOpen: false })} title={courseModal.mode === 'ADD' ? 'Add New Course' : 'Edit Course'}>
         <form onSubmit={handleSaveCourse} className="space-y-6">
             <div className="grid grid-cols-2 gap-6">
                 <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Title (English)</label>
                    <input required type="text" className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50" 
                      value={courseModal.data.title?.en || ''} onChange={e => setCourseModal({...courseModal, data: {...courseModal.data, title: {...courseModal.data.title!, en: e.target.value}}})} />
                 </div>
                 <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Title (Vietnamese)</label>
                    <input required type="text" className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50" 
                      value={courseModal.data.title?.vi || ''} onChange={e => setCourseModal({...courseModal, data: {...courseModal.data, title: {...courseModal.data.title!, vi: e.target.value}}})} />
                 </div>
             </div>
             
             <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Price (VND)</label>
                    <input required type="number" className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50" 
                      value={courseModal.data.price_vnd || ''} onChange={e => setCourseModal({...courseModal, data: {...courseModal.data, price_vnd: parseInt(e.target.value)}})} />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Duration</label>
                    <input required type="text" className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50" 
                      value={courseModal.data.duration || ''} onChange={e => setCourseModal({...courseModal, data: {...courseModal.data, duration: e.target.value}})} placeholder="e.g. 1 Day" />
                 </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Group Link (Zalo/Telegram)</label>
                <input type="text" className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50" 
                  value={courseModal.data.group_link || ''} onChange={e => setCourseModal({...courseModal, data: {...courseModal.data, group_link: e.target.value}})} placeholder="https://..." />
             </div>

             <div>
                 <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Course Image</label>
                 <div className="flex items-center gap-4">
                     {courseModal.data.image && (
                         <div className="w-24 h-24 rounded-lg overflow-hidden border border-sand-200 shrink-0 relative group">
                             <img src={courseModal.data.image} className="w-full h-full object-cover" />
                             <button type="button" onClick={() => setCourseModal({...courseModal, data: {...courseModal.data, image: ''}})} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                         </div>
                     )}
                     <div className="flex-1 space-y-2">
                         <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-sand-100 hover:bg-sand-200 text-stone-600 rounded-lg text-sm font-bold transition-colors">
                             <Plus className="w-4 h-4" /> Upload Image
                             <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setCourseModal({...courseModal, data: {...courseModal.data, image: url}}))} />
                         </label>
                         <p className="text-xs text-stone-400 text-center w-8 inline-block">OR</p>
                         <input type="text" className="w-full p-3 border border-sand-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-sand-50 text-sm" 
                           placeholder="Paste image URL (Google Drive supported)..."
                           value={courseModal.data.image || ''}
                           onChange={(e) => setCourseModal({...courseModal, data: {...courseModal.data, image: processImageUrl(e.target.value)}})}
                         />
                     </div>
                 </div>
             </div>

             <div className="pt-6 flex justify-end gap-3 border-t border-sand-100">
                 <Button type="button" variant="ghost" onClick={() => setCourseModal({ ...courseModal, isOpen: false })}>Cancel</Button>
                 <Button type="submit" className="px-8">Save Course</Button>
             </div>
         </form>
      </Modal>

    </div>
  );
};
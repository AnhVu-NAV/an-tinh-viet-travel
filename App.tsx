
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Chatbot } from './components/Chatbot';
import { Home } from './pages/Home';
import { Tours } from './pages/Tours';
import { TourDetail } from './pages/TourDetail';
import { BookingPage } from './pages/Booking';
import { Locations } from './pages/Locations';
import { LocationDetail } from './pages/LocationDetail';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { Courses } from './pages/Courses';
import { CourseDetail } from './pages/CourseDetail';
import { About } from './pages/About';
import { Profile } from './pages/Profile';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="flex flex-col min-h-screen font-sans text-earth-900 bg-sand-50 selection:bg-primary-light selection:text-white">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tours" element={<Tours />} />
              <Route path="/tours/:id" element={<TourDetail />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/locations/:id" element={<LocationDetail />} />
              <Route path="/booking/:id" element={<BookingPage />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          <Footer />
          <Chatbot />
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;

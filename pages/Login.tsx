import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { Flower } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, language } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (email.includes('admin')) {
      login(email, 'ADMIN');
      navigate('/admin');
    } else {
      login(email, 'USER');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl">
        <div className="text-center">
          <Flower className="mx-auto h-12 w-12 text-primary animate-pulse" />
          <h2 className="mt-6 text-3xl font-serif font-bold text-earth-900">
            {language === 'vi' ? 'Chào mừng trở lại' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            An Tinh Viet - Spiritual Travel
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="text-sm font-medium text-earth-900 ml-1">Email address</label>
              <input
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-sand-200 placeholder-stone-400 text-earth-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm mt-1 bg-sand-50"
                placeholder="user@example.com or admin@antinh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-earth-900 ml-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-sand-200 placeholder-stone-400 text-earth-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm mt-1 bg-sand-50"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <div>
            <Button type="submit" className="w-full justify-center py-3">
              {language === 'vi' ? 'Đăng nhập' : 'Sign in'}
            </Button>
          </div>
          
          <div className="text-center text-xs text-stone-400">
             <p>Hint: Use <b>admin@antinh.com</b> for Admin Role</p>
             <p>Use any other email for User Role</p>
          </div>
        </form>
      </div>
    </div>
  );
};
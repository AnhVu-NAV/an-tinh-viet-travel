import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-teal-900 text-teal-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-serif font-bold text-white mb-4">An Tinh Viet</h2>
            <p className="max-w-xs text-sm opacity-80">
              Healing & Experience Tourism. Reconnecting Body, Mind, and Spirit through Vietnam's heritage.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-amber-400">Tours</a></li>
              <li><a href="#" className="hover:text-amber-400">Meditation Courses</a></li>
              <li><a href="#" className="hover:text-amber-400">About Us</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Hanoi, Vietnam</li>
              <li>hello@antinhviet.com</li>
              <li>+84 999 888 777</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-teal-800 mt-12 pt-8 text-center text-xs opacity-60">
          © 2024 An Tinh Viet. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

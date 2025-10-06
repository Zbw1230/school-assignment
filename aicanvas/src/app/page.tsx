'use client';

import { useState, useEffect } from 'react';
import CanvasComponent from '@/components/Canvas';

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top menu bar for mobile */}
      {isMobile && (
        <header className="bg-gray-100 p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">aicanvas</h1>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-blue-500 text-white rounded"
          >
            {mobileMenuOpen ? 'Close' : 'Menu'}
          </button>
        </header>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for PC (hidden on mobile) */}
        {!isMobile && (
          <aside className="w-64 bg-gray-100 p-4 flex flex-col">
            <h1 className="text-xl font-bold mb-6">aicanvas</h1>
            <nav className="flex-1">
              <ul className="space-y-2">
                <li><button className="w-full text-left p-2 hover:bg-gray-200 rounded">Draw</button></li>
                <li><button className="w-full text-left p-2 hover:bg-gray-200 rounded">Shapes</button></li>
                <li><button className="w-full text-left p-2 hover:bg-gray-200 rounded">Colors</button></li>
                <li><button className="w-full text-left p-2 hover:bg-gray-200 rounded">Export</button></li>
              </ul>
            </nav>
            <div className="mt-auto">
              <button className="w-full p-2 bg-blue-500 text-white rounded">Clear Canvas</button>
            </div>
          </aside>
        )}

        {/* Mobile menu overlay */}
        {isMobile && mobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
            <div className="bg-white w-64 h-full p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Menu</h2>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 bg-gray-200 rounded"
                >
                  Close
                </button>
              </div>
              <ul className="space-y-2">
                <li><button className="w-full text-left p-2 hover:bg-gray-200 rounded">Draw</button></li>
                <li><button className="w-full text-left p-2 hover:bg-gray-200 rounded">Shapes</button></li>
                <li><button className="w-full text-left p-2 hover:bg-gray-200 rounded">Colors</button></li>
                <li><button className="w-full text-left p-2 hover:bg-gray-200 rounded">Export</button></li>
                <li><button className="w-full text-left p-2 hover:bg-gray-200 rounded mt-4">Clear Canvas</button></li>
              </ul>
            </div>
          </div>
        )}

        {/* Main canvas area */}
        <main className={`flex-1 ${isMobile ? 'pt-2' : ''}`}>
          <CanvasComponent />
        </main>
      </div>
    </div>
  );
}
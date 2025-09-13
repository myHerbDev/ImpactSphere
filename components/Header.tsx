
import React from 'react';
import type { NavItem } from '../types';
import { LeafIcon } from './Icons';

interface HeaderProps {
  navItems: NavItem[];
  activeView: string;
  setActiveView: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ navItems, activeView, setActiveView }) => {
  return (
    <header className="bg-surface/80 backdrop-blur-lg sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <LeafIcon />
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">ImpactSphere</h1>
          </div>
          <nav className="hidden md:flex space-x-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveView(item.name)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeView === item.name
                    ? 'text-primary'
                    : 'text-text-secondary hover:bg-background hover:text-text-primary'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>
       {/* Mobile Navigation */}
      <nav className="md:hidden flex justify-around p-1 bg-surface border-t border-border">
        {navItems.map((item) => (
            <button
            key={item.name}
            onClick={() => setActiveView(item.name)}
            aria-label={item.name}
            className={`flex flex-col items-center justify-center w-full py-2 rounded-md text-xs font-medium transition-colors duration-200 ${
                activeView === item.name
                ? 'text-primary'
                : 'text-text-secondary hover:bg-background'
            }`}
            >
            {item.icon}
            <span className="mt-1.5">{item.name}</span>
            </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;
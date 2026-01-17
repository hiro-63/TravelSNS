import React from 'react';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4 lg:px-6 shadow-sm">
            <div className="flex items-center">
                <Link to="/" className="text-xl font-bold text-theme-primary tracking-wide">
                    TravelApp
                </Link>
            </div>

            <button
                onClick={onMenuClick}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-theme-primary"
            >
                <Menu className="w-6 h-6" />
            </button>
        </header>
    );
};

export default Header;

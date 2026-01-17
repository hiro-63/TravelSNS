import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, User, LogOut, Send, Search, Bell, Mail, PlusCircle, X, Menu, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NavigationDrawer = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
        onClose();
    };

    const handleNavigation = (path) => {
        navigate(path);
        onClose();
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <aside
                className={`fixed top-0 right-0 h-full w-64 bg-theme-primary text-white z-50 transform transition-transform duration-300 shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <span className="text-xl font-bold tracking-wide">Menu</span>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <div className="space-y-1 px-2">
                        <button
                            onClick={() => handleNavigation('/')}
                            className="w-full flex items-center px-4 py-3 rounded-md transition-colors hover:bg-white/10 text-left"
                        >
                            <Home className="w-5 h-5 mr-3" />
                            <span>ホーム</span>
                        </button>

                        <button
                            onClick={() => handleNavigation('/explore')}
                            className="w-full flex items-center px-4 py-3 rounded-md transition-colors hover:bg-white/10 text-left"
                        >
                            <Search className="w-5 h-5 mr-3" />
                            <span>話題を検索</span>
                        </button>

                        <button
                            onClick={() => handleNavigation('/search')}
                            className="w-full flex items-center px-4 py-3 rounded-md transition-colors hover:bg-white/10 text-left"
                        >
                            <MapPin className="w-5 h-5 mr-3" />
                            <span>周辺スポット</span>
                        </button>

                        <button className="w-full flex items-center px-4 py-3 rounded-md transition-colors hover:bg-white/10 text-left">
                            <Bell className="w-5 h-5 mr-3" />
                            <span>通知</span>
                        </button>

                        <button className="w-full flex items-center px-4 py-3 rounded-md transition-colors hover:bg-white/10 text-left">
                            <Mail className="w-5 h-5 mr-3" />
                            <span>メッセージ</span>
                        </button>
                    </div>

                    <div className="border-t border-white/10 my-4 pt-4 px-2">
                        {user && (
                            <button
                                onClick={() => handleNavigation(`/profile/${user.username}`)}
                                className="w-full flex items-center px-4 py-3 rounded-md transition-colors hover:bg-white/10 text-left"
                            >
                                <User className="w-5 h-5 mr-3" />
                                <span>プロフィール</span>
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-3 rounded-md transition-colors hover:bg-white/10 text-left text-red-300 hover:text-red-200"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            <span>ログアウト</span>
                        </button>
                    </div>

                    <div className="px-4 mt-6">
                        <button className="w-full bg-theme-secondary hover:bg-opacity-90 text-theme-primary font-bold py-3 px-4 rounded-md shadow-md transition-colors">
                            投稿する
                        </button>
                    </div>
                </nav>
            </aside>
        </>
    );
};

export default NavigationDrawer;

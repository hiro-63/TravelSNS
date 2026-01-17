import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, User, LogOut, Send, Search, Bell, Mail, PlusCircle, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="hidden sm:flex flex-col w-20 lg:w-72 px-4 py-8 h-screen sticky top-0 overflow-y-auto">
            <div className="flex items-center justify-center lg:justify-start px-4 mb-10">
                <div className="w-10 h-10 bg-miri-teal rounded-xl flex items-center justify-center shadow-soft">
                    <Send className="w-6 h-6 text-white" />
                </div>
                <span className="hidden lg:block text-2xl font-bold ml-3 text-miri-text tracking-wide">TravelApp</span>
            </div>

            <nav className="flex-1 space-y-2">
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `flex items-center justify-center lg:justify-start px-4 py-3 rounded-full transition-all duration-300 ${isActive
                            ? 'text-japan-primary font-bold bg-white shadow-sm ring-1 ring-japan-secondary'
                            : 'text-japan-text hover:bg-japan-secondary/20 hover:text-japan-primary'
                        }`
                    }
                >
                    <Home className="w-7 h-7" />
                    <span className="hidden lg:block ml-4 text-lg">ホーム</span>
                </NavLink>

                {/* Explore/Search */}
                <NavLink
                    to="/explore"
                    className={({ isActive }) =>
                        `flex items-center justify-center lg:justify-start px-4 py-3 rounded-full transition-all duration-300 ${isActive
                            ? 'text-japan-primary font-bold bg-white shadow-sm ring-1 ring-japan-secondary'
                            : 'text-japan-text hover:bg-japan-secondary/20 hover:text-japan-primary'
                        }`
                    }
                >
                    <Search className="w-7 h-7" />
                    <span className="hidden lg:block ml-4 text-lg">話題を検索</span>
                </NavLink>

                <NavLink
                    to="/search"
                    className={({ isActive }) =>
                        `flex items-center justify-center lg:justify-start px-4 py-3 rounded-full transition-all duration-300 ${isActive
                            ? 'text-japan-primary font-bold bg-white shadow-sm ring-1 ring-japan-secondary'
                            : 'text-japan-text hover:bg-japan-secondary/20 hover:text-japan-primary'
                        }`
                    }
                >
                    <MapPin className="w-7 h-7" />
                    <span className="hidden lg:block ml-4 text-lg">周辺スポット</span>
                </NavLink>

                <div className="flex items-center justify-center lg:justify-start px-4 py-3 rounded-full text-japan-text hover:bg-japan-secondary/20 hover:text-japan-primary cursor-pointer transition-all duration-300">
                    <Bell className="w-7 h-7" />
                    <span className="hidden lg:block ml-4 text-lg">通知</span>
                </div>

                <div className="flex items-center justify-center lg:justify-start px-4 py-3 rounded-full text-japan-text hover:bg-japan-secondary/20 hover:text-japan-primary cursor-pointer transition-all duration-300">
                    <Mail className="w-7 h-7" />
                    <span className="hidden lg:block ml-4 text-lg">メッセージ</span>
                </div>

                <div onClick={logout} className="flex items-center justify-center lg:justify-start px-4 py-3 rounded-full text-japan-text hover:bg-japan-secondary/20 hover:text-japan-primary cursor-pointer transition-all duration-300">
                    <LogOut className="w-7 h-7" />
                    <span className="hidden lg:block ml-4 text-lg">ログアウト</span>
                </div>

                <button className="hidden lg:block w-full bg-japan-primary hover:bg-japan-accent text-white font-bold py-3 px-4 rounded-full shadow-md transition-colors mt-4">
                    投稿する
                </button>
                <button className="lg:hidden w-12 h-12 bg-japan-primary hover:bg-japan-accent text-white rounded-full flex items-center justify-center shadow-md mt-4 transition-colors">
                    <PlusCircle className="w-6 h-6" />
                </button>
            </nav>

            {user && (
                <NavLink to={`/profile/${user.username}`} className="flex items-center justify-center lg:justify-start px-4 py-4 mt-auto rounded-full hover:bg-japan-secondary/20 transition-colors">
                    <div className="w-10 h-10 border-2 border-japan-secondary rounded-full flex items-center justify-center overflow-hidden bg-white">
                        <User className="w-6 h-6 text-japan-dim" />
                    </div>
                    <div className="hidden lg:block ml-3 overflow-hidden">
                        <p className="font-bold text-sm text-japan-text truncate">{user.username}</p>
                        <p className="text-japan-dim text-xs truncate">@{user.username}</p>
                    </div>
                </NavLink>
            )}
        </aside>
    );
};

export default Sidebar;

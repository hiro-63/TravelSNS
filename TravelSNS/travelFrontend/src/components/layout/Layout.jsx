import React, { useState, useEffect } from 'react';
import Header from './Header';
import NavigationDrawer from './NavigationDrawer';
import { Outlet, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import RecommendedUsers from '../recommendation/RecommendedUsers';
import RecommendedDestinations from '../recommendation/RecommendedDestinations';

const Layout = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [recommendations, setRecommendations] = useState({ users: [], locations: [] });
    const location = useLocation();

    // Check if current page is Profile page to adjust layout
    const isProfilePage = location.pathname.startsWith('/profile/');

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                // Only fetch if not on profile page (since we hide sidebar there)
                // actually, fetch anyway for simplicity or caching
                const [usersRes, locsRes] = await Promise.all([
                    api.get('/recommendations/users'),
                    api.get('/recommendations/locations')
                ]);
                setRecommendations({
                    users: usersRes.data,
                    locations: locsRes.data
                });
            } catch (error) {
                console.error("Error fetching recommendations:", error);
            }
        };

        if (!isProfilePage) {
            fetchRecommendations();
        }
    }, [isProfilePage]);

    return (
        <div className="min-h-screen bg-theme-bg pt-16 relative isolate">
            {/* Background Image with Washi-like Texture */}
            <div className="fixed inset-0 z-[-1]">
                {/* Texture Layer (very faint) */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-multiply"
                    style={{ backgroundImage: "url('/login_bg.png')" }}
                />

                {/* Soft White Overlay (washi-like) */}
                <div className="absolute inset-0 bg-white/97 backdrop-blur-[1px]" />
            </div>


            <Header onMenuClick={() => setIsDrawerOpen(true)} />

            <NavigationDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />

            <div className="flex justify-center">
                <div className={`flex w-full ${isProfilePage ? 'max-w-full' : 'max-w-6xl'}`}>
                    {/* Main Content */}
                    <main className={`flex-1 w-full ${isProfilePage ? 'max-w-full' : 'max-w-2xl mx-auto p-4'}`}>
                        <Outlet />
                    </main>

                    {/* Recommendations Sidebar: Hide on Profile Page as requested */}
                    {!isProfilePage && (
                        <div className="hidden lg:block w-96 pl-8 pt-4 sticky top-20 h-fit">
                            <div className="space-y-6">
                                {/* Recommended Users in Sidebar */}
                                <div className="bg-white rounded-xl shadow-sm border border-theme-border overflow-hidden">
                                    <RecommendedUsers users={recommendations.users} />
                                </div>

                                {/* Recommended Destinations in Sidebar */}
                                <div className="bg-white rounded-xl shadow-sm border border-theme-border overflow-hidden">
                                    <RecommendedDestinations locations={recommendations.locations} />
                                </div>

                                {/* Information Block (kept smaller or moved) - User asked to replace but maybe keep as footer?
                                    User said: "recommendations here please" and pointed to Info block. 
                                    I will Replace it as requested. I'll add a small footer for system info if needed, or omit.
                                    The prompt says "Recommendations display specification (Information replacement)". So replacing is correct.
                                */}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Layout;

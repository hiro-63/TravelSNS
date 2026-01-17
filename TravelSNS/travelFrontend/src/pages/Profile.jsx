import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Post from '../components/post/Post';
import { Camera, Edit3, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { username } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [mimics, setMimics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts');

    const isOwnProfile = currentUser && currentUser.username === username;

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const profileRes = await api.get(`/profiles/${username}`);
                setProfile(profileRes.data);
                const postsRes = await api.get(`/profiles/${username}/posts`);
                setPosts(postsRes.data);
            } catch (error) {
                console.error("Failed to fetch profile data", error);
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchProfileData();
        }
    }, [username]);

    // Fetch Mimics when tab changes to 'saved'
    useEffect(() => {
        const fetchMimics = async () => {
            if (activeTab === 'saved' && isOwnProfile) {
                try {
                    const res = await api.get('/users/me/mimics');
                    setMimics(res.data);
                } catch (error) {
                    console.error("Failed to fetch saved trips", error);
                }
            }
        };
        fetchMimics();
    }, [activeTab, isOwnProfile]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-theme-primary"></div>
            </div>
        );
    }

    if (!profile) {
        return <div className="p-10 text-center text-theme-text-light">ユーザーが見つかりません。</div>;
    }

    return (
        <div className="pb-20 w-full">
            {/* Banner Section - Full Width */}
            <div className="relative bg-white shadow-sm mb-4">
                {/* Banner Image */}
                <div className="h-64 md:h-80 lg:h-96 w-full relative bg-theme-surface overflow-hidden">
                    {profile.bannerUrl ? (
                        <img src={profile.bannerUrl} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-theme-primary to-blue-900 flex items-center justify-center">
                            <span className="text-white/20 text-6xl font-serif">Journey</span>
                        </div>
                    )}

                    {/* Add Cover Button (Owner only) */}
                    {isOwnProfile && (
                        <button className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-theme-text px-3 py-1.5 rounded-md text-sm font-semibold shadow-sm flex items-center transition-colors">
                            <Camera className="w-4 h-4 mr-2" />
                            編集
                        </button>
                    )}
                </div>

                {/* Profile Header Content */}
                <div className="max-w-6xl mx-auto px-4 md:px-8 pb-4">
                    <div className="flex flex-col md:flex-row items-center md:items-end -mt-20 md:-mt-12 md:ml-4 relative z-10">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-[6px] border-white bg-white overflow-hidden shadow-lg">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-theme-surface flex items-center justify-center text-6xl font-bold text-theme-text-light">
                                        {profile.username[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            {isOwnProfile && (
                                <button className="absolute bottom-4 right-4 bg-theme-surface hover:bg-gray-200 p-2 rounded-full border border-white shadow-sm transition-colors">
                                    <Camera className="w-5 h-5 text-theme-text" />
                                </button>
                            )}
                        </div>

                        {/* Name & Actions */}
                        <div className="flex-1 mt-4 md:mt-0 md:ml-8 text-center md:text-left w-full md:w-auto pb-4">
                            <h1 className="text-4xl font-bold text-theme-text mb-2">{profile.username}</h1>
                            <p className="text-theme-text-light font-medium text-xl mb-4">@{profile.displayName}</p>

                            <div className="flex justify-center md:justify-start space-x-6 mb-6 md:mb-0 text-theme-text text-base">
                                <span className="hover:underline cursor-pointer">
                                    <strong className="text-theme-primary text-xl">120</strong> フォロー
                                </span>
                                <span className="hover:underline cursor-pointer">
                                    <strong className="text-theme-primary text-xl">45</strong> フォロワー
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 mt-4 md:mb-6">
                            {isOwnProfile ? (
                                <>
                                    <button className="px-5 py-2.5 bg-theme-primary hover:bg-theme-primary/90 text-white rounded-md font-semibold text-base shadow-sm transition-colors flex items-center">
                                        <span className="mr-2">+</span> ストーリー
                                    </button>
                                    <button className="px-5 py-2.5 bg-theme-surface hover:bg-gray-200 text-theme-text rounded-md font-semibold text-base shadow-sm transition-colors flex items-center">
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        編集
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="px-8 py-2.5 bg-theme-primary hover:bg-theme-primary/90 text-white rounded-md font-semibold text-base shadow-sm transition-colors">
                                        フォロー
                                    </button>
                                    <button className="px-5 py-2.5 bg-theme-surface hover:bg-gray-200 text-theme-text rounded-md font-semibold text-base shadow-sm transition-colors">
                                        メッセージ
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-theme-border mt-8 mb-1"></div>

                    {/* Navigation Tabs - Soft UI */}
                    <nav className="flex space-x-4 justify-center md:justify-start">
                        {['posts', 'photos', 'videos', 'likes'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-4 rounded-md font-bold text-base transition-all relative ${activeTab === tab
                                    ? 'text-theme-primary'
                                    : 'text-theme-text-light hover:bg-theme-surface'
                                    }`}
                            >
                                {tab === 'posts' && '投稿'}
                                {tab === 'photos' && '写真'}
                                {tab === 'videos' && '動画'}
                                {tab === 'likes' && 'いいね'}

                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-theme-primary rounded-t-md"></div>
                                )}
                            </button>
                        ))}
                        {isOwnProfile && (
                            <button
                                onClick={() => setActiveTab('saved')}
                                className={`px-6 py-4 rounded-md font-bold text-base transition-all relative ${activeTab === 'saved'
                                    ? 'text-theme-primary'
                                    : 'text-theme-text-light hover:bg-theme-surface'
                                    }`}
                            >
                                保存した旅
                                {activeTab === 'saved' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-theme-primary rounded-t-md"></div>
                                )}
                            </button>
                        )}
                    </nav>
                </div>
            </div>

            {/* Main Content Area - Single Column, Centered, Wide */}
            <div className="max-w-4xl mx-auto px-4 mt-8">
                {/* Posts Section */}
                <div className="">
                    {activeTab === 'posts' && (
                        <div className="space-y-6">
                            {/* Create Post (if own profile) */}
                            {isOwnProfile && (
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-theme-border flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-theme-surface flex-shrink-0 overflow-hidden">
                                        {profile.avatarUrl ? (
                                            <img src={profile.avatarUrl} alt="Me" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-xl text-theme-text-light">
                                                {profile.username[0]}
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="その気持ち、シェアしよう"
                                        className="flex-1 bg-theme-surface/50 hover:bg-theme-surface transition-colors rounded-full px-6 py-3 text-base focus:outline-none cursor-pointer"
                                    />
                                </div>
                            )}

                            {/* Posts List */}
                            {posts.length === 0 ? (
                                <div className="bg-white p-12 rounded-lg shadow-sm border border-theme-border text-center">
                                    <h3 className="font-bold text-theme-text text-xl mb-2">投稿がありません</h3>
                                    <p className="text-theme-text-light text-base">まだアクティビティがありません。</p>
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <div key={post.id} className="bg-white rounded-lg shadow-sm border border-theme-border overflow-hidden">
                                        <Post post={post} />
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'saved' && isOwnProfile && (
                        <div className="space-y-6">
                            {mimics.length === 0 ? (
                                <div className="bg-white p-12 rounded-lg shadow-sm border border-theme-border text-center">
                                    <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <h3 className="font-bold text-theme-text text-xl mb-2">保存した旅はありません</h3>
                                    <p className="text-theme-text-light text-base">「真似したい」と思った旅を保存しましょう。</p>
                                </div>
                            ) : (
                                mimics.map((mimic) => (
                                    <div key={mimic.id} className="bg-white rounded-lg shadow-sm border border-theme-border overflow-hidden relative">
                                        <div className="absolute top-2 right-2 bg-blue-100 text-blue-600 px-2 py-1 text-xs rounded-full z-10 font-bold border border-blue-200">
                                            保存済み
                                        </div>
                                        {mimic.post ? <Post post={mimic.post} /> : <div className="p-4">Post deleted</div>}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;

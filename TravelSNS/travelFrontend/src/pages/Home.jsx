import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import CreatePost from '../components/post/CreatePost';
import Post from '../components/post/Post';

const Home = () => {
    const [activeTab, setActiveTab] = useState('recommend'); // 'recommend' | 'following'

    // Store posts and pagination state for each tab
    const [feedState, setFeedState] = useState({
        recommend: { posts: [], page: 1, hasMore: true, scrollY: 0 },
        following: { posts: [], page: 1, hasMore: true, scrollY: 0 }
    });

    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const selectedLocation = location.state?.selectedLocation;

    // Use a ref to prevent duplicate fetch calls during loading
    const loadingRef = useRef(false);

    const fetchPosts = useCallback(async (type, pageNum, append = false) => {
        if (loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);

        try {
            const params = {
                page: pageNum,
                limit: 10,
                type: type === 'recommend' ? 'foryou' : 'following'
            };

            const response = await api.get('/posts', { params });
            const newPosts = response.data;

            setFeedState(prev => {
                const currentPosts = prev[type].posts;
                return {
                    ...prev,
                    [type]: {
                        ...prev[type],
                        posts: append ? [...currentPosts, ...newPosts] : newPosts,
                        page: pageNum,
                        hasMore: newPosts.length === 10 // Assuming limit is 10
                    }
                };
            });
        } catch (error) {
            console.error(`Error fetching ${type} posts:`, error);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, []);

    // Initial fetch or tab switch
    useEffect(() => {
        const currentFeed = feedState[activeTab];
        if (currentFeed.posts.length === 0 && currentFeed.hasMore) {
            fetchPosts(activeTab, 1, false);
        }
    }, [activeTab, fetchPosts]);
    // feedState dependency removed to avoid loops, explicit checks inside effect

    const handlePostCreated = () => {
        // Refresh current tab
        fetchPosts(activeTab, 1, false);
    };

    // Infinite Scroll Handler
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop
                >= document.documentElement.offsetHeight - 100
            ) {
                const currentFeed = feedState[activeTab];
                if (!loadingRef.current && currentFeed.hasMore) {
                    fetchPosts(activeTab, currentFeed.page + 1, true);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [activeTab, feedState, fetchPosts]);

    return (
        <div className="min-h-screen pb-20">
            {/* Header with Tabs */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 shadow-sm">
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('recommend')}
                        className={`flex-1 py-4 text-center font-bold text-base transition-colors relative ${activeTab === 'recommend' ? 'text-theme-primary' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        おすすめ
                        {activeTab === 'recommend' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-theme-primary rounded-t-full mx-12"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`flex-1 py-4 text-center font-bold text-base transition-colors relative ${activeTab === 'following' ? 'text-theme-primary' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        フォロー中
                        {activeTab === 'following' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-theme-primary rounded-t-full mx-12"></div>
                        )}
                    </button>
                </div>
            </div>

            <div className="mt-4">
                {/* Show CreatePost only on Recommend tab? Or both? Usually Top. */}
                <CreatePost onPostCreated={handlePostCreated} initialLocation={selectedLocation} />
            </div>

            <div className="space-y-6 mt-6 container mx-auto px-4 max-w-xl">
                {/* Fallback Display if no posts */}
                {feedState[activeTab].posts.length === 0 && !loading && (
                    <div className="p-10 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                        {activeTab === 'following' ? (
                            <>
                                <p className="font-bold text-lg mb-1">まだフォローしていません</p>
                                <p className="text-sm">気になるユーザーをフォローして、<br />旅の最新情報を受け取りましょう！</p>
                            </>
                        ) : (
                            <>
                                <p className="font-bold text-lg mb-1">投稿はまだありません</p>
                                <p className="text-sm">最初の旅の思い出をシェアしましょう！</p>
                            </>
                        )}
                    </div>
                )}

                {/* Post Feed */}
                {feedState[activeTab].posts.map((post) => (
                    <Post key={post.id} post={post} />
                ))}

                {loading && (
                    <div className="p-4 text-center text-gray-400">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-theme-primary mx-auto"></div>
                    </div>
                )}

                {!feedState[activeTab].hasMore && feedState[activeTab].posts.length > 0 && (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        これ以上投稿はありません
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;

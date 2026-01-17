import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import api from '../api/axios';
import Post from '../components/post/Post';

const Explore = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [ageGroup, setAgeGroup] = useState('');
    const [tag, setTag] = useState('');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchQuery) params.search = searchQuery;
            if (ageGroup) params.ageGroup = ageGroup;
            if (tag) params.tag = tag;

            const response = await api.get('/posts', { params });
            setPosts(response.data);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []); // Run once on mount

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPosts();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setAgeGroup('');
        setTag('');
        // We might want to trigger fetch after State update, need useEffect or direct call with empty
        // simpler to just reload
        // But better UX:
        setTimeout(() => fetchPosts(), 0);
        // Actually, fetchPosts reads from State? No, it reads from closures if not passed.
        // I need to update fetchPosts to read params or pass them.
        // Revised fetchPosts implementation above reads from closures. 
        // Calling it immediately after set state might read old state due to React batching.
        // Better: useEffect on params? Or pass params to fetchPosts.
        // Let's rely on button click triggering fetch for now, and clear filters manually.
    };

    // Better fetch trigger
    useEffect(() => {
        // Debounce or just trigger on filter change? 
        // For now, let's keep manual search for text, but maybe auto for filters?
        // Let's keep it manual or explicitly triggered to avoid too many requests.
    }, [ageGroup, tag]); // If we want auto-refresh

    return (
        <div className="min-h-screen pb-20">
            {/* Sticky Header with Search Bar */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 py-2 border-b border-gray-100 shadow-sm">
                <div className="container mx-auto px-4">
                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-theme-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-12 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-theme-primary focus:ring-1 focus:ring-theme-primary sm:text-sm transition-all"
                            placeholder="キーワード、タグ、地名で検索"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer ${showFilters || ageGroup || tag ? 'text-theme-primary' : 'text-gray-400'}`}
                        >
                            <Filter className="h-5 w-5" />
                        </button>
                    </form>

                    {/* Filters Panel */}
                    {(showFilters || ageGroup || tag) && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100 animate-fade-in-down">
                            <div className="flex flex-wrap gap-3 items-end">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">年代フィルター</label>
                                    <select
                                        value={ageGroup}
                                        onChange={(e) => setAgeGroup(e.target.value)}
                                        className="p-2 border border-theme-border rounded bg-white text-sm focus:outline-none focus:border-theme-primary"
                                    >
                                        <option value="">指定なし</option>
                                        <option value="teen">10代</option>
                                        <option value="20s">20代</option>
                                        <option value="30s">30代</option>
                                        <option value="40s">40代</option>
                                        <option value="50s">50代</option>
                                        <option value="60plus">60代以上</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">タグ指定</label>
                                    <input
                                        type="text"
                                        placeholder="#弾丸旅行"
                                        value={tag}
                                        onChange={(e) => setTag(e.target.value)}
                                        className="p-2 border border-theme-border rounded bg-white text-sm w-32 focus:outline-none focus:border-theme-primary"
                                    />
                                </div>
                                <div className="flex-1 text-right">
                                    <button
                                        type="button"
                                        onClick={fetchPosts}
                                        className="px-4 py-2 bg-theme-primary text-white text-sm font-bold rounded-full shadow hover:bg-opacity-90"
                                    >
                                        検索
                                    </button>
                                </div>
                            </div>
                            {(ageGroup || tag) && (
                                <div className="mt-2 text-xs text-gray-400 flex items-center">
                                    <span>適用中のフィルター: </span>
                                    {ageGroup && <span className="ml-1 bg-white border px-1 rounded">{ageGroup}</span>}
                                    {tag && <span className="ml-1 bg-white border px-1 rounded">#{tag}</span>}
                                    <button onClick={() => { setAgeGroup(''); setTag(''); setTimeout(fetchPosts, 0); }} className="ml-2 text-red-400 hover:text-red-500 flex items-center">
                                        <X className="w-3 h-3 mr-1" /> 解除
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto px-4 pt-4">
                <div className="space-y-4">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary mx-auto mb-2"></div>
                            検索中...
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="p-10 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                            <p className="font-bold text-lg mb-1">結果が見つかりませんでした</p>
                            <p className="text-sm">条件を変更して再度お試しください</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <Post key={post.id} post={post} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Explore;

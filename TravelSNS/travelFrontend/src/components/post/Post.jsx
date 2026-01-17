import React, { useState } from 'react';
import { User, MessageCircle, Heart, Share2, MapPin, MoreHorizontal, Plane, Repeat, Share, Bookmark, DollarSign, Tag as TagIcon, Trash, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import LeafletMap from '../map/LeafletMap';
import api from '../../api/axios';

const Post = ({ post }) => {
    const [isMimicked, setIsMimicked] = useState(false); // Should ideally come from backend "isMimicked" or mimics list
    const [likesCount, setLikesCount] = useState(post.likesCount || 0);
    const [mimicCount, setMimicCount] = useState(0); // If we had this count
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Menu toggle state

    // Accordion states
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [isTripDetailsOpen, setIsTripDetailsOpen] = useState(false);

    // Hacky way to get current user ID (should be passed or from context in real app)
    // Assuming localStorage has user data or we parse token.
    // For now, let's try to grab from localStorage if available, or assume parent handles visibility?
    // User requested "Only author can delete".
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isOwner = currentUser && post.user && currentUser.id === post.user.id;

    // Importing Chevron icons for accordion
    // Note: You need to make sure these are imported from 'lucide-react' at the top of the file.
    // Since I cannot see the imports in this block, I will assume I need to add them to the import list in a separate edit or verify they are there.
    // Looking at the file content from previous turn, ChevronDown and ChevronUp are NOT imported.
    // I will use replace_file_content for the whole file or multiple chunks to handle imports as well.
    // Actually, I can use multi_replace for this. But since I am replacing a large chunk of logic inside the component and imports, maybe replace_file_content on specific ranges is better or just one big replace if the file is small enough.
    // The file is 278 lines.

    // Let's stick to the plan. I will define the functions here, but wait, I need to add imports.
    // Since I cannot change imports in this specific tool call easily without targeting the top, I'll switch to multi_replace_file_content.

    // ...
    // Wait, the tool is replace_file_content. I'll just use multi_replace_file_content in the next thought block effectively.
    // I will cancel this tool call and use multi_replace_file_content.


    const handleDelete = async () => {
        if (!window.confirm("この投稿を削除してもよろしいですか？\n削除すると元に戻せません。")) return;

        try {
            await api.delete(`/posts/${post.id}`);
            // Force reload or callback to remove from list. 
            // Ideally parent passes onDeleteSuccess callback.
            window.location.reload();
        } catch (error) {
            console.error("Delete error:", error);
            alert("削除に失敗しました");
        }
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ja });
    };

    const handleMimic = async () => {
        try {
            if (isMimicked) {
                await api.delete(`/posts/${post.id}/mimic`);
                setIsMimicked(false);
            } else {
                await api.post(`/posts/${post.id}/mimic`);
                setIsMimicked(true);
            }
        } catch (error) {
            console.error("Mimic error:", error);
            alert("操作に失敗しました");
        }
    };

    const handleLike = async () => {
        try {
            // Basic like toggle logic (optimistic UI)
            // In real app, we should check if already liked
            setLikesCount(prev => prev + 1);
            await api.post(`/posts/${post.id}/like`);
        } catch (error) {
            console.error("Like error", error);
        }
    };

    return (
        <article className="p-5 border-b border-theme-border bg-white hover:bg-theme-surface/30 transition-colors cursor-pointer group">
            <div className="flex space-x-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-theme-primary/10 flex items-center justify-center text-theme-primary border border-theme-primary/20">
                        <User className="w-6 h-6" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2 truncate">
                            <span className="font-bold text-theme-primary text-base">{post.user?.username || 'Guest'}</span>
                            <span className="text-theme-text-light text-sm truncate">@{post.user?.displayName || 'guest'}</span>
                            {post.user?.profile?.ageGroup && (
                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                                    {post.user.profile.ageGroup}代
                                </span>
                            )}
                            <span className="text-theme-text-light text-xs">•</span>
                            <span className="text-theme-text-light text-sm">{formatDate(post.createdAt)}</span>
                        </div>
                        {/* Menu (Only for Owner) */}
                        <div className="relative">
                            <MoreHorizontal
                                className="w-5 h-5 text-theme-text-light hover:text-theme-primary transition-colors cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                            />
                            {isMenuOpen && isOwner && (
                                <div className="absolute right-0 top-6 bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden z-10 w-32">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); handleDelete(); }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                    >
                                        <Trash className="w-4 h-4 mr-2" />
                                        削除する
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="text-base text-theme-text whitespace-pre-wrap leading-relaxed mb-3">
                        {post.content}
                    </div>

                    {/* Images Grid */}
                    {post.images && post.images.length > 0 && (
                        <div className={`grid gap-1 mb-3 rounded-lg overflow-hidden border border-gray-100 ${post.images.length === 1 ? 'grid-cols-1' :
                            post.images.length === 2 ? 'grid-cols-2' :
                                'grid-cols-2' // 3 or 4 images
                            }`}>
                            {post.images.map((img, idx) => (
                                <div key={img.id} className="relative group">
                                    <img
                                        src={img.imageUrl.startsWith('http') ? img.imageUrl : `http://localhost:5000${img.imageUrl}`}
                                        alt={`Post ${idx + 1}`}
                                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${post.images.length === 1 ? 'max-h-96' : 'aspect-square'
                                            }`}
                                    />
                                    {img.description && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                            {img.description}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {post.tags.map(tag => (
                                <span key={tag.id} className="text-theme-primary text-sm hover:underline cursor-pointer">
                                    #{tag.name}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Map Visualization (Accordion) */}
                    {(post.routePoints?.length > 0 || (post.latitude && post.longitude)) && (
                        <div className="mt-2 border border-theme-border rounded-md overflow-hidden">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsMapOpen(!isMapOpen); }}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-700 font-medium"
                            >
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-theme-primary" />
                                    <span>地図を表示 {post.locationName && `(${post.locationName})`}</span>
                                </div>
                                {isMapOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {isMapOpen && (
                                <div className="border-t border-theme-border z-0 relative">
                                    <LeafletMap
                                        lat={post.latitude}
                                        lon={post.longitude}
                                        routePoints={post.routePoints}
                                        height="250px"
                                        popupContent={post.locationName}
                                    />
                                    {post.locationName && (
                                        <div className="bg-gray-50 p-2 text-xs text-gray-600 border-t border-gray-100 flex items-center">
                                            <MapPin className="w-3 h-3 mr-1 text-primary-500" />
                                            {post.locationName}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Trip Details Card (Accordion) */}
                    {post.tripData && (
                        <div className="mt-3 border border-theme-border rounded-md overflow-hidden">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsTripDetailsOpen(!isTripDetailsOpen); }}
                                className="w-full flex items-center justify-between p-3 bg-theme-surface/30 hover:bg-theme-surface/50 transition-colors text-sm text-gray-700 font-medium"
                            >
                                <div className="flex items-center">
                                    <DollarSign className="w-4 h-4 mr-2 text-theme-primary" />
                                    <span>旅の記録（予算・詳細）</span>
                                </div>
                                {isTripDetailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {isTripDetailsOpen && (
                                <div className="p-3 bg-theme-surface/10 border-t border-theme-border text-sm">
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-600">

                                        {/* 総予算 */}
                                        {post.tripData.totalBudget > 0 && (
                                            <div className="flex justify-between">
                                                <span>総予算:</span>
                                                <span className="font-bold">
                                                    ¥{post.tripData.totalBudget.toLocaleString()}
                                                </span>
                                            </div>
                                        )}

                                        {/* 交通費 */}
                                        {post.tripData.budgetTransport > 0 && (
                                            <div className="flex justify-between">
                                                <span>交通費:</span>
                                                <span className="font-bold">
                                                    ¥{post.tripData.budgetTransport.toLocaleString()}
                                                </span>
                                            </div>
                                        )}

                                        {/* 宿泊費 */}
                                        {post.tripData.budgetAccommodation > 0 && (
                                            <div className="flex justify-between">
                                                <span>宿泊費:</span>
                                                <span className="font-bold">
                                                    ¥{post.tripData.budgetAccommodation.toLocaleString()}
                                                </span>
                                            </div>
                                        )}

                                        {/* 食費 */}
                                        {post.tripData.budgetFood > 0 && (
                                            <div className="flex justify-between">
                                                <span>食費:</span>
                                                <span className="font-bold">
                                                    ¥{post.tripData.budgetFood.toLocaleString()}
                                                </span>
                                            </div>
                                        )}

                                        {/* 宿泊先 */}
                                        {post.tripData.accommodationNames && (
                                            <div className="col-span-2">
                                                <span className="block text-xs text-gray-400">宿泊:</span>
                                                <span>
                                                    {Array.isArray(post.tripData.accommodationNames)
                                                        ? post.tripData.accommodationNames.join('、')
                                                        : JSON.parse(post.tripData.accommodationNames).join('、')}
                                                </span>
                                            </div>
                                        )}

                                        {/* 利用交通手段 */}
                                        {post.tripData.transportMethods && (
                                            <div className="col-span-2">
                                                <span className="block text-xs text-gray-400">利用交通手段:</span>
                                                <span>
                                                    {Array.isArray(post.tripData.transportMethods)
                                                        ? post.tripData.transportMethods.join('、')
                                                        : JSON.parse(post.tripData.transportMethods).join('、')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between mt-4 max-w-sm text-theme-text-light">
                        <div className="flex items-center hover:text-theme-primary transition-colors cursor-pointer group/btn">
                            <MessageCircle className="w-4 h-4 mr-2 group-hover/btn:bg-theme-primary/5 rounded-full p-1 box-content" />
                            <span className="text-xs">{post.comments?.length || 0}</span>
                        </div>
                        <div
                            className={`flex items-center transition-colors cursor-pointer group/btn ${isMimicked ? 'text-blue-600' : 'hover:text-blue-600'}`}
                            onClick={(e) => { e.stopPropagation(); handleMimic(); }}
                            title="この旅を真似する（保存）"
                        >
                            <Bookmark className={`w-4 h-4 mr-2 group-hover/btn:bg-blue-50 rounded-full p-1 box-content ${isMimicked ? 'fill-current' : ''}`} />
                            <span className="text-xs">真似したい</span>
                        </div>
                        <div
                            className="flex items-center hover:text-red-500 transition-colors cursor-pointer group/btn"
                            onClick={(e) => { e.stopPropagation(); handleLike(); }}
                        >
                            <Heart className={`w-4 h-4 mr-2 group-hover/btn:bg-red-50 rounded-full p-1 box-content ${likesCount > (post.likesCount || 0) ? 'fill-red-500 text-red-500' : ''}`} />
                            <span className="text-xs">{likesCount}</span>
                        </div>
                        <div className="flex items-center hover:text-theme-primary transition-colors cursor-pointer group/btn">
                            <Share className="w-4 h-4 mr-2 group-hover/btn:bg-theme-primary/5 rounded-full p-1 box-content" />
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default Post;

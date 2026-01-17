import React, { useState, useEffect } from 'react';
import { User, MapPin, X, DollarSign, Tag as TagIcon, Briefcase } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LeafletMap from '../map/LeafletMap';

const CreatePost = ({ onPostCreated, initialLocation }) => {
    const [images, setImages] = useState([]); // Array of { url: string, description: string, file: File(optional) }

    // Missing states implementation
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [routePoints, setRoutePoints] = useState([]);

    // Tag state
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    // Trip data state
    const [showTripDetails, setShowTripDetails] = useState(false);
    const [tripData, setTripData] = useState({
        totalBudget: '',
        budgetFood: '',
        budgetAccommodation: '',
        budgetTransport: '',
        accommodationNames: '',
        transportMethods: ''
    });

    // Location search state
    const [locationInput, setLocationInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestLoading, setIsSuggestLoading] = useState(false);

    // Initial location effect
    useEffect(() => {
        if (initialLocation) {
            setRoutePoints([{
                lat: initialLocation.lat,
                lon: initialLocation.lon,
                name: initialLocation.name || '指定の位置'
            }]);
            setShowMap(true);
        }
    }, [initialLocation]);

    // Handlers
    const handleTagInput = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
                setTagInput('');
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleLocationInput = async (e) => {
        const val = e.target.value;
        setLocationInput(val);
        if (val.length > 1) {
            setIsSuggestLoading(true);
            try {
                // Use fetch to avoid axios interceptors for external API
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}`);
                const data = await response.json();

                setSuggestions(data.map(item => ({
                    name: item.display_name.split(',')[0], // Use first part as name
                    lat: item.lat,
                    lon: item.lon,
                    address: item.display_name
                })));
            } catch (err) {
                console.error(err);
                setSuggestions([]);
            } finally {
                setIsSuggestLoading(false);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSelectSuggestion = (item) => {
        setRoutePoints(prev => [...prev, {
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            name: item.name
        }]);
        setLocationInput('');
        setSuggestions([]);
    };

    const handleMapClick = ({ lat, lon }) => {
        setRoutePoints(prev => [...prev, {
            lat: lat,
            lon: lon,
            name: `地点 ${prev.length + 1}`
        }]);
    };

    const removePoint = (index) => {
        setRoutePoints(prev => prev.filter((_, i) => i !== index));
    };

    // -----------------------------
    // Image Handling
    // -----------------------------
    const handleImageSelect = async (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (images.length + files.length > 4) {
                alert("画像は最大4枚までです");
                return;
            }

            setIsSending(true); // Show loading state during upload
            try {
                const newImages = await Promise.all(files.map(async (file) => {
                    const formData = new FormData();
                    formData.append('image', file);
                    const res = await api.post('/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    return {
                        url: res.data.imageUrl, // Server URL
                        description: '',
                    };
                }));
                setImages(prev => [...prev, ...newImages]);
            } catch (err) {
                console.error("Upload failed", err);
                alert("画像のアップロードに失敗しました");
            } finally {
                setIsSending(false);
            }
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const moveImage = (index, direction) => {
        const newImages = [...images];
        if (direction === 'left' && index > 0) {
            [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
        } else if (direction === 'right' && index < newImages.length - 1) {
            [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
        }
        setImages(newImages);
    };

    const handleImageDescriptionChange = (index, text) => {
        const newImages = [...images];
        newImages[index].description = text;
        setImages(newImages);
    };

    // -----------------------------
    // Submit Post
    // -----------------------------
    const handleSubmit = async () => {
        if (!content.trim() && images.length === 0) return;

        setIsSending(true);
        setError(null);

        try {
            const payload = {
                content,
                // Assign sortOrder based on current index
                images: images.map((img, idx) => ({
                    url: img.url,
                    description: img.description,
                    sortOrder: idx
                })),
                latitude: routePoints.length > 0 ? routePoints[0].lat : null,
                longitude: routePoints.length > 0 ? routePoints[0].lon : null,
                locationName: routePoints.length > 0 ? routePoints[0].name : null,
                routePoints,
                tags,
                tripData: showTripDetails ? {
                    totalBudget: parseInt(tripData.totalBudget) || 0,
                    budgetFood: parseInt(tripData.budgetFood) || 0,
                    budgetAccommodation: parseInt(tripData.budgetAccommodation) || 0,
                    budgetTransport: parseInt(tripData.budgetTransport) || 0,
                    accommodationNames: tripData.accommodationNames.split(',').map(s => s.trim()).filter(Boolean),
                    transportMethods: tripData.transportMethods.split(',').map(s => s.trim()).filter(Boolean)
                } : null
            };

            await api.post('/posts', payload);

            // Reset
            setContent('');
            setImages([]);
            setRoutePoints([]);
            setShowMap(false);
            setShowTripDetails(false);
            setTags([]);
            setTripData({
                totalBudget: '',
                budgetFood: '',
                budgetAccommodation: '',
                budgetTransport: '',
                accommodationNames: '',
                transportMethods: ''
            });

            if (onPostCreated) onPostCreated();
        } catch (error) {
            console.error("Failed to create post", error);
            setError("投稿に失敗しました: " + (error.response?.data?.message || error.message));
        } finally {
            setIsSending(false);
        }
    };

    // -----------------------------
    // UI
    // -----------------------------
    return (
        <div className="p-4 my-6 bg-white rounded-lg shadow-sm border border-theme-border">
            <div className="flex space-x-3">

                {/* User Avatar ... */}
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-theme-surface rounded-full flex items-center justify-center border border-theme-border">
                        <User className="w-6 h-6 text-theme-text-light" />
                    </div>
                </div>

                <div className="flex-1">
                    {/* 投稿内容を入力 */}
                    <textarea
                        className="w-full h-24 border border-theme-border rounded-md p-3 bg-theme-surface/30"
                        placeholder="旅の思い出をシェアしよう..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>

                    {/* Image Preview Area */}
                    {images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-2 mb-2">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative group border rounded-md p-1 bg-gray-50">
                                    <div className="relative aspect-video bg-gray-200 overflow-hidden rounded">
                                        {/* Backend URL needs to be full path or proxy handles relative? 
                                            Assuming api.defaults.baseURL is set, but image url from backend is /uploads/filename.
                                            If frontend is 3000 and backend 5000, we need full URL or proxy.
                                            Let's pre-pend backend URL if it starts with /.
                                        */}
                                        <img
                                            src={img.url.startsWith('http') ? img.url : `http://localhost:5000${img.url}`}
                                            alt="upload preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>

                                        {/* Sort Buttons */}
                                        <div className="absolute bottom-1 left-1 flex space-x-1">
                                            {idx > 0 && (
                                                <button onClick={() => moveImage(idx, 'left')} className="bg-black/50 text-white p-1 rounded hover:bg-theme-primary">
                                                    &lt;
                                                </button>
                                            )}
                                            {idx < images.length - 1 && (
                                                <button onClick={() => moveImage(idx, 'right')} className="bg-black/50 text-white p-1 rounded hover:bg-theme-primary">
                                                    &gt;
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="説明を追加..."
                                        value={img.description}
                                        onChange={(e) => handleImageDescriptionChange(idx, e.target.value)}
                                        className="w-full mt-1 text-xs border-b border-gray-200 focus:border-theme-primary outline-none py-1 bg-transparent"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 機能ボタン */}
                    <div className="flex items-center space-x-2 mt-2 border-b border-gray-100 pb-2 mb-2">
                        {/* Image Upload Button */}
                        <label className={`flex items-center space-x-1 px-2 py-1 rounded text-sm cursor-pointer ${images.length >= 4 ? 'opacity-50 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageSelect}
                                disabled={images.length >= 4}
                            />
                            <MapPin className="w-4 h-4 hidden" /> {/* Dummy icon replacement */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                            <span>写真</span>
                        </label>

                        <button
                            onClick={() => setShowMap(!showMap)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${showMap ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <MapPin className="w-4 h-4" />
                            <span>地図</span>
                        </button>

                        <button
                            onClick={() => setShowTripDetails(!showTripDetails)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${showTripDetails ? 'bg-green-50 text-green-600' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <DollarSign className="w-4 h-4" />
                            <span>予算</span>
                        </button>

                        {/* タグ入力 */}
                        <div className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-500">
                            <TagIcon className="w-4 h-4" />
                            <input
                                type="text"
                                placeholder="タグ"
                                className="bg-transparent outline-none w-20"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagInput}
                            />
                        </div>
                    </div>

                    {/* タグ一覧 */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {tags.map((tag) => (
                                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center">
                                    #{tag}
                                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* 地図・サジェスト */}
                    {showMap && (
                        <div className="mt-3">
                            {/* 住所入力 */}
                            <input
                                type="text"
                                value={locationInput}
                                onChange={handleLocationInput}
                                placeholder="場所を入力（例: 東京駅）"
                                className="w-full border p-2 rounded text-sm"
                            />

                            {/* サジェスト */}
                            {locationInput && suggestions.length > 0 && (
                                <div className="border rounded bg-white shadow mt-1 max-h-40 overflow-y-auto">
                                    {suggestions.map((item, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleSelectSuggestion(item)}
                                            className="p-2 text-sm hover:bg-gray-100 cursor-pointer border-b last:border-b-0 border-gray-50 bg-white"
                                        >
                                            <div className="font-bold text-gray-800">{item.name}</div>
                                            {item.address && (
                                                <div className="text-xs text-gray-500 mt-0.5 truncate">
                                                    {item.address}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {isSuggestLoading && (
                                <p className="text-xs text-gray-400 mt-1">検索中...</p>
                            )}

                            {/* 地図 */}
                            <div className="mt-3 bg-gray-50 p-2 rounded-md">
                                <LeafletMap
                                    routePoints={routePoints}
                                    height="200px"
                                    onMapClick={handleMapClick}
                                />

                                {/* ルート一覧 */}
                                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                                    {routePoints.map((p, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs bg-white p-1 rounded border">
                                            <span className="truncate flex-1">
                                                <span className="font-bold mr-1">{idx + 1}.</span>
                                                {p.name}
                                            </span>
                                            <button onClick={() => removePoint(idx)} className="text-red-400 hover:text-red-600 p-1">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {routePoints.length === 0 && (
                                        <p className="text-xs text-center text-gray-400">
                                            場所を入力するか、地図をクリックして追加
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 旅の詳細 */}
                    {showTripDetails && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md border text-sm">
                            <h4 className="font-bold text-gray-700 mb-2 flex items-center">
                                <Briefcase className="w-4 h-4 mr-1" /> 旅の詳細記録
                            </h4>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">総予算 (円)</label>
                                    <input
                                        type="number"
                                        className="w-full p-1 border rounded"
                                        value={tripData.totalBudget || ""}
                                        onChange={(e) =>
                                            setTripData({ ...tripData, totalBudget: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">交通費</label>
                                    <input
                                        type="number"
                                        className="w-full p-1 border rounded"
                                        value={tripData.budgetTransport || ""}
                                        onChange={(e) =>
                                            setTripData({ ...tripData, budgetTransport: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">宿泊費</label>
                                    <input
                                        type="number"
                                        className="w-full p-1 border rounded"
                                        value={tripData.budgetAccommodation || ""}
                                        onChange={(e) =>
                                            setTripData({ ...tripData, budgetAccommodation: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">食費</label>
                                    <input
                                        type="number"
                                        className="w-full p-1 border rounded"
                                        value={tripData.budgetFood || ""}
                                        onChange={(e) =>
                                            setTripData({ ...tripData, budgetFood: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                        宿泊先 (カンマ区切り)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-1 border rounded"
                                        value={tripData.accommodationNames || ""}
                                        onChange={(e) =>
                                            setTripData({
                                                ...tripData,
                                                accommodationNames: e.target.value
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                        利用交通手段 (カンマ区切り)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-1 border rounded"
                                        value={tripData.transportMethods || ""}
                                        onChange={(e) =>
                                            setTripData({
                                                ...tripData,
                                                transportMethods: e.target.value
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    )}


                    {/* エラー */}
                    {error && (
                        <div className="mt-2 p-2 text-sm text-red-600 bg-red-50 rounded border">
                            {error}
                        </div>
                    )}

                    {/* 投稿ボタン */}
                    <div className="flex justify-end mt-3">
                        <button
                            onClick={handleSubmit}
                            disabled={(!content.trim() && images.length === 0) || isSending}
                            className={`px-5 py-2 rounded-full font-bold text-sm text-white shadow-sm ${(!content.trim() && images.length === 0) || isSending
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-theme-primary hover:bg-opacity-90 active:scale-95'
                                }`}
                        >
                            {isSending ? '送信中' : '投稿'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;

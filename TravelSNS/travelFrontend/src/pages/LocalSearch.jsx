import React, { useState, useEffect } from 'react';
import { searchLocal, searchAddress } from '../api/searchApi';
import { Search, MapPin, Navigation, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LocalSearch = () => {
    const [query, setQuery] = useState('');
    const [addressQuery, setAddressQuery] = useState(''); // New: Address input
    const [location, setLocation] = useState(null);
    const [locationName, setLocationName] = useState('現在地'); // Display name for location
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchMode, setSearchMode] = useState('current'); // current, address

    // Default to Tokyo
    const [defaultLat, defaultLon] = [35.6895, 139.6917];
    const navigate = useNavigate();

    const handleCreatePost = (item) => {
        const coords = item.Geometry.Coordinates.split(',');
        const locationData = {
            name: item.Name,
            lat: parseFloat(coords[1]),
            lon: parseFloat(coords[0])
        };
        // Navigate to Home (where post creation is) with state
        navigate('/', { state: { selectedLocation: locationData } });
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        setResults([]);

        try {
            let searchLocation = location;

            // 1. Resolve Location if needed
            if (searchMode === 'address') {
                if (!addressQuery) {
                    setError("場所の名称を入力してください");
                    setLoading(false);
                    return;
                }
                try {
                    const geoData = await searchAddress(addressQuery);
                    if (geoData.Feature && geoData.Feature.length > 0) {
                        const coords = geoData.Feature[0].Geometry.Coordinates.split(',');
                        searchLocation = {
                            longitude: parseFloat(coords[0]),
                            latitude: parseFloat(coords[1])
                        };
                        setLocation(searchLocation);
                        setLocationName(geoData.Feature[0].Name);
                    } else {
                        setError("指定された場所が見つかりませんでした");
                        setLoading(false);
                        return;
                    }
                } catch (geoError) {
                    setError("住所検索に失敗しました");
                    setLoading(false);
                    return;
                }
            } else if (searchMode === 'current') {
                if (!location) {
                    // Try to get location if not set
                    try {
                        const pos = await new Promise((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject);
                        });
                        searchLocation = pos.coords;
                        setLocation(searchLocation);
                        setLocationName("現在地");
                    } catch (locError) {
                        setError("現在地を取得できませんでした");
                        setLoading(false);
                        return;
                    }
                }
            }

            // 2. Search Local Spots
            const params = {
                query: query,
                results: 20,
                sort: 'dist'
            };

            if (searchLocation) {
                params.lat = searchLocation.latitude;
                params.lon = searchLocation.longitude;
                params.dist = 3; // 3km radius
            } else {
                // Fallback or error? Yahoo API requires lat/lon for dist/geo sort
                // We could search without lat/lon but then dist sort is invalid.
                // For this app, we enforce location context.
                setError("検索中心位置が定まっていません");
                setLoading(false);
                return;
            }

            const data = await searchLocal(params);

            if (data.Error) {
                setError(data.Error.Message);
            } else {
                setResults(data.Feature || []);
            }

        } catch (err) {
            setError("検索中にエラーが発生しました。");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError("このブラウザは位置情報をサポートしていません。");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation(position.coords);
                setSearchMode('current');
                setLocationName("現在地");
                setLoading(false);
            },
            (err) => {
                setError("位置情報の取得に失敗しました: " + err.message);
                setLoading(false);
            }
        );
    };

    return (
        <div className="flex flex-col h-full bg-primary-50 text-text-main font-sans">
            {/* Header Section */}
            <div className="p-4 bg-white shadow-sm sticky top-0 z-10">
                <h1 className="text-xl font-bold mb-4 text-primary-700">周辺スポット検索</h1>

                {/* Search Mode Switching */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-3 w-fit">
                    <button
                        onClick={() => setSearchMode('current')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${searchMode === 'current' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Navigation className="inline w-4 h-4 mr-1" /> 現在地周辺
                    </button>
                    <button
                        onClick={() => setSearchMode('address')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${searchMode === 'address' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <MapPin className="inline w-4 h-4 mr-1" /> 特定の場所周辺
                    </button>
                </div>

                <div className="flex flex-col gap-3">

                    {/* Address Input (Only in Address Mode) */}
                    {searchMode === 'address' && (
                        <div className="flex gap-2 animate-fadeIn">
                            <input
                                type="text"
                                value={addressQuery}
                                onChange={(e) => setAddressQuery(e.target.value)}
                                placeholder="中心となる場所 (例: 京都駅, 東京タワー)"
                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-400 font-medium bg-secondary-50"
                            />
                        </div>
                    )}

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="探したいもの (例: ラーメン, 公園)"
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700 transition disabled:bg-gray-400 min-w-[80px]"
                        >
                            {loading ? '...' : '検索'}
                        </button>
                    </div>

                    {searchMode === 'current' && (
                        <div className="flex gap-2 items-center">
                            <button
                                onClick={getCurrentLocation}
                                className="text-sm flex items-center gap-1 text-secondary-600 hover:text-secondary-800 font-bold"
                            >
                                <Navigation className="w-4 h-4" />
                                現在地を更新
                            </button>
                            {location && <span className="text-xs text-green-600 font-bold">位置情報取得済み</span>}
                        </div>
                    )}

                    {searchMode === 'address' && location && locationName !== '現在地' && (
                        <div className="text-sm text-gray-600">
                            <span className="font-bold">検索中心:</span> {locationName}
                        </div>
                    )}


                </div>

                {error && (
                    <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm font-medium" role="alert">
                        {error}
                    </div>
                )}
            </div>

            {/* Results Section */}
            <div className="flex-1 overflow-y-auto p-4">
                {results.length === 0 && !loading && !error && (
                    <div className="text-center text-gray-500 mt-10">
                        <p className="text-lg font-bold mb-2">スポットを探そう</p>
                        <p className="text-sm">キーワードを入力して検索してください。</p>
                        {searchMode === 'address' && <p className="text-xs mt-2 text-gray-400">「特定の場所周辺」では、まず場所を指定してから検索します。</p>}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 pb-20">
                    {results.map((item, index) => (
                        <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-gray-800 mb-1">{item.Name}</h3>
                                    {item.Property && item.Property.Distance && (
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap">
                                            約{(item.Property.Distance / 1000).toFixed(1)}km
                                        </span>
                                    )}
                                </div>

                                {item.Property && (
                                    <>
                                        <p className="text-sm text-gray-600 mb-2">{item.Property.Address}</p>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {item.Property.Genre && item.Property.Genre.map((g, i) => (
                                                <span key={i} className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-md border border-primary-100">{g.Name}</span>
                                            ))}
                                        </div>
                                        {item.Property.CatchCopy && (
                                            <p className="text-xs text-gray-500 italic mb-2">{item.Property.CatchCopy}</p>
                                        )}
                                        {item.Property.Tel1 && <p className="text-sm text-gray-700 mt-1"><span className="font-bold text-gray-400">TEL:</span> {item.Property.Tel1}</p>}
                                    </>
                                )}
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100 sticky bottom-0">
                                <div className="flex justify-end items-center gap-3">
                                    <button
                                        onClick={() => handleCreatePost(item)}
                                        className="text-primary-600 hover:text-primary-800 text-sm font-bold flex items-center gap-1 border border-primary-200 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        この場所で投稿
                                    </button>
                                    <a
                                        href={`https://map.yahoo.co.jp/place?lat=${item.Geometry.Coordinates.split(',')[1]}&lon=${item.Geometry.Coordinates.split(',')[0]}`} // Approximate link
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
                                    >
                                        Yahoo!ロコ
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LocalSearch;

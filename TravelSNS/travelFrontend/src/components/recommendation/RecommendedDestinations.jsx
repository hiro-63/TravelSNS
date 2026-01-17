import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecommendedDestinations = ({ locations = [] }) => {
    if (locations.length === 0) return null;

    return (
        <div className="py-4">
            <div className="flex justify-between items-center px-4 mb-3 border-b border-gray-100 pb-2">
                <h3 className="text-sm font-bold text-gray-700">おすすめの旅行先</h3>
                <Link to="/explore" className="text-xs text-theme-primary font-bold flex items-center hover:underline">
                    もっと見る <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
            </div>

            <div className="px-4 space-y-3">
                {locations.map((loc, idx) => (
                    <div key={idx} className="relative aspect-[16/9] bg-gray-200 rounded-lg overflow-hidden shadow-sm group cursor-pointer group">
                        <Link to={`/explore?search=${encodeURIComponent(loc.locationName)}`}>
                            {loc.thumbnail ? (
                                <img
                                    src={loc.thumbnail}
                                    alt={loc.locationName}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-r from-blue-300 to-indigo-300"></div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                                <div className="flex items-center text-white mb-0.5">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    <span className="font-bold text-sm">{loc.locationName}</span>
                                </div>
                                <p className="text-white/80 text-[10px] line-clamp-1">
                                    {loc.postCount}件の投稿
                                </p>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendedDestinations;

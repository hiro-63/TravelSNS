import React, { useState } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

const RecommendedUsers = ({ users = [] }) => {
    const [following, setFollowing] = useState({});

    const handleFollow = async (userId) => {
        try {
            // Optimistic update
            setFollowing(prev => ({ ...prev, [userId]: true }));

            // Call API
            await api.post(`/users/${userId}/follow`);
        } catch (error) {
            console.error("Error following user:", error);
            setFollowing(prev => ({ ...prev, [userId]: false }));
        }
    };

    if (users.length === 0) return null;

    return (
        <div className="py-4">
            <h3 className="px-4 text-sm font-bold text-gray-700 mb-4 border-b border-gray-100 pb-2">おすすめのユーザー</h3>
            <div className="px-4 space-y-3">
                {users.map((user) => (
                    <div key={user.userId} className="flex items-center gap-3">

                        <Link to={`/profile/${user.username}`} className="shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                                {user.profile?.avatarUrl ? (
                                    <img src={user.profile.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-400">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                            <Link to={`/profile/${user.username}`}>
                                <p className="font-bold text-sm text-gray-800 truncate">
                                    {user.profile?.displayName || user.username}
                                </p>
                                <p className="text-xs text-gray-500 truncate">@{user.displayName}</p>
                            </Link>
                        </div>

                        <button
                            onClick={() => handleFollow(user.userId)}
                            disabled={following[user.userId]}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1 shrink-0 ${following[user.id]
                                ? 'bg-gray-100 text-gray-500 cursor-default'
                                : 'bg-theme-primary text-white hover:bg-theme-primary/90'
                                }`}
                        >
                            {following[user.id] ? (
                                <UserCheck className="w-3 h-3" />
                            ) : (
                                <span className="flex items-center gap-1">
                                    <UserPlus className="w-3 h-3" />
                                    フォロー
                                </span>
                            )}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendedUsers;

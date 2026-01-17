import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    // ログイン済みならホームへ転送
    return user ? <Navigate to="/" /> : <Outlet />;
};

export default PublicRoute;

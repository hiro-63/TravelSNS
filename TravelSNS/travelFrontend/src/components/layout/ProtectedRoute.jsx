import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    // 未ログインならログイン画面へ
    return user ? <Layout /> : <Navigate to="/login" />;
};

export default ProtectedRoute;

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Home from './pages/Home';
import LocalSearch from './pages/LocalSearch';
import Explore from './pages/Explore';
import PublicRoute from './components/layout/PublicRoute';
import ProtectedRoute from './components/layout/ProtectedRoute';

function App() {
    return (
        <Routes>
            {/* Public Routes (Login/Register) */}
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected Routes (Main App) */}
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/search" element={<LocalSearch />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Route>
        </Routes>
    );
}

export default App;
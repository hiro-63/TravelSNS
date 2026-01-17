import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(username, password);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.message);
        }
    };

    return (
        <div
            className="relative flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat font-sans"
            style={{ backgroundImage: "url('/login_bg.png')" }}
        >
            {/* Overlay for better contrast */}
            <div className="absolute inset-0 bg-theme-primary/40 mix-blend-multiply"></div>

            <div className="relative z-10 max-w-md w-full space-y-8 bg-white/95 p-10 rounded-xl shadow-2xl backdrop-blur-sm border border-theme-secondary/30">
                <div className="flex flex-col items-center">
                    <div className="p-3 rounded-full bg-theme-primary/5">
                        <MapPin className="h-10 w-10 text-theme-primary" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-serif font-bold text-theme-primary tracking-wide">
                        おかえりなさい
                    </h2>
                    <p className="mt-2 text-center text-sm text-theme-text-light">
                        ログイン
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-theme-text mb-1">
                                ユーザー名
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-theme-border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-theme-secondary focus:border-theme-secondary sm:text-sm bg-theme-input-bg transition duration-200"
                                placeholder="ユーザー名を入力"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-theme-text mb-1">
                                パスワード
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-theme-border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-theme-secondary focus:border-theme-secondary sm:text-sm bg-theme-input-bg transition duration-200"
                                placeholder="パスワードを入力"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm text-center bg-red-50 py-2 rounded-md border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-theme-primary to-theme-accent-indigo hover:from-theme-primary/90 hover:to-theme-accent-indigo/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-secondary shadow-lg transform transition hover:-translate-y-0.5"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                {/* Optional: Icon here */}
                            </span>
                            ログイン
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-theme-text-light">
                        アカウントをお持ちでない方は {' '}
                        <Link to="/register" className="font-semibold text-theme-secondary hover:text-theme-primary transition-colors border-b border-transparent hover:border-theme-primary">
                            新規登録
                        </Link>
                    </p>
                </div>
            </div>

            {/* Footer / Copyright */}
            <div className="absolute bottom-4 text-white/60 text-xs text-center font-serif">
                &copy; 2025 Travel SNS. All rights reserved.
            </div>
        </div>
    );
};

export default Login;

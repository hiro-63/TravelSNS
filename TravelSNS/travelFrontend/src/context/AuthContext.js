import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    // トークン検証APIがない場合は、トークンがあるだけでログイン状態とみなすか、
                    // /auth/me のようなエンドポイントを叩く。
                    // 現状のBackendには /auth/me 相当があるか不明だが、一旦ユーザ情報を保持する。
                    // ここではlocalStorageにuser情報も簡易保存している想定か、
                    // 本来はVerifyが必要。
                    // 簡易的に user を復元。
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }
                }
            } catch (error) {
                console.error("Auth check failed", error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });

            // Backendのレスポンス形式に合わせる
            // AuthController.js (signin) -> { id, username, email, roles, accessToken } 等を返すと想定
            // 実際のレスポンスを確認する必要があるが、標準的なJWTフローを想定。

            if (response.data.accessToken) {
                localStorage.setItem('token', response.data.accessToken);
                localStorage.setItem('user', JSON.stringify(response.data));
                setUser(response.data);
                return { success: true };
            } else {
                return { success: false, message: "Token not found" };
            }
        } catch (error) {
            console.error("Login error", error);
            return {
                success: false,
                message: error.response?.data?.message || "ログインに失敗しました"
            };
        }
    };

    const register = async (username, email, password) => {
        try {
            await api.post('/auth/register', { username, password }); // Email removed from payload
            return { success: true };
        } catch (error) {
            console.error("Register error", error);
            return {
                success: false,
                message: error.response?.data?.message || "登録に失敗しました"
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ملي يشعل السيت، كنشوفو واش ديجا كاين Token مخبي
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // كندقو على Laravel نتأكدو واش الـ Token باقي خدام
                    const response = await api.get('/me');
                    setUser(response.data);
                } catch (err) {
                    // إيلا كان الـ Token ميت كنمسحوه
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    // 🚨 هادي هي الفانكشن لي كيهمنا أمرها دابا!
    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            
            // 🌟 السطر السحري لي كان ناقص المشروع كاملو:
            const token = response.data.token;
            const userData = response.data.user;

            localStorage.setItem('token', token); // 👈 حفظ الـ Token ف المتصفح
            setUser(userData); // حفظ بيانات المستخدم ف الـ React State

            return userData;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error("Logout error", err);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
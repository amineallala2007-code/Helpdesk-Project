import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

const profilePhotoOf = (user) => {
    if (!user) return '';
    const photos = JSON.parse(localStorage.getItem('profilePhotos') || '{}');
    return user.photo || photos[user.id] || photos[user.email] || '';
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/me');
                    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
                    const mergedUser = {
                        ...response.data,
                        name: storedUser.name || response.data.name,
                        email: storedUser.email || response.data.email,
                        photo: storedUser.photo || profilePhotoOf(response.data),
                    };
                    localStorage.setItem('user', JSON.stringify(mergedUser));
                    setUser(mergedUser);
                } catch (err) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            
            const token = response.data.token;
            const userData = response.data.user;
            const mergedUser = {
                ...userData,
                photo: profilePhotoOf(userData),
            };

            localStorage.setItem('token', token); 
            localStorage.setItem('user', JSON.stringify(mergedUser));
            setUser(mergedUser); 

            return mergedUser;
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
                localStorage.removeItem('user');
                setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

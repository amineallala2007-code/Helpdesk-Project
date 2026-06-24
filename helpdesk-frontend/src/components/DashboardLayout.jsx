import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import chuLogo from '../assets/chu-hassan-logo.jpeg';
import ThemeToggle from './ThemeToggle';
import api from '../services/api';

const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [profileOpen, setProfileOpen] = useState(false);

    let storedUser = {};
    try {
        storedUser = JSON.parse(localStorage.getItem('user')) || {};
    } catch (e) {
        console.error('Erreur local storage:', e);
    }

    const [localUser, setLocalUser] = useState(storedUser);
    const userRole = String(localUser?.role || '').toLowerCase();
    const isAdmin = userRole.includes('admin') || userRole === '1';
    const isAgent = userRole.includes('agent') || userRole === '2';
    const [profileForm, setProfileForm] = useState({
        name: localUser?.name || '',
        email: localUser?.email || '',
        password: '',
        photo: localUser?.photo || '',
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;
    const isDashboardHome = location.pathname === '/dashboard' && !location.hash;
    const isActiveAdminSection = (hash) => location.pathname === '/dashboard' && location.hash === hash;

    const goToDashboardSection = (hash) => {
        navigate(`/dashboard${hash}`);
    };

    const handleProfilePhoto = (file) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setProfileForm(prev => ({ ...prev, photo: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        const payload = {
            name: profileForm.name,
            email: profileForm.email,
            photo: profileForm.photo,
        };

        if (profileForm.password) {
            payload.password = profileForm.password;
        }

        try {
            const response = await api.put('/profile', payload);
            const updatedUser = {
                ...localUser,
                ...response.data,
            };

            localStorage.setItem('user', JSON.stringify(updatedUser));
            const savedPhotos = JSON.parse(localStorage.getItem('profilePhotos') || '{}');
            localStorage.setItem('profilePhotos', JSON.stringify({
                ...savedPhotos,
                [updatedUser.id]: updatedUser.photo || '',
                [localUser.email]: updatedUser.photo || '',
                [updatedUser.email]: updatedUser.photo || '',
            }));

            setLocalUser(updatedUser);
            setProfileForm(prev => ({ ...prev, password: '', photo: updatedUser.photo || '' }));
            setProfileOpen(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Impossible de modifier le profil.');
        }
    };

    return (
        <div className="app-shell">
            <aside className="app-sidebar">
                <div className="app-sidebar__brand">
                    <div className="app-sidebar__logo-wrap">
                        <img className="chu-brand__logo" src={chuLogo} alt="CHU Hassan II" />
                    </div>
                    <span className="app-sidebar__space">
                        {localUser?.role || 'Space'} Space
                    </span>
                </div>

                <nav className="app-nav">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`app-nav__button ${isDashboardHome ? 'is-active' : ''}`}
                    >
                        Table de Bord
                    </button>

                    <button
                        onClick={() => navigate('/messages')}
                        className={`app-nav__button ${isActive('/messages') ? 'is-active' : ''}`}
                    >
                        Messages
                    </button>

                    {!isAdmin && !isAgent && (
                        <button
                            onClick={() => navigate('/create-ticket')}
                            className={`app-nav__button ${isActive('/create-ticket') ? 'is-active' : ''}`}
                        >
                            Creer un Ticket
                        </button>
                    )}

                    {isAdmin && (
                        <>
                            <div className="app-nav__section">Administration</div>
                            <button
                                onClick={() => goToDashboardSection('#users')}
                                className={`app-nav__button ${isActiveAdminSection('#users') ? 'is-active' : ''}`}
                            >
                                Voir tous les utilisateurs
                            </button>
                            <button
                                onClick={() => goToDashboardSection('#registration-requests')}
                                className={`app-nav__button ${isActiveAdminSection('#registration-requests') ? 'is-active' : ''}`}
                            >
                                Demandes inscription
                            </button>
                            <button
                                onClick={() => goToDashboardSection('#add-user')}
                                className={`app-nav__button ${isActiveAdminSection('#add-user') ? 'is-active' : ''}`}
                            >
                                Ajouter utilisateur
                            </button>
                        </>
                    )}
                </nav>

                <div className="app-sidebar__footer">
                    <button
                        onClick={() => setProfileOpen(true)}
                        className="chu-button chu-button--ghost"
                        style={{ width: '100%', marginBottom: '10px' }}
                    >
                        Profil
                    </button>
                    <button
                        onClick={handleLogout}
                        className="chu-button chu-button--dark"
                        style={{ width: '100%' }}
                    >
                        Deconnexion
                    </button>
                </div>
            </aside>

            <div className="app-content">
                <header className="app-header">
                    <div>
                        <h4>
                            Bienvenue, <strong>{localUser?.name || 'Utilisateur'}</strong>
                        </h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <ThemeToggle />
                        <span className="role-badge">
                            {isAdmin ? 'Admin' : isAgent ? 'Agent Support' : 'Client / Demandeur'}
                        </span>

                        <button
                            type="button"
                            className="avatar avatar--button"
                            onClick={() => setProfileOpen(true)}
                            title="Voir mon profil"
                            aria-label="Voir mon profil"
                        >
                            {localUser?.photo ? (
                                <img src={localUser.photo} alt={localUser?.name || 'Profil'} />
                            ) : (
                                localUser?.name ? localUser.name.charAt(0).toUpperCase() : 'U'
                            )}
                        </button>
                    </div>
                </header>

                <main className="app-main">
                    {children}
                </main>
            </div>

            {profileOpen && (
                <div className="modal-backdrop" onClick={() => setProfileOpen(false)}>
                    <form className="modal-card" onSubmit={handleSaveProfile} onClick={(e) => e.stopPropagation()}>
                        <h3>Modifier profil</h3>
                        <label htmlFor="profile-photo" className="cover-upload-wrapper profile-upload">
                            {profileForm.photo ? (
                                <img src={profileForm.photo} alt="Profil" />
                            ) : (
                                <div className="cover-upload-placeholder">
                                    <strong>+</strong>
                                    <span>Changer la photo de profil</span>
                                </div>
                            )}
                        </label>
                        <input
                            id="profile-photo"
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleProfilePhoto(e.target.files?.[0])}
                        />
                        <div className="field" style={{ marginTop: '14px' }}>
                            <label>Nom</label>
                            <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required />
                        </div>
                        <div className="field">
                            <label>Email</label>
                            <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} required />
                        </div>
                        <div className="field">
                            <label>Mot de passe</label>
                            <input type="password" value={profileForm.password} onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })} placeholder="Nouveau mot de passe" />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="chu-button chu-button--ghost" onClick={() => setProfileOpen(false)}>Annuler</button>
                            <button type="submit" className="chu-button chu-button--primary">Enregistrer</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;

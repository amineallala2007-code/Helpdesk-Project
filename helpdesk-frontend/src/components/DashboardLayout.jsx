import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    let localUser = {};
    try {
        localUser = JSON.parse(localStorage.getItem('user')) || {};
    } catch (e) {
        console.error("Erreur local storage:", e);
    }

    const userRole = String(localUser?.role || '').toLowerCase();
    const isAdmin = userRole.includes('admin') || userRole === '1';
    const isAgent = userRole.includes('agent') || userRole === '2';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const getBadgeStyle = () => {
        if (isAdmin) return { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
        if (isAgent) return { background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' };
        return { background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' };
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#f4f6f9', fontFamily: 'Segoe UI, sans-serif', overflow: 'hidden' }}>
            
            <aside style={{ width: '260px', background: '#1e293b', color: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 10px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid #334155', background: '#0f172a' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', letterSpacing: '1px', fontWeight: 'bold', color: '#38bdf8' }}>🛠️ HELPDESK</h3>
                    <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>
                        {localUser?.role || 'Space'} Space
                    </span>
                </div>

                <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        style={{
                            padding: '12px 16px', background: isActive('/dashboard') ? '#38bdf8' : 'transparent',
                            color: isActive('/dashboard') ? '#0f172a' : '#94a3b8', border: 'none', borderRadius: '8px',
                            textAlign: 'left', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', fontSize: '14px'
                        }}
                    >
                        📊 Table de Bord
                    </button>

                    {!isAdmin && !isAgent && (
                        <button 
                            onClick={() => navigate('/create-ticket')} 
                            style={{
                                padding: '12px 16px', background: isActive('/create-ticket') ? '#38bdf8' : 'transparent',
                                color: isActive('/create-ticket') ? '#0f172a' : '#94a3b8', border: 'none', borderRadius: '8px',
                                textAlign: 'left', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', fontSize: '14px'
                            }}
                        >
                            ➕ Créer un Ticket
                        </button>
                    )}
                </nav>

                <div style={{ padding: '20px 12px', borderTop: '1px solid #334155' }}>
                    <button 
                        onClick={handleLogout}
                        style={{
                            width: '100%', padding: '12px', background: '#ef4444', color: '#fff', 
                            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s'
                        }}
                    >
                        🚪 Déconnexion
                    </button>
                </div>
            </aside>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                
                <header style={{ height: '70px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div>
                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>
                            Bienvenue, <span style={{ color: isAdmin ? '#ef4444' : '#38bdf8', fontWeight: 'bold' }}>{localUser?.name || 'Utilisateur'}</span> 👋
                        </h4>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ 
                            fontSize: '12px', 
                            padding: '6px 14px', 
                            borderRadius: '20px', 
                            fontWeight: 'bold',
                            ...getBadgeStyle()
                        }}>
                            {isAdmin ? '👑 Admin' : isAgent ? '🎧 Agent Support' : '👤 Client / Demandeur'}
                        </span>

                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: isAdmin ? '#fee2e2' : '#e0f2fe', color: isAdmin ? '#991b1b' : '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                            {localUser?.name ? localUser.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '30px', overflowY: 'auto', boxSizing: 'border-box' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
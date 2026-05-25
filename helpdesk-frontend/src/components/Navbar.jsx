import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useContext(AuthContext);
    
    const localUser = JSON.parse(localStorage.getItem('user')) || {};
    const currentUser = user || localUser;

    const userRole = String(currentUser?.role || '').toLowerCase();
    const isAdmin = userRole.includes('admin') || userRole === '1';
    const isAgent = userRole.includes('agent') || userRole === '2';

    const getBadgeStyle = () => {
        if (isAdmin) return { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
        if (isAgent) return { background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' };
        return { background: '#dcfce7', color: '#166534', border: '1px solid #86efac' };
    };

    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', background: '#fff', borderBottom: '1px solid #e2e8f0', height: '65px', boxSizing: 'border-box' }}>
            
            <div style={{ fontSize: '15px', color: '#334155', fontWeight: '500' }}>
                <span style={{ fontWeight: '700', color: isAdmin ? '#ef4444' : '#0284c7' }}>{currentUser?.name || 'Utilisateur'}</span> 👋
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                
                <span style={{ 
                    padding: '5px 14px', 
                    borderRadius: '50px', 
                    fontSize: '12px', 
                    fontWeight: '700',
                    ...getBadgeStyle()
                }}>
                    {isAdmin ? '👑 Admin' : isAgent ? '🎧 Agent Support' :  '👤 Client / Demandeur'}
                </span>

                <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#0ea5e9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '15px' }}>
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>

                <button 
                    onClick={logout} 
                    style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'background 0.2s' }}
                >
                    Déconnexion
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
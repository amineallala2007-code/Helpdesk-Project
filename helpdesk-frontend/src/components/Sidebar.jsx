import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    const localUser = JSON.parse(localStorage.getItem('user')) || {};
    const currentUser = user || localUser;

    const userRole = String(currentUser?.role || '').toLowerCase();
    
    const isAdmin = userRole.includes('admin') || userRole === '1';
    const isAgent = userRole.includes('agent') || userRole === '2';
    
    const isClient = (userRole === 'requester' || (!isAdmin && !isAgent)) && currentUser?.email;

    const isActive = (path) => location.pathname === path;

    const linkStyle = (path, isAction = false) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        color: isAction ? '#10b981' : (isActive(path) ? '#0284c7' : '#94a3b8'),
        background: isActive(path) ? '#e0f2fe' : 'transparent',
        padding: '12px 16px',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '14px',
        transition: 'all 0.2s',
        marginBottom: '5px'
    });

    return (
        <aside style={{ width: '240px', background: '#1e293b', padding: '20px 15px', height: '100vh', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ padding: '10px 15px 25px 15px', borderBottom: '1px solid #334155', marginBottom: '20px' }}>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: '700', letterSpacing: '0.5px' }}>🛠️ HELPDESK</h3>
                <span style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                    {isAdmin ? 'ADMIN SPACE' : isAgent ? 'AGENT SPACE' : 'CLIENT SPACE'}
                </span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                
                <li>
                    <Link to="/dashboard" style={linkStyle('/dashboard')}>
                        📊 Table de Bord
                    </Link>
                </li>

                {isClient && !isAdmin && (
                    <li>
                        <Link to="/create-ticket" style={linkStyle('/create-ticket', true)}>
                            ➕ Créer un Ticket
                        </Link>
                    </li>
                )}

                {isAdmin && (
                    <>
                        <div style={{ padding: '15px 15px 5px 15px', color: '#475569', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Management</div>
                        
                        <li>
                            <Link to="/users" style={linkStyle('/users')}>
                                👥 Control Utilisateurs
                            </Link>
                        </li>
                        <li>
                            <Link to="/categories" style={linkStyle('/categories')}>
                                📁 Catégories API
                            </Link>
                        </li>
                    </>
                )}
            </ul>
        </aside>
    );
}

export default Sidebar;
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: '#343a40', color: '#fff' }}>
            <h3>Helpdesk System 🛠️</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span>Connecté en tant que: <strong>{user?.name}</strong> ({user?.role})</span>
                <button onClick={logout} style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Déconnexion
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
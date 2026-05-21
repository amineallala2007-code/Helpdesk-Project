import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Sidebar() {
    const { user } = useContext(AuthContext);

    return (
        <aside style={{ width: '220px', background: '#f8f9fa', padding: '20px', height: 'calc(100vh - 60px)', borderRight: '1px solid #ddd' }}>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '15px' }}>
                    <strong style={{ color: '#007bff' }}>📌 Tableau de bord</strong>
                </li>
                
                {/* كاع الأدوار كيشوفو الـ Tickets */}
                <li style={{ marginBottom: '10px' }}>
                    <a href="/tickets" style={{ textDecoration: 'none', color: '#333' }}>🎫 Mes Tickets</a>
                </li>

                {/* الـ Requester بوحدو لي يقدر يكريي Ticket جديد */}
                {user?.role === 'requester' && (
                    <li style={{ marginBottom: '10px' }}>
                        <a href="/tickets/create" style={{ textDecoration: 'none', color: '#28a745' }}>➕ Créer un Ticket</a>
                    </li>
                )}

                {/* الـ Admin بوحدو لي كيشوف إدارة المستخدمين والـ Categories */}
                {user?.role === 'admin' && (
                    <>
                        <hr />
                        <li style={{ marginBottom: '10px' }}>
                            <a href="/users" style={{ textDecoration: 'none', color: '#333' }}>👥 Gestion Utilisateurs</a>
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <a href="/categories" style={{ textDecoration: 'none', color: '#333' }}>📁 Catégories</a>
                        </li>
                    </>
                )}
            </ul>
        </aside>
    );
}

export default Sidebar;
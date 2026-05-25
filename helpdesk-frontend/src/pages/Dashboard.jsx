import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';



const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
        case 'open': return { background: '#d1e7dd', color: '#0f5132', padding: '6px 14px', borderRadius: '50px', fontWeight: 'bold', fontSize: '12px', display: 'inline-block' };
        case 'in_progress': return { background: '#fff3cd', color: '#664d03', padding: '6px 14px', borderRadius: '50px', fontWeight: 'bold', fontSize: '12px', display: 'inline-block' };
        case 'resolved': return { background: '#cfe2ff', color: '#084298', padding: '6px 14px', borderRadius: '50px', fontWeight: 'bold', fontSize: '12px', display: 'inline-block' };
        case 'closed': return { background: '#e2e3e5', color: '#41464b', padding: '6px 14px', borderRadius: '50px', fontWeight: 'bold', fontSize: '12px', display: 'inline-block' };
        default: return { background: '#eee', color: '#333', padding: '6px 14px', borderRadius: '50px' };
    }
};

const getPriorityStyle = (priorityName) => {
    const name = priorityName?.toLowerCase() || '';
    if (name.includes('high') || name.includes('élevé') || name.includes('urgent')) return { color: '#dc3545', fontWeight: 'bold', background: '#f8d7da', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' };
    if (name.includes('medium') || name.includes('moyen')) return { color: '#fd7e14', fontWeight: 'bold', background: '#fff3cd', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' };
    return { color: '#198754', fontWeight: 'bold', background: '#d1e7dd', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' };
};

const Dashboard = () => {
    const navigate= useNavigate();
    const { user: contextUser } = useContext(AuthContext);
    const localUser = JSON.parse(localStorage.getItem('user')) || {};
    const currentUser = contextUser || localUser;

    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const userRole = String(currentUser?.role || '').toLowerCase();
    const isAdmin = userRole.includes('admin') || userRole === '1';
    const isAgent = userRole.includes('agent') || userRole === '2';



    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/tickets');
                setTickets(Array.isArray(response.data) ? response.data : response.data.tickets || []);

                if (isAdmin) {
                    try {
                        const usersRes = await api.get('/admin/users');
                        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
                    } catch (uErr) {
                        console.error("Erreur chargement utilisateurs:", uErr);
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Impossible de charger les données du Dashboard.");
                setLoading(false);
            }
        };

        if (currentUser && currentUser.id) {
            fetchDashboardData();
        } else {
            setLoading(false);
        }
    }, [currentUser, isAdmin]);

    const handleSaveRole = async (userId, userCurrentName, userCurrentEmail, selectedRole) => {
        try {
            const response = await api.put(`/admin/users/${userId}`, {
                name: userCurrentName,
                email: userCurrentEmail,
                role: selectedRole
            });
            alert(response.data.message || "Rôle mis à jour avec succès ! 🎉");
        } catch (err) {
            console.error(err);
            const backendError = err.response?.data?.error || err.response?.data?.message || "Erreur inconnue";
            alert(`⚠️ Échec de modification : ${backendError}`);
        }
    };

    if (loading) return <div style={{ padding: '20px', color: '#64748b' }}>Chargement du Dashboard...</div>;

    return (
        <div style={{ width: '100%', margin: '0 auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#1e293b', fontSize: '24px', fontWeight: '700' }}>
                        {isAdmin ? '👑 Espace Admin - Super Vision' : isAgent ? '🎧 Espace Agent - Gestion des Tickets' : '📊 Dashboard'}
                    </h2>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                        Bienvenue, <span style={{ fontWeight: 'bold', color: isAdmin ? '#ef4444' : '#0284c7' }}>{currentUser?.name || 'Admin'}</span> 👋
                    </p>
                </div>
                <div>
                    {!isAgent && !isAdmin && (
                            <Link to="/create-ticket" style={{ padding: '10px 20px', background: '#10b981', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                                ➕ Créer un Ticket
                            </Link>
                    )}
                </div>
            </div>

            {error && <div style={{ padding: '15px', color: '#ef4444', background: '#fdf2f2', borderRadius: '8px', marginBottom: '20px' }}>⚠️ {error}</div>}

            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px', background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px' }}>
                    <h4 style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{isAdmin ? 'Total Global Tickets' : 'Total Tickets'}</h4>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0 0 0', color: '#1e293b' }}>{tickets.length}</p>
                </div>
                <div style={{ flex: '1 1 200px', background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                    <h4 style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>🟢 Tickets Ouverts</h4>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0 0 0', color: '#10b981' }}>{tickets.filter(t => t.status?.toLowerCase() === 'open').length}</p>
                </div>
                <div style={{ flex: '1 1 200px', background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                    <h4 style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>🟡 En Cours</h4>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0 0 0', color: '#f59e0b' }}>{tickets.filter(t => t.status?.toLowerCase() === 'in_progress').length}</p>
                </div>
                {isAdmin && (
                    <div style={{ flex: '1 1 200px', background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #6366f1' }}>
                        <h4 style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>👥 Utilisateurs Inscrits</h4>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0 0 0', color: '#6366f1' }}>{users.length}</p>
                    </div>
                )}
            </div>

            {isAdmin && users.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ color: '#1e293b', marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>👥 Contrôle des Utilisateurs (Rôles)</h3>
                    <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                    <th style={{ padding: '16px 20px' }}>ID</th>
                                    <th style={{ padding: '16px 20px' }}>Nom</th>
                                    <th style={{ padding: '16px 20px' }}>Email</th>
                                    <th style={{ padding: '16px 20px' }}>Rôle Actuel</th>
                                    <th style={{ padding: '16px 20px' }}>Changer le Rôle</th>
                                    <th style={{ padding: '16px 20px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => {
                                    const currentRoleCleaned = String(u.role || '').toLowerCase();
                                    const isSuperAdminPrincipal = u.email === 'admin@helpdesk.com';

                                    return (
                                        <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '16px 20px', fontWeight: 'bold' }}>#{u.id}</td>
                                            <td style={{ padding: '16px 20px', fontWeight: '600', color: '#1e293b' }}>{u.name}</td>
                                            <td style={{ padding: '16px 20px', color: '#475569' }}>{u.email}</td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    background: (currentRoleCleaned === 'admin' || currentRoleCleaned === '1') ? '#fee2e2' : (currentRoleCleaned === 'agent' || currentRoleCleaned === '2') ? '#e0f2fe' : '#dcfce7',
                                                    color: (currentRoleCleaned === 'admin' || currentRoleCleaned === '1') ? '#991b1b' : (currentRoleCleaned === 'agent' || currentRoleCleaned === '2') ? '#0369a1' : '#166534'
                                                }}>
                                                    {currentRoleCleaned === 'requester' ? 'REQUESTER' : String(u.role).toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <select
                                                    value={u.role === 'user' ? 'requester' : u.role}
                                                    disabled={isSuperAdminPrincipal}
                                                    onChange={(e) => {
                                                        const newRole = e.target.value;
                                                        setUsers(prev => prev.map(user => user.id === u.id ? { ...user, role: newRole } : user));
                                                    }}
                                                    style={{
                                                        padding: '6px 10px',
                                                        borderRadius: '6px',
                                                        border: '1px solid #cbd5e1',
                                                        fontSize: '14px',
                                                        backgroundColor: isSuperAdminPrincipal ? '#f1f5f9' : '#fff',
                                                        cursor: isSuperAdminPrincipal ? 'not-allowed' : 'default'
                                                    }}
                                                >
                                                    <option value="requester">User / Client</option>
                                                    <option value="agent">Support Agent</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <button
                                                    onClick={() => handleSaveRole(u.id, u.name, u.email, u.role)}
                                                    disabled={isSuperAdminPrincipal}
                                                    style={{
                                                        padding: '6px 14px',
                                                        background: isSuperAdminPrincipal ? '#cbd5e1' : '#10b981',
                                                        color: isSuperAdminPrincipal ? '#64748b' : '#fff',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: isSuperAdminPrincipal ? 'not-allowed' : 'pointer',
                                                        fontWeight: 'bold',
                                                        fontSize: '13px'
                                                    }}
                                                >
                                                    💾 Enregistrer
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <h3 style={{ color: '#334155', marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>
                {isAdmin ? '🎫 Supervision de tous les Tickets' : isAgent ? '📥 Toutes les plaintes reçues' : '🎫 Liste de mes Tickets'}
            </h3>

            <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px 20px' }}>ID</th>
                            <th style={{ padding: '16px 20px' }}>Sujet</th>
                            <th style={{ padding: '16px 20px' }}>Description</th>
                            {(isAgent || isAdmin) && <th style={{ padding: '16px 20px' }}>Demandeur</th>}
                            <th style={{ padding: '16px 20px' }}>Catégorie</th>
                            <th style={{ padding: '16px 20px' }}>Priorité</th>
                            <th style={{ padding: '16px 20px' }}>Statut</th>
                            {isAdmin && <th style={{ padding: '16px 20px' }}>Assigner à un Agent</th>}
                            <th style={{ padding: '16px 20px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.length === 0 ? (
                            <tr><td colSpan={isAdmin ? "9" : "8"} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Aucun ticket trouvé.</td></tr>
                        ) : (
                            tickets.map((ticket) => (
                                <tr key={ticket.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 20px', fontWeight: 'bold' }}>#{ticket.id}</td>
                                    <td style={{ padding: '16px 20px', color: '#0284c7', fontWeight: '600' }}>{ticket.title}</td>
                                    <td style={{ padding: '16px 20px', color: '#475569', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ticket.description}</td>
                                    {(isAgent || isAdmin) && <td style={{ padding: '16px 20px', fontWeight: '500' }}>{ticket.requester?.name || 'Inconnu'}</td>}
                                    <td style={{ padding: '16px 20px' }}>{ticket.category?.name || 'Général'}</td>
                                    <td style={{ padding: '16px 20px' }}><span style={getPriorityStyle(ticket.priority?.name)}>{ticket.priority?.name || 'Normale'}</span></td>
                                    <td style={{ padding: '16px 20px' }}><span style={getStatusStyle(ticket.status)}>{ticket.status?.toUpperCase()}</span></td>

                                    {isAdmin && (
                                        <td style={{ padding: '16px 20px' }}>
                                            <select
                                                value={ticket.assignee_id || ''}
                                                onChange={async (e) => {
                                                    const selectedAgentId = e.target.value;
                                                    if (!selectedAgentId) return;
                                                    try {
                                                        await api.put(`/admin/tickets/${ticket.id}/assign`, { assignee_id: selectedAgentId });
                                                        setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, assignee_id: selectedAgentId, status: 'in_progress' } : t));
                                                        alert("Ticket assigné avec succès à l'agent ! 🚀");
                                                    } catch (err) {
                                                        const assignError = err.response?.data?.error || err.response?.data?.message || "Erreur inconnue";
                                                        alert(`⚠️ Erreur d'assignation : ${assignError}`);
                                                    }
                                                }}
                                                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                                            >
                                                <option value="">-- Choisir un Agent --</option>
                                                {users.filter(u => String(u.role).toLowerCase() === 'agent' || String(u.role) === '2').map(agent => (
                                                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                    )}

                                    <td style={{ padding: '16px 20px' }}>
                                        {isAdmin ? (
                                            <button
                                                onClick={() => navigate(`/tickets/${ticket.id}`)}
                                                style={{ padding: '6px 14px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                            >
                                                👁️ Inspecter
                                            </button>
                                        ) : isAgent ? (
                                            <button
                                                onClick={() => navigate(`/tickets/${ticket.id}`)}
                                                style={{ padding: '6px 14px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                            >
                                                🛠️ Traiter
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigate(`/client/tickets/${ticket.id}`)}
                                                style={{ padding: '6px 14px', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                            >
                                                👁️ Voir Details
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
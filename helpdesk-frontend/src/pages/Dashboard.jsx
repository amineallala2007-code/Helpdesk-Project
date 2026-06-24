import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const roleOf = (user) => String(user?.role || '').toLowerCase();
const isAdminRole = (role) => role === 'admin' || role === '1';
const isAgentRole = (role) => role === 'agent' || role === '2';

const statusColors = {
    open: '#16a34a',
    in_progress: '#f59e0b',
    resolved: '#2563eb',
    closed: '#64748b',
};

const badge = (bg, color = '#0f172a') => ({
    display: 'inline-block',
    padding: '5px 10px',
    borderRadius: '999px',
    background: bg,
    color,
    fontWeight: 700,
    fontSize: '12px',
});

const card = {
    background: 'var(--chu-surface)',
    border: '1px solid var(--chu-border)',
    borderRadius: '8px',
    padding: '18px',
    boxShadow: '0 10px 28px rgba(8, 113, 129, 0.07)',
};

function BarChart({ title, rows }) {
    const max = Math.max(1, ...rows.map(row => row.value));

    return (
        <div className="dashboard-card" style={card}>
            <h3 style={{ marginTop: 0, fontSize: '16px', color: '#0f172a' }}>{title}</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
                {rows.map(row => (
                    <div key={row.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px', color: '#475569' }}>
                            <span>{row.label}</span>
                            <strong>{row.value}</strong>
                        </div>
                        <div style={{ height: '9px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: `${(row.value / max) * 100}%`, minWidth: row.value ? '8px' : '0', height: '100%', background: row.color || 'var(--chu-cyan-strong)' }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user: contextUser } = useContext(AuthContext);
    const localUser = JSON.parse(localStorage.getItem('user')) || {};
    const currentUser = localUser?.id ? localUser : contextUser;
    const role = roleOf(currentUser);
    const isAdmin = isAdminRole(role);
    const isAgent = isAgentRole(role);

    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [categories, setCategories] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'requester' });
    const [editingRoleUser, setEditingRoleUser] = useState(null);
    const [editingTicket, setEditingTicket] = useState(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const ticketsRes = await api.get('/tickets');
            setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);

            if (isAdmin) {
                const [usersRes, requestsRes] = await Promise.all([
                    api.get('/admin/users'),
                    api.get('/admin/registration-requests'),
                ]);
                setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
                setRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
            } else if (!isAgent) {
                const [catRes, prioRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/priorities'),
                ]);
                setCategories(Array.isArray(catRes.data) ? catRes.data : []);
                setPriorities(Array.isArray(prioRes.data) ? prioRes.data : []);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Impossible de charger le dashboard.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.id) fetchDashboardData();
    }, [currentUser?.id, isAdmin]);

    useEffect(() => {
        if (!loading && location.hash) {
            const target = document.querySelector(location.hash);
            target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [loading, location.hash]);

    const stats = useMemo(() => {
        const byStatus = ['open', 'in_progress', 'resolved', 'closed'].map(status => ({
            label: status.toUpperCase(),
            value: tickets.filter(t => t.status === status).length,
            color: statusColors[status],
        }));

        const priorityMap = tickets.reduce((acc, ticket) => {
            const name = ticket.priority?.name || 'Normale';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});

        const byPriority = Object.entries(priorityMap).map(([label, value]) => ({
            label,
            value,
            color: '#0ea5e9',
        }));

        return { byStatus, byPriority };
    }, [tickets]);

    const handleSaveRole = async (userId, name, email, selectedRole) => {
        try {
            const response = await api.put(`/admin/users/${userId}`, { name, email, role: selectedRole });
            alert(response.data.message || 'Role mis a jour.');
            setEditingRoleUser(null);
            fetchDashboardData();
        } catch (err) {
            alert(err.response?.data?.message || 'Echec de modification.');
        }
    };

    const openRoleModal = (user) => {
        setEditingRoleUser({
            id: user.id,
            name: user.name,
            email: user.email,
            role: roleOf(user) || 'requester',
        });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/users', newUser);
            setNewUser({ name: '', email: '', password: '', role: 'requester' });
            alert('Utilisateur cree.');
            fetchDashboardData();
        } catch (err) {
            alert(err.response?.data?.message || 'Impossible de creer utilisateur.');
        }
    };

    const handleRegistration = async (requestId, action) => {
        try {
            await api.post(`/admin/registration-requests/${requestId}/${action}`);
            fetchDashboardData();
        } catch (err) {
            alert(err.response?.data?.message || 'Action impossible.');
        }
    };

    const assignTicket = async (ticketId, agentId) => {
        if (!agentId) return;
        try {
            const response = await api.put(`/admin/tickets/${ticketId}/assign`, { assignee_id: agentId });
            setTickets(prev => prev.map(t => t.id === ticketId ? response.data.ticket : t));
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur d assignation.');
        }
    };

    const openTicketModal = (ticket) => {
        setEditingTicket({
            id: ticket.id,
            title: ticket.title || '',
            description: ticket.description || '',
            category_id: ticket.category_id || ticket.category?.id || '',
            priority_id: ticket.priority_id || ticket.priority?.id || '',
        });
    };

    const handleUpdateTicket = async (e) => {
        e.preventDefault();

        try {
            const response = await api.patch(`/tickets/${editingTicket.id}`, editingTicket);
            setTickets(prev => prev.map(ticket => ticket.id === editingTicket.id ? response.data.ticket : ticket));
            setEditingTicket(null);
            alert(response.data.message || 'Ticket modifie.');
        } catch (err) {
            alert(err.response?.data?.message || 'Impossible de modifier le ticket.');
        }
    };

    const handleDeleteTicket = async (ticketId) => {
        if (!window.confirm('Supprimer ce ticket ?')) return;

        try {
            await api.delete(`/tickets/${ticketId}`);
            setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
            alert('Ticket supprime.');
        } catch (err) {
            alert(err.response?.data?.message || 'Impossible de supprimer le ticket.');
        }
    };

    if (loading) return <div style={{ padding: '20px', color: '#64748b' }}>Chargement du Dashboard...</div>;

    return (
        <div className="dashboard-page" style={{ width: '100%', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#0f172a', fontSize: '26px', fontWeight: 800 }}>
                        {isAdmin ? 'Espace Admin' : isAgent ? 'Espace Agent Support' : 'Dashboard Demandeur'}
                    </h2>
                    <p style={{ margin: '6px 0 0', color: '#64748b' }}>Bienvenue, <strong>{currentUser?.name || 'Utilisateur'}</strong></p>
                </div>
                {!isAgent && !isAdmin && (
                    <Link to="/create-ticket" className="chu-button chu-button--primary">
                        Creer un ticket
                    </Link>
                )}
            </div>

            {error && <div className="alert alert--error">{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div className="dashboard-card dashboard-card--accent" style={card}><span style={{ color: '#64748b' }}>Total tickets</span><p style={{ fontSize: '30px', fontWeight: 800, margin: '8px 0 0' }}>{tickets.length}</p></div>
                <div className="dashboard-card dashboard-card--accent" style={card}><span style={{ color: '#64748b' }}>Ouverts</span><p style={{ fontSize: '30px', fontWeight: 800, margin: '8px 0 0', color: '#16a34a' }}>{tickets.filter(t => t.status === 'open').length}</p></div>
                <div className="dashboard-card dashboard-card--accent" style={card}><span style={{ color: '#64748b' }}>En cours</span><p style={{ fontSize: '30px', fontWeight: 800, margin: '8px 0 0', color: '#f59e0b' }}>{tickets.filter(t => t.status === 'in_progress').length}</p></div>
                {isAdmin && <div className="dashboard-card dashboard-card--accent" style={card}><span style={{ color: '#64748b' }}>Demandes comptes</span><p style={{ fontSize: '30px', fontWeight: 800, margin: '8px 0 0', color: 'var(--chu-cyan-strong)' }}>{requests.length}</p></div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '26px' }}>
                <BarChart title="Diagramme par statut" rows={stats.byStatus} />
                <BarChart title="Diagramme par priorite" rows={stats.byPriority.length ? stats.byPriority : [{ label: 'Aucun', value: 0 }]} />
            </div>

            {isAdmin && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                    <div id="registration-requests" className="dashboard-card section-anchor" style={card}>
                        <h3 style={{ marginTop: 0 }}>Demandes d inscription</h3>
                        {requests.length === 0 ? <p style={{ color: '#64748b' }}>Aucune demande en attente.</p> : requests.map(req => (
                            <div key={req.id} style={{ borderTop: '1px solid #e2e8f0', padding: '12px 0' }}>
                                <strong>{req.name}</strong>
                                <div style={{ color: '#64748b', fontSize: '13px' }}>{req.email} - {req.role}</div>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                    <button className="chu-button chu-button--success" onClick={() => handleRegistration(req.id, 'approve')}>Approuver</button>
                                    <button className="chu-button chu-button--danger" onClick={() => handleRegistration(req.id, 'reject')}>Refuser</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form id="add-user" onSubmit={handleCreateUser} className="dashboard-card section-anchor" style={card}>
                        <h3 style={{ marginTop: 0 }}>Ajouter un utilisateur</h3>
                        {['name', 'email', 'password'].map(field => (
                            <input className="chu-input" key={field} type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'} placeholder={field === 'name' ? 'Nom' : field === 'email' ? 'Email' : 'Mot de passe'} value={newUser[field]} onChange={(e) => setNewUser({ ...newUser, [field]: e.target.value })} required style={{ marginBottom: '10px' }} />
                        ))}
                        <select className="chu-select" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} style={{ marginBottom: '10px' }}>
                            <option value="requester">Demandeur</option>
                            <option value="agent">Agent</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button className="chu-button chu-button--primary" type="submit" style={{ width: '100%' }}>Creer utilisateur</button>
                    </form>
                </div>
            )}

            {isAdmin && users.length > 0 && (
                <div id="users" className="section-anchor" style={{ marginBottom: '28px' }}>
                    <h3>Gestion des utilisateurs</h3>
                    <div className="table-shell">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead><tr style={{ background: '#f8fafc', textAlign: 'left' }}><th style={{ padding: '14px' }}>Nom</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '14px' }}>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td><span className="role-badge">{roleOf(u) === 'requester' ? 'Demandeur' : roleOf(u) === 'agent' ? 'Agent' : 'Admin'}</span></td>
                                        <td><button className="chu-button chu-button--ghost" disabled={u.email === 'admin@helpdesk.com'} onClick={() => openRoleModal(u)}>Modifier</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <h3 style={{ color: '#334155' }}>{isAdmin ? 'Tous les tickets' : isAgent ? 'Tickets a traiter' : 'Mes tickets'}</h3>
            <div className="table-shell">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={{ padding: '14px' }}>ID</th>
                            <th>Sujet</th>
                            <th>Description</th>
                            {(isAgent || isAdmin) && <th>Demandeur</th>}
                            <th>Categorie</th>
                            <th>Priorite</th>
                            <th>Statut</th>
                            {isAdmin && <th>Agent</th>}
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.length === 0 ? (
                            <tr><td colSpan={isAdmin ? 9 : 8} style={{ padding: '28px', textAlign: 'center', color: '#64748b' }}>Aucun ticket trouve.</td></tr>
                        ) : tickets.map(ticket => (
                            <tr key={ticket.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '14px', fontWeight: 700 }}>#{ticket.id}</td>
                                <td style={{ color: '#0284c7', fontWeight: 700 }}>{ticket.title}</td>
                                <td style={{ color: '#475569', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ticket.description}</td>
                                {(isAgent || isAdmin) && <td>{ticket.requester?.name || 'Inconnu'}</td>}
                                <td>{ticket.category?.name || 'General'}</td>
                                <td><span style={badge('#fef3c7', '#92400e')}>{ticket.priority?.name || 'Normale'}</span></td>
                                <td><span style={badge(`${statusColors[ticket.status] || '#64748b'}22`, statusColors[ticket.status] || '#334155')}>{ticket.status?.toUpperCase()}</span></td>
                                {isAdmin && (
                                    <td>
                                        <select className="chu-select" value={ticket.assignee_id || ''} onChange={(e) => assignTicket(ticket.id, e.target.value)}>
                                            <option value="">Choisir agent</option>
                                            {users.filter(u => roleOf(u) === 'agent').map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                                        </select>
                                    </td>
                                )}
                                <td>
                                    <div className="table-actions">
                                    <button className="chu-button chu-button--ghost" onClick={() => navigate(isAgent || isAdmin ? `/tickets/${ticket.id}` : `/client/tickets/${ticket.id}`)}>
                                        Ouvrir chat
                                    </button>
                                    {!isAgent && !isAdmin && ticket.status !== 'closed' && (
                                        <button className="chu-button chu-button--primary" onClick={() => openTicketModal(ticket)}>
                                            Modifier
                                        </button>
                                    )}
                                    {!isAgent && !isAdmin && (
                                        <button className="chu-button chu-button--danger" onClick={() => handleDeleteTicket(ticket.id)}>
                                            Supprimer
                                        </button>
                                    )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingRoleUser && (
                <div className="modal-backdrop" onClick={() => setEditingRoleUser(null)}>
                    <form
                        className="modal-card"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveRole(editingRoleUser.id, editingRoleUser.name, editingRoleUser.email, editingRoleUser.role);
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Modifier le role</h3>
                        <div className="profile-list">
                            <div><span>Nom</span><strong>{editingRoleUser.name}</strong></div>
                            <div><span>Email</span><strong>{editingRoleUser.email}</strong></div>
                        </div>
                        <div className="field" style={{ marginTop: '16px' }}>
                            <label>Role</label>
                            <select className="chu-select" value={editingRoleUser.role} onChange={(e) => setEditingRoleUser({ ...editingRoleUser, role: e.target.value })}>
                                <option value="requester">Demandeur</option>
                                <option value="agent">Agent</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="chu-button chu-button--ghost" onClick={() => setEditingRoleUser(null)}>Annuler</button>
                            <button type="submit" className="chu-button chu-button--primary">Enregistrer</button>
                        </div>
                    </form>
                </div>
            )}

            {editingTicket && (
                <div className="modal-backdrop" onClick={() => setEditingTicket(null)}>
                    <form className="modal-card" onSubmit={handleUpdateTicket} onClick={(e) => e.stopPropagation()}>
                        <h3>Modifier ticket</h3>
                        <div className="field">
                            <label>Sujet</label>
                            <input value={editingTicket.title} onChange={(e) => setEditingTicket({ ...editingTicket, title: e.target.value })} required />
                        </div>
                        <div className="field">
                            <label>Description</label>
                            <textarea rows="4" value={editingTicket.description} onChange={(e) => setEditingTicket({ ...editingTicket, description: e.target.value })} required />
                        </div>
                        <div className="field">
                            <label>Categorie</label>
                            <select value={editingTicket.category_id} onChange={(e) => setEditingTicket({ ...editingTicket, category_id: e.target.value })} required>
                                <option value="">Choisir une categorie</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div className="field">
                            <label>Priorite</label>
                            <select value={editingTicket.priority_id} onChange={(e) => setEditingTicket({ ...editingTicket, priority_id: e.target.value })} required>
                                <option value="">Choisir une priorite</option>
                                {priorities.map(prio => <option key={prio.id} value={prio.id}>{prio.name}</option>)}
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="chu-button chu-button--ghost" onClick={() => setEditingTicket(null)}>Annuler</button>
                            <button type="submit" className="chu-button chu-button--primary">Enregistrer</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

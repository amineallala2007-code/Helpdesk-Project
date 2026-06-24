import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const roleOf = (user) => String(user?.role || '').toLowerCase();
const isAdminRole = (role) => role === 'admin' || role === '1';
const isAgentRole = (role) => role === 'agent' || role === '2';
const profilePhotoOf = (user) => {
    if (!user) return '';
    const photos = JSON.parse(localStorage.getItem('profilePhotos') || '{}');
    return user.photo || photos[user.id] || photos[user.email] || '';
};

function Messages() {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user')) || {};
    const role = roleOf(currentUser);
    const isAdmin = isAdminRole(role);
    const isAgent = isAgentRole(role);

    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const loadMessagesData = async () => {
            try {
                setLoading(true);
                const ticketsRes = await api.get('/tickets');
                setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);

                if (isAdmin) {
                    const usersRes = await api.get('/admin/users');
                    setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Impossible de charger les messages.');
            } finally {
                setLoading(false);
            }
        };

        loadMessagesData();
    }, [isAdmin]);

    const openTicket = (ticketId) => {
        navigate(isAgent || isAdmin ? `/tickets/${ticketId}` : `/client/tickets/${ticketId}`);
    };

    return (
        <div className="messages-page">
            <div className="messages-card" style={{ width: 'min(100%, 980px)' }}>
                <h2>Messages</h2>
                <p style={{ marginTop: '-8px', color: '#64748b' }}>
                    Ouvrez une discussion liee a un ticket pour chatter avec le demandeur ou l agent.
                </p>

                {loading && <p style={{ color: '#64748b' }}>Chargement...</p>}
                {error && <p className="alert alert--error">{error}</p>}

                {!loading && isAdmin && users.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                        <h3>Utilisateurs</h3>
                        <div className="messages-grid">
                            {users.map(user => (
                                <div className="message-ticket" key={user.id}>
                                    <div>
                                        <h3>{user.name}</h3>
                                        <p>{user.email} - {roleOf(user) || 'role'}</p>
                                    </div>
                                    <button className="chu-button chu-button--ghost" onClick={() => setSelectedUser(user)}>
                                        Voir profil
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && (
                    <div>
                        <h3>Discussions par ticket</h3>
                        <div className="messages-grid">
                            {tickets.length === 0 ? (
                                <p style={{ color: '#64748b' }}>Aucune discussion disponible.</p>
                            ) : tickets.map(ticket => (
                                <div className="message-ticket" key={ticket.id}>
                                    <div>
                                        <h3>#{ticket.id} - {ticket.title}</h3>
                                        <p>
                                            Demandeur: {ticket.requester?.name || 'Inconnu'}
                                            {ticket.assignee?.name ? ` | Agent: ${ticket.assignee.name}` : ' | Agent: aucun'}
                                        </p>
                                    </div>
                                    <button className="chu-button chu-button--primary" onClick={() => openTicket(ticket.id)}>
                                        Chatter
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {selectedUser && (
                <div className="modal-backdrop" onClick={() => setSelectedUser(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h3>Profil utilisateur</h3>
                        <div className="profile-summary">
                            <div className="avatar avatar--large">
                                {profilePhotoOf(selectedUser) ? (
                                    <img src={profilePhotoOf(selectedUser)} alt={selectedUser.name || 'Profil'} />
                                ) : (
                                    selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'
                                )}
                            </div>
                            <div>
                                <h3>{selectedUser.name}</h3>
                                <p>{selectedUser.email}</p>
                            </div>
                        </div>
                        <div className="profile-list">
                            <div><span>Nom</span><strong>{selectedUser.name}</strong></div>
                            <div><span>Email</span><strong>{selectedUser.email}</strong></div>
                            <div><span>Role</span><strong>{roleOf(selectedUser) === 'requester' ? 'Demandeur' : roleOf(selectedUser) === 'agent' ? 'Agent' : 'Admin'}</strong></div>
                        </div>
                        <div className="modal-actions">
                            <button className="chu-button chu-button--ghost" onClick={() => navigate('/dashboard#users')}>Gestion utilisateurs</button>
                            <button className="chu-button chu-button--primary" onClick={() => setSelectedUser(null)}>Fermer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Messages;

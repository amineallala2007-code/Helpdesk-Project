import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const imageBox = { marginTop: '8px', maxWidth: '260px', borderRadius: '8px', border: '1px solid #d8ecef' };

const roleOf = (user) => String(user?.role || '').toLowerCase();
const isAdminUser = (user) => roleOf(user) === 'admin' || roleOf(user) === '1';
const roleLabel = (user) => {
    const role = roleOf(user);
    if (role === 'agent' || role === '2') return 'Agent';
    if (role === 'admin' || role === '1') return 'Admin';
    return 'Demandeur';
};

const savedProfilePhotos = () => JSON.parse(localStorage.getItem('profilePhotos') || '{}');
const profilePhotoOf = (profileUser) => {
    if (!profileUser) return '';
    const photos = savedProfilePhotos();
    return profileUser.photo || photos[profileUser.id] || photos[profileUser.email] || '';
};

const renderAttachments = (attachments = []) => attachments.map((file) => (
    <div key={file.id || file.url}>
        {String(file.mime || '').startsWith('image/') ? (
            <a href={file.url} target="_blank" rel="noreferrer">
                <img src={file.url} alt={file.original_name || 'piece jointe'} className="ticket-attachment-preview" style={imageBox} />
            </a>
        ) : (
            <a href={file.url} target="_blank" rel="noreferrer">{file.original_name || 'Piece jointe'}</a>
        )}
    </div>
));

const ClientTicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const chatEndRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [attachmentPreview, setAttachmentPreview] = useState('');
    const [profileVisible, setProfileVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!attachment) {
            setAttachmentPreview('');
            return undefined;
        }

        const objectUrl = URL.createObjectURL(attachment);
        setAttachmentPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [attachment]);

    const fetchTicketDetails = async () => {
        try {
            setLoading(true);
            const [ticketRes, messagesRes] = await Promise.all([
                api.get(`/tickets/${id}`),
                api.get(`/tickets/${id}/messages`)
            ]);
            setTicket(ticketRes.data);
            setMessages(Array.isArray(messagesRes.data) ? messagesRes.data : []);
        } catch (err) {
            setError('Impossible de charger les details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchTicketDetails();
    }, [id]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !attachment) return;

        try {
            const formData = new FormData();
            formData.append('body', newMessage);
            if (attachment) {
                formData.append('attachment', attachment);
            }
            const response = await api.post(`/tickets/${id}/messages`, formData);
            setMessages(prev => [...prev, response.data]);
            setNewMessage('');
            setAttachment(null);
            e.target.reset();
        } catch (err) {
            alert(err.response?.data?.message || "Erreur lors de l'envoi du message");
        }
    };

    const handleConfirmSolution = async () => {
        try {
            const response = await api.put(`/tickets/${id}/confirm-solution`);
            setTicket(response.data.ticket);
            alert(response.data.message || 'Ticket ferme.');
        } catch (err) {
            alert(err.response?.data?.message || 'Impossible de valider la solution.');
        }
    };

    if (loading) return <div className="chat-page">Chargement...</div>;
    if (error) return <div className="chat-page"><p className="alert alert--error">{error}</p></div>;
    if (!ticket) return <div className="chat-page">Ticket introuvable.</div>;

    const otherUser = ticket.assignee;
    const canViewOtherProfile = Boolean(otherUser && !isAdminUser(otherUser));

    return (
        <div className="chat-page">
            <div className="chat-card ticket-details">
                <button onClick={() => navigate('/dashboard')} className="chu-button chu-button--ghost" style={{ marginBottom: '18px' }}>Retour</button>
                <div className="ticket-detail-grid">
                    <section className="ticket-detail-box">
                        <span className="ticket-detail-label">Probleme</span>
                        <h2>{ticket.title}</h2>
                        <p>{ticket.description}</p>
                        <span className="role-badge">Statut: {ticket.status.toUpperCase()}</span>
                        <div className="ticket-photo-box">
                            <strong>Photos du ticket</strong>
                            {ticket.attachments?.length > 0 ? (
                                <div className="ticket-photo-grid">
                                    {renderAttachments(ticket.attachments)}
                                </div>
                            ) : (
                                <p>Aucune photo ajoutee.</p>
                            )}
                        </div>
                    </section>

                    <section className="ticket-detail-box">
                        <span className="ticket-detail-label">Autre utilisateur</span>
                        {canViewOtherProfile ? (
                            <div className="ticket-user-summary">
                                <div className="ticket-user-photo">
                                    {profilePhotoOf(otherUser) ? (
                                        <img src={profilePhotoOf(otherUser)} alt={otherUser.name || 'Profil'} />
                                    ) : (
                                        <span>{otherUser?.name ? otherUser.name.charAt(0).toUpperCase() : '?'}</span>
                                    )}
                                </div>
                                <div className="ticket-user-info">
                                    <strong>{otherUser?.name || 'Pas encore assigne'}</strong>
                                    <span>{otherUser?.email || 'Email non disponible'}</span>
                                    <span>{otherUser ? roleLabel(otherUser) : 'Agent'}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="ticket-user-private">
                                <strong>Profil prive</strong>
                                <span>Seul cet utilisateur peut voir son profil.</span>
                            </div>
                        )}
                    </section>
                </div>

                {ticket.status === 'resolved' && (
                    <div style={{ marginTop: '16px' }}>
                        <button onClick={handleConfirmSolution} className="chu-button chu-button--success">
                            Valider la solution et fermer le ticket
                        </button>
                    </div>
                )}
            </div>

            <div className="chat-card chat-shell" style={{ marginTop: '22px' }}>
                <div className="chat-header">
                    <h2 style={{ fontSize: '26px', marginBottom: 0 }}>Discussion</h2>
                    {canViewOtherProfile && (
                        <button className="chu-button chu-button--ghost" onClick={() => setProfileVisible(prev => !prev)}>
                            Voir profil
                        </button>
                    )}
                </div>

                {profileVisible && canViewOtherProfile && (
                    <div className="chat-profile-card">
                        <div className="chat-profile-photo">
                            {profilePhotoOf(otherUser) ? (
                                <img src={profilePhotoOf(otherUser)} alt={otherUser.name || 'Profil'} />
                            ) : (
                                <span>{otherUser.name ? otherUser.name.charAt(0).toUpperCase() : 'U'}</span>
                            )}
                        </div>
                        <div className="chat-profile-info">
                            <strong>{otherUser.name || 'Utilisateur'}</strong>
                            <span>{otherUser.email || 'Email non disponible'}</span>
                            <span>{roleLabel(otherUser)}</span>
                            <p>Remarque: le profil admin n est pas affiche aux utilisateurs.</p>
                        </div>
                    </div>
                )}

                <div className="chat-window">
                    {messages.map((msg) => {
                        const isMe = msg.author_id === user.id;
                        const authorName = msg.author?.name || 'Utilisateur';

                        return (
                            <div key={msg.id} className={`message-row ${isMe ? 'is-me' : ''}`}>
                                <div className="message-bubble">
                                    {msg.body && <div>{msg.body}</div>}
                                    {renderAttachments(msg.attachments)}
                                </div>
                                <div className="message-author">{isMe ? 'Vous' : authorName}</div>
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="chat-form">
                    <input className="chu-input" type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={ticket.status === 'closed'} placeholder={ticket.status === 'closed' ? 'Ferme' : 'Repondre...'} />
                    <button className="chu-button chu-button--primary" type="submit" disabled={ticket.status === 'closed'}>Envoyer</button>
                    <label htmlFor="client-chat-image" className={`cover-upload-wrapper chat-upload ${ticket.status === 'closed' ? 'is-disabled' : ''}`}>
                        {attachmentPreview ? (
                            <img src={attachmentPreview} alt="Image du message" />
                        ) : (
                            <div className="cover-upload-placeholder">
                                <strong>+</strong>
                                <span>Cliquez pour telecharger votre image principale</span>
                            </div>
                        )}
                    </label>
                    <input
                        id="client-chat-image"
                        type="file"
                        hidden
                        accept="image/*"
                        disabled={ticket.status === 'closed'}
                        onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                    />
                    <div className="upload-file-name">
                        {attachment ? attachment.name : ''}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientTicketDetails;

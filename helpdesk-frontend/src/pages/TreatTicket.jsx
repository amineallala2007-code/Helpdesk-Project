import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const imageBox = { marginTop: '8px', maxWidth: '260px', borderRadius: '8px', border: '1px solid #e2e8f0' };

const renderAttachments = (attachments = []) => attachments.map((file) => (
    <div key={file.id || file.url}>
        {String(file.mime || '').startsWith('image/') ? (
            <a href={file.url} target="_blank" rel="noreferrer">
                <img src={file.url} alt={file.original_name || 'piece jointe'} style={imageBox} />
            </a>
        ) : (
            <a href={file.url} target="_blank" rel="noreferrer">{file.original_name || 'Piece jointe'}</a>
        )}
    </div>
));

const TreatTicket = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const chatEndRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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

    const handleUpdateStatus = async (newStatus) => {
        try {
            const response = await api.put(`/tickets/${id}/status`, { status: newStatus });
            setTicket(response.data.ticket);
        } catch (err) {
            alert(err.response?.data?.message || "Erreur: vous n'avez pas la permission.");
        }
    };

    const handleAssignToMe = async () => {
        try {
            const response = await api.put(`/tickets/${id}/assign`);
            setTicket(response.data.ticket);
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de l assignation.');
        }
    };

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
            alert(err.response?.data?.message || "Erreur lors de l'envoi");
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Chargement...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

    return (
        <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px', cursor: 'pointer', padding: '8px 16px' }}>Retour</button>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 10px 0' }}>{ticket?.title}</h2>
                <p style={{ color: '#475569' }}>{ticket?.description}</p>
                <p><strong>Demandeur:</strong> {ticket?.requester?.name || 'Inconnu'}</p>
                <p><strong>Agent assigne:</strong> {ticket?.assignee?.name || 'Aucun'}</p>
                {ticket?.attachments?.length > 0 && (
                    <div>
                        <strong>Photos du ticket:</strong>
                        {renderAttachments(ticket.attachments)}
                    </div>
                )}
                {!ticket?.assignee_id && (
                    <button onClick={handleAssignToMe} style={{ marginTop: '12px', padding: '8px 14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        Prendre ce ticket
                    </button>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                    {['open', 'in_progress', 'resolved', 'closed'].map((s) => (
                        <button key={s} onClick={() => handleUpdateStatus(s)} style={{ padding: '7px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: ticket?.status === s ? '#0284c7' : '#e2e8f0', color: ticket?.status === s ? '#fff' : '#0f172a' }}>
                            {s.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
                <h3 style={{ marginTop: 0 }}>Discussion</h3>
                <div style={{ height: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', paddingRight: '10px' }}>
                    {messages.map((msg) => {
                        const isMe = msg.author_id === user.id;
                        const authorName = msg.author?.name || 'Utilisateur';
                        const role = String(msg.author?.role || '').toLowerCase();
                        const label = isMe ? 'Vous' : `${authorName} (${role || 'user'})`;

                        return (
                            <div key={msg.id} style={{ textAlign: isMe ? 'right' : 'left' }}>
                                <div style={{ display: 'inline-block', padding: '10px 14px', borderRadius: '12px', background: isMe ? '#0284c7' : '#f1f5f9', color: isMe ? '#fff' : '#1e293b', textAlign: 'left', maxWidth: '75%' }}>
                                    {msg.body && <div>{msg.body}</div>}
                                    {renderAttachments(msg.attachments)}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', fontWeight: 'bold' }}>{label}</div>
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Ecrire un message..." style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <button type="submit" style={{ padding: '10px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Envoyer</button>
                    <input type="file" accept="image/*" onChange={(e) => setAttachment(e.target.files?.[0] || null)} style={{ gridColumn: '1 / -1' }} />
                </form>
            </div>
        </div>
    );
};

export default TreatTicket;

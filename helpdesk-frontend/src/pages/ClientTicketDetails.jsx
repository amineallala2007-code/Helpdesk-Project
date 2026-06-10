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

const ClientTicketDetails = () => {
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

    if (loading) return <div style={{ padding: '20px' }}>Chargement...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
    if (!ticket) return <div style={{ padding: '20px' }}>Ticket introuvable.</div>;

    return (
        <div style={{ padding: '30px', maxWidth: '820px', margin: '0 auto', fontFamily: 'Segoe UI, sans-serif' }}>
            <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px', cursor: 'pointer' }}>Retour</button>

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', marginBottom: '20px', borderLeft: '5px solid #0d6efd' }}>
                <h2 style={{ margin: '0 0 10px' }}>{ticket.title}</h2>
                <p style={{ color: '#475569' }}>{ticket.description}</p>
                <p><strong>Agent:</strong> {ticket.assignee?.name || 'Pas encore assigne'}</p>
                <span style={{ padding: '5px 10px', borderRadius: '20px', background: '#e2e8f0', fontWeight: 'bold' }}>
                    Statut: {ticket.status.toUpperCase()}
                </span>
                {ticket.attachments?.length > 0 && (
                    <div style={{ marginTop: '14px' }}>
                        <strong>Photos du ticket:</strong>
                        {renderAttachments(ticket.attachments)}
                    </div>
                )}
                {ticket.status === 'resolved' && (
                    <button onClick={handleConfirmSolution} style={{ marginTop: '16px', padding: '10px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Valider la solution et fermer le ticket
                    </button>
                )}
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
                <h3 style={{ marginTop: 0 }}>Discussion</h3>
                <div style={{ height: '330px', overflowY: 'auto', border: '1px solid #f1f5f9', padding: '15px', borderRadius: '8px', background: '#f8fafc', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {messages.map((msg) => {
                        const isMe = msg.author_id === user.id;
                        const authorName = msg.author?.name || 'Utilisateur';

                        return (
                            <div key={msg.id} style={{ textAlign: isMe ? 'right' : 'left' }}>
                                <div style={{ display: 'inline-block', padding: '9px 12px', borderRadius: '8px', background: isMe ? '#0d6efd' : '#e9ecef', color: isMe ? '#fff' : '#000', textAlign: 'left', maxWidth: '80%', fontSize: '14px' }}>
                                    {msg.body && <div>{msg.body}</div>}
                                    {renderAttachments(msg.attachments)}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                    {isMe ? 'Vous' : authorName}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={ticket.status === 'closed'} placeholder={ticket.status === 'closed' ? 'Ferme' : 'Repondre...'} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    <button type="submit" disabled={ticket.status === 'closed'} style={{ padding: '0 24px', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Envoyer</button>
                    <input type="file" accept="image/*" disabled={ticket.status === 'closed'} onChange={(e) => setAttachment(e.target.files?.[0] || null)} style={{ gridColumn: '1 / -1' }} />
                </form>
            </div>
        </div>
    );
};

export default ClientTicketDetails;

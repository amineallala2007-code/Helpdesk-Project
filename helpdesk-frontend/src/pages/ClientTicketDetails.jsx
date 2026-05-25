import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ClientTicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const chatEndRef = useRef(null);

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const currentUserId = user.id;

    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Auto-scroll l-aakhir message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchTicketDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [ticketRes, messagesRes] = await Promise.all([
                api.get(`/tickets/${id}`, config),
                api.get(`/tickets/${id}/messages`, config)
            ]);

            setTicket(ticketRes.data);
            setMessages(Array.isArray(messagesRes.data) ? messagesRes.data : []);
            setLoading(false);
        } catch (err) {
            setError("Impossible de charger les détails.");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchTicketDetails();
    }, [id]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const response = await api.post(`/tickets/${id}/messages`, { body: newMessage }, config);
            setMessages(prev => [...prev, response.data]);
            setNewMessage('');
        } catch (err) {
            alert("Erreur lors de l'envoi du message");
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Chargement...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>⚠️ {error}</div>;
    if (!ticket) return <div style={{ padding: '20px' }}>Ticket introuvable.</div>;

    return (
        <div style={{ padding: '30px', maxWidth: '700px', margin: '0 auto', fontFamily: 'Segoe UI, sans-serif' }}>
            <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px', cursor: 'pointer' }}>⬅️ Retour</button>

            {/* Ticket Info */}
            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', borderLeft: '5px solid #0d6efd' }}>
                <h2 style={{ margin: '0 0 10px' }}>🎫 {ticket.title}</h2>
                <p style={{ color: '#475569' }}>{ticket.description}</p>
                <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#e2e3e5', fontWeight: 'bold' }}>
                    Statut: {ticket.status.toUpperCase()}
                </span>
            </div>

            {/* Chat Section */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ marginTop: 0 }}>💬 Discussion</h3>
                
                <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #f1f5f9', padding: '15px', borderRadius: '8px', background: '#f8fafc', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {messages.map((msg) => {
                        const isMe = msg.author_id === currentUserId;
                        const authorName = msg.author?.name || "Utilisateur";
                        
                        return (
                            <div key={msg.id} style={{ textAlign: isMe ? 'right' : 'left' }}>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    background: isMe ? '#0d6efd' : '#e9ecef',
                                    color: isMe ? '#fff' : '#000',
                                    textAlign: 'left',
                                    maxWidth: '80%',
                                    fontSize: '14px'
                                }}>
                                    {msg.body}
                                </div>
                                <div style={{ fontSize: '10px', color: '#6c757d', marginTop: '2px' }}>
                                    {isMe ? "Vous" : authorName}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                        disabled={ticket.status === 'closed'} 
                        placeholder={ticket.status === 'closed' ? "Fermé" : "Répondre..."} 
                        style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                    />
                    <button type="submit" disabled={ticket.status === 'closed'} style={{ padding: '0 24px', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Envoyer</button>
                </form>
            </div>
        </div>
    );
};

export default ClientTicketDetails;
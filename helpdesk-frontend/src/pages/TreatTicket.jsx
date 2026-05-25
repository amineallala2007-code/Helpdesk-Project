import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const TreatTicket = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const chatEndRef = useRef(null);

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const token = localStorage.getItem('token');
    const currentUserId = user.id;

    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchTicketDetails = async () => {
        if (!id) return;
        try {
            setLoading(true);
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

    // وظيفة تغيير الحالة
    const handleUpdateStatus = async (newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.put(`/tickets/${id}/status`, { status: newStatus }, config);
            fetchTicketDetails(); // تحديث البيانات بعد التغيير
        } catch (err) {
            alert("Erreur: Vous n'avez pas la permission.");
        }
    };

    useEffect(() => {
        fetchTicketDetails();
    }, [id]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await api.post(`/tickets/${id}/messages`, { body: newMessage }, config);
            setMessages(prev => [...prev, response.data]);
            setNewMessage('');
        } catch (err) {
            alert("Erreur lors de l'envoi");
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Chargement...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>⚠️ {error}</div>;

    return (
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px', cursor: 'pointer', padding: '8px 16px' }}>⬅️ Retour</button>

            {/* Header مع الحالة */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 10px 0' }}>🎫 {ticket?.title}</h2>
                
                {/* بوطونات تغيير الحالة */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    {['open', 'in_progress', 'resolved', 'closed'].map((s) => (
                        <button 
                            key={s}
                            onClick={() => handleUpdateStatus(s)}
                            style={{
                                padding: '5px 12px', fontSize: '12px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                                background: ticket?.status === s ? '#0284c7' : '#e2e8f0',
                                color: ticket?.status === s ? '#fff' : '#000'
                            }}
                        >
                            {s.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                <div style={{ height: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', paddingRight: '10px' }}>
                    {messages.map((msg) => {
                        const isMe = msg.author_id === currentUserId;
                        const authorName = msg.author?.name || "Utilisateur";
                        const role = String(msg.author?.role || '').toLowerCase();
                        let label = isMe ? "Vous" : (role.includes('admin') ? "👑 " + authorName : role.includes('agent') ? "🎧 " + authorName : authorName);

                        return (
                            <div key={msg.id || Math.random()} style={{ textAlign: isMe ? 'right' : 'left' }}>
                                <div style={{ display: 'inline-block', padding: '10px 14px', borderRadius: '12px', background: isMe ? '#0284c7' : '#f1f5f9', color: isMe ? '#fff' : '#1e293b', textAlign: 'left', maxWidth: '75%' }}>
                                    {msg.body}
                                </div>
                                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', fontWeight: 'bold' }}>{label}</div>
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Écrire un message..." style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <button type="submit" style={{ padding: '10px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Envoyer</button>
                </form>
            </div>
        </div>
    );
};

export default TreatTicket;
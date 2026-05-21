import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext'; 
const TicketsList = () => {
    const { user } = useContext(AuthContext); 
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await api.get('/tickets');
                setTickets(Array.isArray(response.data) ? response.data : response.data.tickets || []);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching tickets:", err);
                setError("Impossible de charger les tickets.");
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    if (loading) return <div style={{ padding: '20px' }}>Chargement des tickets...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '30px',
                borderBottom: '2px solid #f1f1f1',
                paddingBottom: '15px'
            }}>
                <h2 style={{ margin: 0, color: '#333' }}>🎫 Mes Tickets</h2>
                
      
            </div>

            {tickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#777', background: '#f9f9f9', borderRadius: '8px' }}>
                    Aucun ticket trouvé.
                </div>
            ) : (
                <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '15px' }}>ID</th>
                                <th style={{ padding: '15px' }}>Sujet</th>
                                <th style={{ padding: '15px' }}>Description</th>
                                <th style={{ padding: '15px' }}>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((ticket) => (
                                <tr key={ticket.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>#{ticket.id}</td>
                                    <td style={{ padding: '15px', color: '#007bff' }}>{ticket.title || ticket.sujet}</td>
                                    <td style={{ padding: '15px', color: '#555' }}>{ticket.description}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{ 
                                            padding: '5px 10px', 
                                            borderRadius: '20px', 
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            background: ticket.status === 'open' ? '#e2f0d9' : '#fce4d6',
                                            color: ticket.status === 'open' ? '#385723' : '#c65911'
                                        }}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TicketsList;
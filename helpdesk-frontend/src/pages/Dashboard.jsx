import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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

    const handleLogout = async () => {
        if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
            await logout();
            navigate('/login');
        }
    };

    if (loading) return <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>Chargement du Dashboard...</div>;

    // فحص صلاحية المستخدم الحالي (واش Agent)
    const isAgent = user?.role === 'agent';

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            
            {/* 🔝 الهيدر المتغير على حساب الـ Role */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '30px',
                borderBottom: '2px solid #f1f1f1',
                paddingBottom: '15px'
            }}>
                <div>
                    <h2 style={{ margin: 0, color: '#333' }}>
                        {isAgent ? '🎧 Espace Agent - Gestion des Tickets' : '📊 Dashboard'}
                    </h2>
                    <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                        Bienvenue, {isAgent ? `Agent ${user?.name}` : user?.name || 'Utilisateur'} 👋
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    
                    {/* 🛡️ حماية: الزر الأخضر يظهر فـقـط للـ Demandeur ومخفي تماماً على الـ Agent */}
                    {!isAgent && (
                        <Link 
                            to="/tickets/create" 
                            style={{ 
                                padding: '10px 20px', 
                                background: '#28a745', 
                                color: '#fff', 
                                textDecoration: 'none', 
                                borderRadius: '6px', 
                                fontWeight: 'bold',
                                fontSize: '14px',
                                boxShadow: '0 4px 6px rgba(40, 167, 69, 0.1)'
                            }}
                        >
                            ➕ Créer un Ticket
                        </Link>
                    )}

                    {/* 🚪 زر تسجيل الخروج */}
                    <button 
                        onClick={handleLogout}
                        style={{ 
                            padding: '10px 20px', 
                            background: '#dc3545', 
                            color: '#fff', 
                            border: 'none',
                            borderRadius: '6px', 
                            fontWeight: 'bold',
                            fontSize: '14px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(220, 53, 69, 0.1)',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#bd2130'}
                        onMouseLeave={(e) => e.target.style.background = '#dc3545'}
                    >
                        🚪 Déconnexion
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ padding: '15px', color: 'red', background: '#fdf2f2', borderRadius: '6px', marginBottom: '20px' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* 🎫 العنوان المتغير لقائمة التذاكر */}
            <h3 style={{ color: '#555', marginBottom: '15px' }}>
                {isAgent ? '📥 Toutes les plaintes reçues' : '🎫 Liste de mes Tickets'}
            </h3>
            
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
                                {/* 👤 عمود الطالب يظهر فقط للـ Agent */}
                                {isAgent && <th style={{ padding: '15px' }}>Demandeur</th>}
                                <th style={{ padding: '15px' }}>Catégorie</th>
                                <th style={{ padding: '15px' }}>Priorité</th>
                                <th style={{ padding: '15px' }}>Statut</th>
                                {/* ⚙️ عمود الإجراءات يظهر فقط للـ Agent */}
                                {isAgent && <th style={{ padding: '15px' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((ticket) => (
                                <tr key={ticket.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>#{ticket.id}</td>
                                    <td style={{ padding: '15px', color: '#007bff', fontWeight: '500' }}>{ticket.title}</td>
                                    <td style={{ padding: '15px', color: '#555', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {ticket.description}
                                    </td>
                                    
                                    {/* عرض اسم الطالب للـ Agent */}
                                    {isAgent && (
                                        <td style={{ padding: '15px', fontWeight: '500' }}>
                                            {ticket.requester?.name || 'Inconnu'}
                                        </td>
                                    )}
                                    
                                    {/* عرض الفئة (Category) */}
                                    <td style={{ padding: '15px', color: '#666' }}>
                                        {ticket.category?.name || 'Général'}
                                    </td>
                                    
                                    {/* عرض الأولوية (Priority) باللون المناسب */}
                                    <td style={{ padding: '15px' }}>
                                        <span style={{ 
                                            padding: '4px 10px', 
                                            borderRadius: '4px', 
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            background: ticket.priority?.name?.toLowerCase() === 'urgent' ? '#fcd4d4' : '#fff3cd',
                                            color: ticket.priority?.name?.toLowerCase() === 'urgent' ? '#900' : '#856404'
                                        }}>
                                            {ticket.priority?.name || 'Normale'}
                                        </span>
                                    </td>
                                    
                                    {/* عرض الحالة (Status) */}
                                    <td style={{ padding: '15px' }}>
                                        <span style={{ 
                                            padding: '5px 12px', 
                                            borderRadius: '20px', 
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            background: ticket.status === 'open' ? '#e2f0d9' : '#fce4d6',
                                            color: ticket.status === 'open' ? '#385723' : '#c65911'
                                        }}>
                                            {ticket.status.toUpperCase()}
                                        </span>
                                    </td>

                                    {/* 🛠️ زر المعالجة خاص فقط بالـ Agent */}
                                    {isAgent && (
                                        <td style={{ padding: '15px' }}>
                                            <Link 
                                                to={`/tickets/${ticket.id}/treat`} 
                                                style={{ 
                                                    padding: '6px 12px', 
                                                    background: '#007bff', 
                                                    color: '#fff', 
                                                    textDecoration: 'none', 
                                                    borderRadius: '4px',
                                                    fontSize: '13px',
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 2px 4px rgba(0,123,255,0.2)'
                                                }}
                                            >
                                                🛠️ Traiter
                                            </Link>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
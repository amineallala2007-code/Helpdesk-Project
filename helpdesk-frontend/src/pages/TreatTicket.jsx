import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const TreatTicket = () => {
    const { id } = useParams(); // جلب الـ ID ديال التيكيت من الرابط
    const navigate = useNavigate();
    
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // الأستيت ديال الحقول لي غايغير الـ Agent
    const [status, setStatus] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [priorityId, setPriorityId] = useState('');
    
    // جلب تفاصيل التيكيت ملي تفتح الصفحة
    useEffect(() => {
        const fetchTicketDetails = async () => {
            try {
                const response = await api.get(`/tickets/${id}`);
                setTicket(response.data);
                setStatus(response.data.status);
                setCategoryId(response.data.category_id || 1);
                setPriorityId(response.data.priority_id || 1);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError("Impossible de charger les détails du ticket.");
                setLoading(false);
            }
        };
        fetchTicketDetails();
    }, [id]);

    // دالة التعيين (شد التيكيت لراسي)
    const handleAssignMe = async () => {
        try {
            const response = await api.put(`/tickets/${id}/assign`);
            setTicket(response.data.ticket);
            setStatus('in_progress');
            alert("Vous avez pris en charge ce ticket ! 🎧");
        } catch (err) {
            alert("Erreur lors de la prise en charge.");
        }
    };

    // دالة حفظ التحديثات (الحالة، الفئة، الأولوية)
    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/tickets/${id}/update-status`, {
                status: status,
                category_id: parseInt(categoryId),
                priority_id: parseInt(priorityId)
            });
            alert("Ticket mis à jour avec succès ! ✅");
            navigate('/dashboard'); // الرجوع للـ Dashboard
        } catch (err) {
            alert("Erreur lors de la mise à jour.");
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Chargement du ticket...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>⚠️ {error}</div>;

    return (
        <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px', cursor: 'pointer' }}>⬅️ Retour au Dashboard</button>
            
            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '25px', borderLeft: '5px solid #007bff' }}>
                <h2 style={{ margin: '0 0 10px 0' }}>📌 {ticket.title}</h2>
                <p style={{ color: '#555', fontSize: '15px' }}>{ticket.description}</p>
                <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '15px 0' }} />
                <p style={{ margin: '5px 0', fontSize: '13px' }}><strong>Demandeur:</strong> {ticket.requester?.name} ({ticket.requester?.email})</p>
                <p style={{ margin: '5px 0', fontSize: '13px' }}><strong>Agent Assigné:</strong> {ticket.assignee?.name || <span style={{ color: 'red' }}>Aucun (Ticket non géré)</span>}</p>
                
                {/* زر أخذ التذكرة إيلا كانت باقا خاوية */}
                {!ticket.assignee_id && (
                    <button onClick={handleAssignMe} style={{ marginTop: '10px', padding: '8px 15px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        🙋‍♂️ Prendre en charge ce ticket
                    </button>
                )}
            </div>

            {/* فورم التحديث الخاص بالـ Agent */}
            <form onSubmit={handleUpdateStatus} style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>⚙️ Traitement du Ticket</h3>
                
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Statut :</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="open">OPEN (Ouvert)</option>
                        <option value="in_progress">IN PROGRESS (En cours)</option>
                        <option value="resolved">RESOLVED (Résolu)</option>
                        <option value="closed">CLOSED (Fermé)</option>
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Catégorie :</label>
                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="1">Général / Autre</option>
                        <option value="2">Technique</option>
                        <option value="3">Facturation</option>
                    </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Priorité :</label>
                    <select value={priorityId} onChange={(e) => setPriorityId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="1">Basse (Low)</option>
                        <option value="2">Moyenne (Medium)</option>
                        <option value="3">Haute (Urgent)</option>
                    </select>
                </div>

                <button type="submit" style={{ width: '100%', padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                    💾 Enregistrer les modifications
                </button>
            </form>
        </div>
    );
};

export default TreatTicket;
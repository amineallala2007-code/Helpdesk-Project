import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CreateTicket() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [priorityId, setPriorityId] = useState('');
    
    const [categories, setCategories] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFields = async () => {
            try {
                const catRes = await api.get('/categories');
                const prioRes = await api.get('/priorities');
                setCategories(Array.isArray(catRes.data) ? catRes.data : []);
                setPriorities(Array.isArray(prioRes.data) ? prioRes.data : []);
            } catch (err) {
                console.error("Erreur fields fallback:", err);
                setCategories([{ id: 1, name: "Technique" }, { id: 2, name: "Facturation" }]);
                setPriorities([{ id: 1, name: "Faible" }, { id: 2, name: "Moyenne" }, { id: 3, name: "Haute" }]);
            }
        };
        fetchFields();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryId || !priorityId) {
            setError("Veuillez choisir une catégorie et une priorité.");
            return;
        }

        setError('');
        setSubmitting(true);

        try {
            await api.post('/tickets', {
                title: title,
                description: description,
                category_id: categoryId,
                priority_id: priorityId
            });

            alert('Ticket créé avec succès ! 🎉');
            navigate('/dashboard'); 
        } catch (err) {
            console.error("Erreur création ticket:", err);
            setError(err.response?.data?.message || 'Impossible de créer le ticket.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '15px', cursor: 'pointer' }}>⬅️ Retour</button>
            <h2>➕ Créer un nouveau Ticket</h2>
            
            {error && (
                <p style={{ color: 'red', background: '#fdf2f2', padding: '10px', borderRadius: '4px' }}>
                    ⚠️ {error}
                </p>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: 'bold' }}>Titre :</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: 'bold' }}>Description :</label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        required 
                        rows="4"
                        style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: 'bold' }}>Catégorie :</label>
                    <select 
                        value={categoryId} 
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff' }}
                    >
                        <option value="">-- Choisir une catégorie --</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: 'bold' }}>Priorité :</label>
                    <select 
                        value={priorityId} 
                        onChange={(e) => setPriorityId(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff' }}
                    >
                        <option value="">-- Choisir une priorité --</option>
                        {priorities.map(prio => <option key={prio.id} value={prio.id}>{prio.name}</option>)}
                    </select>
                </div>

                <button 
                    type="submit" 
                    disabled={submitting} 
                    style={{ 
                        width: '100%', padding: '12px', background: '#28a745', color: '#fff', 
                        border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' 
                    }}
                >
                    {submitting ? 'Création en cours...' : 'Valider le Ticket'}
                </button>
            </form>
        </div>
    );
}

export default CreateTicket;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // 👈 تأكدي باللي هاد السطر كيشوف ف ملف api.js ديالنا

function CreateTicket() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            // صيفطنا الداتا للباك إند
            await api.post('/tickets', {
                title: title,
                description: description
            });

            alert('Ticket créé avec succès ! 🎉');
            navigate('/dashboard'); // ملي ينجح يرجعنا للـ Dashboard نشوفو التيكيت تزادت
        } catch (err) {
            console.error("Erreur création ticket:", err);
            setError(err.response?.data?.message || 'Impossible de créer le ticket (Unauthenticated).');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '5px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
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
                        style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: 'bold' }}>Description :</label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        required 
                        rows="5"
                        style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={submitting} 
                    style={{ 
                        width: '100%', 
                        padding: '12px', 
                        background: '#28a745', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontWeight: 'bold' 
                    }}
                >
                    {submitting ? 'Création en cours...' : 'Valider le Ticket'}
                </button>
            </form>
        </div>
    );
}

export default CreateTicket;
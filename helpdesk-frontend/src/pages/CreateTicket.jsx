import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CreateTicket() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [priorityId, setPriorityId] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [attachmentPreview, setAttachmentPreview] = useState('');

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
                console.error('Erreur fields fallback:', err);
                setCategories([{ id: 1, name: 'Technique' }, { id: 2, name: 'Facturation' }]);
                setPriorities([{ id: 1, name: 'Faible' }, { id: 2, name: 'Moyenne' }, { id: 3, name: 'Haute' }]);
            }
        };
        fetchFields();
    }, []);

    useEffect(() => {
        if (!attachment) {
            setAttachmentPreview('');
            return undefined;
        }

        const objectUrl = URL.createObjectURL(attachment);
        setAttachmentPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [attachment]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryId || !priorityId) {
            setError('Veuillez choisir une categorie et une priorite.');
            return;
        }

        setError('');
        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category_id', categoryId);
            formData.append('priority_id', priorityId);
            if (attachment) {
                formData.append('attachment', attachment);
            }

            await api.post('/tickets', formData);

            alert('Ticket cree avec succes.');
            navigate('/dashboard');
        } catch (err) {
            console.error('Erreur creation ticket:', err);
            setError(err.response?.data?.message || 'Impossible de creer le ticket.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="form-page">
            <div className="form-card">
                <button onClick={() => navigate('/dashboard')} className="chu-button chu-button--ghost" style={{ marginBottom: '18px' }}>
                    Retour
                </button>
                <h2>Creer un nouveau Ticket</h2>

                {error && <p className="alert alert--error">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <label>Titre</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="Sujet du probleme"
                        />
                    </div>

                    <div className="field">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows="5"
                            placeholder="Expliquez le besoin ou le probleme"
                        />
                    </div>

                    <div className="field">
                        <label>Categorie</label>
                        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                            <option value="">Choisir une categorie</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>

                    <div className="field">
                        <label>Priorite</label>
                        <select value={priorityId} onChange={(e) => setPriorityId(e.target.value)} required>
                            <option value="">Choisir une priorite</option>
                            {priorities.map(prio => <option key={prio.id} value={prio.id}>{prio.name}</option>)}
                        </select>
                    </div>

                    <div className="field">
                        <label>Photo explicative</label>
                        <label htmlFor="ticket-image" className="cover-upload-wrapper">
                            {attachmentPreview ? (
                                <img src={attachmentPreview} alt="Photo explicative" />
                            ) : (
                                <div className="cover-upload-placeholder">
                                    <strong>+</strong>
                                    <span>Cliquez pour telecharger une image explicative</span>
                                </div>
                            )}
                        </label>
                        <input
                            id="ticket-image"
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                        />
                        {attachment && <small style={{ color: '#475569' }}>Image choisie: {attachment.name}</small>}
                    </div>

                    <button className="chu-button chu-button--primary" type="submit" disabled={submitting} style={{ width: '100%' }}>
                        {submitting ? 'Creation en cours...' : 'Valider le Ticket'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateTicket;

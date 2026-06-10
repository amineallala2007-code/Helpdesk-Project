import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

function Login() {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [requestForm, setRequestForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'requester',
    });

    const inputStyle = {
        width: '100%',
        padding: '10px',
        marginTop: '5px',
        borderRadius: '6px',
        border: '1px solid #cbd5e1',
        boxSizing: 'border-box',
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await login(email, password);
            window.location.href = '/dashboard';
        } catch (err) {
            console.error('Erreur Login:', err);
            setError('Email ou mot de passe incorrect');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRequestAccount = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const response = await api.post('/auth/register-request', requestForm);
            alert(response.data.message || 'Demande envoyee a admin.');
            setShowRegister(false);
            setRequestForm({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                role: 'requester',
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Impossible d envoyer la demande.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8fafc', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ width: '100%', maxWidth: '430px', padding: '24px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 15px 45px rgba(15, 23, 42, 0.08)' }}>
                <h2 style={{ marginTop: 0, color: '#0f172a' }}>Helpdesk System</h2>
                <p style={{ marginTop: '-8px', color: '#64748b' }}>{showRegister ? 'Demander un compte a admin' : 'Connexion'}</p>

                {error && <p style={{ color: '#b91c1c', background: '#fee2e2', padding: '10px', borderRadius: '6px', fontSize: '14px' }}>{error}</p>}

                {!showRegister ? (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Email :</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Mot de passe :</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
                        </div>
                        <button type="submit" disabled={submitting} style={{ width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                            {submitting ? 'Connexion en cours...' : 'Se connecter'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRequestAccount}>
                        <div style={{ marginBottom: '12px' }}>
                            <label>Nom :</label>
                            <input value={requestForm.name} onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })} required style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label>Email :</label>
                            <input type="email" value={requestForm.email} onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })} required style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label>Role demande :</label>
                            <select value={requestForm.role} onChange={(e) => setRequestForm({ ...requestForm, role: e.target.value })} style={inputStyle}>
                                <option value="requester">Demandeur</option>
                                <option value="agent">Agent Support</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label>Mot de passe :</label>
                            <input type="password" value={requestForm.password} onChange={(e) => setRequestForm({ ...requestForm, password: e.target.value })} required minLength="6" style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Confirmer mot de passe :</label>
                            <input type="password" value={requestForm.password_confirmation} onChange={(e) => setRequestForm({ ...requestForm, password_confirmation: e.target.value })} required minLength="6" style={inputStyle} />
                        </div>
                        <button type="submit" disabled={submitting} style={{ width: '100%', padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Envoyer la demande
                        </button>
                    </form>
                )}

                <button onClick={() => { setShowRegister(!showRegister); setError(''); }} style={{ marginTop: '14px', width: '100%', padding: '10px', background: 'transparent', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer' }}>
                    {showRegister ? 'Retour connexion' : 'Demander un nouveau compte'}
                </button>
            </div>
        </div>
    );
}

export default Login;

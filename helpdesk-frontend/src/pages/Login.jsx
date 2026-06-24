import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import chuLogo from '../assets/chu-hassan-logo.jpeg';
import ThemeToggle from '../components/ThemeToggle';

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
        <div className="auth-page">
            <section className="auth-visual">
                <img className="auth-visual__logo" src={chuLogo} alt="CHU Hassan II - Centre Hospitalier Hassan II Fes" />
                <div>
                    <h1>Plateforme Helpdesk CHU Hassan II</h1>
                    <p>Un espace clair pour suivre les tickets, valider les demandes et garder les equipes support connectees.</p>
                </div>
            </section>

            <section className="auth-panel">
                <div className="auth-theme-toggle">
                    <ThemeToggle />
                </div>
                <div className="auth-card">
                    <div className="chu-brand chu-brand--compact">
                        <img className="chu-brand__logo" src={chuLogo} alt="CHU Hassan II" />
                    </div>
                    <h2>{showRegister ? 'Demande d inscription' : 'Connexion'}</h2>
                    <p>{showRegister ? 'Votre demande sera verifiee par un administrateur.' : 'Accedez a votre espace selon votre role.'}</p>

                    {error && <p className="alert alert--error">{error}</p>}

                    {!showRegister ? (
                        <form onSubmit={handleSubmit}>
                            <div className="field">
                                <label>Email</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="field">
                                <label>Mot de passe</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            <button className="chu-button chu-button--primary" type="submit" disabled={submitting} style={{ width: '100%' }}>
                                {submitting ? 'Connexion en cours...' : 'Se connecter'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRequestAccount}>
                            <div className="field">
                                <label>Nom</label>
                                <input value={requestForm.name} onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })} required />
                            </div>
                            <div className="field">
                                <label>Email</label>
                                <input type="email" value={requestForm.email} onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })} required />
                            </div>
                            <div className="field">
                                <label>Role demande</label>
                                <select value={requestForm.role} onChange={(e) => setRequestForm({ ...requestForm, role: e.target.value })}>
                                    <option value="requester">Demandeur</option>
                                    <option value="agent">Agent Support</option>
                                </select>
                            </div>
                            <div className="field">
                                <label>Mot de passe</label>
                                <input type="password" value={requestForm.password} onChange={(e) => setRequestForm({ ...requestForm, password: e.target.value })} required minLength="6" />
                            </div>
                            <div className="field">
                                <label>Confirmer mot de passe</label>
                                <input type="password" value={requestForm.password_confirmation} onChange={(e) => setRequestForm({ ...requestForm, password_confirmation: e.target.value })} required minLength="6" />
                            </div>
                            <button className="chu-button chu-button--success" type="submit" disabled={submitting} style={{ width: '100%' }}>
                                Envoyer la demande
                            </button>
                        </form>
                    )}

                    <button className="chu-button chu-button--ghost" onClick={() => { setShowRegister(!showRegister); setError(''); }} style={{ marginTop: '14px', width: '100%' }}>
                        {showRegister ? 'Retour connexion' : 'Demander un nouveau compte'}
                    </button>
                </div>
            </section>
        </div>
    );
}

export default Login;

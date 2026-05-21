import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TicketsList from './pages/TicketsList';
import CreateTicket from './pages/CreateTicket';
import TreatTicket from './pages/TreatTicket';

const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    const { user } = useContext(AuthContext);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
                
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                
                <Route path="/tickets/create" element={<ProtectedRoute><CreateTicket /></ProtectedRoute>} />
                
                <Route path="/tickets" element={<ProtectedRoute><TicketsList /></ProtectedRoute>} />
                
                <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
                <Route path="/tickets/:id/treat" element={<TreatTicket />} />
            </Routes>
        </Router>
    );
}

export default App;
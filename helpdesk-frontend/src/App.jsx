import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateTicket from './pages/CreateTicket';
import TreatTicket from './pages/TreatTicket';
import ClientTicketDetails from './pages/ClientTicketDetails';
import DashboardLayout from './components/DashboardLayout';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <DashboardLayout><Dashboard /></DashboardLayout>
                    </PrivateRoute>
                } />
                <Route path="/create-ticket" element={
                    <PrivateRoute>
                        <DashboardLayout><CreateTicket /></DashboardLayout>
                    </PrivateRoute>
                } />
                <Route path="/tickets/:id" element={
                    <PrivateRoute>
                        <DashboardLayout><TreatTicket /></DashboardLayout>
                    </PrivateRoute>
                } />
                <Route path="/client/tickets/:id" element={
                    <PrivateRoute>
                        <DashboardLayout><ClientTicketDetails /></DashboardLayout>
                    </PrivateRoute>
                } />

                <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Router>
    );
}

export default App;
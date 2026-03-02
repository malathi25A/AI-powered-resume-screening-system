// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ResumesPage from './pages/ResumesPage';
import JobsPage from './pages/JobsPage';
import EvaluatePage from './pages/EvaluatePage';
import ResultsPage from './pages/ResultsPage';
import ShortlistedPage from './pages/ShortlistedPage';
import AnalyticsPage from './pages/AnalyticsPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#05070f' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
        <div style={{ color: '#38bdf8', fontFamily: 'DM Mono', fontSize: 14 }}>Loading SmartHire AI...</div>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#0d1117', color: '#e2e8f0', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 10 },
            success: { iconTheme: { primary: '#34d399', secondary: '#05070f' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#05070f' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="resumes" element={<ResumesPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="evaluate" element={<EvaluatePage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="shortlisted" element={<ShortlistedPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

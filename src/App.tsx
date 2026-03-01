/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

function MissingConfig() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-red-200">
        <h2 className="text-xl font-bold text-red-600 mb-4">Missing Configuration</h2>
        <p className="text-zinc-600 mb-4">
          Please set the following environment variables in the AI Studio Secrets panel:
        </p>
        <ul className="list-disc list-inside text-sm text-zinc-800 space-y-2 bg-zinc-50 p-4 rounded-lg">
          <li className="font-mono">VITE_SUPABASE_URL</li>
          <li className="font-mono">VITE_SUPABASE_ANON_KEY</li>
        </ul>
        <p className="text-sm text-zinc-500 mt-4">
          After setting these variables, the app will automatically reload.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  if (!isSupabaseConfigured) {
    return <MissingConfig />;
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
